
FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Installez Prisma CLI globalement
RUN npm install -g prisma

COPY . .

EXPOSE 3131

CMD ["node", "app.js"]
