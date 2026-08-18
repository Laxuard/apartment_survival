package com.apartment.survival.common.exception;

import java.util.Map;
import java.util.LinkedHashMap;
import org.springframework.http.*;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private final ExceptionTranslator exceptionTranslator;

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            @NonNull HttpHeaders headers,
            @NonNull HttpStatusCode status,
            @NonNull WebRequest request) {

        var servletRequest = ((ServletWebRequest) request).getRequest();

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe -> fieldErrors.put(fe.getField(), fe.getDefaultMessage()));

        ProblemDetail problem = exceptionTranslator.buildProblemDetail(
                HttpStatus.BAD_REQUEST,
                "validation-failed",
                "Input validation failed",
                servletRequest.getRequestURI(),
                Map.of("invalid_params", fieldErrors));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetail> handleAuthenticationException(AuthenticationException ex,
            HttpServletRequest request) {
        ProblemDetail problem = exceptionTranslator.translate(ex, request.getRequestURI());
        return ResponseEntity.status(problem.getStatus()).body(problem);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDeniedException(AccessDeniedException ex,
            HttpServletRequest request) {
        ProblemDetail problem = exceptionTranslator.translate(ex, request.getRequestURI());
        return ResponseEntity.status(problem.getStatus()).body(problem);
    }

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ProblemDetail> handleBaseException(BaseException ex, HttpServletRequest request) {
        ProblemDetail problem = exceptionTranslator.translate(ex, request.getRequestURI());
        return ResponseEntity.status(problem.getStatus()).body(problem);
    }

    @ExceptionHandler(ConcurrencyFailureException.class)
    public ResponseEntity<ProblemDetail> handleConcurrencyFailure(ConcurrencyFailureException ex,
            HttpServletRequest request) {
        ProblemDetail problem = exceptionTranslator.translate(ex, request.getRequestURI());
        return ResponseEntity.status(problem.getStatus()).body(problem);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ProblemDetail> handleDataIntegrityViolation(DataIntegrityViolationException ex,
            HttpServletRequest request) {
        ProblemDetail problem = exceptionTranslator.translate(ex, request.getRequestURI());
        return ResponseEntity.status(problem.getStatus()).body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleUnexpected(Exception ex, HttpServletRequest request) {
        ProblemDetail problem = exceptionTranslator.translate(ex, request.getRequestURI());
        return ResponseEntity.status(problem.getStatus()).body(problem);
    }

    @Override
    protected ResponseEntity<Object> createResponseEntity(
            Object body,
            @NonNull HttpHeaders headers,
            @NonNull HttpStatusCode statusCode,
            @NonNull WebRequest request) {

        if (body instanceof ProblemDetail problem) {
            exceptionTranslator.addMetadata(problem, null);
        }

        return super.createResponseEntity(body, headers, statusCode, request);
    }
}