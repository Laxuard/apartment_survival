package com.apartment.survival.iam.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.apartment.survival.iam.dto.UserRequest;
import com.apartment.survival.iam.dto.UserResponse;
import com.apartment.survival.iam.security.UserDetailsImpl;
import com.apartment.survival.iam.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(version = "1.0", path = "/api/me")
public class UserController {

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<UserResponse.ProfileDetail> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserResponse.ProfileDetail response = authService.getProfile(userDetails.getUserId());
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<UserResponse.ProfileDetail> updateProfile(
            @Valid @RequestBody UserRequest.UpdateProfile request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserResponse.ProfileDetail response = authService.updateProfile(userDetails.getUserId(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody UserRequest.ChangePassword request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        authService.changePassword(userDetails.getUserId(), request);
        return ResponseEntity.noContent().build();
    }
}
