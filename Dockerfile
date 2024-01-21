FROM node:20.10-alpine3.18 as build

WORKDIR ./app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:20.10-alpine3.18
WORKDIR /app
COPY package*.json .
RUN npm install --only=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/views ./views
COPY --from=build /app/public ./public
COPY .env.production .
CMD npm run start:prod
