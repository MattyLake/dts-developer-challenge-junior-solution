# dts-developer-challenge-junior-solution

This is a solution for the Junior Software Developer position. It includes a full-stack application with node.js backend and node.js frontend.

## Deployment

To deploy the application:

1. Ensure you have Docker and Docker Compose installed.
2. Then, using .example.env, create strong passwords for root and database users and save it as .env file.
3. Run the following command to build and start the application:

   ```bash
   docker-compose up --build -d
   ```

4. Access the application at `http://localhost:8080`.

## Verification

Since the API has no GET endpoints (as per the brief), you can verify the functionality by checking the database directly.

1. Connect to the PostgreSQL database container using the psql following command:

   ```bash
   docker-compose exec db psql -U postgres -d app_database
   ```

2. Run the following SQL query to check for inserted data:

   ```sql
   SELECT * FROM tasks;
   ```

If you see records in the `tasks` table, it indicates that the application is functioning correctly.

## API Endpoints

The application provides the following API endpoints:

- `POST /api/tasks`: Create a new task.
  - title (string, required)
  - description (text, optional)
  - status (enum: To Do, In Progress, Done; default: To Do)
  - due_date (date, required)
  - due_time (time, required)
