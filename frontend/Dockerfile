FROM node:latest
WORKDIR /app
COPY package.json .
COPY package-lock.json* .
RUN yarn install
COPY . .
CMD [ "yarn", "dev", "--host", "0.0.0.0", "--port", "3000"]