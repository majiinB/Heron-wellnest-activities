/**
 * Activiities API
 *
 * @file app.ts
 * @description Sets up and configures the Express application instance for the 
 * Heron Wellnest Activities API. This file defines middleware, routes, 
 * and application-level settings. It does not start the server directly—`index.ts`
 * handles bootstrapping and listening on the port.
 *
 * Routes:
 * - GET /health: A simple health check endpoint that returns a status of 'ok'.
 *
 * Middleware:
 * - express.json(): Parses incoming request bodies in JSON format.
 * - CORS policy: Applies Cross-Origin Resource Sharing rules for valid sources.
 *
 * Usage:
 * - Imported by `index.ts` to start the server.
 *
 * @author Arthur M. Artugue
 * @created 2025-08-16
 * @updated 2025-09-24
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from 'cors';
import {corsOptions} from './config/cors.config.js'; 
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import journalRoute from './routes/journal.routes.js'

const app : express.Express = express();

// --- Swagger options ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Heron Wellnest Activities API',
      version: '1.0.0',
      description: 'API documentation for Heron Wellnest Activities API. Responsible for gamified activities inside the app (e.g. Mind Mirror / Journaling, Flip and Feel, Gratitude Jar, Mood check-in / Mood meter)',
    },
    servers: [
      {
        url: 'http://localhost:8080/api/v1/activities', // adjust your base URL
      },
    ],
  },
  apis: ['./src/routes/**/*.ts'], // 👈 path to your route files with @openapi JSDoc comments
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares
app.use(cors(corsOptions));
app.use(express.json()); 
app.use(loggerMiddleware); // Custom logger middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
// This is a health check route
app.get('/api/v1/activities/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api/v1/activities/mind-mirror', journalRoute);

app.use(errorMiddleware); // Custom error handling middleware

export default app;