
package com.smartticket.backend.service;

import com.smartticket.backend.entity.ShowSeatReservation;
import com.smartticket.backend.repository.ShowSeatReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeatLockService {

    private final StringRedisTemplate redisTemplate;
    private final ShowSeatReservationRepository reservationRepository;

    private static final Duration LOCK_DURATION =
            Duration.ofMinutes(7);

    public String lockSeat(Long showId, Long seatId) {

        // Check database before acquiring Redis lock
        ShowSeatReservation reservation =
                reservationRepository
                        .findByShowIdAndSeatId(showId, seatId)
                        .orElse(null);

        if (reservation != null
                && "BOOKED".equals(reservation.getStatus())) {
            return null;
        }

        String key = buildKey(showId, seatId);
        String lockToken = UUID.randomUUID().toString();

        Boolean locked = redisTemplate.opsForValue()
                .setIfAbsent(key, lockToken, LOCK_DURATION);

        if (Boolean.TRUE.equals(locked)) {
            return lockToken;
        }

        return null;
    }

    public boolean unlockSeat(
            Long showId, Long seatId, String lockToken) {

        if (lockToken == null || lockToken.isBlank()) {
            return false;
        }

        String key = buildKey(showId, seatId);

        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setScriptText(
                "if redis.call('get', KEYS[1]) == ARGV[1] " +
                        "then return redis.call('del', KEYS[1]) " +
                        "else return 0 end"
        );
        script.setResultType(Long.class);

        Long result = redisTemplate.execute(
                script,
                Collections.singletonList(key),
                lockToken
        );

        return Long.valueOf(1L).equals(result);
    }

    private String buildKey(Long showId, Long seatId) {
        return "seat-lock:" + showId + ":" + seatId;
    }

    public boolean isSeatLockedByToken(
            Long showId, Long seatId, String lockToken) {

        if (lockToken == null || lockToken.isBlank()) {
            return false;
        }

        String existingToken = redisTemplate.opsForValue()
                .get(buildKey(showId, seatId));

        return lockToken.equals(existingToken);
    }
}