# Metarhia application example for Node.js

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/metarhia/Example/blob/master/LICENSE)

Metarhia application example demonstrates how to build an application using Metarchia stack.

## Introduction

This is a logical continuation of
[Node.js Starter Kit](https://github.com/HowProgrammingWorks/NodejsStarterKit)
from [How Programming Works](https://github.com/HowProgrammingWorks) software
development course moving all system code to dependencies, namely using
[Metarhia technology stack](https://github.com/metarhia).

The purpose of this starter kit is to show best practices for Metarhia and
Metaserverless, to give structure and architecture example, to illustrate
simplicity and efficiency of mentioned technologies.

This example are optimized for reliability, scalability,
performance and security. So if you need readability and want to study code,
let's start with
[Node.js Starter Kit](https://github.com/HowProgrammingWorks/NodejsStarterKit).

You can begin development from this starter kit but having in mind future
production deployment and further moving application to
[Metaserverless cloud](https://github.com/Metaserverless) based on Metarhia
technology stack and Node.js.

## Quick Start

If you have Docker installed to run the project, use the command: `docker-compose up`.

In this scenario, you can skip some of the following sections.

## Requirements

- Node.js version 16 or newer
- PostgreSQL. version 12.x is prefered

## Usage

- Fork and clone this repository (optionally subscribe to repo changes)
- Run `npm i` to install dependencies and generate RSA certificate
- Remove unneeded dependencies if your project doesn't require them
- Add your license to `LICENSE` file but don't remove starter kit license
- Before running a project, run database init script: `database/setup.sh`:
- Run the project: `node server.js` (it can be stopped by pressing Ctrl+C);
- Feel free to ask questions on https://t.me/nodeua and share any ideas or report bugs by posting issues.

## Feature list

- Serve API with auto routing, HTTP(S), WS(S)
- Hot Code Reloading
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
- Prototype polution prevention

## License

Copyright (c) 2020-2023 Metarhia contributors.
This starter kit is [MIT licensed](./LICENSE).
