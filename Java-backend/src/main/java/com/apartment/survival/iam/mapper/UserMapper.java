package com.apartment.survival.iam.mapper;

import org.mapstruct.*;

import com.apartment.survival.iam.dto.AuthRequest;
import com.apartment.survival.iam.dto.AuthResponse;
import com.apartment.survival.iam.dto.UserResponse;
import com.apartment.survival.iam.model.User;
import com.apartment.survival.iam.security.UserDetailsImpl;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE, builder = @Builder(disableBuilder = true))
public interface UserMapper {

    // User Entity -> AuthResponse.UserSummary (maps id -> userId)
    @Mapping(target = "userId", source = "id")
    AuthResponse.UserSummary toSummary(User user);

    // UserDetailsImpl (Security Context) -> AuthResponse.UserSummary
    AuthResponse.UserSummary toSummary(UserDetailsImpl userDetails);

    // User Entity -> UserResponse.ProfileDetail
    @Mapping(target = "userId", source = "id")
    UserResponse.ProfileDetail toProfileDetail(User user);

    // AuthRequest.Register -> User Entity (password encoding & role handled in service)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "accountLocked", constant = "false")
    @Mapping(target = "deleted", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(AuthRequest.Register request);
}
