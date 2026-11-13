
package com.smartticket.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SeatLockServiceTest {

    @Autowired
    private SeatLockService seatLockService;

    @Test
    void onlyOneRequestCanLockTheSameSeat() throws Exception {
        Long showId = 99999L;
        Long seatId = 99999L;

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);

        try {
            Future<String> first = executor.submit(() -> {
                ready.countDown();
                start.await();
                return seatLockService.lockSeat(showId, seatId);
            });

            Future<String> second = executor.submit(() -> {
                ready.countDown();
                start.await();
                return seatLockService.lockSeat(showId, seatId);
            });

            ready.await();
            start.countDown();

            String firstToken = first.get();
            String secondToken = second.get();

            assertNotEquals(
                    firstToken == null,
                    secondToken == null,
                    "Exactly one request should acquire the seat lock"
            );

            String winningToken =
                    firstToken != null ? firstToken : secondToken;

            assertTrue(seatLockService.unlockSeat(
                    showId, seatId, winningToken));
        } finally {
            executor.shutdownNow();
        }
    }
}