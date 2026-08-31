package com.apartment.survival.iam.service;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apartment.survival.common.exception.type.DuplicateResourceException;
import com.apartment.survival.common.exception.type.ResourceNotFoundException;
import com.apartment.survival.iam.dto.AuthRequest;
import com.apartment.survival.iam.dto.AuthResponse;
import com.apartment.survival.iam.mapper.UserMapper;
import com.apartment.survival.iam.model.User;
import com.apartment.survival.iam.repository.UserRepository;
import com.apartment.survival.iam.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

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

    @Transactional(readOnly = true)
    public com.apartment.survival.iam.dto.UserResponse.ProfileDetail getProfile(java.util.UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return userMapper.toProfileDetail(user);
    }

    @Transactional
    public com.apartment.survival.iam.dto.UserResponse.ProfileDetail updateProfile(java.util.UUID userId,
            com.apartment.survival.iam.dto.UserRequest.UpdateProfile request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        String newEmail = request.email().trim();
        String newUsername = request.username().trim();

        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("Email already in use: " + newEmail);
        }

        if (!user.getUsername().equalsIgnoreCase(newUsername) && userRepository.existsByUsername(newUsername)) {
            throw new DuplicateResourceException("Username already in use: " + newUsername);
        }

        user.setUsername(newUsername);
        user.setEmail(newEmail);

        return userMapper.toProfileDetail(user);
    }

    @Transactional
    public void changePassword(java.util.UUID userId,
            com.apartment.survival.iam.dto.UserRequest.ChangePassword request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new com.apartment.survival.common.exception.type.BadRequestException(
                    "Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
    }
}
