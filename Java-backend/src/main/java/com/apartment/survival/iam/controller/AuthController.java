package com.apartment.survival.iam.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.apartment.survival.iam.dto.AuthRequest;
import com.apartment.survival.iam.dto.AuthResponse;
import com.apartment.survival.iam.security.SecuritySessionHelper;
import com.apartment.survival.iam.service.AuthService;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping(version = "1.0", path = "/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SecuritySessionHelper securitySessionHelper;
    
    @GetMapping("/csrf")
    public ResponseEntity<AuthResponse.CsrfToken> getCsrfToken(CsrfToken csrfToken) {
        if (csrfToken == null) {
            return ResponseEntity.ok(new AuthResponse.CsrfToken("", "X-XSRF-TOKEN", "_csrf"));
        }
        return ResponseEntity.ok(new AuthResponse.CsrfToken(
            csrfToken.getToken(),
            csrfToken.getHeaderName(),
            csrfToken.getParameterName()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse.UserSummary> login(@Valid @RequestBody AuthRequest.Login request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {

        securitySessionHelper.authenticateAndCreateSession(request.login(), request.password(), httpRequest, httpResponse);
        AuthResponse.UserSummary userSummary = authService.getCurrentUserSummary(httpRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body(userSummary);
    }
    

    @PostMapping("/register")
    public ResponseEntity<AuthResponse.UserSummary> register(@Valid @RequestBody AuthRequest.Register request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {

        AuthResponse.UserSummary userSummary = authService.register(request);
        securitySessionHelper.authenticateAndCreateSession(request.email(), request.password(), httpRequest, httpResponse);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(userSummary);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        securitySessionHelper.destroySession(request, response);
        return ResponseEntity.noContent().build();
    }

}
