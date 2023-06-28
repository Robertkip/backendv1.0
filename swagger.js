const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "backendv1.2",
      version: "1.0.0",
      description: "Waridi JS Retrieve",
    },
    servers: [
      {
        url: "http://192.168.1.76:8084/",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Signup: {
          type: "object",
          require: [
            "roleId",
            "username",
            "email",
            "password",
            "confirm_password",
            "accessToken",
            "resetPasswordToken",
            "resetPasswordExpires",
            "verified",
            "active",
          ],
          properties: {
            roleId: {
              type: "integer",
              description: "The role Id User Provides During Registration",
            },
            username: {
              type: "string",
              description: "The Username Provided During Registration",
            },
            email: {
              type: "string",
              description: "The Email Provided During Registration",
            },
            password: {
              type: "string",
              description: "The Password of the User",
            },
            confirm_password: {
              type: "string",
              description: "The Password of the User",
            },
            accessToken: {
              type: "text",
              description: "The Access Token of The User",
            },
            resetPasswordToken: {
              type: "text",
              description: "The Reset Password Token",
            },
            resetPasswordExpires: {
              type: "date",
              description: "The Time in Which Reset Password Expires",
            },
            verified: {
              type: "boolean",
              description: "Check If Verified or Not",
            },
            active: {
              active: "boolean",
              description: "Check if the User is active or Not",
            },
          },
        },
      },
      responses: {
        400: {
          description: "Please provide email, password",
          contents: "application/json",
        },
        500: {
          description: "Error Registering a User",
          contents: "application/json",
        },
      },
    },
  },
  apis: ["./src/routers/authRoute.js"],
};

export default options;
