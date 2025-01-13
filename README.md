# **Collabhub-api**

## **Overview**

**Collabhub** is a dynamic platform designed to connect individuals seeking collaborators with specific skills for their projects. Beyond matchmaking, CollabHub offers real-time guidance and feedback to help users refine their work.

## **Features**

- Professional profiles
- Project listings
- JWT authentication
- In-app & email notifications (Mailjet integration)
- File (avatar, banner, resume) uploads (AWS S3)
- Caching
- (Near) Real-time chat (long-polling)

### **Upcoming features**

- OATH (google and linkedin)
- Improved chat and notifications with pusher
- Documentation with Swagger

## **Tech Stack**

- **Frontend**: [Next.js](https://nextjs.org/) (React framework)
- **Backend**: [NestJS](https://nestjs.com/) (Node.js framework)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (with TypeORM)
- **Authentication**: JWT
- **Deployment**: Vercel/Fly.io (fly.toml file already included)
- **Caching**: Redis

---

## **Installation**

Working demo can be found here [Collabhub](https://collabhub.xyz)

---

## **Installation**

### **Prerequisites**

- **Node.js** (>= 14.x)
- **NPM**
- **Redis** (>= 6.x)

### **Steps**

1. Clone the repository:

   ```bash
   git clone https://github.com/nwanguma/collabhub-api.git
   cd collabhub-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment (create local Redis and postgresQL):

   - Backend: Create a `.env` file in the root directory and provide the variables as specified in the `env.example` file

4. Seed database:

   ```bash
   npm run seed:db
   ```

5. Start the development server:

   ```bash
   npm run start:dev
   ```

6. Visit `http://localhost:{{PORT}}` to view the application.

7. Run tests (optional):

   ```bash
   npm run test:watch
   ```

8. Connect to frontend (optional):
   The frontend lives here [Collabhub-frontend](https://github.com/nwanguma/collabhub-frontend). Please follow instructions in the readme to connect and run the app end-to-end

---

## **Usage**

### **For Users**

1. Sign up using your email.
2. Update your profile to unlock full access.
3. Create your projects, and list skills/stack used.

---

## **Key API Endpoints**

### **Authentication**

- `POST /auth/register`: Register a new user (candidate or company)
- `POST /auth/login`: Login with credentials (returns JWT)
- `POST /auth/refresh`: Generate new access and refresh tokens
- `POST /auth/activate/{token}`: User account activation
- `POST /auth/reset-password`: Password reset initialization
- `POST /auth/reset-password/{token}`: Password reset
- `POST /auth/change-password/{token}`: Password change

### **Users**

- `GET /users/me`: Get signed in user

### **Projects**

- `GET /projects`: Lists all projects
- `GET /projects/{id}`: Get specific project with the id
- `POST /projects`: Create project
- `PUT /projects/{id}`: Update specific project with the id
- `DELETE /projects/{id}`: Delete specific project with the id
- `POST /projects/{id}/comments`: Comment on project
- `DELETE /projects/{id}/{commentId}/comments`: Delete project comment
- `POST /projects/{id}/reactions`: Like or unlike project
- `POST /projects/{id}/feedback`: Add project feedback
- `PUT /projects/{id}/feedback`: Update project feedback
- `DELETE /projects/{id}/feedback`: Delete project feedback

### **Notifications**

- `PUT /notifications/{id}/read`: Mark notification as read
- `GET /notifications/long-poll`: Get latest notifications and messages
- `GET /notifications`: Get user notifications

### **Profiles**

- `GET /profiles`: Fetches all profiles
- `GET /profiles/{id}`: Get specific profile with the id
- `PUT /profiles/{id}`: Update specific profile with the id
- `GET /profiles/connections/all`: Get all connections (followers/following).
- `POST /profiles/{id}/comments`: Comment on profile
- `DELETE /profiles/{id}/{commentId}/comments`: Delete profile comment
- `POST /profiles/{id}/reactions`: Like or unlike profile
- `PATCH /profiles/{followedUserProfileId}/follow`: Follow user
- `PATCH /profiles/{followedUserProfileId}/unfollow`: Unfollow user

### **Conversations**

- `GET /conversations`: Fetches all conversations
- `GET /conversations/{id}/messages`: Get messages per conversation
- `POST /conversations/{recipientId}`: Create new conversation

### **Messages**

- `GET /messages`: Send message

### **Skills**

- `GET /skills`: Fetches all skills

### **Locations**

- `GET /locations`: Fetches all locations

### **File uploads**

- `POST /locations/upload/documents`: Uploads documents
- `POST /locations/upload/images`: Uploads images

### **Recommendations**

- `GET /recommendations`: Fetches profile and project recommendations

---

## **Miscellanous features**

- Rate limiting using @nestjs/throttler is applied on auth routes
- A couple GET endpoints are cached automatically, cache is invalidated after updates

## **Database Schema**

- (Will update readme with db schema design doc later)
- Schema information can be found in the main `*.entity.ts` file for each core project feature

---

## **Contributing**

Contributions are not welcome yet! App is purely to demonstrate my working knowledge of the stack employed in building this project.

---

## **Contact**

For any inquiries, please contact [nwangumat@gmail.com](mailto:nwangumat@gmail.com).

---

This **README.md** will guide reviewers through setting up, running, and reviewing to the **Collabhub** project. Let me know if you have questions!
