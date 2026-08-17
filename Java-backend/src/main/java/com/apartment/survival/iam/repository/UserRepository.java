package com.apartment.survival.iam.repository;

import java.util.UUID;
import java.util.Optional;
import com.apartment.survival.iam.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmailOrUsername(String email, String username);

}
