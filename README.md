# CampusFind

CampusFind is a campus lost-and-found app. Students can report, browse, edit, and delete lost or found item listings.

## Project structure

- `backend/` — Express API and Mongoose item model
- `frontend/` — React and Vite user interface

## Run it on your computer

Requirements: Node.js and MongoDB running locally.

1. In the project folder, install the backend packages:

   ```powershell
   npm.cmd install
   ```

2. In `backend/`, copy `.env.example` to `.env`. The example connects to a local MongoDB database named `campusfind`.
3. Start the API from the `backend/` folder:

   ```powershell
   node server.js
   ```

   The API runs at `http://localhost:5001`.
4. In a second terminal, install and start the frontend:

   ```powershell
   cd frontend
   npm.cmd install
   npm.cmd run dev
   ```

   Open the local address printed by Vite.

## API routes

- `GET /api/items` — list reports
- `GET /api/items/:id` — view one report
- `POST /api/items` — create a report
- `PUT /api/items/:id` — update a report
- `DELETE /api/items/:id` — delete a report

## Deploying

The frontend and API need separate services, and the API needs a cloud MongoDB connection.

- API web service: use the repository root, build command `npm install`, and start command `node backend/server.js`. Set `MONGO_URI` in the host's environment variables to your MongoDB Atlas connection string. The host provides `PORT`.
- Frontend static site: use `frontend` as the root directory, build command `npm install && npm run build`, and publish directory `dist`. Set `VITE_API_URL` to the deployed API URL followed by `/api/items`, for example `https://your-api.example.com/api/items`.

Never commit `.env` files or paste database credentials into source code. Use the hosting provider's environment-variable settings for deployment secrets.
