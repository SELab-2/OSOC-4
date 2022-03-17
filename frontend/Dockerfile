FROM node:latest
WORKDIR /app
COPY package.json .
RUN yarn install
COPY . .
RUN yarn global add serve
ARG VITE_FRONTEND_BASE_URL
ENV VITE_FRONTEND_BASE_URL=${VITE_FRONTEND_BASE_URL}
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN yarn build
CMD ["serve", "-s", "dist"]