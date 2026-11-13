
package com.smartticket.backend.service;
import com.smartticket.backend.entity.Seat;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import com.smartticket.backend.dto.SeatResponse;
import com.smartticket.backend.dto.ShowSeatResponse;
import com.smartticket.backend.entity.ShowSeatReservation;
import com.smartticket.backend.repository.SeatRepository;
import com.smartticket.backend.repository.ShowSeatReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final ShowSeatReservationRepository reservationRepository;

    public List<SeatResponse> getSeatsByScreen(Long screenId) {
        return seatRepository.findByScreenId(screenId)
                .stream()
                .map(seat -> new SeatResponse(
                        seat.getId(),
                        seat.getScreenId(),
                        seat.getSeatNumber(),
                        seat.getSeatTier(),
                        seat.getPrice()
                ))
                .toList();
    }

    public List<ShowSeatResponse> getAvailableSeats(Long screenId) {

        // Temporary development assumption: show ID equals screen ID.
        Long showId = screenId;

        Map<Long, ShowSeatReservation> reservations =
                reservationRepository.findByShowId(showId)
                        .stream()
                        .collect(Collectors.toMap(
                                ShowSeatReservation::getSeatId,
                                Function.identity()
                        ));

        return seatRepository.findByScreenId(screenId)
                .stream()
                .map(seat -> {
                    ShowSeatReservation reservation =
                            reservations.get(seat.getId());

                    String status = reservation == null
                            ? "AVAILABLE"
                            : reservation.getStatus();

                    return new ShowSeatResponse(
                            seat.getId(),
                            seat.getScreenId(),
                            seat.getSeatNumber(),
                            seat.getSeatTier(),
                            seat.getPrice(),
                            status
                    );
                })
                .toList();
    }
    @Transactional
    public int generateSeatsForScreen(Long screenId) {

        if (!seatRepository.findByScreenId(screenId).isEmpty()) {
            return 0;
        }

        List<Seat> seats = new java.util.ArrayList<>();

        for (int i = 1; i <= 100; i++) {
            String row = String.valueOf((char) ('A' + (i - 1) / 10));
            int number = ((i - 1) % 10) + 1;

            seats.add(Seat.builder()
                    .screenId(screenId)
                    .seatNumber(row + number)
                    .seatTier(row.equals("A") ? "PREMIUM" : "REGULAR")
                    .price(row.equals("A")
                            ? new BigDecimal("250.00")
                            : new BigDecimal("180.00"))
                    .build());
        }

        seatRepository.saveAll(seats);
        return seats.size();
    }
}