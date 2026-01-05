import swaggerJsdoc from "swagger-jsdoc";
import { SERVER_URL } from "../env";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Rent Car API",
      version: "1.0.0",
      description:
        "REST API for managing car rentals, users, and admin resources. Authenticated endpoints use Bearer access tokens generated from Google OAuth.",
      contact: {
        name: "Ridwan Alfarezi",
      },
    },
    servers: [
      {
        url: SERVER_URL,
        description: "Current server",
      },
      {
        url: "http://localhost:3000",
        description: "Local development",
      },
    ],
    tags: [
      { name: "Auth", description: "Google OAuth and token lifecycle" },
      { name: "Rentals", description: "Customer rental operations" },
      { name: "Cars", description: "Admin car management" },
      { name: "Users", description: "Admin user management" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Access token obtained after Google OAuth sign-in",
        },
      },
      schemas: {
        MessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        TokenPair: {
          type: "object",
          properties: {
            type: { type: "string", example: "Bearer" },
            accessToken: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", example: "customer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Car: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            brand: { type: "string" },
            price: { type: "number", format: "float" },
            quantity: { type: "integer" },
            image: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Rental: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            carId: { type: "string" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            quantity: { type: "integer" },
            price: { type: "number", format: "float" },
            status: { type: "string", example: "pending" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            user: { $ref: "#/components/schemas/User" },
            car: { $ref: "#/components/schemas/Car" },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            pageSize: { type: "integer", example: 10 },
            total: { type: "integer", example: 25 },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            stack: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/": {
        get: {
          summary: "Welcome message",
          responses: {
            200: {
              description: "API welcome message with docs link",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/google": {
        get: {
          tags: ["Auth"],
          summary: "Start Google OAuth login flow",
          description:
            "Redirects the user to Google for authentication. Complete the flow to receive access and refresh tokens.",
          responses: {
            302: { description: "Redirect to Google OAuth" },
          },
        },
      },
      "/auth/google/callback": {
        get: {
          tags: ["Auth"],
          summary: "Handle Google OAuth callback",
          responses: {
            200: {
              description: "Returns authenticated user and tokens",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      user: { $ref: "#/components/schemas/User" },
                      token: { $ref: "#/components/schemas/TokenPair" },
                    },
                  },
                },
              },
            },
            401: { description: "Authentication failed" },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Rotate access token using refresh token cookie",
          responses: {
            200: {
              description: "New access token issued",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      tokens: { $ref: "#/components/schemas/TokenPair" },
                    },
                  },
                },
              },
            },
            400: { description: "Missing refresh token" },
            403: { description: "Invalid refresh token" },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout user and revoke refresh token",
          responses: {
            200: {
              description: "Refresh token revoked and cookie cleared",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
            400: { description: "Missing refresh token" },
            403: { description: "Invalid refresh token" },
          },
        },
      },
      "/rentals": {
        get: {
          tags: ["Rentals"],
          summary: "List rentals (admin)",
          parameters: [
            {
              name: "query",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Search by user or car name",
            },
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1 },
            },
            {
              name: "startDate",
              in: "query",
              required: false,
              schema: { type: "string", format: "date-time" },
            },
            {
              name: "endDate",
              in: "query",
              required: false,
              schema: { type: "string", format: "date-time" },
            },
          ],
          responses: {
            200: {
              description: "Rentals list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Rental" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
            403: { description: "Admin role required" },
          },
          security: [{ bearerAuth: [] }],
        },
        post: {
          tags: ["Rentals"],
          summary: "Create rental (customer)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["carId", "quantity", "startDate", "endDate"],
                  properties: {
                    carId: { type: "string" },
                    quantity: { type: "integer", minimum: 1, maximum: 100 },
                    startDate: { type: "string", format: "date-time" },
                    endDate: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Rental created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/Rental" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation error" },
            401: { description: "Unauthorized" },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      "/rentals/{rentalId}": {
        get: {
          tags: ["Rentals"],
          summary: "Get rental by id (customer)",
          parameters: [
            {
              name: "rentalId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Rental details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/Rental" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Rental not found" },
          },
          security: [{ bearerAuth: [] }],
        },
        put: {
          tags: ["Rentals"],
          summary: "Update rental dates (customer)",
          parameters: [
            {
              name: "rentalId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["startDate", "endDate"],
                  properties: {
                    startDate: { type: "string", format: "date-time" },
                    endDate: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Rental updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/Rental" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
          security: [{ bearerAuth: [] }],
        },
        delete: {
          tags: ["Rentals"],
          summary: "Cancel rental (customer)",
          parameters: [
            {
              name: "rentalId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Rental cancelled",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      "/rentals/user/{userId}": {
        get: {
          tags: ["Rentals"],
          summary: "List rentals for a user (customer)",
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Rentals for the user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Rental" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      "/admin/users": {
        get: {
          tags: ["Users"],
          summary: "List users (admin)",
          parameters: [
            {
              name: "query",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            200: {
              description: "Users list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/User" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
            403: { description: "Admin role required" },
          },
          security: [{ bearerAuth: [] }],
        },
        post: {
          tags: ["Users"],
          summary: "Create user (admin)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email"],
                  properties: {
                    name: { type: "string", minLength: 3 },
                    email: { type: "string", format: "email" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "User created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation error" },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      "/admin/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get user by id (admin)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "User details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { data: { $ref: "#/components/schemas/User" } },
                  },
                },
              },
            },
            404: { description: "User not found" },
          },
          security: [{ bearerAuth: [] }],
        },
        put: {
          tags: ["Users"],
          summary: "Update user (admin)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email"],
                  properties: {
                    name: { type: "string", minLength: 3 },
                    email: { type: "string", format: "email" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "User updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
          security: [{ bearerAuth: [] }],
        },
        delete: {
          tags: ["Users"],
          summary: "Delete user (admin)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "User deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      "/admin/cars": {
        get: {
          tags: ["Cars"],
          summary: "List cars (admin)",
          parameters: [
            {
              name: "query",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Search by name or brand",
            },
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            200: {
              description: "Cars list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Car" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
            403: { description: "Admin role required" },
          },
          security: [{ bearerAuth: [] }],
        },
        post: {
          tags: ["Cars"],
          summary: "Create car (admin)",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["name", "brand", "price", "quantity"],
                  properties: {
                    name: { type: "string" },
                    brand: { type: "string" },
                    price: { type: "number" },
                    quantity: { type: "integer" },
                    image: {
                      type: "string",
                      format: "binary",
                      description: "Optional car image",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Car created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/Car" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation error" },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      "/admin/cars/{id}": {
        get: {
          tags: ["Cars"],
          summary: "Get car by id (admin)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Car details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { data: { $ref: "#/components/schemas/Car" } },
                  },
                },
              },
            },
            404: { description: "Car not found" },
          },
          security: [{ bearerAuth: [] }],
        },
        put: {
          tags: ["Cars"],
          summary: "Update car (admin)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["name", "brand", "price", "quantity"],
                  properties: {
                    name: { type: "string" },
                    brand: { type: "string" },
                    price: { type: "number" },
                    quantity: { type: "integer" },
                    image: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Car updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/Car" },
                    },
                  },
                },
              },
            },
          },
          security: [{ bearerAuth: [] }],
        },
        delete: {
          tags: ["Cars"],
          summary: "Delete car (admin)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Car deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
          security: [{ bearerAuth: [] }],
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
