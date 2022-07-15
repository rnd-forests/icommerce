## iCommerce

#### Order Processing Event Collaboration

![](./docs/images/order_event_collaboration.jpg)

#### Order Processing Message Broker

![](docs/images/order_processing_message_broker.jpg)

TODO

- installation guide: setup script, docker, docker compose
- authentication for order api??
- cloud events, message format
- NX graphq
- rabittmq structure (channels, exchanges, queue, etc)
- dev env (OS)
- rate limit for order placed API???


### Installation Guides
This project is written in Node.js, so before you can use it, you need to install Node.js
Make sure you have Node.js `v16` installed on your computer.

- Node.js: `v.16.x` (tested with `v16.15.0`)
- NPM: `8.5.x` (tested with `8.5.5`)

We use Docker and Docker Compose for constructing the development environment of the applications. Therefore, we need to install these two softwares:

- Install Docker: https://docs.docker.com/get-docker
- Install Docker Compose: https://docs.docker.com/compose/install

Make sure `docker` and `docker-compose` commands are available in your PATH.

To simplify the development process, all microservices and shared libraries are contained in
a single repository. We use [Lerna](https://lerna.js.org) to manage dependencies and relationships between them.

To start the installation process, run the `setup-dev.sh` script located at project root.

```bash
$ ./setup-dev.sh
```
This simple script will do the followings:

- Starting Docker containers for PostgreSQL, RabbitMQ, and MongoDB.
- Installing packages and dependencies for microservices and shared libraries.
- Migrating databases and seeding test data (for PostgreSQL).

Our microservices are located in `packages` directory. Each microservice has a `dev.sh` script. Running that script will start the local Node.js server for microservices. We've four services and each service will run in different port.

- `warehouse-service`: `3001`
- `order-processor-service`: `3002`
- `customer-service`: `3003`
- `activity-log-service`: `3004`
