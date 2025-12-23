<?php

/**
 * X Imperium - Secure Password Handler
 *
 * Provides secure password hashing using Argon2ID (or bcrypt as fallback).
 * Supports migration from legacy MD5 hashes.
 *
 * @package XImperium\Security
 * @license GPL-2.0
 */

class PasswordHandler
{
    /**
     * Argon2ID options (OWASP recommended)
     */
    private const ARGON2_OPTIONS = [
        'memory_cost' => 65536,  // 64 MB
        'time_cost' => 4,        // 4 iterations
        'threads' => 3           // 3 parallel threads
    ];

    /**
     * Bcrypt options (fallback)
     */
    private const BCRYPT_OPTIONS = [
        'cost' => 13  // 2^13 iterations (OWASP 2024 recommendation)
    ];

    /**
     * Maximum password length (DoS prevention)
     */
    private const MAX_PASSWORD_LENGTH = 128;

    /**
     * Hash a password securely
     *
     * @param string $password Plain text password
     * @return string Hashed password
     * @throws RuntimeException If hashing fails
     */
    public static function hash(string $password): string
    {
        $algorithm = self::getAlgorithm();
        $options = self::getOptions($algorithm);

        $hash = password_hash($password, $algorithm, $options);

        // In PHP 8+, password_hash throws on failure instead of returning false
        // This check is kept for documentation purposes
        return $hash;
    }

    /**
     * Verify a password against a hash
     *
     * Supports both modern hashes (Argon2ID/bcrypt) and legacy MD5 hashes
     * for migration purposes.
     *
     * @param string $password Plain text password to verify
     * @param string $hash Stored hash (modern or legacy MD5)
     * @return bool True if password matches
     */
    public static function verify(string $password, string $hash): bool
    {
        // Check if this is a legacy MD5 hash
        if (self::isLegacyMd5Hash($hash)) {
            return self::verifyLegacyMd5($password, $hash);
        }

        // Use PHP's password_verify for modern hashes
        return password_verify($password, $hash);
    }

    /**
     * Check if a hash needs to be rehashed
     *
     * Returns true if:
     * - Hash is legacy MD5
     * - Hash uses outdated algorithm
     * - Hash uses outdated options
     *
     * @param string $hash The hash to check
     * @return bool True if rehashing is needed
     */
    public static function needsRehash(string $hash): bool
    {
        // Legacy MD5 hashes always need rehashing
        if (self::isLegacyMd5Hash($hash)) {
            return true;
        }

        $algorithm = self::getAlgorithm();
        $options = self::getOptions($algorithm);

        return password_needs_rehash($hash, $algorithm, $options);
    }

    /**
     * Check if a hash is a legacy MD5 hash
     *
     * MD5 hashes are exactly 32 hexadecimal characters and don't start with $
     * (modern password hashes like bcrypt/argon2 start with $)
     *
     * @param string $hash Hash to check
     * @return bool True if this is an MD5 hash
     */
    public static function isLegacyMd5Hash(string $hash): bool
    {
        return strlen($hash) === 32
            && ctype_xdigit($hash)
            && !str_starts_with($hash, '$');
    }

    /**
     * Verify password against legacy MD5 hash
     *
     * @param string $password Plain text password
     * @param string $md5Hash MD5 hash
     * @return bool True if password matches
     */
    private static function verifyLegacyMd5(string $password, string $md5Hash): bool
    {
        // Use hash_equals for timing-safe comparison
        return hash_equals($md5Hash, md5($password));
    }

    /**
     * Get the preferred hashing algorithm
     *
     * @return string Algorithm constant (PASSWORD_ARGON2ID, PASSWORD_ARGON2I, or PASSWORD_BCRYPT)
     */
    private static function getAlgorithm(): string
    {
        // Check if Argon2ID is available (PHP 7.3+)
        if (defined('PASSWORD_ARGON2ID')) {
            return PASSWORD_ARGON2ID;
        }

        // Check if Argon2I is available (PHP 7.2+)
        if (defined('PASSWORD_ARGON2I')) {
            return PASSWORD_ARGON2I;
        }

        // Fallback to bcrypt (always available)
        return PASSWORD_BCRYPT;
    }

    /**
     * Get options for the specified algorithm
     *
     * @param int|string $algorithm Algorithm constant
     * @return array Options array
     */
    private static function getOptions($algorithm): array
    {
        if ($algorithm === PASSWORD_BCRYPT) {
            return self::BCRYPT_OPTIONS;
        }

        // Argon2 options
        return self::ARGON2_OPTIONS;
    }

    /**
     * Generate a secure random password
     *
     * @param int $length Password length (default 16, minimum 4)
     * @param bool $specialChars Include special characters
     * @return string Generated password
     * @throws InvalidArgumentException If length is invalid
     * @throws Exception If random bytes generation fails
     */
    public static function generatePassword(int $length = 16, bool $specialChars = true): string
    {
        $minLength = $specialChars ? 4 : 3;
        if ($length < $minLength) {
            throw new InvalidArgumentException("Password length must be at least {$minLength}");
        }
        if ($length > self::MAX_PASSWORD_LENGTH) {
            throw new InvalidArgumentException("Password length must not exceed " . self::MAX_PASSWORD_LENGTH);
        }

        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $numbers = '0123456789';
        $special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        $chars = $lowercase . $uppercase . $numbers;
        if ($specialChars) {
            $chars .= $special;
        }

        $charLength = strlen($chars);
        $password = '';

        // Ensure at least one of each required character type
        $password .= $lowercase[random_int(0, strlen($lowercase) - 1)];
        $password .= $uppercase[random_int(0, strlen($uppercase) - 1)];
        $password .= $numbers[random_int(0, strlen($numbers) - 1)];
        if ($specialChars) {
            $password .= $special[random_int(0, strlen($special) - 1)];
        }

        // Fill rest randomly
        for ($i = strlen($password); $i < $length; $i++) {
            $password .= $chars[random_int(0, $charLength - 1)];
        }

        // Use cryptographically secure Fisher-Yates shuffle
        return self::secureStringShuffle($password);
    }

    /**
     * Cryptographically secure string shuffle using Fisher-Yates algorithm
     *
     * @param string $string String to shuffle
     * @return string Shuffled string
     * @throws Exception If random_int fails
     */
    private static function secureStringShuffle(string $string): string
    {
        $array = str_split($string);
        $length = count($array);

        for ($i = $length - 1; $i > 0; $i--) {
            $j = random_int(0, $i);
            // Swap elements
            $temp = $array[$i];
            $array[$i] = $array[$j];
            $array[$j] = $temp;
        }

        return implode('', $array);
    }

    /**
     * Generate a secure password reset token
     *
     * @return string 64-character hexadecimal token
     * @throws Exception If random bytes generation fails
     */
    public static function generateResetToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Hash a password reset token for storage
     *
     * @param string $token Plain token
     * @return string Hashed token
     */
    public static function hashResetToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /**
     * Verify a password reset token
     *
     * @param string $token Plain token from user
     * @param string $hashedToken Stored hashed token
     * @return bool True if token matches
     */
    public static function verifyResetToken(string $token, string $hashedToken): bool
    {
        return hash_equals($hashedToken, hash('sha256', $token));
    }

    /**
     * Check password strength
     *
     * @param string $password Password to check
     * @return array ['score' => 0-4, 'feedback' => string[], 'strong' => bool]
     */
    public static function checkStrength(string $password): array
    {
        $score = 0;
        $feedback = [];

        $length = strlen($password);

        // Length checks
        if ($length >= 8) {
            $score++;
        } else {
            $feedback[] = 'Password should be at least 8 characters';
        }

        if ($length >= 12) {
            $score++;
        }

        // Character type checks
        if (preg_match('/[a-z]/', $password)) {
            $score += 0.5;
        } else {
            $feedback[] = 'Add lowercase letters';
        }

        if (preg_match('/[A-Z]/', $password)) {
            $score += 0.5;
        } else {
            $feedback[] = 'Add uppercase letters';
        }

        if (preg_match('/[0-9]/', $password)) {
            $score += 0.5;
        } else {
            $feedback[] = 'Add numbers';
        }

        if (preg_match('/[^a-zA-Z0-9]/', $password)) {
            $score += 0.5;
        } else {
            $feedback[] = 'Add special characters';
        }

        // Common patterns (weakness)
        if (preg_match('/^[a-zA-Z]+$/', $password)) {
            $score -= 0.5;
            $feedback[] = 'Avoid using only letters';
        }

        if (preg_match('/^[0-9]+$/', $password)) {
            $score -= 1;
            $feedback[] = 'Avoid using only numbers';
        }

        // Common passwords check (simplified)
        $common = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome'];
        if (in_array(strtolower($password), $common)) {
            $score = 0;
            $feedback = ['This password is too common'];
        }

        $score = max(0, min(4, (int) $score));

        return [
            'score' => $score,
            'feedback' => $feedback,
            'strong' => $score >= 3
        ];
    }

    /**
     * Validate password meets minimum requirements
     *
     * @param string $password Password to validate
     * @param int $minLength Minimum length (default 8)
     * @return array ['valid' => bool, 'errors' => string[]]
     */
    public static function validate(string $password, int $minLength = 8): array
    {
        $errors = [];

        if (strlen($password) < $minLength) {
            $errors[] = "Password must be at least {$minLength} characters";
        }

        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }

        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }

        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
}
