package com.kaarigarexpo.event_service.dto;

public record AdminAnalyticsResponse(long totalEvents, long upcomingEvents, long ongoingEvents,
                                     long totalApplications, long pendingApplications,
                                     long totalTickets, long checkedInTickets,
                                     double attendanceRatePercent) {}
