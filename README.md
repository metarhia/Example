# Metarhia Example Server for Node.js

[![travis](https://travis-ci.org/metarhia/impress.svg?branch=master)](https://travis-ci.org/metarhia/Example)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/metarhia/Example/blob/master/LICENSE)

## Concept

This is a logical continuation of
[Node.js Starter Kit](https://github.com/HowProgrammingWorks/NodejsStarterKit)
from [How Programming Works](https://github.com/HowProgrammingWorks) software
development course moving all system code to dependencies, namely using
[Metarhia technology stack](https://github.com/metarhia).

You can begin development from this starter kit but having in mind future
production deployment and further moving application to
[Metaserverless cloud](https://github.com/Metaserverless) based on Metarhia
technology stack and Node.js.

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
- Prototype polution prevention
- Better code isolation

## Usage

- You need node.js v12.5.0 or later (v14 prefered)
- Fork and clone this repository (optionally subscribe to repo changes)
- Run `npm i` to install dependencies and generate RSA certificate
- Remove unneeded dependencies if your project doesn't require them
- Add your license to `LICENSE` file but don't remove starter kit license
- Start your project modifying this starter kit
- Before running server initialize the DB:
  - First of all, make sure you have PostgreSQL installed (prefer 12.x).
  - Run database initialization script: `db/setup.sh`
- Run project: `node server.js` and stop with Ctrl+C
- Ask questions in https://t.me/nodeua and post issues on
  [github](https://github.com/HowProgrammingWorks/NodejsStarterKit/issues)

## License

Copyright (c) 2020-2022 Metarhia contributors.
This starter kit is [MIT licensed](./LICENSE).
