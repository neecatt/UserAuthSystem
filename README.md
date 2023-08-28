# User Authentication System with 2-Factor Authentication (2FA)

This project is a user authentication system built using NestJS, MongoDB, Prisma, and Docker. It includes 2-Factor Authentication (2FA) with QR code support.

## Prerequisites

- Node.js and npm: Install Node.js and npm from https://nodejs.org/.
- Docker: Install Docker from https://www.docker.com/get-started.
- Docker Compose: Install Docker Compose from https://docs.docker.com/compose/install/.

## Setup Instructions

1. Clone the repository:
   ```sh
   git clone https://github.com/neecatt/UserAuthSystem.git
   ```

2. Install dependencies:
   npm install
   
3. Set up environment variables:

Rename .env.example to .env.
Update .env file with your MongoDB connection URI and JWT secret.

4. Build and run the application using Docker:
   docker-compose up -d

5. Access the application:

The application will be running at http://localhost:3000.
The GraphQL Playground can be accessed at http://localhost:3000/graphql.

## Usage
1. Register a new user using the register mutation.
2. Log in with your registered user using the login mutation.
3. To enable 2FA, use the enableTwoFactorAuthentication mutation. This will return a QR code for configuring an authenticator app.
4. Authenticate with 2FA using the authenticateTwoFactor mutation and the 6-digit code from your authenticator app.
5. You can change your password using the changePassword mutation.
