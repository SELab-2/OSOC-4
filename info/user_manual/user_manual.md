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

## 4.1 Domain model
![Domain model](../domain_model/domain_model.svg)

### 4.1 Users

### 4.1.1 active approved disabled
A user can either be active, approved, disabled or nothing. 

If a user is:
- nothing, then the user has been created and an invite has been send to that user.
- active, then the user has set a name and password by using the invite link.
- approved, then the user was active, and an admin has approved the user (the user now has acces to the tool). 
- disabled, then the user does not take part in the current edition

### 4.1.1 roles
There are 2 types of roles: coaches and admins. Admins can do anything any coach can do.

**Coaches**
Coaches are 

First of all we have a login system. If you already have an account on the tool (see the next section 'invite system' if you want to know how to obtain an account), you need to provide your email-adress and password in order to login. There is no support yet for github, but that will be added in a later version. There also is no 2FA, but it may be added in later versions.



### 4.2 Invite system


## 5. Description of the user interface

## 6. Safety warnings

## 7. Configuration

## 8. Installation-instructions

## 9. Troubleshooting section and instructions on how to solve problems

## 10. Maintenance information

## 11. Technical specifications/requirements

## 12. Setting up a development environment and running tests
