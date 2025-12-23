<?php

/**
 * X Imperium - Game Exception Hierarchy
 *
 * Provides structured exception handling for the game.
 * Replaces ad-hoc trigger_error() and die() patterns.
 *
 * @package XImperium\Exceptions
 * @license GPL-2.0
 */

/**
 * Base exception for all game-related exceptions
 */
class GameException extends Exception
{
    /**
     * @var string Error code for categorization
     */
    protected string $errorCode = 'GAME_ERROR';

    /**
     * @var array Additional context data
     */
    protected array $context = [];

    /**
     * Create a new game exception
     *
     * @param string $message Exception message
     * @param string $errorCode Error code for categorization
     * @param array $context Additional context data
     * @param int $code PHP exception code
     * @param Throwable|null $previous Previous exception
     */
    public function __construct(
        string $message = '',
        string $errorCode = 'GAME_ERROR',
        array $context = [],
        int $code = 0,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->errorCode = $errorCode;
        $this->context = $context;
    }

    /**
     * Get the error code
     *
     * @return string
     */
    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    /**
     * Get context data
     *
     * @return array
     */
    public function getContext(): array
    {
        return $this->context;
    }

    /**
     * Get a formatted error message for logging
     *
     * @return string
     */
    public function getLogMessage(): string
    {
        $message = sprintf(
            "[%s] %s",
            $this->errorCode,
            $this->getMessage()
        );

        if (!empty($this->context)) {
            $message .= ' | Context: ' . json_encode($this->context);
        }

        return $message;
    }
}

/**
 * Database-related exceptions
 */
class DatabaseException extends GameException
{
    protected string $errorCode = 'DATABASE_ERROR';

    /**
     * @var string|null The SQL query that caused the error
     */
    protected ?string $query = null;

    /**
     * Create a database exception
     *
     * @param string $message Error message
     * @param string|null $query The SQL query that failed
     * @param int $code Error code
     * @param Throwable|null $previous Previous exception
     */
    public function __construct(
        string $message = '',
        ?string $query = null,
        int $code = 0,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, 'DATABASE_ERROR', [], $code, $previous);
        $this->query = $query;
    }

    /**
     * Get the query that caused the error
     *
     * @return string|null
     */
    public function getQuery(): ?string
    {
        return $this->query;
    }
}

/**
 * Authentication and authorization exceptions
 */
class AuthenticationException extends GameException
{
    protected string $errorCode = 'AUTH_ERROR';
}

/**
 * Session-related exceptions
 */
class SessionException extends GameException
{
    protected string $errorCode = 'SESSION_ERROR';
}

/**
 * Validation exceptions
 */
class ValidationException extends GameException
{
    protected string $errorCode = 'VALIDATION_ERROR';

    /**
     * @var array Validation errors by field
     */
    protected array $errors = [];

    /**
     * Create a validation exception
     *
     * @param string $message General error message
     * @param array $errors Field-specific errors ['field' => 'error message']
     */
    public function __construct(string $message = 'Validation failed', array $errors = [])
    {
        parent::__construct($message, 'VALIDATION_ERROR', ['errors' => $errors]);
        $this->errors = $errors;
    }

    /**
     * Get validation errors
     *
     * @return array
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * Check if a specific field has an error
     *
     * @param string $field Field name
     * @return bool
     */
    public function hasError(string $field): bool
    {
        return isset($this->errors[$field]);
    }

    /**
     * Get error for a specific field
     *
     * @param string $field Field name
     * @return string|null
     */
    public function getError(string $field): ?string
    {
        return $this->errors[$field] ?? null;
    }
}

/**
 * Empire-related exceptions
 */
class EmpireException extends GameException
{
    protected string $errorCode = 'EMPIRE_ERROR';
}

/**
 * Combat-related exceptions
 */
class CombatException extends GameException
{
    protected string $errorCode = 'COMBAT_ERROR';
}

/**
 * Trade-related exceptions
 */
class TradeException extends GameException
{
    protected string $errorCode = 'TRADE_ERROR';
}

/**
 * Coalition-related exceptions
 */
class CoalitionException extends GameException
{
    protected string $errorCode = 'COALITION_ERROR';
}

/**
 * Configuration exceptions
 */
class ConfigurationException extends GameException
{
    protected string $errorCode = 'CONFIG_ERROR';
}

/**
 * Rate limiting exceptions
 */
class RateLimitException extends GameException
{
    protected string $errorCode = 'RATE_LIMIT';

    /**
     * @var int Seconds until retry is allowed
     */
    protected int $retryAfter;

    /**
     * Create a rate limit exception
     *
     * @param string $message Error message
     * @param int $retryAfter Seconds until retry
     */
    public function __construct(string $message = 'Rate limit exceeded', int $retryAfter = 60)
    {
        parent::__construct($message, 'RATE_LIMIT', ['retry_after' => $retryAfter]);
        $this->retryAfter = $retryAfter;
    }

    /**
     * Get seconds until retry is allowed
     *
     * @return int
     */
    public function getRetryAfter(): int
    {
        return $this->retryAfter;
    }
}

/**
 * Security-related exceptions
 */
class SecurityException extends GameException
{
    protected string $errorCode = 'SECURITY_ERROR';
}

/**
 * CSRF validation exception
 */
class CsrfException extends SecurityException
{
    protected string $errorCode = 'CSRF_ERROR';

    public function __construct(string $message = 'CSRF token validation failed')
    {
        parent::__construct($message, 'CSRF_ERROR');
    }
}

/**
 * Insufficient resources exception
 */
class InsufficientResourcesException extends GameException
{
    protected string $errorCode = 'INSUFFICIENT_RESOURCES';

    /**
     * @var string Resource type
     */
    protected string $resourceType;

    /**
     * @var float Required amount
     */
    protected float $required;

    /**
     * @var float Available amount
     */
    protected float $available;

    /**
     * Create an insufficient resources exception
     *
     * @param string $resourceType Type of resource
     * @param float $required Required amount
     * @param float $available Available amount
     */
    public function __construct(string $resourceType, float $required, float $available)
    {
        $message = sprintf(
            'Insufficient %s: required %.2f, available %.2f',
            $resourceType,
            $required,
            $available
        );

        parent::__construct($message, 'INSUFFICIENT_RESOURCES', [
            'resource_type' => $resourceType,
            'required' => $required,
            'available' => $available
        ]);

        $this->resourceType = $resourceType;
        $this->required = $required;
        $this->available = $available;
    }

    /**
     * Get the resource type
     *
     * @return string
     */
    public function getResourceType(): string
    {
        return $this->resourceType;
    }

    /**
     * Get required amount
     *
     * @return float
     */
    public function getRequired(): float
    {
        return $this->required;
    }

    /**
     * Get available amount
     *
     * @return float
     */
    public function getAvailable(): float
    {
        return $this->available;
    }

    /**
     * Get the deficit amount
     *
     * @return float
     */
    public function getDeficit(): float
    {
        return $this->required - $this->available;
    }
}
