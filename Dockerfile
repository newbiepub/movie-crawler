FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app
RUN npm run build

RUN rm -rf lib

EXPOSE 8080
CMD ["npm", "run", "serve"]