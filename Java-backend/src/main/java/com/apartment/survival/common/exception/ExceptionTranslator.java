package com.apartment.survival.common.exception;

import java.net.URI;
import java.util.Map;
import java.util.Arrays;
import java.time.Instant;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.BadCredentialsException;

@Component
public class ExceptionTranslator {

    private static final URI BLANK_TYPE = URI.create("about:blank");

    public ProblemDetail translate(Exception ex, String path) {
        if (ex instanceof BaseException baseEx) {
            return buildProblemDetail(baseEx.getHttpStatus(), baseEx.getErrorCode(), baseEx.getMessage(), path, null);
        }

        if (ex instanceof AuthenticationException) {
            String detailMessage = "Authentication failed";
            String errorCode = "unauthorized";
            if (ex instanceof BadCredentialsException) {
                detailMessage = "Email or password is incorrect";
                errorCode = "invalid-credentials";
            } else if (ex instanceof LockedException) {
                detailMessage = "Your account has been suspended by an administrator.";
                errorCode = "account-locked";
            }
            return buildProblemDetail(HttpStatus.UNAUTHORIZED, errorCode, detailMessage, path, null);
        }

        if (ex instanceof AccessDeniedException) {
            return buildProblemDetail(HttpStatus.FORBIDDEN, "forbidden",
                    "You do not have permission to access this resource", path, null);
        }

        if (ex instanceof ConcurrencyFailureException) {
            return buildProblemDetail(HttpStatus.CONFLICT, "concurrency-conflict",
                    "The resource was modified by another concurrent transaction. Please retry your request.", path,
                    null);
        }

        if (ex instanceof DataIntegrityViolationException) {
            return buildProblemDetail(HttpStatus.CONFLICT, "data-integrity-violation",
                    "A database integrity constraint was violated (e.g., unique key collision or invalid reference).",
                    path, null);
        }

        if (ex instanceof IllegalArgumentException) {
            return buildProblemDetail(HttpStatus.BAD_REQUEST, "bad-request", ex.getMessage(), path, null);
        }

        return buildProblemDetail(HttpStatus.INTERNAL_SERVER_ERROR, "internal-error", "An unexpected error occurred",
                path, null);
    }

    public ProblemDetail buildProblemDetail(HttpStatus status, String errorCode, String detail, String path, Map<String, Object> properties) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setType(BLANK_TYPE);
        problem.setTitle(toTitle(errorCode));
        problem.setInstance(URI.create(path));

        return addMetadata(problem, properties);
    }

    public ProblemDetail addMetadata(ProblemDetail problem, Map<String, Object> additionalProperties) {
        if (problem.getType() == null) {
            problem.setType(BLANK_TYPE);
        }
        problem.setProperty("timestamp", Instant.now().toString());

        if (additionalProperties != null) {
            additionalProperties.forEach(problem::setProperty);
        }
        return problem;
    }

    private String toTitle(String errorCode) {
        if (errorCode == null || errorCode.isBlank())
            return "Error";
        return Arrays.stream(errorCode.split("-"))
                .filter(w -> !w.isBlank())
                .map(w -> Character.toUpperCase(w.charAt(0)) + w.substring(1))
                .collect(Collectors.joining(" "));
    }
}