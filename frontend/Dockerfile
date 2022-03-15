FROM node:latest
WORKDIR /app
COPY package.json .
COPY package-lock.json* .
RUN yarn install
COPY . .
RUN yarn global add serve
RUN yarn build
CMD [ "serve", "-s", "dist"]