package com.apartment.survival.iam.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.MappingConstants;
import com.apartment.survival.iam.model.User;
import com.apartment.survival.iam.dto.AuthRequest;
import com.apartment.survival.iam.dto.AuthResponse;
import com.apartment.survival.config.UserDetailsImpl;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {

    // User Entity -> AuthResponse.UserSummary
    AuthResponse.UserSummary toSummary(User user);

    // UserDetailsImpl (Security Context) -> AuthResponse.UserSummary (maps userId -> id)
    @Mapping(target = "id", source = "userId")
    AuthResponse.UserSummary toSummary(UserDetailsImpl userDetails);

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
