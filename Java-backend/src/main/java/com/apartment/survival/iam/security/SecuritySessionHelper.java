package com.apartment.survival.iam.security;

import java.util.List;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.session.SessionAuthenticationException;

@Component
@RequiredArgsConstructor
public class SecuritySessionHelper {

    private final SessionRegistry sessionRegistry;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    private static final int MAX_SESSIONS = 3;

    public Authentication authenticateAndCreateSession(
            String login, 
            String password, 
            HttpServletRequest request, 
            HttpServletResponse response) {
        
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(login, password)
        );

        List<SessionInformation> sessions = sessionRegistry.getAllSessions(auth.getPrincipal(), false);
        if (sessions.size() >= MAX_SESSIONS) {
            throw new SessionAuthenticationException("Maximum session limit reached (" + MAX_SESSIONS + ")");
        }

        // Prevent Session Fixation: get session and rotate session ID
        HttpSession session = request.getSession(true);
        request.changeSessionId();

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        sessionRegistry.registerNewSession(session.getId(), auth.getPrincipal());

        return auth;
    }

    public void destroySession(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            sessionRegistry.removeSessionInformation(session.getId());
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        if (response != null) {
            SecurityContext emptyContext = SecurityContextHolder.createEmptyContext();
            securityContextRepository.saveContext(emptyContext, request, response);

            // Instruct the client browser to delete the JSESSIONID cookie
            Cookie cookie = new Cookie("JSESSIONID", null);
            String contextPath = request.getContextPath();
            cookie.setPath((contextPath != null && !contextPath.isEmpty()) ? contextPath : "/");
            cookie.setMaxAge(0);
            cookie.setHttpOnly(true);
            response.addCookie(cookie);
        }
    }

}
