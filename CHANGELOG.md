# Changelog

All notable changes to this project are documented here.

For historical changes (2007-2009), see [CHANGELOG_LEGACY.TXT](CHANGELOG_LEGACY.TXT).

## [Unreleased]

### Added
- CLAUDE.md - AI assistant context file for Claude Code
- Expanded README.md with quick start and documentation links

### Changed
- Renamed CHANGELOG.TXT to CHANGELOG_LEGACY.TXT
- Updated documentation to reflect completed security work

## [3.0.0] - 2024-12

Major modernization release bringing the codebase to PHP 8.2+ with modern security practices.

### Security
- **SQL Injection Prevention** - PDO wrapper with prepared statements (`include/database/Database.php`)
- **Password Hashing** - Argon2ID with legacy MD5 migration support (`include/security/PasswordHandler.php`)
- **XSS Prevention** - Input sanitization library (`include/security/InputSanitizer.php`)
- **Session Security** - CSRF protection, secure cookies, session regeneration (`include/security/SessionManager.php`)
- **Removed** all `addslashes()` calls from codebase

### Added
- Docker containerization with production-ready setup
- Caddy reverse proxy configuration for automatic HTTPS
- Database migration system (`database/migrate.php`)
- Comprehensive documentation in `docs/`:
  - DEPLOYMENT_GUIDE.md - Step-by-step production deployment
  - DEPLOYMENT_OPTIONS.md - Deployment architecture analysis
  - MODERNIZATION_PLAN.md - Security upgrade roadmap
  - BOT_ARCHITECTURE.md - Single-player AI system design
  - USER_MANUAL.md - Game rules and mechanics
- Composer integration with PHPUnit, PHPStan, PHP_CodeSniffer
- Environment variable configuration via `.env`

### Changed
- Upgraded to PHP 8.2+ compatibility
- Modern exception-based error handling
- Database transactions properly implemented

### Infrastructure
- `docker-compose.yml` - Local development environment
- `docker-compose.prod.yml` - Production setup with Caddy
- `Dockerfile` - PHP 8.2-Apache with security hardening
- `Caddyfile` - HTTPS reverse proxy configuration

---

## Legacy Versions

See [CHANGELOG_LEGACY.TXT](CHANGELOG_LEGACY.TXT) for versions 2.5.0 through 2.7.1 (2007-2009).
