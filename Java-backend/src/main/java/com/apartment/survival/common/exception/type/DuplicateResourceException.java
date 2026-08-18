package com.apartment.survival.common.exception.type;

import org.springframework.http.HttpStatus;

import com.apartment.survival.common.exception.BaseException;

public class DuplicateResourceException extends BaseException {

    public DuplicateResourceException(String message) {
        super(HttpStatus.CONFLICT, "duplicate-resource", message);
    }
}