# OSOC-4

# Deployment

## Requirements

- Docker
- Docker Compose
- (Docker without sudo) -> https://docs.docker.com/engine/install/linux-postinstall/
- Commands can be run in the root directory or sub directories

## Run

`docker-compose up -d`

This command starts a mongodb server, redis server and the api. Ports can be changed in the docker-compose.yml file.

This will also create a new data folder in the root directory. This contains the data for the mongodb and redis server. The folder can be deleted but keep in mind that all data in the database will be lost.

## Restart

`docker-compose restart`

This will restart the api, mongodb and redis.
When only one service must be restarted use one of the following commands:

`docker restart osoc-backend`

`docker restart osoc-mongodb`

`docker restart osoc-redis`

## Stop

`docker-compose down`

## After changes

When changes are made to the api, the docker image needs to be rebuild and the api container needs to be recreated.

`docker-compose up -d --build`

# Accessing API docs

Use the following URL to access the Swagger API docs. Change the port if needed.

`http://localhost:8000/docs`
