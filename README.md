# OSOC-4
# Deployment

## Requirements

- Docker
- Docker Compose
- (Docker without sudo) -> https://docs.docker.com/engine/install/linux-postinstall/
- Commands can be run in the root directory or sub directories

## Run

`docker-compose up -d`

This command starts a mongodb server, redis server, the backend api and the frontend. Ports can be changed in the docker-compose.yml file.

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

## Automatic Deployment

Github Actions are used to automatically deploy the new codebase from the master or development branch to the server. A seperate docker-compose file is used by the Github Actions to deploy the application to the production server. This docker-compose file is made so the frontend and backend use the correct paths. This is needed because subdomains can't be used in the UGent network. Instead we use an extra prefixpath.

These brach versions of the application can be accessed by:
```
frontend: https://sel2-4.ugent.be/{branchname}/frontend
backend-api: https://sel2-4.ugent.be/{branchname}/api
```

# Development

## Config
While developing you can use your own environment variables by using a .env file in the backend directory of the application.

```
# Mongo
MONGO_URL=192.168.0.102
MONGO_PORT=27017
MONGO_USER=root
MONGO_PASSWORD=justapassword

# Redis
REDIS_URL=192.168.0.102
REDIS_PORT=6379
REDIS_PASSWORD=justapassword

# SMTP Mail
SMTP_SERVER=smtp.gmail.com
SMTP_SSL_PORT=465
SENDER_EMAIL=osoc.groep4@gmail.com
SENDER_PASSWORD=Justapassword123!

# Invite Settings
INVITE_EXPIRE=4320 # in minutes
PASSWORDRESET_EXPIRE=30 # in minutes
```

## Accessing API docs

Use the following URL to access the Swagger API docs. Change the port if needed.

`http://localhost:8000/docs`

## Testing

Tests are run automatically with github actions but can be run locally too. There is a seperate docker-compose file for the test containers so they won't interfere with the running containers for the development or production. The containers used for testing dont't map there ports to the host machine so they can't be accessed by the internet for security.
```
docker-compose -f test-docker-compose.yml up --build -d # this starts the test database and test redis server
docker-compose -f test-docker-compose.yml run test-osoc-backend python -m unittest discover # This executes the python -m ... command in the backend container
docker-compose down
```


