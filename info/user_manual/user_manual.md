# User manual for OSOC Selection tool 
[1. Introduction](#1-introduction)

[2. Product information](#2-product-information)

[3. Intended use](#3-intended-use)

[4. Description of the main product elements](#4-description-of-the-main-product-elements)

[5. Description of the user interface](#5-description-of-the-user-interface)

[6. Safety warnings](#6-safety-warnings)

[7. Configuration](#7-configuration)

[8. Installation instructions](#8-installation-instructions)

[9. Troubleshooting section and instructions on how to solve problems](#9-troubleshooting-section-and-instructions-on-how-to-solve-problems)

[10. Maintenance information](#10-maintenance-information)

[11. Technical specifications/requirements](#11-technical-specificationsrequirements)

[12. Setting up a development environment and running tests](#12-setting-up-a-development-environment-and-running-tests)


## 1. Introduction
In this manual we'll explain everything there is to explain about the OSOC selection tool we've created. Going from installation and configuration, to usage of the version 1 selection tool. And we'll even go as far as showing you how to further develop this handy tool.


## 2. Product information
This manual concerns the Open Summer Of Code Selection tool, version 1


## 3. Intended use
The tool is intended to be (and made to be) used by the selection-team of OSOC. With this we mean the people of OSOC itself that will supervise and conduct the selection-process (they are intended to be admins within our tool). And the people that will help the selection process by suggesting students (the coaches). These coaches will have to be invited every year, as these people mostly differ from edition to edition. 


## 4. Description of the main product elements


### 4.1 Domain model
![Domain model](https://github.com/SELab-2/OSOC-4/blob/user_man/info/domain_model/domain_model.svg)

Now folows a description of each element in the domain model.


#### 4.1.1 User
Now follows an in depth description of the attributes of a user.

**id**: the id of the user, only used internally and unique for each user \
**email**: the email address of the user, this is unique for each user \
**name**: the name of the user, two or more users with the same name may exist \
**password**: the password of the user, this will be saved in the database, hashed and salted for security reasons \
**role**: there are 2 types of roles: coaches and admins. Admins can do anything any coach can do and more \
role **coach**: ... \
role **admin**: can do anything any coach can do \
status **is_active, is_approved, is_disabled**: a user can either be active, approved, disabled or nothing \
satus **nothing** (all are set false): the user has been created and an invite has been send to that user
status **active**: the user has set a name and password by using the invite link. \
status **approved**: the user was active, and an admin has approved the user (the user now has acces to the tool)
status **disabled**: the user does not take part in the current edition and therefore shouldn't have acces to the tool, he is disabled


#### 4.1.2 Project
Now follows an in depth description of the attributes of a project.

**id**: the id of the project, only used internally and unique for each project \
**name**: the name of the project \
**description**: the description of the project \
**goals**: the goals of the project, this is a list of goals (strings/text) that should be all be archieved at the end of the project \
**partner**: the partner ordering the project. This consists of two more fields. In the database we do not store these two fields seperatily \
partner **name**: the name of the partner \
partner: **about**: additional information about the partner


#### 4.1.3 Edition
Now follows an in depth description of the attributes of an edition.

**id**: the id of the edition, only used internally and unique for each edition \
**year**: the year in which the edition took place, this is unique for each edition \
**name**: the name of the edition. (like "OSOC 2022 edition") \
**Description**: the description of the edition. (like startdate and enddate, or brief overview of the partners, ...) \
**form_id**: the id of the tally form for this year's edition. Notice that multiple years can use the same tally form 


#### 4.1.4 Skill
Now follows an in depth description of the attributes of a skill.

**id**: the id of the skill, only used internally and unique for each skill \
**name**: the name of the skill. (like ux-designer, backend developer, ...)


#### 4.1.5 Question
Now follows an in depth description of the attributes of a question.

**id**: the id of the question, only used internally and unique for each question \
**tally_id**: the id of the question assigned by tally \
**question**: the question itself


#### 4.1.6 Answer
Now follows an in depth description of the attributes of an answer.

**id**: the id of the answer, only used internally and unique for each answer \
**tally_id**: the id of the answer assigned by tally \
**answer**: the answer itself


#### 4.1.7 QuestionAnswer
Now follows an in depth description of the attributes of a question-answer.

**id**: the id of the question-answer, only used internally and unique for each answer \
**question_id**: the id of the question \
**answer_id**: the id of the answer.


#### 4.1.8 Student
Now follows an in depth description of the attributes of a question-answer.

**id**: the id of the student, only used internally and unique for each student \
**email**: the email address of the student \
**name**: the name of the student \
**nickname**: the nickname of the student \
**phone_number**: the phone number of the student \
**question_answers**: a list of questions-answers, the questions and answers which the student filled in \
**skills**: a list of skills which the student has \
**edition**: the edition in which the student filled in the form


...


First of all we have a login system. If you already have an account on the tool (see the next section 'invite system' if you want to know how to obtain an account), you need to provide your email-adress and password in order to login. There is no support yet for github, but that will be added in a later version. There also is no 2FA, but it may be added in later versions.



## 5. Description of the user interface

## 6. Safety warnings

## 7. Configuration

## 8. Installation-instructions

## 9. Troubleshooting section and instructions on how to solve problems

## 10. Maintenance information

## 11. Technical specifications/requirements

## 12. Setting up a development environment and running tests
