FROM node:16-alpine
# WORKDIR /app
# COPY package.json .
# RUN yarn install
# COPY . .
# RUN yarn global add serve
# ARG PUBLIC_URL
# ENV PUBLIC_URL=${PUBLIC_URL}
# ARG API_URL
# ENV API_URL=${API_URL}
# RUN yarn build
# CMD ["serve", "-s", "build"]
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh