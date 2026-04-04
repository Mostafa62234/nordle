FROM node:18-alpine

WORKDIR /app

# Copy the package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all the server files
COPY . .

EXPOSE 3001

# Start the application
CMD ["node", "index.js"]
