-- Create auth database for the admin UI (better-auth / Prisma)
CREATE DATABASE app_auth;
GRANT ALL PRIVILEGES ON DATABASE app_auth TO hydra;
