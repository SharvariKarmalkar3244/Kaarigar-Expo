package com.kaarigarexpo.kaarigar_service.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminReviewRequest(

        @NotBlank(message = "Status is required")
        String status,

        String rejectionReason
) {
}