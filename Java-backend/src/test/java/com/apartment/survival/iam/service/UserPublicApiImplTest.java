package com.apartment.survival.iam.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.apartment.survival.iam.api.UserPublicDto;
import com.apartment.survival.iam.model.User;
import com.apartment.survival.iam.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserPublicApiImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserPublicApiImpl userPublicApi;

    private static final UUID USER_ID_1 = UUID.randomUUID();
    private static final UUID USER_ID_2 = UUID.randomUUID();

    // ==========================================
    // 1. EXISTS BY ID
    // ==========================================

    @Nested
    @DisplayName("existsById()")
    class ExistsByIdTests {

        @Test
        @DisplayName("Should return true when user exists in repository")
        void existsById_True() {
            when(userRepository.existsById(USER_ID_1)).thenReturn(true);

            boolean exists = userPublicApi.existsById(USER_ID_1);

            assertThat(exists).isTrue();
            verify(userRepository).existsById(USER_ID_1);
        }

        @Test
        @DisplayName("Should return false when user does not exist in repository")
        void existsById_False() {
            when(userRepository.existsById(USER_ID_1)).thenReturn(false);

            boolean exists = userPublicApi.existsById(USER_ID_1);

            assertThat(exists).isFalse();
            verify(userRepository).existsById(USER_ID_1);
        }
    }

    // ==========================================
    // 2. FIND BY ID
    // ==========================================

    @Nested
    @DisplayName("findById()")
    class FindByIdTests {

        @Test
        @DisplayName("Should return UserPublicDto when user is active, non-locked, and not deleted")
        void findById_ActiveUser_Success() {
            User activeUser = User.builder()
                    .id(USER_ID_1)
                    .username("Laxuard")
                    .email("laxuard@gmail.com")
                    .enabled(true)
                    .accountLocked(false)
                    .deleted(false)
                    .build();

            when(userRepository.findById(USER_ID_1)).thenReturn(Optional.of(activeUser));

            Optional<UserPublicDto> result = userPublicApi.findById(USER_ID_1);

            assertThat(result).isPresent();
            assertThat(result.get().userId()).isEqualTo(USER_ID_1);
            assertThat(result.get().username()).isEqualTo("Laxuard");
            assertThat(result.get().email()).isEqualTo("laxuard@gmail.com");
        }

        @Test
        @DisplayName("Should return empty when user is locked or soft-deleted")
        void findById_LockedOrDeletedUser_ReturnsEmpty() {
            User lockedUser = User.builder()
                    .id(USER_ID_1)
                    .username("Laxuard")
                    .email("laxuard@gmail.com")
                    .enabled(true)
                    .accountLocked(true) // Locked
                    .deleted(false)
                    .build();

            when(userRepository.findById(USER_ID_1)).thenReturn(Optional.of(lockedUser));

            Optional<UserPublicDto> result = userPublicApi.findById(USER_ID_1);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should return empty when user is not found in database")
        void findById_NotFound_ReturnsEmpty() {
            when(userRepository.findById(USER_ID_1)).thenReturn(Optional.empty());

            Optional<UserPublicDto> result = userPublicApi.findById(USER_ID_1);

            assertThat(result).isEmpty();
        }
    }

    // ==========================================
    // 3. FIND BY USERNAME
    // ==========================================

    @Nested
    @DisplayName("findByUsername()")
    class FindByUsernameTests {

        @Test
        @DisplayName("Should return UserPublicDto when user exists, is active, non-locked, and not deleted")
        void findByUsername_ActiveUser_Success() {
            User activeUser = User.builder()
                    .id(USER_ID_1)
                    .username("Laxuard")
                    .email("laxuard@gmail.com")
                    .enabled(true)
                    .accountLocked(false)
                    .deleted(false)
                    .build();

            when(userRepository.findByUsername("Laxuard")).thenReturn(Optional.of(activeUser));

            Optional<UserPublicDto> result = userPublicApi.findByUsername("Laxuard");

            assertThat(result).isPresent();
            assertThat(result.get().userId()).isEqualTo(USER_ID_1);
            assertThat(result.get().username()).isEqualTo("Laxuard");
            assertThat(result.get().email()).isEqualTo("laxuard@gmail.com");
        }

        @Test
        @DisplayName("Should return empty when username is null or blank without querying repository")
        void findByUsername_NullOrBlank_ReturnsEmpty() {
            assertThat(userPublicApi.findByUsername(null)).isEmpty();
            assertThat(userPublicApi.findByUsername("")).isEmpty();
            assertThat(userPublicApi.findByUsername("   ")).isEmpty();
            verifyNoInteractions(userRepository);
        }

        @Test
        @DisplayName("Should return empty when user is locked or soft-deleted")
        void findByUsername_LockedOrDeleted_ReturnsEmpty() {
            User lockedUser = User.builder()
                    .id(USER_ID_1)
                    .username("Laxuard")
                    .email("laxuard@gmail.com")
                    .enabled(true)
                    .accountLocked(true)
                    .deleted(false)
                    .build();

            when(userRepository.findByUsername("Laxuard")).thenReturn(Optional.of(lockedUser));

            Optional<UserPublicDto> result = userPublicApi.findByUsername("Laxuard");

            assertThat(result).isEmpty();
        }
    }

    // ==========================================
    // 4. FIND ALL BY IDS (BATCH LOOKUP)
    // ==========================================

    @Nested
    @DisplayName("findAllByIds()")
    class FindAllByIdsTests {

        @Test
        @DisplayName("Should return empty map when set of IDs is null or empty without querying DB")
        void findAllByIds_EmptySet_ReturnsEmptyMap() {
            Map<UUID, UserPublicDto> resultNull = userPublicApi.findAllByIds(null);
            Map<UUID, UserPublicDto> resultEmpty = userPublicApi.findAllByIds(Set.of());

            assertThat(resultNull).isEmpty();
            assertThat(resultEmpty).isEmpty();
            verifyNoInteractions(userRepository);
        }

        @Test
        @DisplayName("Should return mapped profiles for active users and filter out inactive ones")
        void findAllByIds_BatchLookup_Success() {
            User activeUser1 = User.builder()
                    .id(USER_ID_1)
                    .username("Alex")
                    .email("alex@gmail.com")
                    .enabled(true)
                    .accountLocked(false)
                    .deleted(false)
                    .build();

            User activeUser2 = User.builder()
                    .id(USER_ID_2)
                    .username("Bob")
                    .email("bob@gmail.com")
                    .enabled(true)
                    .accountLocked(false)
                    .deleted(false)
                    .build();

            UUID lockedUserId = UUID.randomUUID();
            User lockedUser = User.builder()
                    .id(lockedUserId)
                    .username("BannedUser")
                    .email("banned@gmail.com")
                    .enabled(true)
                    .accountLocked(true)
                    .deleted(false)
                    .build();

            Set<UUID> queryIds = Set.of(USER_ID_1, USER_ID_2, lockedUserId);

            when(userRepository.findAllById(queryIds)).thenReturn(List.of(activeUser1, activeUser2, lockedUser));

            Map<UUID, UserPublicDto> results = userPublicApi.findAllByIds(queryIds);

            assertThat(results).hasSize(2);
            assertThat(results).containsKey(USER_ID_1);
            assertThat(results).containsKey(USER_ID_2);
            assertThat(results).doesNotContainKey(lockedUserId);

            assertThat(results.get(USER_ID_1).username()).isEqualTo("Alex");
            assertThat(results.get(USER_ID_2).username()).isEqualTo("Bob");
        }
    }
}
