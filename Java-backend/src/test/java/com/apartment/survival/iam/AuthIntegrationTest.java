package com.apartment.survival.iam;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.apartment.survival.iam.dto.AuthRequest;
import com.apartment.survival.iam.model.Role;
import com.apartment.survival.iam.model.User;
import com.apartment.survival.iam.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Authentication & Session Management Integration Tests")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String REGISTER_URL = "/api/auth/register";
    private static final String LOGIN_URL = "/api/auth/login";
    private static final String LOGOUT_URL = "/api/auth/logout";

    private static final String EMAIL = "integration.user@gmail.com";
    private static final String USERNAME = "IntegrationUser";
    private static final String PASSWORD = "SecurePassword123!";

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    // ==========================================
    // 1. REGISTRATION WORKFLOW (END-TO-END)
    // ==========================================

    @Nested
    @DisplayName("User Registration Flow")
    class RegistrationFlowTests {

        @Test
        @DisplayName("Should register user, persist BCrypt-hashed password in DB, and create authenticated session")
        void register_PersistsUserAndCreatesSession() throws Exception {
            AuthRequest.Register request = new AuthRequest.Register(EMAIL, USERNAME, PASSWORD);

            // 1. Send HTTP Registration request
            MvcResult result = mockMvc.perform(post(REGISTER_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").isNotEmpty())
                    .andExpect(jsonPath("$.email").value(EMAIL))
                    .andExpect(jsonPath("$.username").value(USERNAME))
                    .andReturn();

            // Verify active session was created
            assertThat(result.getRequest().getSession(false)).isNotNull();
            assertThat(result.getRequest().getSession(false).getId()).isNotEmpty();

            // 2. Verify Database State directly
            User savedUser = userRepository.findByEmail(EMAIL)
                    .orElseThrow(() -> new AssertionError("User should have been saved in the database"));

            assertThat(savedUser.getUsername()).isEqualTo(USERNAME);
            assertThat(savedUser.getEmail()).isEqualTo(EMAIL);
            assertThat(savedUser.getRole()).isEqualTo(Role.USER);
            assertThat(savedUser.isEnabled()).isTrue();
            assertThat(savedUser.isAccountLocked()).isFalse();

            // 3. Security Assert: Password must NEVER be plaintext
            assertThat(savedUser.getPassword()).isNotEqualTo(PASSWORD);
            assertThat(passwordEncoder.matches(PASSWORD, savedUser.getPassword())).isTrue();
        }

        @Test
        @DisplayName("Should return 409 Conflict when attempting to register with existing email")
        void register_DuplicateEmail_ReturnsConflict() throws Exception {
            // First registration
            AuthRequest.Register firstRequest = new AuthRequest.Register(EMAIL, USERNAME, PASSWORD);
            mockMvc.perform(post(REGISTER_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(firstRequest)))
                    .andExpect(status().isCreated());

            // Duplicate registration attempt
            AuthRequest.Register duplicateRequest = new AuthRequest.Register(EMAIL, "DifferentUsername", PASSWORD);
            mockMvc.perform(post(REGISTER_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(duplicateRequest)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.title").value("Duplicate Resource"))
                    .andExpect(jsonPath("$.detail").value("Email already in use: " + EMAIL));
        }
    }

    // ==========================================
    // 2. LOGIN & AUTHENTICATION WORKFLOW
    // ==========================================

    @Nested
    @DisplayName("User Login Flow")
    class LoginFlowTests {

        @BeforeEach
        void seedUser() throws Exception {
            AuthRequest.Register register = new AuthRequest.Register(EMAIL, USERNAME, PASSWORD);
            mockMvc.perform(post(REGISTER_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(register)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("Should successfully authenticate with valid credentials and establish active session")
        void login_Success() throws Exception {
            AuthRequest.Login loginRequest = new AuthRequest.Login(EMAIL, PASSWORD);

            MvcResult result = mockMvc.perform(post(LOGIN_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.email").value(EMAIL))
                    .andExpect(jsonPath("$.username").value(USERNAME))
                    .andReturn();

            assertThat(result.getRequest().getSession(false)).isNotNull();
            assertThat(result.getRequest().getSession(false).getId()).isNotEmpty();
        }

        @Test
        @DisplayName("Should return 401 Unauthorized when password is incorrect")
        void login_BadCredentials_ReturnsUnauthorized() throws Exception {
            AuthRequest.Login wrongPasswordRequest = new AuthRequest.Login(EMAIL, "WrongPassword123!");

            mockMvc.perform(post(LOGIN_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(wrongPasswordRequest)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.title").value("Invalid Credentials"))
                    .andExpect(jsonPath("$.detail").value("Email or password is incorrect"));
        }
    }

    // ==========================================
    // 3. LOGOUT WORKFLOW
    // ==========================================

    @Nested
    @DisplayName("User Logout Flow")
    class LogoutFlowTests {

        @Test
        @DisplayName("Should destroy session and return expired JSESSIONID cookie")
        void logout_Success() throws Exception {
            // 1. Register & get active session
            AuthRequest.Register register = new AuthRequest.Register(EMAIL, USERNAME, PASSWORD);
            MvcResult registerResult = mockMvc.perform(post(REGISTER_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(register)))
                    .andExpect(status().isCreated())
                    .andReturn();

            var session = registerResult.getRequest().getSession(false);
            assertThat(session).isNotNull();

            // 2. Perform Logout passing the active session
            mockMvc.perform(post(LOGOUT_URL)
                    .session((org.springframework.mock.web.MockHttpSession) session))
                    .andExpect(status().isNoContent())
                    .andExpect(cookie().exists("JSESSIONID"))
                    .andExpect(cookie().maxAge("JSESSIONID", 0)); // Expired cookie header sent back
        }
    }
}
