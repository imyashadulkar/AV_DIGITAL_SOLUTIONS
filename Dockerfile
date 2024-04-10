FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy the rest of the application code into the container at /usr/src/app
COPY . .

# Install project dependencies
RUN npm install

# Command to run the Node.js application
CMD ["node", "src/index.js"]
