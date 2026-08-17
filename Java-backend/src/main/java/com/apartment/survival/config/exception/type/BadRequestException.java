package com.apartment.survival.config.exception.type;

import org.springframework.http.HttpStatus;
import com.apartment.survival.config.exception.BaseException;

public class BadRequestException extends BaseException {
    public BadRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, "bad-request", message);
    }
}