# Use the official Node.js 23.11.0 image as a base image
FROM node:23.11.0-slim

# Set the working directory in the container
WORKDIR /application

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install
# RUN npm install -g pm2

# Copy the rest of the application files
COPY . ./

# Build the React + Vite application
RUN npm run build

# Command to run the application (adjust if necessary)
CMD ["npm", "run", "preview"]
