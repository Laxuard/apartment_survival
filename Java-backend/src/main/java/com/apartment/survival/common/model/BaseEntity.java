package com.apartment.survival.common.model;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.github.f4b6a3.uuid.UuidCreator;

@Getter
@Setter
@SuperBuilder
@MappedSuperclass
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    // === Primary Key (UUIDv7) ===
    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    // === Auditing Metadata ===
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    // === Optimistic Concurrency Control ===
    @Version
    @Column(name = "version")
    private Long version;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UuidCreator.getTimeOrderedEpoch(); // RFC 9562 time-ordered UUID
        }
    }

    // === JPA Set & Collection-Safe Equality ===
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BaseEntity that)) return false;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
