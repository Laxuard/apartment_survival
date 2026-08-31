package com.apartment.survival.iam.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
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

import com.apartment.survival.common.exception.ExceptionTranslator;
import com.apartment.survival.iam.dto.UserRequest;
import com.apartment.survival.iam.dto.UserResponse;
import com.apartment.survival.iam.model.Role;
import com.apartment.survival.iam.security.UserDetailsImpl;
import com.apartment.survival.iam.service.AuthService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private ExceptionTranslator exceptionTranslator;

    private static final String ME_URL = "/api/me";
    private static final String PASSWORD_URL = "/api/me/password";

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String EMAIL = "user@test.com";
    private static final String USERNAME = "testuser";

    private void setupSecurityContext() {
        UserDetailsImpl userDetails = new UserDetailsImpl(
                USER_ID, EMAIL, USERNAME, "password", true, true, java.util.List.of());
        var auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Nested
    @DisplayName("GET /api/me")
    class GetProfileTests {

        @Test
        @DisplayName("Should return 200 OK with profile details")
        void getProfile_Success() throws Exception {
            setupSecurityContext();
            var profile = new UserResponse.ProfileDetail(USER_ID, USERNAME, EMAIL, Role.USER, Instant.now());
            when(authService.getProfile(USER_ID)).thenReturn(profile);

            mockMvc.perform(get(ME_URL)
                    .header("API-Version", "1.0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.userId").value(USER_ID.toString()))
                    .andExpect(jsonPath("$.username").value(USERNAME))
                    .andExpect(jsonPath("$.email").value(EMAIL));

            verify(authService).getProfile(USER_ID);
        }
    }

    @Nested
    @DisplayName("PUT /api/me")
    class UpdateProfileTests {

        @Test
        @DisplayName("Should return 200 OK when profile is updated")
        void updateProfile_Success() throws Exception {
            setupSecurityContext();
            var request = new UserRequest.UpdateProfile("newname", "new@test.com");
            var updated = new UserResponse.ProfileDetail(USER_ID, "newname", "new@test.com", Role.USER, Instant.now());

            when(authService.updateProfile(eq(USER_ID), any(UserRequest.UpdateProfile.class))).thenReturn(updated);

            mockMvc.perform(put(ME_URL)
                    .header("API-Version", "1.0")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.username").value("newname"))
                    .andExpect(jsonPath("$.email").value("new@test.com"));

            verify(authService).updateProfile(eq(USER_ID), any(UserRequest.UpdateProfile.class));
        }
    }

    @Nested
    @DisplayName("PUT /api/me/password")
    class ChangePasswordTests {

        @Test
        @DisplayName("Should return 204 No Content on successful password change")
        void changePassword_Success() throws Exception {
            setupSecurityContext();
            var request = new UserRequest.ChangePassword("oldpass123", "newpass123");

            mockMvc.perform(put(PASSWORD_URL)
                    .header("API-Version", "1.0")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNoContent());

            verify(authService).changePassword(eq(USER_ID), any(UserRequest.ChangePassword.class));
        }
    }
}
