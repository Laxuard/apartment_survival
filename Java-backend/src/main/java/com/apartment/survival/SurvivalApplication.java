package com.apartment.survival;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class SurvivalApplication {

	public static void main(String[] args) {
		SpringApplication.run(SurvivalApplication.class, args);
	}

}
