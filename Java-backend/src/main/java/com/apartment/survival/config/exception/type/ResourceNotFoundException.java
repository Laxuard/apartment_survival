package com.apartment.survival.config.exception.type;

import org.springframework.http.HttpStatus;
import com.apartment.survival.config.exception.BaseException;

public class ResourceNotFoundException extends BaseException {
    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, "resource-not-found", message);
    }
}