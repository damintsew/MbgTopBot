# Choose the latest LTS version of Node.js
FROM node:20

# It's good practice to specify a non-root user
# Here we use 'node' user provided by the base Node image
USER node

# Set the working directory. All the path will be taken relatively from this directory.
WORKDIR /home/node/app

# Add this to execute 'npm install' whenever your package.json changes
COPY package*.json ./
RUN npm install

# Expose any Ports your app is served on
EXPOSE 3000 5000
