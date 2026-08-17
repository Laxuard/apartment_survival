package com.apartment.survival.iam.service;

import lombok.RequiredArgsConstructor;
import com.apartment.survival.iam.model.User;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;
import com.apartment.survival.iam.dto.AuthRequest;
import com.apartment.survival.iam.dto.AuthResponse;
import com.apartment.survival.iam.mapper.UserMapper;
import com.apartment.survival.config.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import com.apartment.survival.iam.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import com.apartment.survival.config.exception.type.ResourceNotFoundException;
import com.apartment.survival.config.exception.type.DuplicateResourceException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse.UserSummary register(AuthRequest.Register request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already in use: " + request.email());
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username already in use: " + request.username());
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.password()));

        User savedUser = userRepository.save(user);
        return userMapper.toSummary(savedUser);
    }

    public AuthResponse.UserSummary getCurrentUserSummary(HttpServletRequest httpRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new ResourceNotFoundException("No authenticated user in current session");
        }

        if (auth.getPrincipal() instanceof UserDetailsImpl userDetails) {
            return userMapper.toSummary(userDetails);
        }

        throw new ResourceNotFoundException("User principal not found");
    }
}
