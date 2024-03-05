# Use NodeJS base image
FROM node:lts

# Create app directory
WORKDIR /usr/src/app

RUN npm install yarn
# Install app dependencies by copying
# package.json and package-lock.json
COPY package.json ./
COPY yarn.lock ./

# Install all dependencies
RUN yarn install

# Copy app source
COPY . .

# Expose the listening port
EXPOSE 3000

# Command to run the app
CMD [ "yarn", "start:dev" ]