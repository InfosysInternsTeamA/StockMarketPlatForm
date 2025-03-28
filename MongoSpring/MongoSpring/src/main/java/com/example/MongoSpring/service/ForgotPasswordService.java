package com.example.MongoSpring.service;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.MongoSpring.model.User;
import com.example.MongoSpring.repository.UserRepository;

@Service
public class ForgotPasswordService {

    private static final Logger logger = LoggerFactory.getLogger(ForgotPasswordService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public void forgotPassword(String email) {
        if (email == null || email.trim().isEmpty()) {
            logger.error("Email is null or empty");
            throw new IllegalArgumentException("Email cannot be empty");
        }

        logger.info("Processing forgot password for email: {}", email);
        try {
            Optional<User> optionalUser = userRepository.findByEmail(email.trim());
            if (!optionalUser.isPresent()) {
                logger.error("User not found for email: {}", email);
                throw new RuntimeException("User not found");
            }

            User user = optionalUser.get();
            String token = UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            user.setResetPasswordExpires(new Date(System.currentTimeMillis() + 3600000));
            try {
                userRepository.save(user);
                logger.info("User token saved successfully for email: {}", email);
            } catch (Exception e) {
                logger.error("Failed to save user token for email: {}", email, e);
                throw new RuntimeException("Failed to save user token: " + e.getMessage());
            }

            String resetLink = "http://localhost:3000/reset-password/" + token;
            try {
                emailService.sendEmail(user.getEmail(), "Password Reset", "Reset link: " + resetLink);
                logger.info("Password reset link sent to email: {}", email);
            } catch (Exception e) {
                logger.error("Failed to send email", e);
                throw new RuntimeException("Failed to send password reset email: " + e.getMessage());
            }
        } catch (Exception e) {
            logger.error("Error in forgotPassword", e);
            throw new RuntimeException("Error processing forgot password request: " + e.getMessage());
        }
    }

    public void resetPassword(String token, String newPassword) {
        logger.info("Processing reset password for token: {}", token);
        Optional<User> optionalUser = userRepository.findByResetPasswordToken(token);
        if (!optionalUser.isPresent()) {
            logger.error("Invalid token: {}", token);
            throw new RuntimeException("Invalid token");
        }

        User user = optionalUser.get();
        if (user.getResetPasswordExpires().before(new Date())) {
            logger.error("Token has expired for token: {}", token);
            throw new RuntimeException("Token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpires(null);
        userRepository.save(user);
        logger.info("Password has been reset for token: {}", token);
    }
}
