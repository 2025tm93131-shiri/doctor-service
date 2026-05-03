FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 🔥 ADD THIS LINE
RUN npx prisma generate

EXPOSE 3001

CMD ["npx", "nodemon", "index.js"]