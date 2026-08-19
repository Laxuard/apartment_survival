package com.apartment.survival.iam.api;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface UserPublicApi {

    boolean existsById(UUID userId);

    Optional<UserPublicDto> findById(UUID userId);

    Optional<UserPublicDto> findByUsername(String username);

    Map<UUID, UserPublicDto> findAllByIds(Set<UUID> userIds);
}
