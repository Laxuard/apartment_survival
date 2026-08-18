package com.apartment.survival.common.exception.type;

import org.springframework.http.HttpStatus;

import com.apartment.survival.common.exception.BaseException;

public class ResourceNotFoundException extends BaseException {
    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, "resource-not-found", message);
    }
}