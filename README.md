# Metarhia application example for Node.js

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/metarhia/Example/blob/master/LICENSE)

[🚀 Metarhia documentation and starter's guide](https://github.com/metarhia/Docs)

## Concept

This is a logical continuation of
[Node.js Starter Kit](https://github.com/HowProgrammingWorks/NodejsStarterKit)
moving all system code to dependencies, namely using
[Metarhia technology stack](https://github.com/metarhia).

<!--
You can begin development from this starter kit but having in mind future
production deployment and further moving application to
[Metaserverless cloud](https://github.com/Metaserverless) based on Metarhia
technology stack and Node.js.
-->

The purpose of this starter kit is to show best practices for Metarhia and
Metaserverless, to give structure and architecture example, to illustrate
simplicity and efficiency of mentioned technologies.

All parts of this implementation are optimized for reliability, scalability,
performance and security. So if you need readability and want to study code,
let's start with
[Node.js Starter Kit](https://github.com/HowProgrammingWorks/NodejsStarterKit).

## Feature list

- Serve API with auto routing, HTTP(S), WS(S)
- Server code live reload with file system watch
- Auto dependency loader and plugins
- Graceful shutdown and application reload
- Minimum code size and dependencies
- Code sandboxing for security and context isolation
- Multi-threading for CPU utilization and isolation
- Serve multiple ports in threads
- Serve static files with memory cache
- Application configuration
- Simple logger and redirection from console
- Database access layer (Postgresql)
- Client persistent sessions
- Unit-tests and API tests example
- Request queue timeout and size
- API parallel execution concurrency
- API method execution timeout
- Load balancing for scaling
- Prototype pollution prevention
- Better code isolation

## Usage

- You need Node.js 18.x or higher (24.x preferred)
- Fork and clone this repository (optionally subscribe to repo changes)
- Run `npm i` to install dependencies and generate RSA certificate
- Remove unneeded dependencies if your project doesn't require them
- Add your license to `LICENSE` file but don't remove starter kit license
- Start your project modifying this starter kit

## Docker Usage

The easiest way to run this application is using Docker and Docker Compose:

### Prerequisites

- Docker and Docker Compose installed
- No need to install PostgreSQL or Redis locally
- Uses PostgreSQL 17 (latest stable) and Redis 8

### Quick Start

```bash
# Start all services (API, PostgreSQL, Redis)
docker-compose up

# Start services in background (detached mode)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs api-example
docker-compose logs pg-example
docker-compose logs redis-example

# Rebuild and start services
docker-compose up --build -d
```

### Access Points

- **Main Application**: http://localhost:8002/ (Metarhia Console)
- **API Endpoints**: http://localhost:8001/api/
- **Load Balancer**: http://localhost:8000/ (redirects to 8002)

### Service Status

```bash
# Check running services
docker-compose ps

# Restart a specific service
docker-compose restart api-example
```

## Manual Installation (Alternative)

If you prefer to run without Docker:

- Before running server initialize the DB:
  - First of all, make sure you have PostgreSQL installed (preferably 15.x to 17.x).
  - Run database initialization script: `database/setup.sh`
- Run project: `node server.js` and stop with Ctrl+C
- Ask questions in Telegram https://t.me/nodeua (node.js related) or
  https://t.me/metaserverless (metarhia related)

## License

Copyright (c) 2020-2025 Metarhia contributors.
This starter kit is [MIT licensed](./LICENSE).
