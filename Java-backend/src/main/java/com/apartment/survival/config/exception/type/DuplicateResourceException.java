package com.apartment.survival.config.exception.type;

import org.springframework.http.HttpStatus;
import com.apartment.survival.config.exception.BaseException;

public class DuplicateResourceException extends BaseException {

    public DuplicateResourceException(String message) {
        super(HttpStatus.CONFLICT, "duplicate-resource", message);
    }
}