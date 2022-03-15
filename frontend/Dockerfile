FROM node:latest
WORKDIR /app
COPY package.json .
RUN yarn install
COPY . .
RUN yarn global add serve
ARG VITE_FRONTEND_BASE_URL
ENV VITE_FRONTEND_BASE_URL=${VITE_FRONTEND_BASE_URL}
RUN yarn build
CMD ["serve", "-s", "dist"]