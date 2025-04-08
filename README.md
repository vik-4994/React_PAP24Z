# Unipool - Course Exchange

Exchange your 8:00 lab on Monday to a better timeslot!

## Author

- Ihor Gavrylenko

# Running

1. Copy the `.env.example` file to `.env`.
2. Optionally, change the database provider in `prisma.schema` to your preferred choice.
3. Install the required npm modules by running:
   `npm install`
4. Initialize the Prisma database and client by running:
   `npx prisma db push`
5. You can start both the frontend and backend in one of the following ways:
6. Use NX Console to run `frontend:serve:development` and `backend:serve:development`.
7. Or, use the VS Code action called `Whole App Dev` (recommended for convenience).
8. Once the application is running, navigate to
   http://localhost:4200
