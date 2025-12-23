# X-Imperium (Solar Realms Elite)

A modernized browser-based 4X space empire strategy game. Originally released in 2009, now updated for PHP 8.2+ with modern security practices.

## Quick Start

```bash
# Clone and start with Docker
git clone https://github.com/ArchitectVS7/x-imperium.git
cd x-imperium
cp .env.example .env
# Edit .env with secure passwords
docker-compose up -d --build

# Access at http://localhost:8080
```

## Tech Stack

- **Backend:** PHP 8.2+
- **Database:** MySQL 8.0 (PDO with prepared statements)
- **Templates:** Smarty
- **Deployment:** Docker + Caddy (HTTPS)

## Development

```bash
composer install          # Install dependencies
composer run-script lint  # PSR-12 linting
composer run-script analyze  # PHPStan analysis

# Database migrations
docker-compose exec web php database/migrate.php
```

## Documentation

- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Step-by-step production deployment
- [Modernization Plan](docs/MODERNIZATION_PLAN.md) - Security upgrade roadmap
- [Bot Architecture](docs/BOT_ARCHITECTURE.md) - Single-player AI system (planned)
- [User Manual](docs/USER_MANUAL.md) - Game rules and mechanics
- [Claude Code Guide](CLAUDE.md) - AI assistant context

## Game Features

- Turn-based multiplayer empire management
- Resource economy (credits, food, ore, petroleum)
- Military combat (ground, orbital, space)
- Covert operations and espionage
- Diplomacy and coalition system
- Research and technology trees
- Global market trading

## License

GPL-2.0 - See [LICENSE.TXT](LICENSE.TXT)

## Legacy

Originally **Solar Realms Elite** - a classic BBS-style strategy game. See [CHANGELOG_LEGACY.TXT](CHANGELOG_LEGACY.TXT) for historical version notes (2007-2009).
