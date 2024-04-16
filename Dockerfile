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

# Expose the listening port
EXPOSE 3000

# Command to run the app
CMD [ "npm", "run", "start:prod" ]
