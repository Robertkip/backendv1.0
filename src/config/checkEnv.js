// Settings the server cannot run without. Login breaks without the JWT secrets.
const REQUIRED = ["JWT_TOKEN", "JWT_REFRESH_TOKEN"];

// Settings that have an insecure development default, so production must set them.
const REQUIRED_IN_PRODUCTION = ["REDIS_SESSION_SECRET", "DATABASE_PASSWORD"];

// Names of the required settings that are missing or blank.
export const missingEnv = (env = process.env) => {
  const required = env.NODE_ENV === "production" ? [...REQUIRED, ...REQUIRED_IN_PRODUCTION] : REQUIRED;
  return required.filter((name) => !env[name] || !env[name].trim());
};

// Stops startup with a clear message instead of failing later on first use.
export const checkEnv = (env = process.env) => {
  const missing = missingEnv(env);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Set them in .env (see env.example) and restart."
    );
    process.exit(1);
  }
};
