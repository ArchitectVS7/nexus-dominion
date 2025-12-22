<?php
/**
 * Solar Realms Elite - Modern Database Abstraction Layer
 *
 * Provides PDO-based database access with prepared statements for SQL injection prevention.
 * Maintains backward compatibility with legacy ADODB-style Execute() calls during migration.
 *
 * @package SolarRealms\Database
 * @license GPL-2.0
 */

class Database
{
    /** @var PDO */
    private $pdo;

    /** @var bool */
    private $inTransaction = false;

    /** @var string */
    private $tablePrefix = '';

    /** @var bool Log deprecated query patterns */
    private $logDeprecated = true;

    /** @var string|null */
    private $lastError = null;

    /** @var string Current driver type */
    private $driverType;

    /** @var string Current database name */
    public $database;

    /** @var string Driver type (ADODB compatibility) */
    public $databaseType;

    /**
     * Create a new Database instance
     *
     * @param string $driver Database driver (mysql, mysqli, pgsql, sqlite)
     * @param string $host Database host
     * @param string $database Database name (or file path for SQLite)
     * @param string $username Database username
     * @param string $password Database password
     * @param int $port Database port (default: 3306 for MySQL, 5432 for PostgreSQL)
     * @param array $options Additional PDO options
     * @throws DatabaseException If connection fails
     */
    public function __construct(
        string $driver,
        string $host,
        string $database,
        string $username,
        string $password,
        int $port = 0,
        array $options = []
    ) {
        // Normalize driver name
        $driver = $this->normalizeDriver($driver);
        $this->driverType = $driver;
        $this->databaseType = $driver;
        $this->database = $database;

        // Build driver-specific DSN
        $dsn = $this->buildDsn($driver, $host, $database, $port);

        // Build driver-specific options
        $defaultOptions = $this->buildOptions($driver);

        try {
            $this->pdo = new PDO($dsn, $username, $password, array_merge($defaultOptions, $options));
        } catch (PDOException $e) {
            throw new DatabaseException("Database connection failed: " . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Normalize driver name to PDO driver
     *
     * @param string $driver
     * @return string
     */
    private function normalizeDriver(string $driver): string
    {
        $driverMap = [
            'mysqli' => 'mysql',
            'mysqlt' => 'mysql',
            'postgres' => 'pgsql',
            'postgresql' => 'pgsql',
            'sqlite3' => 'sqlite',
        ];
        return $driverMap[strtolower($driver)] ?? strtolower($driver);
    }

    /**
     * Build DSN string based on driver type
     *
     * @param string $driver
     * @param string $host
     * @param string $database
     * @param int $port
     * @return string
     */
    private function buildDsn(string $driver, string $host, string $database, int $port): string
    {
        switch ($driver) {
            case 'sqlite':
                return "sqlite:{$database}";

            case 'pgsql':
                $port = $port ?: 5432;
                return "pgsql:host={$host};port={$port};dbname={$database}";

            case 'mysql':
            default:
                $port = $port ?: 3306;
                return "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
        }
    }

    /**
     * Build driver-specific PDO options
     *
     * @param string $driver
     * @return array
     */
    private function buildOptions(string $driver): array
    {
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_BOTH,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        // MySQL-specific options
        if ($driver === 'mysql') {
            $options[PDO::MYSQL_ATTR_INIT_COMMAND] = "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci";
        }

        return $options;
    }

    /**
     * Create Database instance from legacy config constants
     *
     * @return self
     * @throws DatabaseException If required configuration is missing
     */
    public static function fromConfig(): self
    {
        $driver = defined('CONF_DATABASE_DRIVER') ? CONF_DATABASE_DRIVER : 'mysql';
        $host = defined('CONF_DATABASE_HOSTNAME') ? CONF_DATABASE_HOSTNAME : 'localhost';
        $database = defined('CONF_DATABASE_NAME') ? CONF_DATABASE_NAME : '';
        $username = defined('CONF_DATABASE_USERNAME') ? CONF_DATABASE_USERNAME : '';
        $password = defined('CONF_DATABASE_PASSWORD') ? CONF_DATABASE_PASSWORD : '';

        if (empty($database)) {
            throw new DatabaseException("Database name (CONF_DATABASE_NAME) is required");
        }

        return new self($driver, $host, $database, $username, $password);
    }

    /**
     * Get the underlying PDO instance
     *
     * @return PDO
     */
    public function getPdo(): PDO
    {
        return $this->pdo;
    }

    /**
     * Prepare a SQL statement
     *
     * @param string $sql SQL query with named or positional placeholders
     * @return PDOStatement
     * @throws DatabaseException If prepare fails
     */
    public function prepare(string $sql): PDOStatement
    {
        try {
            return $this->pdo->prepare($sql);
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            throw new DatabaseException("Prepare failed: " . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Execute a query with prepared statement (SECURE - use this for new code)
     *
     * @param string $sql SQL query with named placeholders (:name) or positional (?)
     * @param array $params Parameters to bind
     * @return DatabaseResult
     * @throws DatabaseException If query fails
     */
    public function execute(string $sql, array $params = []): DatabaseResult
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $this->lastError = null;
            return new DatabaseResult($stmt, $this->isSelectQuery($sql));
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            throw new DatabaseException("Query failed: " . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Check if a query is a SELECT statement
     *
     * @param string $sql
     * @return bool
     */
    private function isSelectQuery(string $sql): bool
    {
        return (bool) preg_match('/^\s*(SELECT|SHOW|DESCRIBE|EXPLAIN)\s/i', $sql);
    }

    /**
     * Execute a raw query (LEGACY - for migration compatibility)
     *
     * WARNING: This method is for backward compatibility only.
     * New code should use execute() with prepared statements.
     *
     * @param string $sql Raw SQL query
     * @param array $params Optional parameters for prepared statement
     * @return DatabaseResult|false
     * @deprecated Use execute() with prepared statements instead
     */
    public function Execute(string $sql, array $params = [])
    {
        // If params provided, use secure prepared statement
        if (!empty($params)) {
            try {
                return $this->execute($sql, $params);
            } catch (DatabaseException $e) {
                return false;
            }
        }

        // Legacy raw query execution - log warning
        if ($this->logDeprecated && $this->containsUserInput($sql)) {
            error_log("[DEPRECATED] Raw SQL query detected - migrate to prepared statements: " . substr($sql, 0, 100));
        }

        try {
            $stmt = $this->pdo->query($sql);
            $this->lastError = null;
            return new DatabaseResult($stmt, $this->isSelectQuery($sql));
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            return false;
        }
    }

    /**
     * Get a single value from query result (ADODB compatibility)
     *
     * @param string $sql SQL query
     * @param array $params Parameters
     * @return mixed|false
     */
    public function GetOne(string $sql, array $params = [])
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $result = $stmt->fetchColumn();
            return $result !== false ? $result : false;
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            return false;
        }
    }

    /**
     * Get a single row from query result (ADODB compatibility)
     *
     * @param string $sql SQL query
     * @param array $params Parameters
     * @return array|false
     */
    public function GetRow(string $sql, array $params = [])
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch(PDO::FETCH_BOTH);
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            return false;
        }
    }

    /**
     * Get all rows from query result (ADODB compatibility)
     *
     * @param string $sql SQL query
     * @param array $params Parameters
     * @return array
     */
    public function GetAll(string $sql, array $params = []): array
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_BOTH);
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            return [];
        }
    }

    /**
     * Get a single column from query result (ADODB compatibility)
     *
     * @param string $sql SQL query
     * @param array $params Parameters
     * @return array
     */
    public function GetCol(string $sql, array $params = []): array
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            return [];
        }
    }

    /**
     * Check if SQL appears to contain concatenated user input
     *
     * @param string $sql
     * @return bool
     */
    private function containsUserInput(string $sql): bool
    {
        // Detect common patterns of string concatenation with quotes
        return (bool) preg_match("/'\s*\\.|\\.\\s*'/", $sql);
    }

    /**
     * Begin a database transaction
     *
     * @return bool
     */
    public function beginTransaction(): bool
    {
        if ($this->inTransaction) {
            return true;
        }
        try {
            $this->inTransaction = $this->pdo->beginTransaction();
            return $this->inTransaction;
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            return false;
        }
    }

    /**
     * Alias for beginTransaction (ADODB compatibility)
     *
     * @return bool
     */
    public function BeginTrans(): bool
    {
        return $this->beginTransaction();
    }

    /**
     * Alias for beginTransaction (ADODB compatibility)
     *
     * @return bool
     */
    public function StartTrans(): bool
    {
        return $this->beginTransaction();
    }

    /**
     * Commit the current transaction
     *
     * @return bool
     */
    public function commit(): bool
    {
        if (!$this->inTransaction) {
            return true;
        }
        try {
            $result = $this->pdo->commit();
            $this->inTransaction = false;
            return $result;
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            $this->inTransaction = false;
            return false;
        }
    }

    /**
     * Alias for commit (ADODB compatibility)
     *
     * @return bool
     */
    public function CommitTrans(): bool
    {
        return $this->commit();
    }

    /**
     * Alias for commit (ADODB compatibility)
     *
     * @return bool
     */
    public function CompleteTrans(): bool
    {
        return $this->commit();
    }

    /**
     * Rollback the current transaction
     *
     * @return bool
     */
    public function rollBack(): bool
    {
        if (!$this->inTransaction) {
            return true;
        }
        try {
            $result = $this->pdo->rollBack();
            $this->inTransaction = false;
            return $result;
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            $this->inTransaction = false;
            return false;
        }
    }

    /**
     * Alias for rollBack (ADODB compatibility)
     *
     * @return bool
     */
    public function RollbackTrans(): bool
    {
        return $this->rollBack();
    }

    /**
     * Alias for rollBack (ADODB compatibility)
     *
     * @return bool
     */
    public function FailTrans(): bool
    {
        return $this->rollBack();
    }

    /**
     * Check if currently in a transaction
     *
     * @return bool
     */
    public function inTransaction(): bool
    {
        return $this->inTransaction;
    }

    /**
     * Get the last inserted ID
     *
     * @param string|null $name Sequence name (for PostgreSQL)
     * @return string|false
     */
    public function lastInsertId(?string $name = null)
    {
        try {
            $id = $this->pdo->lastInsertId($name);
            return $id !== '' ? $id : false;
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            return false;
        }
    }

    /**
     * Alias for lastInsertId (ADODB compatibility)
     *
     * @return string|false
     */
    public function Insert_ID()
    {
        return $this->lastInsertId();
    }

    /**
     * Get last error message
     *
     * @return string
     */
    public function ErrorMsg(): string
    {
        return $this->lastError ?? '';
    }

    /**
     * Quote a string for use in a query (use prepared statements instead)
     *
     * @param string $value
     * @return string
     * @deprecated Use prepared statements with execute() instead
     */
    public function quote(string $value): string
    {
        return $this->pdo->quote($value);
    }

    /**
     * Escape a string (LEGACY - use prepared statements instead)
     *
     * @param string $value
     * @return string
     * @deprecated Use prepared statements with execute() instead
     */
    public function qstr(string $value): string
    {
        return $this->quote($value);
    }

    /**
     * Set the table prefix
     *
     * @param string $prefix
     * @return void
     */
    public function setTablePrefix(string $prefix): void
    {
        $this->tablePrefix = $prefix;
    }

    /**
     * Get the table prefix
     *
     * @return string
     */
    public function getTablePrefix(): string
    {
        return $this->tablePrefix;
    }

    /**
     * Enable or disable deprecated query logging
     *
     * @param bool $log
     * @return void
     */
    public function setLogDeprecated(bool $log): void
    {
        $this->logDeprecated = $log;
    }

    /**
     * Get number of affected rows from last query
     *
     * @return int
     */
    public function Affected_Rows(): int
    {
        // This requires storing the last statement, which we don't do
        // Return -1 as ADODB does when unknown
        return -1;
    }
}

/**
 * Database Result wrapper for ADODB compatibility
 */
class DatabaseResult
{
    /** @var PDOStatement */
    private $stmt;

    /** @var array|false Current row data */
    public $fields = [];

    /** @var bool End of resultset flag */
    public $EOF = false;

    /** @var bool Whether this is a SELECT-type query */
    private $isSelect;

    /** @var array All fetched rows for RecordCount */
    private $allRows = null;

    /** @var int Current position in allRows */
    private $position = 0;

    /**
     * @param PDOStatement $stmt
     * @param bool $isSelect Whether this is a SELECT query
     */
    public function __construct(PDOStatement $stmt, bool $isSelect = true)
    {
        $this->stmt = $stmt;
        $this->isSelect = $isSelect;

        // Only fetch for SELECT-type queries
        if ($isSelect) {
            $this->fetchNext();
        } else {
            $this->EOF = true;
            $this->fields = [];
        }
    }

    /**
     * Fetch the next row
     *
     * @return void
     */
    private function fetchNext(): void
    {
        $row = $this->stmt->fetch(PDO::FETCH_BOTH);
        if ($row === false) {
            $this->EOF = true;
            $this->fields = [];
        } else {
            $this->fields = $row;
        }
    }

    /**
     * Move to next row (ADODB compatibility)
     *
     * @return bool
     */
    public function MoveNext(): bool
    {
        if ($this->EOF) {
            return false;
        }
        $this->fetchNext();
        return !$this->EOF;
    }

    /**
     * Get number of rows in result set
     * Note: This is accurate only for SELECT queries
     *
     * @return int
     */
    public function RecordCount(): int
    {
        if (!$this->isSelect) {
            return $this->stmt->rowCount();
        }

        // For SELECT queries, we need to count actual rows
        // PDOStatement::rowCount() is unreliable for SELECT
        if ($this->allRows === null) {
            // Save current state
            $currentFields = $this->fields;
            $currentEOF = $this->EOF;

            // Fetch all remaining rows
            $this->allRows = [];
            if (!empty($currentFields)) {
                $this->allRows[] = $currentFields;
            }
            while ($row = $this->stmt->fetch(PDO::FETCH_BOTH)) {
                $this->allRows[] = $row;
            }

            // Reset to first position
            $this->position = 0;
            if (!empty($this->allRows)) {
                $this->fields = $this->allRows[0];
                $this->EOF = false;
            } else {
                $this->fields = [];
                $this->EOF = true;
            }
        }

        return count($this->allRows);
    }

    /**
     * Get number of fields
     *
     * @return int
     */
    public function FieldCount(): int
    {
        return $this->stmt->columnCount();
    }

    /**
     * Get all rows as array
     *
     * @return array
     */
    public function GetAll(): array
    {
        $rows = [];

        // Include current row if not EOF
        if (!$this->EOF && !empty($this->fields)) {
            // Get associative version of current row
            $assocRow = [];
            foreach ($this->fields as $key => $value) {
                if (is_string($key)) {
                    $assocRow[$key] = $value;
                }
            }
            $rows[] = $assocRow;
        }

        // Fetch remaining rows
        while ($row = $this->stmt->fetch(PDO::FETCH_ASSOC)) {
            $rows[] = $row;
        }

        $this->EOF = true;
        $this->fields = [];
        return $rows;
    }

    /**
     * Get all rows (alias)
     *
     * @return array
     */
    public function getRows(): array
    {
        return $this->GetAll();
    }

    /**
     * Fetch next row as array (ADODB compatibility)
     * Returns current row and advances pointer
     *
     * @return array|false
     */
    public function FetchRow()
    {
        if ($this->EOF) {
            return false;
        }
        $row = $this->fields;
        $this->MoveNext();
        return $row;
    }

    /**
     * Close the cursor
     *
     * @return void
     */
    public function Close(): void
    {
        $this->stmt->closeCursor();
    }
}

/**
 * Database Exception class
 */
class DatabaseException extends Exception
{
    /**
     * @param string $message
     * @param int $code
     * @param Throwable|null $previous
     */
    public function __construct(string $message = "", int $code = 0, ?Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
