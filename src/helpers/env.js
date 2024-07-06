import dotenv from "dotenv";

// import { post } from "./fetch_helper_node.js";
dotenv.config({ path: ".env" });

const baseEnv = {
  ENV: process.env.ENV,
  PORT: process.env.PORT,
  BASE_URL: process.env.BASE_URL,
  UNIT_TEST: process.env.UNIT_TEST === "true",
  SEND_CODE: process.env.SEND_CODE === "true",
  SEND_EMAIL: process.env.SEND_EMAIL === "true",
  MONGODB_URI: process.env.MONGODB_URI,
  VERSION: process.env.VERSION,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION_IN_MINS: process.env.JWT_EXPIRATION_IN_MINS,
  VERIFICATION_CODE_EXPIRE_IN_MINS:
    process.env.VERIFICATION_CODE_EXPIRE_IN_MINS,
  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  GOOGLE_SERVICE_ACCOUNT_KEY_FILE: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
};

const getSecrectsAndVariablesFromENV = () => {
  const secrets = {
    JWT_SECRET: process.env.JWT_SECRET,
    MONGODB_URL:
      baseEnv.ENV === "prod"
        ? process.env.PROD_MONGODB_URL
        : process.env.DEV_MONGODB_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
  };
  const variables = {
    ALLOWED_ORIGINS:
      baseEnv.ENV === "prod"
        ? process.env.PROD_ALLOWED_ORIGINS
        : process.env.DEV_ALLOWED_ORIGINS,
    ALLOWED_ORIGINS_TO_SEND_EMAIL: process.env.ALLOWED_ORIGINS_TO_SEND_EMAIL,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    JWT_EXPIRATION_IN_MINS: process.env.JWT_EXPIRATION_IN_MINS,
    MAX_VERIFICATION_ATTEMPTS: process.env.MAX_VERIFICATION_ATTEMPTS,
    VERIFICATION_CODE_EXPIRE_IN_MINS:
      process.env.VERIFICATION_CODE_EXPIRE_IN_MINS,
  };
  return { secrets, variables };
};

const getSecrectsAndVariablesFromServer = async () => {
  const CONFIG_API_URL = process.env.CONFIG_API_URL;
  const CONFIG_API_ENDPOINT = process.env.CONFIG_API_ENDPOINT;
  const url = `${CONFIG_API_URL}/${CONFIG_API_ENDPOINT}`;
  const headers = { "Content-Type": "application/json" };
  const payload = {
    id: `${process.env.APP_ID}-${process.env.ENV}`,
    env: process.env.ENV,
    token: process.env.CONFIG_API_TOKEN,
  };

  const resData = (await post(url, payload, headers)) || {};
  const { secrets, variables } = resData;

  secrets.MONGODB_URL =
    baseEnv.ENV === "prod" ? secrets.PROD_MONGODB_URL : secrets.DEV_MONGODB_URL;

  variables.ALLOWED_ORIGINS =
    baseEnv.ENV === "prod"
      ? variables.PROD_ALLOWED_ORIGINS
      : variables.DEV_ALLOWED_ORIGINS;

  return { secrets, variables };
};

const loadEnvFromServer = process.env.LOAD_ENV_FROM_SERVER === "true";

const { secrets, variables } = loadEnvFromServer
  ? await getSecrectsAndVariablesFromServer()
  : getSecrectsAndVariablesFromENV();

export const ENV_VAR = {
  ...baseEnv,
};
