package com.kaarigarexpo.kaarigar_service.util;

public final class RoleHeaders {
    private RoleHeaders() {}

    public static boolean hasRole(String role, String expected) {
        if (role == null) return false;
        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) normalized = normalized.substring(5);
        return expected.equalsIgnoreCase(normalized);
    }
}
