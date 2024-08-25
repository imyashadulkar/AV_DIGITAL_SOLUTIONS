import swaggerJsDoc from "swagger-jsdoc";

import { CONST_STRINGS } from "../constants.js";
import { ENV_VAR } from "../env.js";

const { BASE_URL, VERSION, ENV } = ENV_VAR;

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "AV Digital Solutions",
      version: "1.0.0",
      description: `REST API Documentation for Realty Park Server. Authorization is implemented via secure and http only cookie with JWT. 
      ${CONST_STRINGS.SERVER_RUNNING_MESSAGE}.`,
    },
    servers: [
      ...(ENV === "local"
        ? [
            {
              url: `http://localhost:80/${BASE_URL}/${VERSION}`,
              description: "Local server, Version: V1",
            },
          ]
        : [
            {
              url: `https://av-digital-solutions-1.onrender.com/${BASE_URL}/${VERSION}`,
              description: "Deployed server, Version: V1",
            },
          ]),
    ],

    components: {
      securitySchemes: {
        jwtCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "jwt",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
  security: [
    {
      jwtCookieAuth: [],
    },
  ],
  components: {
    responses: {
      headers: {
        "Set-Cookie": {
          description: "Cookies set in the response",
          schema: {
            type: "string",
          },
        },
      },
    },
  },
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);
