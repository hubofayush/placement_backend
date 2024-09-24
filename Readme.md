# Blue-Collar Job Application Backend

This repository contains the backend code for the Blue-Collar Job Application, designed to help connect blue-collar workers from the Ratnagiri region with employers from around the world.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Database Structure](#database-structure)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

The backend handles business logic, API routing, database interaction, authentication, and admin functionalities for managing employers, employees, job listings, and user subscriptions (free and paid tiers).

## Features

- **User Management**: Employees and employers can register, authenticate, and manage profiles.
- **Job Listings**: Employers can post, edit, and delete job listings. Employees can search, view, and apply for jobs.
- **KYC Verification**: Admins can verify employers and employees using KYC documents.
- **Subscription Plans**: Paid and free plans for both employees and employers.
- **Admin Dashboard**: Super admin can view and manage users, jobs, and handle KYC approval.

## Technologies Used

- **Node.js**: Runtime environment.
- **Express.js**: Web framework for building the API.
- **Firebase/Firestore**: Real-time NoSQL database.
- **Firebase Authentication**: Handles user authentication and authorization.
- **Cloud Functions**: For serverless backend logic.
- **JWT (JSON Web Token)**: For secure authentication.
- **Stripe**: For handling payments (optional, for premium services).
- **Jest and Enzyme**: For unit and integration testing.
- **Firebase Hosting**: Optional for deploying backend services.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/blue-collar-job-backend.git
   cd blue-collar-job-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Firebase Project:**

   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Create a new project and set up Firestore, Firebase Authentication, and Cloud Functions.
   - Enable email/password authentication in Firebase Authentication.

4. **Configure environment variables:**

   - Create a `.env` file in the root directory with the following keys:

   ```bash
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key (if using premium services)
   ```

5. **Run the application:**
   ```bash
   npm start
   ```

## Configuration

- Firebase services must be configured, including Firestore, Authentication, and optionally, Cloud Functions for the serverless environment.
- JWT is used for handling authentication; ensure the secret key (`JWT_SECRET`) is set in your `.env` file.

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user (employee/employer).
- `POST /api/auth/login`: Login an existing user.
- `POST /api/auth/verify-kyc`: Verify KYC status for user.

### Job Management

- `POST /api/jobs`: Create a new job listing.
- `GET /api/jobs`: Retrieve all job listings (with filters for location, job type, etc.).
- `GET /api/jobs/:id`: Retrieve a specific job by ID.
- `PUT /api/jobs/:id`: Update a job listing.
- `DELETE /api/jobs/:id`: Delete a job listing.

### Employee Management

- `GET /api/employees`: Retrieve all employees.
- `GET /api/employees/:id`: Retrieve a specific employee.
- `PUT /api/employees/:id`: Update employee details.

### Employer Management

- `GET /api/employers`: Retrieve all employers.
- `GET /api/employers/:id`: Retrieve a specific employer.
- `PUT /api/employers/:id`: Update employer details.

### Admin Management

- `GET /api/admin/dashboard`: View overall stats for the application.
- `PUT /api/admin/kyc-verify/:id`: Verify KYC for a user.

## Authentication

- JWT tokens are used for secure communication between the client and server.
- Firebase Authentication is integrated for managing user logins and registration.

## Database Structure

### Users Collection (Employees & Employers)

- `user_id`: Auto-generated unique identifier.
- `name`: Full name of the user.
- `email`: User’s email.
- `role`: `employee` or `employer`.
- `profile`: Profile details (location, job experience, etc.).
- `subscription`: Free or premium.
- `kycStatus`: `pending`, `approved`, or `rejected`.

### Jobs Collection

- `job_id`: Unique identifier for each job.
- `employer_id`: Reference to the employer who posted the job.
- `title`: Job title.
- `description`: Job description.
- `location`: Job location (Ratnagiri region for employees).
- `salary`: Salary range.
- `status`: `active` or `inactive`.

## Error Handling

All errors are handled centrally using Express middleware. Standardized error codes and messages are returned to the client.

## Testing

Unit and integration tests are implemented using **Jest** and **Enzyme**. To run tests, use the following command:

```bash
npm test
```
