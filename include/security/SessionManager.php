<?php

/**
 * X Imperium - Session Security Manager
 *
 * Provides secure session handling with CSRF protection, session fixation prevention,
 * and secure cookie configuration.
 *
 * @package XImperium\Security
 * @license GPL-2.0
 */

class SessionManager
{
    /**
     * Default session lifetime in seconds (1 hour)
     */
    private const DEFAULT_LIFETIME = 3600;

    /**
     * Session regeneration interval in seconds (30 minutes)
     */
    private const REGENERATE_INTERVAL = 1800;

    /**
     * CSRF token length in bytes
     */
    private const CSRF_TOKEN_LENGTH = 32;

    /**
     * CSRF token lifetime in seconds (1 hour)
     */
    private const CSRF_TOKEN_LIFETIME = 3600;

    /**
     * Reserved internal session keys
     */
    private const RESERVED_KEYS = [
        '_security_created',
        '_security_last_activity',
        '_security_last_regeneration',
        '_security_user_agent',
        '_security_ip',
        '_csrf_token',
        '_csrf_token_time',
        '_session_expired',
        '_flash',
        '_flash_old'
    ];

    /**
     * @var bool Whether session has been initialized
     */
    private static bool $initialized = false;

    /**
     * @var bool Whether session has expired
     */
    private static bool $expired = false;

    /**
     * Initialize secure session handling
     *
     * Should be called before any session operations.
     *
     * @param array $options Optional configuration options
     * @return void
     * @throws RuntimeException If session fails to start
     */
    public static function init(array $options = []): void
    {
        if (self::$initialized) {
            return;
        }

        // Don't initialize if already started
        if (session_status() === PHP_SESSION_ACTIVE) {
            self::$initialized = true;
            return;
        }

        // Configure secure session settings
        self::configureSession($options);

        // Start the session with error handling
        if (!@session_start()) {
            $error = error_get_last();
            throw new RuntimeException(
                'Failed to start session: ' . ($error['message'] ?? 'Unknown error')
            );
        }

        // Initialize session security tracking
        self::initSessionSecurity();

        self::$initialized = true;
    }

    /**
     * Configure PHP session settings
     *
     * @param array $options Configuration options
     * @return void
     * @throws InvalidArgumentException If options are invalid
     */
    private static function configureSession(array $options): void
    {
        // Validate lifetime
        $lifetime = $options['lifetime'] ?? self::DEFAULT_LIFETIME;
        if (!is_int($lifetime) || $lifetime < 0 || $lifetime > 86400 * 30) {
            throw new InvalidArgumentException('Invalid session lifetime: must be 0 to 30 days');
        }

        $secure = $options['secure'] ?? self::isHttps();
        $sameSite = $options['samesite'] ?? 'Lax'; // Lax is safer default for compatibility

        // Validate sameSite
        if (!in_array($sameSite, ['Strict', 'Lax', 'None'], true)) {
            throw new InvalidArgumentException('Invalid samesite value');
        }

        // Validate domain if provided
        $domain = $options['domain'] ?? '';
        $domainPattern = '/^\.?[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?'
            . '(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/';
        if ($domain !== '' && !preg_match($domainPattern, $domain)) {
            throw new InvalidArgumentException('Invalid cookie domain format');
        }

        // Set session cookie parameters
        $cookieParams = [
            'lifetime' => $lifetime,
            'path' => '/',
            'domain' => $domain,
            'secure' => $secure,
            'httponly' => true,
            'samesite' => $sameSite
        ];

        session_set_cookie_params($cookieParams);

        // Additional security settings
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.use_trans_sid', '0');

        // Set session name (optional custom name)
        if (isset($options['name'])) {
            // Session name can only contain alphanumeric characters
            if (!preg_match('/^[a-zA-Z][a-zA-Z0-9]*$/', $options['name'])) {
                throw new InvalidArgumentException('Invalid session name: must be alphanumeric starting with letter');
            }
            session_name($options['name']);
        }
    }

    /**
     * Initialize session security tracking
     *
     * @return void
     */
    private static function initSessionSecurity(): void
    {
        $now = time();

        // Clean up old flash data from previous request
        if (isset($_SESSION['_flash_old'])) {
            unset($_SESSION['_flash_old']);
        }
        if (isset($_SESSION['_flash'])) {
            $_SESSION['_flash_old'] = $_SESSION['_flash'];
            unset($_SESSION['_flash']);
        }

        // Initialize creation time if not set (new session)
        if (!isset($_SESSION['_security_created'])) {
            $_SESSION['_security_created'] = $now;
            $_SESSION['_security_last_activity'] = $now;
            $_SESSION['_security_last_regeneration'] = $now;
            $_SESSION['_security_user_agent'] = self::sanitizeUserAgent($_SERVER['HTTP_USER_AGENT'] ?? '');
            $_SESSION['_security_ip'] = self::getClientIp();

            // Generate initial CSRF token
            self::regenerateCsrfToken();
            return;
        }

        // Check for session timeout
        $lastActivity = $_SESSION['_security_last_activity'] ?? 0;
        $lifetime = defined('CONF_SESSION_TIMEOUT') ? CONF_SESSION_TIMEOUT : self::DEFAULT_LIFETIME;

        // Handle time going backwards (clock skew)
        if ($now < $lastActivity) {
            $_SESSION['_security_last_activity'] = $now;
            return;
        }

        if (($now - $lastActivity) > $lifetime) {
            // Mark session as expired but don't recursively reinitialize
            $_SESSION = [];
            $_SESSION['_session_expired'] = true;
            self::$expired = true;
            return;
        }

        // Verify fingerprint on every request for session hijacking detection
        if (!self::verifyFingerprint(false)) {
            // Fingerprint mismatch - possible session hijacking
            $_SESSION = [];
            $_SESSION['_session_expired'] = true;
            self::$expired = true;
            return;
        }

        // Update last activity time
        $_SESSION['_security_last_activity'] = $now;

        // Regenerate session ID periodically (track last regeneration separately)
        $lastRegen = $_SESSION['_security_last_regeneration'] ?? $_SESSION['_security_created'] ?? 0;
        if (($now - $lastRegen) > self::REGENERATE_INTERVAL) {
            self::regenerateId(false); // Don't delete old session immediately for concurrent requests
            $_SESSION['_security_last_regeneration'] = $now;
        }
    }

    /**
     * Check if session has expired
     *
     * @return bool
     */
    public static function isExpired(): bool
    {
        return self::$expired || (isset($_SESSION['_session_expired']) && $_SESSION['_session_expired']);
    }

    /**
     * Sanitize user agent string
     *
     * @param string $userAgent Raw user agent
     * @return string Sanitized user agent
     */
    private static function sanitizeUserAgent(string $userAgent): string
    {
        // Remove null bytes and limit length
        $userAgent = str_replace("\0", '', $userAgent);
        return substr($userAgent, 0, 255);
    }

    /**
     * Check if connection is HTTPS
     *
     * Only trusts proxy headers from configured trusted proxies.
     *
     * @return bool
     */
    private static function isHttps(): bool
    {
        // Check actual HTTPS first (cannot be spoofed)
        if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
            return true;
        }

        if (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) {
            return true;
        }

        // Only trust proxy headers from known trusted proxies
        $trustedProxies = defined('CONF_TRUSTED_PROXIES') ? CONF_TRUSTED_PROXIES : [];
        $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';

        if (!empty($trustedProxies) && is_array($trustedProxies) && in_array($remoteAddr, $trustedProxies, true)) {
            return !empty($_SERVER['HTTP_X_FORWARDED_PROTO'])
                && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https';
        }

        return false;
    }

    /**
     * Get client IP address
     *
     * Only trusts proxy headers from configured trusted proxies.
     *
     * @return string
     */
    private static function getClientIp(): string
    {
        $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        // Only trust proxy headers from known trusted proxies
        $trustedProxies = defined('CONF_TRUSTED_PROXIES') ? CONF_TRUSTED_PROXIES : [];

        if (!empty($trustedProxies) && is_array($trustedProxies) && in_array($remoteAddr, $trustedProxies, true)) {
            // Check X-Forwarded-For from trusted proxy
            if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
                $ip = trim($ips[0]);
                // Validate IP and reject private/reserved ranges from proxy headers
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }

        // Fall back to REMOTE_ADDR (cannot be spoofed at TCP level)
        if (filter_var($remoteAddr, FILTER_VALIDATE_IP)) {
            return $remoteAddr;
        }

        return '0.0.0.0';
    }

    /**
     * Regenerate session ID
     *
     * Prevents session fixation attacks.
     *
     * @param bool $deleteOldSession Delete the old session data (false is safer for concurrent requests)
     * @return bool
     */
    public static function regenerateId(bool $deleteOldSession = false): bool
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return false;
        }

        $result = session_regenerate_id($deleteOldSession);

        if ($result) {
            $_SESSION['_security_created'] = time();
        }

        return $result;
    }

    /**
     * Generate a new CSRF token
     *
     * @return string The new CSRF token
     * @throws RuntimeException If random bytes generation fails
     */
    public static function regenerateCsrfToken(): string
    {
        self::requireActiveSession();

        try {
            $token = bin2hex(random_bytes(self::CSRF_TOKEN_LENGTH));
        } catch (Exception $e) {
            throw new RuntimeException('Failed to generate CSRF token: ' . $e->getMessage(), 0, $e);
        }

        $_SESSION['_csrf_token'] = $token;
        $_SESSION['_csrf_token_time'] = time();
        return $token;
    }

    /**
     * Get the current CSRF token
     *
     * Generates a new token if none exists.
     *
     * @return string CSRF token
     */
    public static function getCsrfToken(): string
    {
        self::requireActiveSession();

        if (!isset($_SESSION['_csrf_token']) || $_SESSION['_csrf_token'] === '') {
            return self::regenerateCsrfToken();
        }
        return $_SESSION['_csrf_token'];
    }

    /**
     * Validate a CSRF token
     *
     * @param string $token Token to validate
     * @param bool $regenerate Whether to regenerate token after validation
     * @return bool True if token is valid
     */
    public static function validateCsrfToken(string $token, bool $regenerate = false): bool
    {
        $storedToken = $_SESSION['_csrf_token'] ?? '';
        $tokenTime = $_SESSION['_csrf_token_time'] ?? 0;

        // Check for empty tokens
        if ($storedToken === '' || $token === '') {
            return false;
        }

        // Validate expected token length (bin2hex doubles the byte length)
        $expectedLength = self::CSRF_TOKEN_LENGTH * 2;
        if (strlen($token) !== $expectedLength) {
            return false;
        }

        // Check token expiration
        $tokenLifetime = defined('CONF_CSRF_TOKEN_LIFETIME') ? CONF_CSRF_TOKEN_LIFETIME : self::CSRF_TOKEN_LIFETIME;
        if ((time() - $tokenTime) > $tokenLifetime) {
            self::regenerateCsrfToken();
            return false;
        }

        $valid = hash_equals($storedToken, $token);

        if ($valid && $regenerate) {
            self::regenerateCsrfToken();
        }

        return $valid;
    }

    /**
     * Generate CSRF token HTML input field
     *
     * @param string $name Input field name
     * @return string HTML input element
     */
    public static function csrfField(string $name = 'csrf_token'): string
    {
        $token = self::getCsrfToken();
        return sprintf(
            '<input type="hidden" name="%s" value="%s">',
            htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
            htmlspecialchars($token, ENT_QUOTES, 'UTF-8')
        );
    }

    /**
     * Generate CSRF token meta tag for AJAX requests
     *
     * @return string HTML meta element
     */
    public static function csrfMeta(): string
    {
        $token = self::getCsrfToken();
        return sprintf(
            '<meta name="csrf-token" content="%s">',
            htmlspecialchars($token, ENT_QUOTES, 'UTF-8')
        );
    }

    /**
     * Set a session value
     *
     * @param string $key Session key
     * @param mixed $value Value to store
     * @return void
     * @throws InvalidArgumentException If key is reserved
     */
    public static function set(string $key, $value): void
    {
        self::requireActiveSession();
        self::validateKey($key);
        $_SESSION[$key] = $value;
    }

    /**
     * Get a session value
     *
     * @param string $key Session key
     * @param mixed $default Default value if not found
     * @return mixed
     */
    public static function get(string $key, $default = null)
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return $default;
        }
        return $_SESSION[$key] ?? $default;
    }

    /**
     * Check if a session key exists
     *
     * @param string $key Session key
     * @return bool
     */
    public static function has(string $key): bool
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return false;
        }
        return isset($_SESSION[$key]);
    }

    /**
     * Remove a session value
     *
     * @param string $key Session key
     * @return void
     * @throws InvalidArgumentException If key is reserved
     */
    public static function remove(string $key): void
    {
        self::requireActiveSession();
        self::validateKey($key);
        unset($_SESSION[$key]);
    }

    /**
     * Validate that a key is not reserved
     *
     * @param string $key Key to validate
     * @return void
     * @throws InvalidArgumentException If key is reserved
     */
    private static function validateKey(string $key): void
    {
        if (in_array($key, self::RESERVED_KEYS, true)) {
            throw new InvalidArgumentException("Cannot modify reserved session key: $key");
        }
    }

    /**
     * Require an active session
     *
     * @return void
     * @throws RuntimeException If session is not active
     */
    private static function requireActiveSession(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            throw new RuntimeException('Session is not active');
        }
    }

    /**
     * Get all session data (excluding security keys)
     *
     * @return array
     */
    public static function all(): array
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return [];
        }

        $data = $_SESSION ?? [];
        // Remove internal security keys
        foreach (self::RESERVED_KEYS as $key) {
            unset($data[$key]);
        }
        return $data;
    }

    /**
     * Flash a message to the session
     *
     * Message is available for one request only.
     *
     * @param string $key Flash key
     * @param mixed $value Flash value
     * @return void
     */
    public static function flash(string $key, $value): void
    {
        self::requireActiveSession();
        if (!isset($_SESSION['_flash'])) {
            $_SESSION['_flash'] = [];
        }
        $_SESSION['_flash'][$key] = $value;
    }

    /**
     * Get a flash message
     *
     * @param string $key Flash key
     * @param mixed $default Default value
     * @return mixed
     */
    public static function getFlash(string $key, $default = null)
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return $default;
        }

        // Check old flash data (from previous request)
        if (isset($_SESSION['_flash_old'][$key])) {
            $value = $_SESSION['_flash_old'][$key];
            unset($_SESSION['_flash_old'][$key]);
            if (empty($_SESSION['_flash_old'])) {
                unset($_SESSION['_flash_old']);
            }
            return $value;
        }

        return $default;
    }

    /**
     * Check if a flash message exists
     *
     * @param string $key Flash key
     * @return bool
     */
    public static function hasFlash(string $key): bool
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return false;
        }
        return isset($_SESSION['_flash_old'][$key]);
    }

    /**
     * Destroy the current session
     *
     * @return void
     */
    public static function destroy(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            // Clear session data
            $_SESSION = [];

            // Delete session cookie
            if (ini_get('session.use_cookies')) {
                $params = session_get_cookie_params();
                setcookie(
                    session_name(),
                    '',
                    time() - 42000,
                    $params['path'],
                    $params['domain'],
                    $params['secure'],
                    $params['httponly']
                );
            }

            // Destroy session
            session_destroy();
        }

        self::$initialized = false;
        self::$expired = false;
    }

    /**
     * Check if user is logged in
     *
     * @param string $key Session key that indicates logged in state
     * @return bool
     */
    public static function isLoggedIn(string $key = 'user_id'): bool
    {
        return self::has($key) && !empty(self::get($key));
    }

    /**
     * Verify session fingerprint
     *
     * Checks if session appears to be hijacked based on user agent or IP change.
     *
     * @param bool $checkIp Whether to check IP address (may cause issues with mobile users)
     * @return bool True if fingerprint matches
     */
    public static function verifyFingerprint(bool $checkIp = false): bool
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return false;
        }

        $userAgent = self::sanitizeUserAgent($_SERVER['HTTP_USER_AGENT'] ?? '');
        $storedAgent = $_SESSION['_security_user_agent'] ?? '';

        if ($userAgent !== $storedAgent) {
            return false;
        }

        if ($checkIp) {
            $currentIp = self::getClientIp();
            $storedIp = $_SESSION['_security_ip'] ?? '';
            if ($currentIp !== $storedIp) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get session ID
     *
     * @return string
     */
    public static function getId(): string
    {
        return session_id();
    }

    /**
     * Get session name
     *
     * @return string
     */
    public static function getName(): string
    {
        return session_name();
    }

    /**
     * Check if session is active
     *
     * @return bool
     */
    public static function isActive(): bool
    {
        return session_status() === PHP_SESSION_ACTIVE;
    }
}
