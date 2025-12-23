# Solar Realms Elite (x-imperium) Modernization Plan

**Version:** 2.7.1 (2009) → Modern PHP 8.x
**Document Version:** 1.1
**Date:** December 2024
**Last Updated:** December 2024

---

## Current Status

| Phase | Task | Status |
|-------|------|--------|
| 1.1 | SQL Injection Prevention | ✅ Complete |
| 1.2 | Password Hashing (Argon2ID) | ✅ Complete |
| 1.3 | XSS Prevention | ✅ Complete |
| 1.4 | Session Security (CSRF) | ✅ Complete |
| 2.1 | Transaction Handling | ✅ Complete |
| 2.2 | Deprecated PHP Functions | ⏳ In Progress |
| 2.3 | Error Handling | ✅ Complete |
| 4.1 | Composer Integration | ✅ Complete |
| 4.2 | Docker Configuration | ✅ Complete |

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase 1: Critical Security Fixes](#phase-1-critical-security-fixes)
3. [Phase 2: Stability Fixes](#phase-2-stability-fixes)
4. [Phase 3: Maintenance & Cleanup](#phase-3-maintenance--cleanup)
5. [Phase 4: Infrastructure Modernization](#phase-4-infrastructure-modernization)
6. [Implementation Priority Matrix](#implementation-priority-matrix)
7. [Testing Strategy](#testing-strategy)
8. [Rollback Plan](#rollback-plan)

---

## Executive Summary

This document outlines the modernization plan for Solar Realms Elite (x-imperium), a browser-based multiplayer 4X space strategy game originally developed for PHP 4/5 in 2009. The goal is to bring the codebase to modern PHP 8.x standards while preserving all gameplay functionality.

### Current State
- **Language:** PHP 4/5 with deprecated patterns
- **Database:** MySQL via ADODB abstraction layer
- **Template Engine:** Smarty (outdated version)
- **Security:** Multiple critical vulnerabilities
- **PHP Compatibility:** Will not run on PHP 7.4+ without modifications

### Target State
- **Language:** PHP 8.2+ compatible
- **Database:** PDO with prepared statements
- **Template Engine:** Updated Smarty or Twig
- **Security:** OWASP-compliant security practices
- **Deployment:** Docker-ready with modern tooling

---

## Phase 1: Critical Security Fixes

### 1.1 SQL Injection Prevention (CRITICAL)

**Current Problem:**
The codebase uses `addslashes()` for SQL escaping (385+ instances across 40 files), which is vulnerable to SQL injection attacks.

**Affected Files:**
```
admin.php                           chat.php
continuegame.php                    forum_search.php
forum_viewtopic.php                 forum.php
game/battle_invasion.php            game/diplomacy.php
game/globalmarket.php               game/img_logo.php
game/manage.php                     game/messages.php
game/newturn.php                    game/shoutbox.php
gamesbrowser.php                    include/game/classes/army.php
include/game/classes/coalition.php  include/game/classes/diplomacy.php
include/game/classes/empire.php     include/game/classes/event_creator.php
include/game/classes/event_renderer.php
include/game/classes/planets.php    include/game/classes/production.php
include/game/classes/session.php    include/game/classes/supply.php
include/game/classes/template.php   include/game/init_ingame.php
include/game/init.php               include/init.php
include/game/newturn/researchgrowth.php
include/update/victory_condition.php
install.php                         joingame.php
preferences.php                     registernow.php
welcome.php
```

**Solution:**

1. **Create Database Abstraction Layer**
   - Create `include/database/Database.php` with PDO wrapper
   - Implement prepared statement methods
   - Maintain ADODB compatibility during transition

```php
// New: include/database/Database.php
class Database {
    private PDO $pdo;

    public function prepare(string $sql): PDOStatement {
        return $this->pdo->prepare($sql);
    }

    public function execute(string $sql, array $params = []): PDOStatement {
        $stmt = $this->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    // Legacy compatibility wrapper
    public function Execute(string $sql, array $params = []): mixed {
        // If params provided, use prepared statements
        // Otherwise, log warning and execute (for gradual migration)
    }
}
```

2. **Migration Strategy**
   - Phase A: Create wrapper that logs all `addslashes()` usage
   - Phase B: Convert core classes first (`empire.php`, `session.php`, etc.)
   - Phase C: Convert game controllers
   - Phase D: Remove ADODB dependency entirely

**Example Conversion:**
```php
// BEFORE (vulnerable):
$rs = $DB->Execute("SELECT * FROM system_tb_players WHERE email='".addslashes($_POST["email"])."'");

// AFTER (secure):
$rs = $DB->execute(
    "SELECT * FROM system_tb_players WHERE email = :email",
    ['email' => $_POST["email"]]
);
```

---

### 1.2 Password Hashing (CRITICAL)

**Current Problem:**
Passwords are hashed using MD5 without salt, which is cryptographically broken.

**Affected Files:**
```
include/game/classes/session.php:62    - login()
registernow.php:48                     - registration
welcome.php:42                         - login
preferences.php                        - password change
```

**Solution:**

1. **Implement Modern Password Hashing**

```php
// New: include/security/PasswordHandler.php
class PasswordHandler {
    public static function hash(string $password): string {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3
        ]);
    }

    public static function verify(string $password, string $hash): bool {
        // Support legacy MD5 for migration
        if (strlen($hash) === 32 && ctype_xdigit($hash)) {
            if (md5($password) === $hash) {
                return true; // Will trigger rehash
            }
            return false;
        }
        return password_verify($password, $hash);
    }

    public static function needsRehash(string $hash): bool {
        // MD5 hashes need rehashing
        if (strlen($hash) === 32 && ctype_xdigit($hash)) {
            return true;
        }
        return password_needs_rehash($hash, PASSWORD_ARGON2ID);
    }
}
```

2. **Migration Strategy**
   - Add new `password_hash` column to `system_tb_players`
   - On login, verify with both methods
   - If MD5 matches, rehash with Argon2id and update
   - After 90 days, force password reset for non-migrated accounts

---

### 1.3 XSS Prevention (HIGH)

**Current Problem:**
Ad-hoc XSS protection using manual string replacement:
```php
$_POST["nickname"] = str_replace("<","&lt;",$_POST["nickname"]);
$_POST["nickname"] = str_replace(">","&gt;",$_POST["nickname"]);
```

**Solution:**

1. **Create Input Sanitization Class**

```php
// New: include/security/InputSanitizer.php
class InputSanitizer {
    public static function html(string $input): string {
        return htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    public static function text(string $input): string {
        return strip_tags($input);
    }

    public static function int($input): int {
        return filter_var($input, FILTER_VALIDATE_INT) ?: 0;
    }

    public static function email(string $input): ?string {
        $email = filter_var($input, FILTER_VALIDATE_EMAIL);
        return $email ?: null;
    }
}
```

2. **Template Output Escaping**
   - Enable Smarty's automatic escaping
   - Audit all `{$variable}` usages in templates

---

### 1.4 Session Security (HIGH)

**Current Problem:**
- 4-minute session timeout is extremely short
- No CSRF protection
- Session fixation possible

**Affected Files:**
```
include/config_orig.php:15   - CONF_SESSION_TIMEOUT
include/game/classes/session.php
```

**Solution:**

```php
// New: include/security/SessionManager.php
class SessionManager {
    public static function init(): void {
        ini_set('session.cookie_httponly', '1');
        ini_set('session.cookie_secure', '1');
        ini_set('session.cookie_samesite', 'Strict');
        ini_set('session.use_strict_mode', '1');

        session_start();

        // Regenerate session ID periodically
        if (!isset($_SESSION['_created'])) {
            $_SESSION['_created'] = time();
        } elseif (time() - $_SESSION['_created'] > 1800) {
            session_regenerate_id(true);
            $_SESSION['_created'] = time();
        }
    }

    public static function generateCsrfToken(): string {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public static function validateCsrfToken(string $token): bool {
        return hash_equals($_SESSION['csrf_token'] ?? '', $token);
    }
}
```

---

## Phase 2: Stability Fixes

### 2.1 Transaction Handling (HIGH)

**Current Problem:**
Transaction handling is commented out in critical save operations.

**Affected File:** `include/game/classes/empire.php:90-99`
```php
function save() {
    // ...
//  $this->DB->beginTrans();
    if (!$this->DB->Execute($query)) trigger_error($this->DB->ErrorMsg());

    $this->army->save();
    $this->planets->save();
    $this->coalition->save();
    $this->production->save();
    $this->supply->save();

//  $this->DB->completeTrans();
}
```

**Solution:**
```php
function save(): bool {
    try {
        $this->DB->beginTransaction();

        // Save empire data
        $stmt = $this->DB->prepare($this->buildUpdateQuery());
        $stmt->execute($this->data);

        // Save related entities
        $this->army->save();
        $this->planets->save();
        $this->coalition->save();
        $this->production->save();
        $this->supply->save();

        $this->DB->commit();
        return true;
    } catch (Exception $e) {
        $this->DB->rollBack();
        error_log("Empire save failed: " . $e->getMessage());
        return false;
    }
}
```

---

### 2.2 Deprecated PHP Functions (HIGH)

**Current Problem:**
Code uses deprecated PHP functions that will fail on PHP 7.4+.

**`each()` function - 82 files affected:**
```
forum.php
game/last_invasions.php
game/stats.php
include/game/classes/army.php
include/game/classes/coalition.php
include/game/classes/empire.php
include/game/classes/event_renderer.php
include/game/classes/planets.php
include/game/classes/production.php
include/game/classes/supply.php
include/game/classes/system.php
include/game/newturn/pirateraid.php
```

**Solution:**
```php
// BEFORE:
while (list($key, $value) = each($this->data)) {
    // ...
}

// AFTER:
foreach ($this->data as $key => $value) {
    // ...
}
```

**Other deprecated functions to replace:**
| Deprecated | Replacement |
|------------|-------------|
| `each()` | `foreach` |
| `create_function()` | Anonymous functions |
| `ereg()` / `eregi()` | `preg_match()` |
| `split()` | `preg_split()` / `explode()` |
| `mysql_*` | PDO or mysqli |

---

### 2.3 Error Handling (MEDIUM)

**Current Problem:**
Uses `trigger_error()` and `die()` for error handling.

**Solution:**
```php
// New: include/exceptions/GameException.php
class GameException extends Exception {}
class DatabaseException extends GameException {}
class ValidationException extends GameException {}
class AuthenticationException extends GameException {}

// New: include/ErrorHandler.php
class ErrorHandler {
    public static function register(): void {
        set_exception_handler([self::class, 'handleException']);
        set_error_handler([self::class, 'handleError']);
    }

    public static function handleException(Throwable $e): void {
        error_log($e->getMessage() . "\n" . $e->getTraceAsString());

        if ($e instanceof ValidationException) {
            http_response_code(400);
        } elseif ($e instanceof AuthenticationException) {
            http_response_code(401);
        } else {
            http_response_code(500);
        }

        // Display user-friendly error page
        include 'templates/error.html';
    }
}
```

---

### 2.4 Timezone Configuration (LOW)

**Current Problem:**
Hardcoded timezone: `America/Montreal`

**Affected Files:**
```
include/config_orig.php:6
install.php:39
```

**Solution:**
- Make timezone configurable in `config.php`
- Default to UTC for database storage
- Convert to user timezone for display

---

## Phase 3: Maintenance & Cleanup

### 3.1 Remove Backup Files

**Files to Delete:**
```
include/game/classes/template.php~   (backup file)
game/index.html                       (empty placeholder)
```

### 3.2 Update Third-Party Libraries

| Library | Current Version | Recommended Action |
|---------|-----------------|-------------------|
| ADODB | ~5.0 (2008) | Replace with PDO |
| Smarty | 2.x | Update to Smarty 4.x or migrate to Twig |
| gettext | Unknown | Use modern PHP intl extension |

### 3.3 Remove Dead Code

**Items to audit and potentially remove:**
- PHP 4 compatibility checks (`is_php4()`, `is_php5()`)
- `register_globals` checks (removed in PHP 5.4)
- Commented-out debugging code
- Unused configuration constants

### 3.4 Code Organization

**Proposed New Directory Structure:**
```
x-imperium/
├── public/                    # Web root (only public files)
│   ├── index.php
│   ├── css/
│   ├── images/
│   └── scripts/
├── src/                       # Application code
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   └── Security/
├── config/                    # Configuration files
├── templates/                 # Smarty/Twig templates
├── storage/                   # Runtime files
│   ├── cache/
│   ├── logs/
│   └── sessions/
├── database/                  # Migrations and seeds
├── tests/                     # PHPUnit tests
├── docs/                      # Documentation
├── vendor/                    # Composer dependencies
├── composer.json
├── Dockerfile
└── docker-compose.yml
```

---

## Phase 4: Infrastructure Modernization

### 4.1 Composer Integration

```json
{
    "name": "x-imperium/solar-realms-elite",
    "description": "Browser-based multiplayer 4X space strategy game",
    "type": "project",
    "require": {
        "php": "^8.2",
        "ext-pdo": "*",
        "ext-mbstring": "*",
        "ext-gd": "*",
        "smarty/smarty": "^4.0"
    },
    "require-dev": {
        "phpunit/phpunit": "^10.0",
        "phpstan/phpstan": "^1.0",
        "squizlabs/php_codesniffer": "^3.0"
    },
    "autoload": {
        "psr-4": {
            "SolarRealms\\": "src/"
        }
    }
}
```

### 4.2 Docker Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8080:80"
    volumes:
      - .:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

### 4.3 Environment Configuration

```bash
# .env.example
APP_ENV=development
APP_DEBUG=true
APP_TIMEZONE=UTC

DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=solar_realms
DB_USER=sre_user
DB_PASSWORD=

SESSION_LIFETIME=3600
SESSION_SECURE=true

CACHE_DRIVER=file
LOG_LEVEL=debug
```

---

## Implementation Priority Matrix

| Priority | Task | Effort | Risk | Phase | Status |
|----------|------|--------|------|-------|--------|
| P0 | SQL Injection fixes | High | Critical | 1.1 | ✅ Done |
| P0 | Password hashing | Medium | Critical | 1.2 | ✅ Done |
| P1 | XSS prevention | Medium | High | 1.3 | ✅ Done |
| P1 | Session security | Low | High | 1.4 | ✅ Done |
| P1 | Transaction handling | Low | High | 2.1 | ✅ Done |
| P2 | Deprecated functions | High | High | 2.2 | ⏳ Partial |
| P2 | Error handling | Medium | Medium | 2.3 | ✅ Done |
| P3 | Timezone config | Low | Low | 2.4 | ⏳ Partial |
| P3 | Cleanup | Low | Low | 3.x | Planned |
| P4 | Infrastructure | High | Low | 4.x | ✅ Done |

---

## Testing Strategy

### Unit Tests (Per Phase)
```
tests/
├── Unit/
│   ├── Security/
│   │   ├── PasswordHandlerTest.php
│   │   ├── InputSanitizerTest.php
│   │   └── SessionManagerTest.php
│   ├── Database/
│   │   └── DatabaseTest.php
│   └── Game/
│       ├── EmpireTest.php
│       ├── ArmyTest.php
│       └── PlanetsTest.php
└── Integration/
    ├── LoginTest.php
    ├── RegistrationTest.php
    └── GameplayTest.php
```

### Pre-Deployment Checklist
- [ ] All SQL queries use prepared statements
- [ ] All passwords use Argon2id hashing
- [ ] All user input is sanitized
- [ ] All output is escaped in templates
- [ ] CSRF tokens on all forms
- [ ] Session cookies have secure flags
- [ ] Error messages don't leak sensitive info
- [ ] Database transactions work correctly
- [ ] No PHP deprecation warnings on 8.2

---

## Rollback Plan

### Per-Phase Rollback
1. Each phase should be a separate Git branch
2. Database migrations must have down() methods
3. Feature flags for gradual rollout
4. Blue-green deployment capability

### Emergency Rollback
```bash
# Revert to previous version
git checkout main
git revert HEAD~N  # N = number of commits to revert

# Restore database
mysql -u root -p solar_realms < backup/pre_migration.sql
```

---

## Appendix A: File Inventory

### Core Game Classes (15 files)
```
include/game/classes/
├── army.php           - Military unit management
├── coalition.php      - Player alliances
├── diplomacy.php      - Treaties and relations
├── empire.php         - Core empire management
├── event_creator.php  - Event system
├── event_renderer.php - Event display
├── gameplay_costs.php - Economic calculations
├── invasion.php       - Battle system
├── planets.php        - Planet management
├── production.php     - Resource production
├── research.php       - Tech research
├── session.php        - User sessions
├── supply.php         - Supply chain
├── system.php         - System utilities
└── template.php       - Template helpers
```

### Turn Processing (13 files)
```
include/game/newturn/
├── blackmarket.php
├── civilstatus.php
├── foodgrowth.php
├── lottery.php
├── marketgrowth.php
├── military_production.php
├── moneygrowth.php
├── oregrowth.php
├── petroleumgrowth.php
├── pirateraid.php
├── populationgrowth.php
├── randomevent.php
└── researchgrowth.php
```

---

## Appendix B: Database Schema

### System Tables (11)
- `system_tb_players` - User accounts
- `system_tb_games` - Game instances
- `system_tb_sessions` - Active sessions
- `system_tb_chat` - Chat messages
- `system_tb_chat_sessions` - Chat users
- `system_tb_forum` - Forum posts
- `system_tb_hall_of_fame` - Winners
- `system_tb_history` - Player history
- `system_tb_stats` - Usage statistics
- `system_tb_messages` - System messages
- `system_tb_warrant` - Bans/warnings

### Per-Game Tables (24+)
Prefixed with `game{id}_tb_`:
- `army`, `armyconvoy`
- `bonds`, `coalition`
- `diplomacy`, `empire`
- `events`, `invasions`
- `loan`, `lottery`
- `market`, `messages`
- `military_convoys`
- `planets`, `production`
- `research`, `session`
- `stats`, `supply`
- `trade`, `tradeconvoy`
- `treaty`, `victory_condition`

---

*Document prepared for x-imperium modernization project*
