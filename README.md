# OSOC Selection Tool

## Table of contents

- [User manual](info/user_manual.md)
- [Domain model](info/domain_model/domain_model.svg)
- [Deployment scheme](info/deployment/deployment.svg)
- [How to deploy](#deployment)
- [How to further develop & test](#development--testing)

## Deployment

### Requirements

- Docker
- Docker Compose
- (Docker without sudo) -> https://docs.docker.com/engine/install/linux-postinstall/
- Commands can be run in the root directory or sub directories

### Run

`docker-compose up -d`

This command starts a mongodb server, redis server, the backend api and the frontend. Ports can be changed in the docker-compose.yml file.

This will also create a new data folder in the root directory. This contains the data for the mongodb and redis server. The folder can be deleted but keep in mind that all data in the database will be lost.

### Restart

`docker-compose restart`

This will restart the api, mongodb, redis and frontend.
When only one service must be restarted use one of the following commands:

`docker restart osoc-backend`

`docker restart osoc-mongodb`

`docker restart osoc-redis`

`docker restart osoc-frontend`

### Stop

`docker-compose down`

### After changes

When changes are made to the api, the docker image needs to be rebuild and the api container needs to be recreated.

`docker-compose up -d --build`

### Automatic Deployment

Github Actions are used to automatically deploy the new codebase from the master or development branch to the server. A seperate docker-compose file is used by the Github Actions to deploy the application to the production server. This docker-compose file is made so the frontend and backend use the correct paths. This is needed because subdomains can't be used in the UGent network. Instead we use an extra prefixpath (/frontend and /api).

These branch versions of the application can be accessed by:

```
frontend: https://sel2-4.ugent.be/{branchname}/frontend
backend-api: https://sel2-4.ugent.be/{branchname}/api
```

## Development & testing

### Config

While developing you can use your own environment variables by using .env files.

An example .env file for the backend directory of the application. IP-addresses may need to be changed.

```
# Postgres
POSTGRES_URL=192.168.0.102
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=justapassword
POSTGRES_DATABASE=OSOC

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

# Token Settings
ACCESS_EXPIRE=15 #in minutes
RESET_EXPIRE=30 #in days

# Frontend URL
FRONTEND_URL=https://localhost:3000

```

An example .env file for the frontend directory of the application.

```
NEXT_BASE_PATH=""
NEXTAUTH_URL="http://127.0.0.1:3000/api/auth"
NEXT_API_URL="http://127.0.0.1:8000"
NEXT_INTERNAL_API_URL="http://127.0.0.1:8000"
NODE_ENV="development"  # or production
```

### Accessing API docs

Use the following URL to access the Swagger API docs. Change the port if needed.

`http://localhost:8000/docs`

### Testing

#### Backend

Tests are run automatically with github actions but can be run locally too. There is a seperate docker-compose file for the test containers so they won't interfere with the running containers for the development or production. The containers used for testing don't map there ports to the host machine so they can't be accessed by the internet for security.

```
docker-compose -f test-docker-compose.yml up --build -d # this starts the test database and test redis server
docker-compose -f test-docker-compose.yml run test-osoc-backend python -m unittest discover # This executes all tests in the backend container
# To run an individual test specify the name of the test function or class. For example app.tests.test_routers.test_users.TestUsers.test_get_users_me:
# docker-compose -f test-docker-compose.yml run test-osoc-backend python -m unittest app.tests.test_routers.test_users.TestUsers.test_get_users_me
docker-compose down
```


#### Frontend

Tests can be run once using the command `yarn test`. If you want to run tests in watch mode or want more detailed output use `yarn test_watch` or `yarn test --watch-all --verbose`.
