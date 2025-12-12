# Use NodeJS base image
FROM node:20.12

# Create app directory
WORKDIR /usr/src/app
# Install app dependencies by copying
# package.json and package-lock.json
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy app source
COPY . .

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/ || echo "dist directory not found!"

# Expose the listening port
EXPOSE 3000

# Command to run the app
CMD [ "node", "dist/main.js" ]
