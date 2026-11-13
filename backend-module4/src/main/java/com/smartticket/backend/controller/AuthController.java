package com.smartticket.backend.controller;
import com.smartticket.backend.dto.ProfileUpdateRequest;
import com.smartticket.backend.dto.CustomerResponse;
import java.util.List;
import com.smartticket.backend.dto.RegistrationRequest;
import com.smartticket.backend.dto.RegistrationResponse;
import com.smartticket.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartticket.backend.dto.LoginRequest;
import com.smartticket.backend.dto.LoginResponse;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:4202",
        "http://localhost:4201"
})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(
            @RequestBody RegistrationRequest request) {

        RegistrationResponse response = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    @PutMapping("/profile/{userId}")
    public ResponseEntity<LoginResponse> updateProfile(
            @PathVariable Long userId,
            @RequestBody ProfileUpdateRequest request) {

        LoginResponse response = authService.updateProfile(userId, request);

        return ResponseEntity.ok(response);
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleRegistrationError(
            IllegalArgumentException exception) {

        return ResponseEntity.badRequest().body(exception.getMessage());
    }
    @GetMapping("/users")
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {

        List<CustomerResponse> customers = authService.getAllCustomers();

        return ResponseEntity.ok(customers);
    }
}