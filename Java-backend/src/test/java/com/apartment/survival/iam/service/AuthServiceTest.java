package com.apartment.survival.iam.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.apartment.survival.common.exception.type.DuplicateResourceException;
import com.apartment.survival.common.exception.type.ResourceNotFoundException;
import com.apartment.survival.iam.dto.AuthRequest;
import com.apartment.survival.iam.dto.AuthResponse;
import com.apartment.survival.iam.mapper.UserMapper;
import com.apartment.survival.iam.model.User;
import com.apartment.survival.iam.repository.UserRepository;
import com.apartment.survival.iam.security.UserDetailsImpl;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserMapper userMapper;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private AuthService authService;

    private static final String USERNAME = "Laxuard";
    private static final String EMAIL = "laxuard@gmail.com";
    private static final String RAW_PASSWORD = "password123";
    private static final String HASHED_PASSWORD = "$2a$10$hashed_secret";

    private AuthRequest.Register request;

    @BeforeEach
    void setUp() {
        request = new AuthRequest.Register(EMAIL, USERNAME, RAW_PASSWORD);
    }

    // ==========================================
    // 1. REGISTER TESTS
    // ==========================================

    @Nested
    @DisplayName("register()")
    class RegisterTests {

        @Test
        @DisplayName("Should successfully register a new user")
        void register_Success() {
            User mappedUser = User.builder().username(USERNAME).email(EMAIL).build();
            User savedUser = User.builder().id(UUID.randomUUID()).username(USERNAME).email(EMAIL).build();
            AuthResponse.UserSummary expectedSummary = new AuthResponse.UserSummary(savedUser.getId(), EMAIL, USERNAME);

            when(userRepository.existsByEmail(EMAIL)).thenReturn(false);
            when(userRepository.existsByUsername(USERNAME)).thenReturn(false);
            when(userMapper.toEntity(request)).thenReturn(mappedUser);
            when(passwordEncoder.encode(RAW_PASSWORD)).thenReturn(HASHED_PASSWORD);
            when(userRepository.save(mappedUser)).thenReturn(savedUser);
            when(userMapper.toSummary(savedUser)).thenReturn(expectedSummary);

            AuthResponse.UserSummary actualSummary = authService.register(request);

            assertThat(actualSummary).isEqualTo(expectedSummary);
            verify(passwordEncoder).encode(RAW_PASSWORD);
            verify(userRepository).save(mappedUser);
        }

        @Test
        @DisplayName("Should throw exception when email already exists")
        void register_EmailExists() {
            when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("Email already in use: " + EMAIL);

            verify(userRepository, never()).save(any());
            verifyNoInteractions(passwordEncoder, userMapper);
        }

        @Test
        @DisplayName("Should throw exception when username already exists")
        void register_UsernameExists() {
            when(userRepository.existsByEmail(EMAIL)).thenReturn(false);
            when(userRepository.existsByUsername(USERNAME)).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("Username already in use: " + USERNAME);

            verify(userRepository, never()).save(any());
            verifyNoInteractions(passwordEncoder, userMapper);
        }
    }

    // ==========================================
    // 2. GET CURRENT USER SUMMARY TESTS
    // ==========================================

    @Nested
    @DisplayName("getCurrentUserSummary()")
    class GetCurrentUserSummaryTests {

        @Mock
        private Authentication authentication;
        @Mock
        private HttpServletRequest httpRequest;

        @AfterEach
        void tearDown() {
            SecurityContextHolder.clearContext();
        }

        private void setSecurityContext(Authentication auth) {
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
        }

        @Test
        @DisplayName("Should successfully return user summary when authenticated")
        void getCurrentUserSummary_Success() {
            UUID userId = UUID.randomUUID();
            UserDetailsImpl userDetails = new UserDetailsImpl(userId, EMAIL, USERNAME, HASHED_PASSWORD, true, true,
                    List.of());
            AuthResponse.UserSummary expectedSummary = new AuthResponse.UserSummary(userId, EMAIL, USERNAME);

            setSecurityContext(authentication);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getPrincipal()).thenReturn(userDetails);
            when(userMapper.toSummary(userDetails)).thenReturn(expectedSummary);

            AuthResponse.UserSummary result = authService.getCurrentUserSummary(httpRequest);

            assertThat(result).isEqualTo(expectedSummary);
        }

        @Test
        @DisplayName("Should throw exception when context has no authentication")
        void getCurrentUserSummary_NoAuthentication() {
            SecurityContextHolder.clearContext();

            assertThatThrownBy(() -> authService.getCurrentUserSummary(httpRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("No authenticated user in current session");
        }

        @Test
        @DisplayName("Should throw exception when authentication exists but isAuthenticated is false")
        void getCurrentUserSummary_NotAuthenticated() {
            setSecurityContext(authentication);
            when(authentication.isAuthenticated()).thenReturn(false);

            assertThatThrownBy(() -> authService.getCurrentUserSummary(httpRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("No authenticated user in current session");
        }

        @Test
        @DisplayName("Should throw exception when principal is not UserDetailsImpl")
        void getCurrentUserSummary_InvalidPrincipal() {
            setSecurityContext(authentication);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getPrincipal()).thenReturn("anonymousUser");

            assertThatThrownBy(() -> authService.getCurrentUserSummary(httpRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("User principal not found");
        }
    }
}
