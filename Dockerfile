
# build stage
FROM node:lts-alpine as build-stage
RUN apk update
RUN apk add py3-fonttools py3-brotli
WORKDIR /app
COPY package*.json ./
COPY . .
RUN sh ./bin/generate-fonts.sh
RUN yarn install
RUN yarn build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
