FROM node:20-alpine
WORKDIR /usr/server
COPY package*.json .
RUN npm ci --only=production
COPY . .
EXPOSE 8000
EXPOSE 8001
EXPOSE 8002
CMD ["node", "server.js"]
