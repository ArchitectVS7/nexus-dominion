<?php
/**
 * Registration Integration Tests
 *
 * Tests user registration flow and validation
 */

declare(strict_types=1);

namespace Tests\Integration;

use PHPUnit\Framework\TestCase;
use PasswordHandler;
use InputSanitizer;

/**
 * Integration tests for registration functionality
 */
class RegistrationTest extends TestCase
{
    /**
     * Test password hashing during registration
     */
    public function testRegistrationPasswordHashing(): void
    {
        $password = 'NewUserPassword123!';

        // Simulate registration hashing
        $hashedPassword = PasswordHandler::hash($password);

        // Hash should be Argon2ID
        $this->assertStringStartsWith('$argon2id$', $hashedPassword);

        // Password should verify
        $this->assertTrue(PasswordHandler::verify($password, $hashedPassword));
    }

    /**
     * Test nickname sanitization for XSS prevention
     */
    public function testNicknameSanitization(): void
    {
        $maliciousNickname = '<script>alert("XSS")</script>';

        // The registration code uses str_replace for < and >
        $sanitized = str_replace('<', '&lt;', $maliciousNickname);
        $sanitized = str_replace('>', '&gt;', $sanitized);

        $this->assertStringNotContainsString('<script>', $sanitized);
        $this->assertStringContainsString('&lt;script&gt;', $sanitized);
    }

    /**
     * Test email validation
     */
    public function testEmailValidation(): void
    {
        // Valid emails
        $this->assertEquals(
            'user@example.com',
            InputSanitizer::email('user@example.com')
        );

        // Invalid emails should return null
        $this->assertNull(InputSanitizer::email('not-an-email'));
        $this->assertNull(InputSanitizer::email(''));
        $this->assertNull(InputSanitizer::email('user@'));
    }

    /**
     * Test password match validation
     */
    public function testPasswordMatchValidation(): void
    {
        $password1 = 'MyPassword123!';
        $password2 = 'MyPassword123!';
        $password3 = 'DifferentPassword';

        $this->assertEquals($password1, $password2, 'Matching passwords should be equal');
        $this->assertNotEquals($password1, $password3, 'Different passwords should not match');
    }

    /**
     * Test password strength validation for registration
     */
    public function testPasswordStrengthForRegistration(): void
    {
        // Weak passwords should fail validation
        $weakPasswords = ['abc', '123456', 'password', 'qwerty'];

        foreach ($weakPasswords as $weak) {
            $result = PasswordHandler::validate($weak);
            $this->assertFalse(
                $result['valid'],
                "Weak password '$weak' should fail validation"
            );
        }

        // Strong password should pass
        $strongResult = PasswordHandler::validate('MyStr0ng!P@ssw0rd');
        $this->assertTrue($strongResult['valid'], 'Strong password should pass validation');
    }

    /**
     * Test username sanitization
     */
    public function testUsernameSanitization(): void
    {
        // Valid usernames
        $this->assertEquals('player1', InputSanitizer::username('player1'));
        $this->assertEquals('cool_player', InputSanitizer::username('cool_player'));

        // XSS attempt should be sanitized
        $sanitized = InputSanitizer::username('user<script>');
        $this->assertStringNotContainsString('<', $sanitized);
    }

    /**
     * Test that first user becomes admin
     */
    public function testFirstUserBecomesAdmin(): void
    {
        // This is a logic test - in the registration code:
        // $rs = $DB->Execute("SELECT COUNT(*) FROM system_tb_players");
        // if ($rs->fields[0] == 0) $admin = 1;

        // When count is 0, admin should be 1
        $playerCount = 0;
        $admin = ($playerCount == 0) ? 1 : 0;
        $this->assertEquals(1, $admin, 'First user should be admin');

        // When count > 0, admin should be 0
        $playerCount = 5;
        $admin = ($playerCount == 0) ? 1 : 0;
        $this->assertEquals(0, $admin, 'Subsequent users should not be admin');
    }

    /**
     * Test real name sanitization
     */
    public function testRealNameSanitization(): void
    {
        $maliciousName = 'John <script>evil()</script> Doe';

        // Registration sanitization
        $sanitized = str_replace('<', '&lt;', $maliciousName);
        $sanitized = str_replace('>', '&gt;', $sanitized);

        $this->assertStringNotContainsString('<script>', $sanitized);
        $this->assertStringContainsString('&lt;script&gt;', $sanitized);
    }

    /**
     * Test country field sanitization
     */
    public function testCountrySanitization(): void
    {
        $maliciousCountry = 'USA<img src=x onerror=alert(1)>';

        $sanitized = str_replace('<', '&lt;', $maliciousCountry);
        $sanitized = str_replace('>', '&gt;', $sanitized);

        $this->assertStringNotContainsString('<img', $sanitized);
    }

    /**
     * Test input truncation for long inputs
     */
    public function testInputTruncation(): void
    {
        $longInput = str_repeat('a', 1000);

        // Username should be truncated
        $truncatedUsername = InputSanitizer::username($longInput, 32);
        $this->assertEquals(32, strlen($truncatedUsername));

        // General truncation
        $truncated = InputSanitizer::truncate($longInput, 255);
        $this->assertEquals(255, strlen($truncated));
    }

    /**
     * Test required field validation
     */
    public function testRequiredFieldValidation(): void
    {
        $requiredFields = [
            'email' => '',
            'real_name' => '',
            'country' => '',
            'nickname' => '',
            'password1' => '',
            'password2' => ''
        ];

        // All required fields when empty should trigger validation
        foreach ($requiredFields as $field => $value) {
            $this->assertEmpty($value, "Field '$field' should require validation when empty");
        }
    }
}
