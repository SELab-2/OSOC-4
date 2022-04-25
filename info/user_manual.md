# User manual for OSOC Selection tool 
#### [1. Introduction](#1-introduction-1)
#### [2. Product information](#2-product-information-1)
#### [3. Intended use](#3-intended-use-1)
#### [4. Installation guide](#4-installation-guide-1)

[4.1. Configuration](#41-configuration)\
[4.2. Requirements](#42-requirements) \
[4.3. Local installation](#43-local-installation) \
[4.4. Automatic deployment](#44-automatic-deployment)

#### [5. How to further develop & test](#5-howt-to-further-development--test-1)

#### [6. Architecture and Design](#6-architecture-and-design-1)

#### [7. Description of the main product elements](#7-description-of-the-main-product-elements-1)

[7.1. Domain Model](#71-domain-model) \
[7.1.1. Edition](#711-edition) \
[7.1.2. User](#712-user) \
[7.1.3. EditionCoach](#713-editioncoach) \
[7.1.4. Student](#714-student) \
[7.1.5. QuestionAnswer](#715-questionanswer) \
[7.1.6. Answer](#716-answer) \
[7.1.7. Question](#717-question) \
[7.1.8. QuestionTag](#718-questiontag) \
[7.1.9. Skill](#719-skill) \
[7.1.10. StudentSkill](#7110-studentskill) \
[7.1.11. Project](#7111-project) \
[7.1.12. ProjectRequiredSkill](#7112-projectrequiredskill) \
[7.1.13. ProjectCoach](#7113-projectcoach) \
[7.1.14. Suggestion](#7114-suggestion) \
[7.1.15. Participation](#7115-participation) \
[7.1.16. DefaultEmail](#7116-defaultemail)

#### [8. Description of the user interface and common use cases](#8-description-of-the-user-interface-and-common-use-cases-1)

[8.1. Login screen](#81-login-screen)



## 1. Introduction
In this manual we'll explain everything there is to explain about the OSOC selection tool we've created. Going from installation and configuration, to usage of the selection tool. And we'll even go as far as showing you how to further develop this tool.



## 2. Product information
This manual concerns the Open Summer Of Code Selection tool, version 2.



## 3. Intended use
The tool is intended to be (and made to be) used by the selection-team of OSOC. With this we mean the people of OSOC itself that will supervise and conduct the selection-process (they are intended to be admins within our tool). And the people that will help the selection process by suggesting students (the coaches). These coaches will have to be invited every year, as these people mostly differ from edition to edition. 



## 4. Installation guide

### 4.1. Configuration
While developing or before installing you can use your own environment variables by using a .env file in the backend and/or frontend directory of the application. 

An example .env file for the backend directory of the application (IP-addresses may need to be changed):
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

An example .env file for the frontend directory of the application:
```
NEXT_BASE_PATH=""
NEXTAUTH_URL="http://127.0.0.1:3000/api/auth"
NEXT_API_URL="http://127.0.0.1:8000"
NEXT_INTERNAL_API_URL="http://127.0.0.1:8000"
NODE_ENV="development"  # or production
```


### 4.2. Requirements
- Docker (installation guide: https://docs.docker.com/get-docker/)
- Docker Compose (installation guide: https://docs.docker.com/compose/install/)

If you want to run docker without sudo, we recommend you check here: https://docs.docker.com/engine/install/linux-postinstall/

### 4.3. Local installation

You first need to clone the repository that contains the code for the selection tool:

_with SSH, recommended_
```
git clone git@github.com:SELab-2/OSOC-4.git OSOC-selection-tool
cd OSOC-selection-tool
```

_with HTTPS_
```
git clone https://github.com/SELab-2/OSOC-4.git OSOC-selection-tool
cd OSOC-selection-tool
```

Now you need to start the application:
```
docker-compose up -d --build
```

If you want to restart all services you can use:
```
docker-compose restart
```

If you only want to restart one service, use one of the following commands:

`docker restart osoc-backend`

`docker restart osoc-mongodb`

`docker restart osoc-redis`

`docker restart osoc-frontend`

If you want to stop all services you can use
```
docker-compose down
```

### 4.4. Automatic deployment
Github Actions are used to automatically deploy the new codebase from the master or development branch to the server. A seperate docker-compose file is used by the Github Actions to deploy the application to the production server. This docker-compose file is made so the frontend and backend use the correct paths. This is needed because subdomains can't be used in the UGent network. Instead we use an extra prefixpath (/frontend and /api).

These branch versions of the application can be accessed by:
```
frontend: https://sel2-4.ugent.be/{branchname}/frontend
backend-api: https://sel2-4.ugent.be/{branchname}/api
```



## 5. How to further develop & test

## 5.1 Further development

You can find the Swagger API docs on `http://localhost:8000/docs` (change the port if needed). These docs describe what requests you can make to the API (backend), and what type of body the request expects (if a body is needed for that request).

## 5.2 Testing

Tests will run automatically with github actions but can be run locally too. There is a seperate docker-compose file for the test containers so they won't interfere with the running containers for the development or production. The containers used for testing don't map there ports to the host machine so they can't be accessed by the internet for security.

Run backend (API) tests:
```
docker-compose -f test-docker-compose.yml up --build -d # this starts the test database and test redis server
docker-compose -f test-docker-compose.yml run test-osoc-backend python -m unittest discover # This executes the python -m ... command in the backend container
docker-compose down  # this stops the container again
```

Run frontend tests: \
Tests can be run once using the command `yarn test`. If you want to run tests in watch mode or want more detailed output use `yarn test_watch` or yarn `test --watch-all --verbose`.



## 6. Architecture and Design
Now we're going to describe the architecture and design of the OSOC selection tool.

In order to deploy everything, we use Docker. Using containers allows us to have
an easily reproducible deployment. We have a seperate container for the
database (PostgreSQL), the Redis, the backend (FastAPI) and the frontend (Next.js). This allows us to develop and scale
each part of our application separately.

![Architecture](architecture_and_design/containers.svg)

The design of our application is a very standard client-server architecture. A frontend is
used to access a backend, both of which are deployed on a server (as shown above). The frontend is
accessed through a reverse proxy. This is provided through Traefik. Traefik also
provides a dashboard that allows us to monitor all the services.

![Design](architecture_and_design/design.svg)

The backend can then access data, which is stored using PostgreSQL and Redis.
Redis has built in features to let data automaticaly expire and is thus used
for user invites, password resets and revokable tokens. PostgreSQL is used for
everything else. This way the frontend doesn't have direct access to the
database, all operations on the database are defined and controlled by the backend.

Something noticable is that the frontend can send back to the reverse proxy (which will only go to the backend) but it can also send requests straight to the backend. This is because of Next.js. Next.js offers multiple ways to render pages, one is just normal client side rendering and the other we use is server side rendering. With client side rendering the requests will need to go through the proxy (Traefik). But when server side rendering is used for a page (there aren't many pages that use this since almost everything needs to update at real time), the request goes straight from the frontend to the backend, thereby skipping the proxy.



## 7. Description of the main product elements

### 7.1. Domain model
![Domain model](domain_model.svg)

Now folows a description of each element in the domain model.


#### 7.1.1. Edition
An edition of Open Summer Of Code

Now follows an in depth description of the attributes of an edition.

_attributes:_ \
**year**: the year in which the edition took place, primary key \
**name**: the name of the edition. (like "OSOC 2022 edition") \
**Description**: the description of the edition. (like startdate and enddate, or brief overview of the partners, ...) \
**read_only**: whether the edition is read_only


#### 7.1.2. User
A user is a person who has an account on the tool, or is in the progress of getting an account.

Now follows an in depth description of the attributes of a User.

_attributes:_ \
**id**: the id of the user, primary key \
**email**: the email address of the user, unique \
**name**: the name of the user, two or more users with the same name may exist \
**password**: the password of the user, this will be saved in the database, hashed and salted for security reasons \
**role**: there are 2 types of roles: coaches and admins, admins can do anything any coach can do and more \
**active, approved, disabled**: a user can either be active, approved, disabled or nothing \
**satus: nothing** (all of the above are set to false): the user exists. \
**status: active**: the user has set a name and password by using the invite link. \
**status: approved**: the user was active, and an admin has approved the user (the user now has acces to the tool) \
**status: disabled**: the user has been deleted from the tool, this is a soft delete so that we can still see actions the user made in the (previous) edition.

#### 7.1.3. EditionCoach
A coach (user) that belongs to an edition.

Now follows an in depth description of the attributes of an EditionCoach.

_attributes:_ \
**edition_year**: the year of the edition, primary key, foreign key \
**coach_id**: the id of the coach, primary key, foreign key \

#### 7.1.4 Student
A student, a representation of the tally form a student filled out with the info about them. 

Now follows an in depth description of the attributes of a Student.

_attributes:_ \
**id**: the id of the student, primary key \
**decision**: the decison (yes/maybe/no) that an admin gave to the student \
**email_sent**: whether an email has been send \
**edition_year (FK)**: the year of the edition when the student filled in the form

#### 7.1.5. QuestionAnswer
A combination of a question and an answer that a student made.

Now follows an in depth description of the attributes of a QuestionAnswer.

_attributes:_ \
**student_id**: the id of the student, primary key, foreign key \
**question_id**: the id of the question, primary key, foreign key \
**answer_id**: the id of the answer, primary key, foreign key

#### 7.1.6. Answer
An anwser to a question of the tally form.

Now follows an in depth description of the attributes of an Answer.

_attributes:_ \
**id**: the id of the answer, primary key \
**answer**: the answer itself

#### 7.1.7. Question
A question from the tally form.

Now follows an in depth description of the attributes of a Question.

_attributes:_ \
**id**: the id of the question, only used internally and unique for each question \
**tally_id**: the id of the question assigned by tally \
**question**: the question itself \
**edition_year (FK)**: the edition year in which the question was asked.

#### 7.1.8. QuestionTag
A tag for a question from the tally form. The tag gives a meaning to the question, for example the question "What is your first name?" can be linked to the tag "first name", this way the tool knows that the answer to that question is the first name of the student.

Now follows an in depth description of the attributes of a QuestionTag.

_attributes:_ \
**tag**: the tag (the meaning) of the question, primary key \
**question_id (FK)**: the id of the question for which the tag is \
**mandatory**: whether the tag is mandatory to be defined in every edition \
**show_in_list**: whether the tag (and answer) should be visible in the list of students \
**edition_year**: the year of the edition the tag belongs to


#### 7.1.9. Skill
A skill like ux-designer, backend-developper, communications-manager

Now follows an in depth description of the attributes of a Skill

_attributes:_ \
**name**: the name of the skill, primary key (like ux-designer, backend developer, ...)

#### 7.1.10. StudentSkill
A student that has a specific skill.

Now follows an in depth description of the attributes of a StudentSkill

_attributes:_ \
**student_id**: the id of the student who has the skill, primary key, foreign key
**skill_name**: the name of the skill, primary key, foreign key

#### 7.1.11. Project
Represents a project that will be made by OSOC students for a partner. A project will also contain the the information of that partner.

Now follows an in depth description of the attributes of a Project.

_attributes:_ \
**id**: the id of the project, primary key \
**name**: the name of the project \
**description**: the description of the project \
**partner_name**: the name of the partner \
**partner_description**: additional information about the partner \
**edition_year (FK)**: the year of the edition the project belongs to

#### 7.1.12. ProjectRequiredSkill
A skill that a project needs, and how many times it needs a student that has that skill.

Now follows an in depth description of the attributes of a Suggestion.

_attributes:_ \
**project_id**: the id of the project, primary key, foreign key \
**skill_name**: the name of the skill that is required, primary key, foreign key \
**amount**: the amount of students with that skill that are required

#### 7.1.13. ProjectCoach
A coach that coaches for a project.

Now follows an in depth description of the attributes of a ProjectCoach.

_attributes:_ \
**project_id**: the id of the project, primary key, foreign key \
**coach_id**: the id of the coach (user), primary key, foreign key

#### 7.1.14. Suggestion
A suggestion that a coach makes about a student, or a decision from an administrator.

Now follows an in depth description of the attributes of a Suggestion.

_attributes:_ \
**id**: the id of a suggestion, only used internally and unique for each student \
**decision_option**: Yes / No / Maybe \
**reason**: the reason that the coach/administrator gives with the suggestion
**student_id**: the id of the student for which the suggestion made \
**suggested_by_id**: the id of the coach (user) who made the suggestion \
**project_id**: the id of the project for which is suggested, optional attribute \
**skill_name**: the name of the skill which is suggested, optional attribute

#### 7.1.15. Participation
Which student will take on what role in what project.

Now follows an in depth description of the attributes of a Participation.

_attributes defining a relationship:_ \
**studen_id**: the id of the student who will participate \
**project_id**: the id of the project in which the student will participate \
**skill_name**: the name of the skill (thus the skill the student has and will use) the student will take on in the project \

#### 7.1.16. DefaultEmail
Default emails are stored in the database.

Now follows an in depth description of the attributes of a DefaultEmail.

_attributes:_ \
**id**: the id of a default email, primary key \
**type**: the type of the default email, for example yes, maybe, no \
**content**: the content of the default email



## 8. Description of the user interface and common use cases

### 8.1. Login screen

![Login screen](screenshots/login_screen.png)

Before logging in, your profile must be approved by an admin.
1. A field to write your email address that is linked to your profile.
2. A field to write your password to enter the application.
3. This button will give you access to the application if the email address and password match a valid profile. Otherwise, you will get a warning message.
4. If you forgot your password, this button will send you an email to reset your password.

