#!/bin/sh

cd backend

coverage run -m unittest discover
coverage xml
