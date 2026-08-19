package com.apartment.survival.iam.service;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apartment.survival.iam.api.UserPublicApi;
import com.apartment.survival.iam.api.UserPublicDto;
import com.apartment.survival.iam.model.User;
import com.apartment.survival.iam.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserPublicApiImpl implements UserPublicApi {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(UUID userId) {
        return userRepository.existsById(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserPublicDto> findById(UUID userId) {
        return userRepository.findById(userId)
                .filter(User::isEnabled)
                .filter(u -> !u.isAccountLocked())
                .filter(u -> !u.isDeleted())
                .map(u -> new UserPublicDto(u.getId(), u.getUsername(), u.getEmail()));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<UUID, UserPublicDto> findAllByIds(Set<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        
        return userRepository.findAllById(userIds).stream()
                .filter(User::isEnabled)
                .filter(u -> !u.isAccountLocked())
                .filter(u -> !u.isDeleted())
                .collect(Collectors.toMap(
                        User::getId,
                        u -> new UserPublicDto(u.getId(), u.getUsername(), u.getEmail())
                ));
    }
}
