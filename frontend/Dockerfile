FROM node:latest
WORKDIR /app
COPY package.json .
COPY package-lock.json* .
RUN yarn install
COPY . .
RUN yarn build
CMD [ "serve", "dist"]