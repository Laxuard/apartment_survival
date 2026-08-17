package com.apartment.survival.config.exception.type;

import org.springframework.http.HttpStatus;
import com.apartment.survival.config.exception.BaseException;

public class InvalidCredentialsException extends BaseException {
    public InvalidCredentialsException(String message) {
        super(HttpStatus.UNAUTHORIZED, "invalid-credentials", message);
    }
}