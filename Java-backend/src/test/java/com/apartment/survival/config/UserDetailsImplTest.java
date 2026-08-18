package com.apartment.survival.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import com.apartment.survival.iam.model.Role;
import com.apartment.survival.iam.model.User;

class UserDetailsImplTest {

    private static final UUID USER_ID_1 = UUID.randomUUID();
    private static final UUID USER_ID_2 = UUID.randomUUID();
    private static final String USERNAME = "Laxuard";
    private static final String EMAIL = "laxuard@gmail.com";
    private static final String PASSWORD = "$2a$10$hashed_password";

    @Nested
    @DisplayName("Constructor and Mapping Tests")
    class ConstructorMappingTests {

        @Test
        @DisplayName("Should correctly map all fields from User entity")
        void shouldMapFromUserEntity() {
            User user = User.builder()
                    .id(USER_ID_1)
                    .username(USERNAME)
                    .email(EMAIL)
                    .password(PASSWORD)
                    .role(Role.ADMIN)
                    .enabled(true)
                    .accountLocked(false)
                    .build();

            UserDetailsImpl userDetails = new UserDetailsImpl(user);

            assertThat(userDetails.getUserId()).isEqualTo(USER_ID_1);
            assertThat(userDetails.getUsername()).isEqualTo(USERNAME);
            assertThat(userDetails.getEmail()).isEqualTo(EMAIL);
            assertThat(userDetails.getPassword()).isEqualTo(PASSWORD);
            assertThat(userDetails.isEnabled()).isTrue();
            assertThat(userDetails.isAccountNonLocked()).isTrue();
            assertThat(userDetails.isAccountNonExpired()).isTrue();
            assertThat(userDetails.isCredentialsNonExpired()).isTrue();
            assertThat(userDetails.getAuthorities())
                    .extracting(GrantedAuthority::getAuthority)
                    .containsExactly("ROLE_ADMIN");
        }

        @Test
        @DisplayName("Should set accountNonLocked to false when User is locked")
        void shouldMapAccountLockedCorrectly() {
            User lockedUser = User.builder()
                    .id(USER_ID_1)
                    .username(USERNAME)
                    .email(EMAIL)
                    .password(PASSWORD)
                    .role(Role.USER)
                    .enabled(true)
                    .accountLocked(true)
                    .build();

            UserDetailsImpl userDetails = new UserDetailsImpl(lockedUser);

            assertThat(userDetails.isAccountNonLocked()).isFalse();
        }
    }

    @Nested
    @DisplayName("Equals and HashCode Contract (SessionRegistry requirement)")
    class EqualsAndHashCodeTests {

        @Test
        @DisplayName("Should be equal and have same hashCode when userIds match")
        void shouldBeEqualWhenUserIdMatches() {
            UserDetailsImpl user1 = new UserDetailsImpl(
                    USER_ID_1, EMAIL, USERNAME, PASSWORD, true, true, List.of());
            UserDetailsImpl user2 = new UserDetailsImpl(
                    USER_ID_1, "different@gmail.com", "DifferentUser", "different_pwd", false, false, List.of());

            // Reflexive
            assertThat(user1).isEqualTo(user1);

            // Symmetric based on userId
            assertThat(user1).isEqualTo(user2);
            assertThat(user2).isEqualTo(user1);
            assertThat(user1.hashCode()).isEqualTo(user2.hashCode());
        }

        @Test
        @DisplayName("Should not be equal when userIds differ")
        void shouldNotBeEqualWhenUserIdDiffers() {
            UserDetailsImpl user1 = new UserDetailsImpl(
                    USER_ID_1, EMAIL, USERNAME, PASSWORD, true, true, List.of());
            UserDetailsImpl user2 = new UserDetailsImpl(
                    USER_ID_2, EMAIL, USERNAME, PASSWORD, true, true, List.of());

            assertThat(user1).isNotEqualTo(user2);
            assertThat(user1.hashCode()).isNotEqualTo(user2.hashCode());
        }

        @Test
        @DisplayName("Should not be equal to null or different class type")
        void shouldNotBeEqualToNullOrDifferentType() {
            UserDetailsImpl user = new UserDetailsImpl(
                    USER_ID_1, EMAIL, USERNAME, PASSWORD, true, true, List.of());

            assertThat(user).isNotEqualTo(null);
            assertThat(user).isNotEqualTo("NotAUserDetailsObject");
        }
    }
}
