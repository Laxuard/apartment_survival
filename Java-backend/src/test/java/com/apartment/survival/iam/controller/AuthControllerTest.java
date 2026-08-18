package com.apartment.survival.iam.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.apartment.survival.config.SecuritySessionHelper;
import com.apartment.survival.config.exception.ExceptionTranslator;
import com.apartment.survival.iam.dto.AuthRequest;
import com.apartment.survival.iam.dto.AuthResponse;
import com.apartment.survival.iam.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private SecuritySessionHelper securitySessionHelper;

    @MockitoBean
    private ExceptionTranslator exceptionTranslator;

    private static final String REGISTER_URL = "/api/auth/register";
    private static final String LOGIN_URL = "/api/auth/login";
    private static final String LOGOUT_URL = "/api/auth/logout";

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String EMAIL = "laxuard@gmail.com";
    private static final String USERNAME = "Laxuard";
    private static final String PASSWORD = "password123";

    // ==========================================
    // 1. REGISTER ENDPOINT
    // ==========================================

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterEndpointTests {

        @Test
        @DisplayName("Should return 201 Created and UserSummary when request is valid")
        void register_Success() throws Exception {
            AuthRequest.Register request = new AuthRequest.Register(EMAIL, USERNAME, PASSWORD);
            AuthResponse.UserSummary summary = new AuthResponse.UserSummary(USER_ID, EMAIL, USERNAME);

            when(authService.register(any(AuthRequest.Register.class))).thenReturn(summary);

            mockMvc.perform(post(REGISTER_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(USER_ID.toString()))
                    .andExpect(jsonPath("$.email").value(EMAIL))
                    .andExpect(jsonPath("$.username").value(USERNAME));

            verify(authService).register(any(AuthRequest.Register.class));
            verify(securitySessionHelper).authenticateAndCreateSession(
                    eq(EMAIL), eq(PASSWORD), any(HttpServletRequest.class), any(HttpServletResponse.class));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when request body has invalid email or short password")
        void register_InvalidPayload_ReturnsBadRequest() throws Exception {
            // Invalid email format and password under 8 characters
            AuthRequest.Register invalidRequest = new AuthRequest.Register("invalid-email", "ab", "123");

            mockMvc.perform(post(REGISTER_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==========================================
    // 2. LOGIN ENDPOINT
    // ==========================================

    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginEndpointTests {

        @Test
        @DisplayName("Should return 201 Created and UserSummary when login is successful")
        void login_Success() throws Exception {
            AuthRequest.Login request = new AuthRequest.Login(EMAIL, PASSWORD);
            AuthResponse.UserSummary summary = new AuthResponse.UserSummary(USER_ID, EMAIL, USERNAME);

            when(authService.getCurrentUserSummary(any(HttpServletRequest.class))).thenReturn(summary);

            mockMvc.perform(post(LOGIN_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(USER_ID.toString()))
                    .andExpect(jsonPath("$.email").value(EMAIL))
                    .andExpect(jsonPath("$.username").value(USERNAME));

            verify(securitySessionHelper).authenticateAndCreateSession(
                    eq(EMAIL), eq(PASSWORD), any(HttpServletRequest.class), any(HttpServletResponse.class));
            verify(authService).getCurrentUserSummary(any(HttpServletRequest.class));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when login or password is blank")
        void login_BlankFields_ReturnsBadRequest() throws Exception {
            AuthRequest.Login blankRequest = new AuthRequest.Login("", "");

            mockMvc.perform(post(LOGIN_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(blankRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==========================================
    // 3. LOGOUT ENDPOINT
    // ==========================================

    @Nested
    @DisplayName("POST /api/auth/logout")
    class LogoutEndpointTests {

        @Test
        @DisplayName("Should destroy session and return 204 No Content")
        void logout_Success() throws Exception {
            mockMvc.perform(post(LOGOUT_URL))
                    .andExpect(status().isNoContent());

            verify(securitySessionHelper).destroySession(any(HttpServletRequest.class), any(HttpServletResponse.class));
        }
    }
}
