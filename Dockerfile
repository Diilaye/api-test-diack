FROM node:22
WORKDIR app/
COPY . .
RUN npm install
EXPOSE 6800
ENTRYPOINT ["node","app.js"]