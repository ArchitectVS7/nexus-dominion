<?php
/**
 * X Imperium - Input Sanitization Handler
 *
 * Provides comprehensive input sanitization to prevent XSS and other injection attacks.
 * Replaces ad-hoc string replacement patterns used throughout the legacy codebase.
 *
 * @package XImperium\Security
 * @license GPL-2.0
 */

class InputSanitizer
{
    /**
     * Sanitize a string for safe HTML output
     *
     * Converts special characters to HTML entities.
     * Use this for displaying user input in HTML context.
     *
     * @param string $input Raw input string
     * @param int $flags htmlspecialchars flags (default: ENT_QUOTES | ENT_HTML5)
     * @param string $encoding Character encoding (default: UTF-8)
     * @return string Sanitized string safe for HTML output
     */
    public static function html(string $input, int $flags = ENT_QUOTES | ENT_HTML5, string $encoding = 'UTF-8'): string
    {
        return htmlspecialchars($input, $flags, $encoding);
    }

    /**
     * Sanitize a string for safe HTML output (alias for html())
     *
     * @param string $input Raw input string
     * @return string Sanitized string
     */
    public static function escape(string $input): string
    {
        return self::html($input);
    }

    /**
     * Strip all HTML tags from input
     *
     * @param string $input Raw input string
     * @param string|null $allowedTags Optional allowed tags (e.g., '<p><br>')
     * @return string String with tags removed
     */
    public static function stripTags(string $input, ?string $allowedTags = null): string
    {
        if ($allowedTags !== null) {
            return strip_tags($input, $allowedTags);
        }
        return strip_tags($input);
    }

    /**
     * Get plain text from input (strip tags and decode entities)
     *
     * WARNING: This method decodes HTML entities. The output contains raw characters
     * and MUST be re-escaped using html() before displaying in HTML context.
     * Use this only for plain text processing, not for HTML output.
     *
     * @param string $input Raw input string
     * @return string Plain text (NOT safe for direct HTML output)
     */
    public static function text(string $input): string
    {
        $text = strip_tags($input);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return trim($text);
    }

    /**
     * Sanitize and validate an integer
     *
     * @param mixed $input Input value
     * @param int $default Default value if invalid
     * @param int|null $min Minimum allowed value
     * @param int|null $max Maximum allowed value
     * @return int Sanitized integer
     */
    public static function int($input, int $default = 0, ?int $min = null, ?int $max = null): int
    {
        $value = filter_var($input, FILTER_VALIDATE_INT);

        if ($value === false) {
            return $default;
        }

        if ($min !== null && $value < $min) {
            return $min;
        }

        if ($max !== null && $value > $max) {
            return $max;
        }

        return $value;
    }

    /**
     * Sanitize and validate a float
     *
     * @param mixed $input Input value
     * @param float $default Default value if invalid
     * @param float|null $min Minimum allowed value
     * @param float|null $max Maximum allowed value
     * @return float Sanitized float
     */
    public static function float($input, float $default = 0.0, ?float $min = null, ?float $max = null): float
    {
        $value = filter_var($input, FILTER_VALIDATE_FLOAT);

        if ($value === false) {
            return $default;
        }

        if ($min !== null && $value < $min) {
            return $min;
        }

        if ($max !== null && $value > $max) {
            return $max;
        }

        return $value;
    }

    /**
     * Sanitize and validate an email address
     *
     * @param string $input Email address to validate
     * @return string|null Sanitized email or null if invalid
     */
    public static function email(string $input): ?string
    {
        $email = filter_var(trim($input), FILTER_VALIDATE_EMAIL);
        return $email !== false ? strtolower($email) : null;
    }

    /**
     * Sanitize and validate a URL
     *
     * @param string $input URL to validate
     * @param array $allowedSchemes Allowed URL schemes (default: http, https)
     * @return string|null Sanitized URL or null if invalid
     */
    public static function url(string $input, array $allowedSchemes = ['http', 'https']): ?string
    {
        $url = filter_var(trim($input), FILTER_VALIDATE_URL);

        if ($url === false) {
            return null;
        }

        // Verify scheme is allowed
        $scheme = parse_url($url, PHP_URL_SCHEME);
        if (!in_array(strtolower($scheme), $allowedSchemes, true)) {
            return null;
        }

        return $url;
    }

    /**
     * Sanitize a string to contain only alphanumeric characters
     *
     * @param string $input Input string
     * @param string $allowed Additional allowed characters
     * @return string Sanitized alphanumeric string
     */
    public static function alphanumeric(string $input, string $allowed = ''): string
    {
        $pattern = '/[^a-zA-Z0-9' . preg_quote($allowed, '/') . ']/';
        return preg_replace($pattern, '', $input);
    }

    /**
     * Sanitize a username/nickname
     *
     * Allows alphanumeric, underscores, hyphens, and periods.
     *
     * @param string $input Username to sanitize
     * @param int $maxLength Maximum length (default: 32)
     * @return string Sanitized username
     */
    public static function username(string $input, int $maxLength = 32): string
    {
        $username = preg_replace('/[^a-zA-Z0-9_\-.]/', '', $input);
        return mb_substr($username, 0, $maxLength, 'UTF-8');
    }

    /**
     * Sanitize a filename
     *
     * Removes potentially dangerous characters and path traversal attempts.
     *
     * @param string $input Filename to sanitize
     * @param string $replacement Replacement character for invalid chars
     * @return string Sanitized filename
     */
    public static function filename(string $input, string $replacement = '_'): string
    {
        // Remove path components
        $filename = basename($input);

        // Remove null bytes
        $filename = str_replace(chr(0), '', $filename);

        // Replace dangerous characters
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', $replacement, $filename);

        // Prevent hidden files
        $filename = ltrim($filename, '.');

        // Prevent empty filename
        if (empty($filename)) {
            $filename = 'unnamed';
        }

        return $filename;
    }

    /**
     * Sanitize input for use in a SQL LIKE clause
     *
     * Escapes SQL wildcard characters.
     *
     * @param string $input Input string
     * @return string Escaped string for LIKE clause
     */
    public static function sqlLike(string $input): string
    {
        return str_replace(
            ['%', '_', '[', ']'],
            ['\%', '\_', '\[', '\]'],
            $input
        );
    }

    /**
     * Check if input matches a whitelist of allowed values
     *
     * @param mixed $input Input value
     * @param array $whitelist Array of allowed values
     * @param mixed $default Default value if not in whitelist
     * @return mixed Input if in whitelist, default otherwise
     */
    public static function whitelist($input, array $whitelist, $default = null)
    {
        return in_array($input, $whitelist, true) ? $input : $default;
    }

    /**
     * Sanitize boolean input
     *
     * @param mixed $input Input value
     * @return bool Boolean value
     */
    public static function bool($input): bool
    {
        return filter_var($input, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Sanitize array of inputs recursively
     *
     * @param array $input Input array
     * @param callable $sanitizer Sanitization function to apply
     * @return array Sanitized array
     */
    public static function array(array $input, callable $sanitizer): array
    {
        $result = [];
        foreach ($input as $key => $value) {
            $sanitizedKey = self::alphanumeric((string)$key, '_');
            if (is_array($value)) {
                $result[$sanitizedKey] = self::array($value, $sanitizer);
            } else {
                $result[$sanitizedKey] = $sanitizer($value);
            }
        }
        return $result;
    }

    /**
     * Sanitize JSON input
     *
     * @param string $input JSON string
     * @param bool $assoc Return as associative array
     * @return mixed|null Decoded JSON or null if invalid
     */
    public static function json(string $input, bool $assoc = true)
    {
        $decoded = json_decode($input, $assoc, 512);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }

        return $decoded;
    }

    /**
     * Truncate string to maximum length safely
     *
     * Handles multibyte characters correctly.
     *
     * @param string $input Input string
     * @param int $maxLength Maximum length
     * @param string $suffix Suffix to add if truncated (e.g., '...')
     * @return string Truncated string
     */
    public static function truncate(string $input, int $maxLength, string $suffix = ''): string
    {
        if ($maxLength <= 0) {
            return '';
        }

        if (mb_strlen($input, 'UTF-8') <= $maxLength) {
            return $input;
        }

        $suffixLength = mb_strlen($suffix, 'UTF-8');

        // If suffix is longer than or equal to maxLength, just truncate without suffix
        if ($suffixLength >= $maxLength) {
            return mb_substr($input, 0, $maxLength, 'UTF-8');
        }

        $truncated = mb_substr($input, 0, $maxLength - $suffixLength, 'UTF-8');
        return $truncated . $suffix;
    }

    /**
     * Remove control characters from input
     *
     * @param string $input Input string
     * @param bool $keepNewlines Whether to keep newline characters
     * @return string Cleaned string
     */
    public static function removeControlChars(string $input, bool $keepNewlines = true): string
    {
        if ($keepNewlines) {
            // Remove control chars except newlines and tabs
            return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $input);
        }
        // Remove all control characters
        return preg_replace('/[\x00-\x1F\x7F]/', '', $input);
    }

    /**
     * Normalize whitespace in string
     *
     * Collapses multiple spaces/newlines into single space.
     *
     * @param string $input Input string
     * @return string Normalized string
     */
    public static function normalizeWhitespace(string $input): string
    {
        return preg_replace('/\s+/', ' ', trim($input));
    }

    /**
     * Legacy compatibility: Replace angle brackets (mirrors old code behavior)
     *
     * @param string $input Input string
     * @return string String with angle brackets replaced
     * @deprecated Use html() instead for proper escaping
     */
    public static function legacyEscape(string $input): string
    {
        $output = str_replace('<', '&lt;', $input);
        $output = str_replace('>', '&gt;', $output);
        return $output;
    }

    /**
     * Sanitize input from $_GET
     *
     * @param string $key Parameter key
     * @param string $type Type of sanitization (html, int, email, etc.)
     * @param mixed $default Default value
     * @return mixed Sanitized value
     */
    public static function get(string $key, string $type = 'html', $default = null)
    {
        if (!isset($_GET[$key])) {
            return $default;
        }
        return self::sanitizeByType($_GET[$key], $type, $default);
    }

    /**
     * Sanitize input from $_POST
     *
     * @param string $key Parameter key
     * @param string $type Type of sanitization (html, int, email, etc.)
     * @param mixed $default Default value
     * @return mixed Sanitized value
     */
    public static function post(string $key, string $type = 'html', $default = null)
    {
        if (!isset($_POST[$key])) {
            return $default;
        }
        return self::sanitizeByType($_POST[$key], $type, $default);
    }

    /**
     * Sanitize input by type
     *
     * @param mixed $input Input value
     * @param string $type Type of sanitization
     * @param mixed $default Default value
     * @return mixed Sanitized value
     */
    private static function sanitizeByType($input, string $type, $default = null)
    {
        switch ($type) {
            case 'int':
            case 'integer':
                return self::int($input, $default ?? 0);
            case 'float':
            case 'double':
                return self::float($input, $default ?? 0.0);
            case 'bool':
            case 'boolean':
                return self::bool($input);
            case 'email':
                return self::email((string)$input) ?? $default;
            case 'url':
                return self::url((string)$input) ?? $default;
            case 'alpha':
                return self::alphanumeric((string)$input, '');
            case 'alnum':
            case 'alphanumeric':
                return self::alphanumeric((string)$input);
            case 'text':
                return self::text((string)$input);
            case 'html':
            default:
                return self::html((string)$input);
        }
    }
}
