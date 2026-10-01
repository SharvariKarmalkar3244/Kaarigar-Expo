package com.kaarigarexpo.event_service.service;

import com.kaarigarexpo.event_service.entity.EntryTicket;
import com.kaarigarexpo.event_service.entity.Event;
import com.kaarigarexpo.event_service.repository.EntryTicketRepository;
import com.kaarigarexpo.event_service.repository.EventRepository;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class EventReminderService {
    private static final System.Logger LOGGER = System.getLogger(EventReminderService.class.getName());
    private final EventRepository eventRepository;
    private final EntryTicketRepository ticketRepository;
    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;

    public EventReminderService(EventRepository eventRepository, EntryTicketRepository ticketRepository,
            ObjectProvider<JavaMailSender> mailSender,
            @Value("${app.email.enabled:false}") boolean enabled,
            @Value("${app.email.from:no-reply@kaarigar-expo.local}") String from) {
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
        this.mailSender = mailSender.getIfAvailable();
        this.enabled = enabled;
        this.from = from;
    }

    @Scheduled(cron = "${app.reminders.cron:0 0 9 * * *}", zone = "Asia/Kolkata")
    @Transactional
    public void sendTomorrowReminders() {
        if (!enabled || mailSender == null) return;
        LocalDate eventDate = LocalDate.now().plusDays(1);
        for (Event event : eventRepository.findByStartDateGreaterThanEqualOrderByStartDateAsc(eventDate)) {
            if (!eventDate.equals(event.getStartDate())) continue;
            for (EntryTicket ticket : ticketRepository.findByEventIdForReminder(event.getId())) {
                if (ticket.getAttendeeEmail() == null || ticket.getAttendeeEmail().isBlank()
                        || eventDate.equals(ticket.getReminderSentFor())) continue;
                try {
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setFrom(from);
                    message.setTo(ticket.getAttendeeEmail());
                    message.setSubject("Reminder: " + event.getTitle() + " is tomorrow");
                    message.setText("Hello " + (ticket.getAttendeeName() == null ? "there" : ticket.getAttendeeName())
                            + ",\n\nYour event " + event.getTitle() + " starts tomorrow (" + eventDate
                            + ") at " + event.getLocation() + ". Keep your QR ticket ready for check-in.");
                    mailSender.send(message);
                    ticket.setReminderSentFor(eventDate);
                    ticketRepository.save(ticket);
                } catch (RuntimeException exception) {
                    LOGGER.log(System.Logger.Level.ERROR, "Could not send an event reminder for ticket " + ticket.getId(), exception);
                }
            }
        }
    }
}
