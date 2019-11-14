FROM node:carbon

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8084
CMD [ "npm", "start" ]
