package com.apartment.survival.iam.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.apartment.survival.iam.model.Role;
import com.apartment.survival.iam.model.User;
import com.apartment.survival.iam.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    private static final String USERNAME = "Laxuard";
    private static final String LOGIN = "laxuard@gmail.com";
    private static final String PASSWORD = "$2a$10$hashed_password";

    @Nested
    @DisplayName("loadUserByUsername()")
    class LoadUserByUsernameTests {

        @Test
        @DisplayName("Should successfully return UserDetails when user exists")
        void loadUserByUsername_Success() {
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .username(USERNAME)
                    .email(LOGIN)
                    .password(PASSWORD)
                    .role(Role.USER)
                    .enabled(true)
                    .accountLocked(false)
                    .build();

            when(userRepository.findByEmailOrUsername(LOGIN, LOGIN))
                    .thenReturn(Optional.of(user));

            UserDetails userDetails = userDetailsService.loadUserByUsername(LOGIN);

            assertThat(userDetails).isNotNull();
            assertThat(userDetails.getUsername()).isEqualTo(USERNAME);
            assertThat(userDetails.getPassword()).isEqualTo(PASSWORD);
            assertThat(userDetails.isEnabled()).isTrue();
            assertThat(userDetails.isAccountNonLocked()).isTrue();
            assertThat(userDetails.getAuthorities())
                    .extracting(GrantedAuthority::getAuthority)
                    .containsExactly("ROLE_USER");

            verify(userRepository).findByEmailOrUsername(LOGIN, LOGIN);
        }

        @Test
        @DisplayName("Should throw UsernameNotFoundException when user is not found")
        void loadUserByUsername_NotFound_ThrowsException() {
            when(userRepository.findByEmailOrUsername(LOGIN, LOGIN))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> userDetailsService.loadUserByUsername(LOGIN))
                    .isInstanceOf(UsernameNotFoundException.class)
                    .hasMessageContaining("User not found with login: " + LOGIN);

            verify(userRepository).findByEmailOrUsername(LOGIN, LOGIN);
        }
    }
}

