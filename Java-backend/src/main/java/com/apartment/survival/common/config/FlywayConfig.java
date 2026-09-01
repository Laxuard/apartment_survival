package com.apartment.survival.common.config;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.AbstractDependsOnBeanFactoryPostProcessor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManagerFactory;

@Configuration
@ConditionalOnClass(Flyway.class)
@ConditionalOnProperty(prefix = "spring.flyway", name = "enabled", matchIfMissing = true)
public class FlywayConfig {

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();
        return flyway;
    }

    @Component
    public static class FlywayEntityManagerFactoryDependsOnPostProcessor extends AbstractDependsOnBeanFactoryPostProcessor {
        public FlywayEntityManagerFactoryDependsOnPostProcessor() {
            super(EntityManagerFactory.class, "flyway");
        }
    }
}

