FROM node:latest

COPY lens_view_client/ /app

WORKDIR /app

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
