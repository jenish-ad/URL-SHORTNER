# URL Shortener

A full-stack URL shortener built with React, Express, TypeScript, and MongoDB.
Create short links, choose custom slugs, and track how often your links are opened.

## Features

- **Quick shortening** — create short links without an account.
- **Custom links** — signed-in users can choose their own URL slugs.
- **Personal dashboard** — view your links and their click counts.
- **Account authentication** — register, sign in, and sign out using HTTP-only cookies.
- **Persistent storage** — MongoDB keeps links and accounts across restarts.
- **Docker development** — start all three services with one command and reload source changes automatically.

## Technology

| Layer             | Tools                                                 |
| ----------------- | ----------------------------------------------------- |
| Frontend          | React 19, TypeScript, Vite, Tailwind CSS              |
| Routing and state | TanStack Router, TanStack Query, Redux Toolkit        |
| API               | Express 5, TypeScript, Node.js 24                     |
| Database          | MongoDB 8, Mongoose                                   |
| Authentication    | JSON Web Tokens, bcrypt, HTTP-only cookies            |
| Development       | Docker Compose, ESLint, Prettier, Node.js test runner |

## Quick start

### Requirements

- Docker Desktop with the Docker engine running, or Docker Engine with Compose.
- Ports `3000`, `5173`, and `27017` available on your machine.

Node.js and npm are only needed on your machine when running the apps outside Docker.
The commands below use PowerShell and assume the current directory is the project root.

### 1. Configure the backend

For a fresh checkout:

```powershell
Copy-Item Backend/.env.example Backend/.env
```

Edit `Backend/.env` and replace `JWT_SECRET` with a long, random secret.
If you already have a configured `.env`, keep it.

### 2. Start the services

```powershell
docker compose up --build -d
```

| Service       | Address                      |
| ------------- | ---------------------------- |
| Website       | http://localhost:5173        |
| API           | http://localhost:3000        |
| API readiness | http://localhost:3000/health |
| MongoDB       | `localhost:27017`            |

Open the website to create a link. Register an account to use custom slugs and the dashboard.

Compose starts MongoDB first, waits for the database to respond, then starts the API
and frontend. All published ports bind to your local machine.

### 3. Manage the services

```powershell
# Check service status
docker compose ps

# Follow application logs
docker compose logs -f backend frontend

# Stop and remove the containers
docker compose down
```

Database records remain in the `mongodb_data` volume when containers stop or are
recreated. Running `docker compose down -v` also deletes that volume and its data.

## Local development

Use Node.js 24 and npm. Configure `Backend/.env` as described above, then start MongoDB:

```powershell
docker compose up -d mongodb
```

Run the backend in one terminal:

```powershell
cd Backend
npm ci
npm run dev
```

Run the frontend in a second terminal, starting from the project root:

```powershell
cd Frontend
npm ci
npm run dev
```

Open http://localhost:5173. Both development servers reload when source files change.
Use either the local servers or the Compose application containers to avoid port conflicts.

## Configuration

### Backend

Values are read from `Backend/.env`.

| Variable       | Purpose                                                  | Local example                            |
| -------------- | -------------------------------------------------------- | ---------------------------------------- |
| `MONGO_URI`    | MongoDB connection string                                | `mongodb://127.0.0.1:27017/url-shortner` |
| `JWT_SECRET`   | Secret used to sign authentication tokens                | A long, random value                     |
| `APP_URL`      | Public base URL for generated short links                | `http://localhost:3000/`                 |
| `FRONTEND_URL` | Frontend origin allowed to send credentialed requests    | `http://localhost:5173`                  |
| `PORT`         | API listening port                                       | `3000`                                   |
| `NODE_ENV`     | Runtime environment; `production` enables secure cookies | `development`                            |

Compose overrides `MONGO_URI` to use the internal `mongodb` hostname and sets
`APP_URL` to `http://localhost:3000/`. The supplied port mappings and readiness check
expect the API to listen on port `3000`.

After editing backend environment values, recreate the API container:

```powershell
docker compose up -d --force-recreate backend
```

### Frontend

The frontend defaults to `http://localhost:3000` for API requests. To use another
address locally, copy `Frontend/.env.example` to `Frontend/.env` and set `VITE_API_URL`.
Restart Vite after editing the file.

Compose supplies `VITE_API_URL` directly in `compose.yaml`. This must be an address
the browser can reach, rather than a Docker service hostname.

Keep real secrets out of version control. The repository ignores `.env` files and
includes examples for setup.

## API reference

The local API base URL is `http://localhost:3000`.

| Method | Endpoint             | Authentication | Purpose                                                    |
| ------ | -------------------- | -------------- | ---------------------------------------------------------- |
| `GET`  | `/health`            | None           | Check database readiness                                   |
| `POST` | `/api/auth/register` | None           | Create an account and set a session cookie                 |
| `POST` | `/api/auth/login`    | None           | Sign in and set a session cookie                           |
| `POST` | `/api/auth/logout`   | None           | Clear the session cookie                                   |
| `GET`  | `/api/auth/me`       | Required       | Get the signed-in user                                     |
| `POST` | `/api/create`        | Optional       | Create a short link; custom slugs require sign-in          |
| `POST` | `/api/user/urls`     | Required       | List the signed-in user's links                            |
| `GET`  | `/:id`               | None           | Redirect to the original URL and increment its click count |

For example, create a link from PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/create" -ContentType "application/json" -Body '{"url":"https://example.com"}'
```

Example response:

```json
{
  "shortUrl": "http://localhost:3000/Ab3_xY7"
}
```

URLs must use HTTP or HTTPS. Custom slugs accept 3–64 letters, numbers, underscores,
or hyphens; `health` is reserved. Duplicate slugs return `409`, invalid input returns
`400`, and missing short links return `404`.

## Project structure

```text
.
├── Backend/
│   ├── app.ts                  # API setup and startup
│   ├── app.test.ts             # API integration tests
│   ├── src/
│   │   ├── config/             # Database and cookie configuration
│   │   ├── controller/         # Request and response handlers
│   │   ├── dao/                # Database queries
│   │   ├── middleware/         # Authentication checks
│   │   ├── models/             # Mongoose schemas and types
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Validation and business logic
│   │   └── utils/              # Tokens, errors, and request helpers
│   └── Dockerfile
├── Frontend/
│   ├── src/
│   │   ├── api/                # Typed API clients
│   │   ├── components/         # Forms, navigation, and URL list
│   │   ├── pages/              # Home, authentication, and dashboard views
│   │   ├── routing/            # Routes and access checks
│   │   ├── store/              # Redux state and typed hooks
│   │   └── utils/              # HTTP client and shared helpers
│   └── Dockerfile
└── compose.yaml
```

Backend relative imports use `.js` extensions intentionally so the compiled Node.js
ES modules resolve correctly. Source files remain `.ts` and `.tsx`.

## Checks and tests

Run these commands in the relevant application directory:

| Command                | Backend                   | Frontend                         |
| ---------------------- | ------------------------- | -------------------------------- |
| `npm run typecheck`    | Check TypeScript types    | Check TypeScript types           |
| `npm run build`        | Compile to `dist/`        | Type-check and build to `dist/`  |
| `npm test`             | Run API integration tests | —                                |
| `npm run lint`         | —                         | Run ESLint and React hook checks |
| `npm run format`       | Format files              | Format files                     |
| `npm run format:check` | Check formatting          | Check formatting                 |

API tests require MongoDB at `127.0.0.1:27017`. They cover authentication,
authorization, input validation, link creation, redirects, and click counts.
Each run creates a uniquely named test database and removes it afterward.
To use another MongoDB instance, set `TEST_MONGO_URI` in the shell before running tests.

Formatting uses Prettier with an 88-character line width, double quotes, trailing
commas, and two-space indentation. Shared editor settings live in `.editorconfig`.

To run a compiled backend locally, use `npm run build` followed by `npm start`.
To inspect a frontend build locally, use `npm run build` followed by `npm run preview`.
The supplied Docker Compose setup runs development servers with source reloads.

