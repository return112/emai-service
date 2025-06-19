# Simple Email Service

A simplified email service that allows users to register, log in, and send emails to multiple recipients at once.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_password
   EMAIL_SERVICE=gmail
   ```
4. Start the server:
   ```
   npm run dev
   ```

## API Documentation

### Authentication

#### Register a new user
- **URL**: `/api/users/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```

#### Login
- **URL**: `/api/users/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```

#### Get User Profile
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token`
- **Response**:
  ```json
  {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```

### Email

#### Send Email to Multiple Recipients
- **URL**: `/api/email/send`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token`
- **Body**:
  ```json
  {
    "recipients": ["recipient1@example.com", "recipient2@example.com"],
    "subject": "Test Email",
    "body": "<p>This is a test email.</p>",
    "userId": "user_id"
  }
  ```
- **Response**:
  ```json
  {
    "message": "All emails sent successfully",
    "results": [
      {
        "email": "recipient1@example.com",
        "status": "success"
      },
      {
        "email": "recipient2@example.com",
        "status": "success"
      }
    ]
  }
  ```

#### Get Email History
- **URL**: `/api/email/history/:userId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token`
- **Response**:
  ```json
  {
    "emailLogs": [
      {
        "_id": "log_id",
        "userId": "user_id",
        "companyEmail": "recipient@example.com",
        "status": "sent",
        "sentAt": "2023-06-01T12:00:00.000Z",
        "template": {
          "subject": "Test Email",
          "body": "This is a test email."
        }
      }
    ]
  }
  ```

## Note on Email Configuration

This service uses the Nodemailer library with Gmail as the default service. To use Gmail, you need to:

1. Use your Gmail address as `EMAIL_USER`
2. If using regular password, you need to enable "Less secure app access" in your Google account settings
3. Better option: Generate an App Password in your Google account and use it as `EMAIL_PASS`

You can also use other email services by changing the `EMAIL_SERVICE` environment variable. 