package com.apartment.survival.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.web.authentication.session.SessionAuthenticationException;
import org.springframework.security.web.context.SecurityContextRepository;

@ExtendWith(MockitoExtension.class)
class SecuritySessionHelperTest {

    @Mock
    private SessionRegistry sessionRegistry;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private SecurityContextRepository securityContextRepository;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private HttpSession session;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private SecuritySessionHelper securitySessionHelper;

    private static final String LOGIN = "laxuard@gmail.com";
    private static final String PASSWORD = "password123";
    private static final String SESSION_ID = "rotated-session-id-12345";
    private Object principal;

    @BeforeEach
    void setUp() {
        principal = new UserDetailsImpl(
                UUID.randomUUID(), LOGIN, "Laxuard", "$2a$10$hashed", true, true, List.of());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ==========================================
    // 1. AUTHENTICATE AND CREATE SESSION
    // ==========================================

    @Nested
    @DisplayName("authenticateAndCreateSession()")
    class AuthenticateAndCreateSessionTests {

        @Test
        @DisplayName("Should successfully authenticate, rotate session ID, save context, and register session")
        void authenticateAndCreateSession_Success() {
            when(authentication.getPrincipal()).thenReturn(principal);
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(sessionRegistry.getAllSessions(principal, false))
                    .thenReturn(Collections.emptyList());
            when(request.getSession(true)).thenReturn(session);
            when(session.getId()).thenReturn(SESSION_ID);

            Authentication result = securitySessionHelper.authenticateAndCreateSession(
                    LOGIN, PASSWORD, request, response);

            assertThat(result).isEqualTo(authentication);

            // 1. Verify credentials were authenticated
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

            // 2. Verify Session Fixation defense (rotated session ID)
            verify(request).changeSessionId();

            // 3. Verify SecurityContext was saved to repository
            verify(securityContextRepository).saveContext(any(SecurityContext.class), eq(request), eq(response));

            // 4. Verify session registered in SessionRegistry with rotated ID
            verify(sessionRegistry).registerNewSession(SESSION_ID, principal);
        }

        @Test
        @DisplayName("Should throw SessionAuthenticationException when max session limit (3) is reached")
        void authenticateAndCreateSession_MaxSessionLimitReached() {
            List<SessionInformation> activeSessions = List.of(
                    new SessionInformation(principal, "sess-1", new Date()),
                    new SessionInformation(principal, "sess-2", new Date()),
                    new SessionInformation(principal, "sess-3", new Date()));

            when(authentication.getPrincipal()).thenReturn(principal);
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(sessionRegistry.getAllSessions(principal, false))
                    .thenReturn(activeSessions);

            assertThatThrownBy(() -> securitySessionHelper.authenticateAndCreateSession(
                    LOGIN, PASSWORD, request, response))
                    .isInstanceOf(SessionAuthenticationException.class)
                    .hasMessageContaining("Maximum session limit reached (3)");

            // Verify execution halted before creating session or saving context
            verify(request, never()).getSession(anyBoolean());
            verify(request, never()).changeSessionId();
            verify(securityContextRepository, never()).saveContext(any(), any(), any());
            verify(sessionRegistry, never()).registerNewSession(any(), any());
        }
    }

    // ==========================================
    // 2. DESTROY SESSION
    // ==========================================

    @Nested
    @DisplayName("destroySession()")
    class DestroySessionTests {

        @Test
        @DisplayName("Should invalidate session, remove from registry, clear context, and expire JSESSIONID cookie")
        void destroySession_WithActiveSession() {
            when(request.getSession(false)).thenReturn(session);
            when(session.getId()).thenReturn(SESSION_ID);
            when(request.getContextPath()).thenReturn("/app");

            securitySessionHelper.destroySession(request, response);

            // 1. Verify session removed from registry and invalidated
            verify(sessionRegistry).removeSessionInformation(SESSION_ID);
            verify(session).invalidate();

            // 2. Verify empty context saved to repository
            verify(securityContextRepository).saveContext(any(SecurityContext.class), eq(request), eq(response));

            // 3. Verify expired JSESSIONID cookie was added to response
            ArgumentCaptor<Cookie> cookieCaptor = ArgumentCaptor.forClass(Cookie.class);
            verify(response).addCookie(cookieCaptor.capture());

            Cookie expiredCookie = cookieCaptor.getValue();
            assertThat(expiredCookie.getName()).isEqualTo("JSESSIONID");
            assertThat(expiredCookie.getValue()).isNull();
            assertThat(expiredCookie.getMaxAge()).isEqualTo(0);
            assertThat(expiredCookie.isHttpOnly()).isTrue();
            assertThat(expiredCookie.getPath()).isEqualTo("/app");
        }

        @Test
        @DisplayName("Should clear context and expire cookie even when no active session exists")
        void destroySession_NoActiveSession() {
            when(request.getSession(false)).thenReturn(null);
            when(request.getContextPath()).thenReturn("");

            securitySessionHelper.destroySession(request, response);

            // Verify registry and session methods were not called
            verifyNoInteractions(sessionRegistry);

            // Verify empty context saved and cookie expired with default root path "/"
            verify(securityContextRepository).saveContext(any(SecurityContext.class), eq(request), eq(response));

            ArgumentCaptor<Cookie> cookieCaptor = ArgumentCaptor.forClass(Cookie.class);
            verify(response).addCookie(cookieCaptor.capture());
            assertThat(cookieCaptor.getValue().getPath()).isEqualTo("/");
            assertThat(cookieCaptor.getValue().getMaxAge()).isEqualTo(0);
        }

        @Test
        @DisplayName("Should safely handle null response without throwing exception")
        void destroySession_NullResponse() {
            when(request.getSession(false)).thenReturn(session);
            when(session.getId()).thenReturn(SESSION_ID);

            securitySessionHelper.destroySession(request, null);

            verify(sessionRegistry).removeSessionInformation(SESSION_ID);
            verify(session).invalidate();
            verifyNoInteractions(securityContextRepository);
        }
    }
}

