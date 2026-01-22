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
 * @updated 2025-11-11
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from 'cors';
import {corsOptions} from './config/cors.config.js'; 
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import journalRoute from './routes/activities/journal.routes.js'
import moodCheckInRoute from './routes/activities/moodCheckIn.route.js';
import gratitudeJarRoute from './routes/activities/gratitudeJar.routes.js';
import flipAndFeelRoute from './routes/activities/flipfeel.route.js';
import badgeRoute from './routes/activities/userBadge.route.js';
import { env } from './config/env.config.js';
import fs from 'fs';

const app : express.Express = express();
const isTS = fs.existsSync('./src/routes');

// --- Swagger options ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Heron Wellnest Activities API',
      version: '1.2.0',
      description:"Heron Wellnest Activities API provides endpoints for managing and tracking gamified wellness activities within the app, including journaling (Mind Mirror), mood tracking (Mood Meter / Mood Check-in), gratitude exercises (Gratitude Jar), and interactive experiences (Flip and Feel). This API enables secure creation, retrieval, and management of user activity data while supporting authenticationand role-based access control.",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1/activities`, 
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [isTS? './src/routes/**/*.ts' : "./dist/routes/**/*.{js,ts}"], // path to your route files with @openapi JSDoc comments
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
app.use('/api/v1/activities/mood-check-in', moodCheckInRoute);
app.use('/api/v1/activities/gratitude-jar', gratitudeJarRoute);
app.use('/api/v1/activities/flip-and-feel', flipAndFeelRoute); 
app.use('/api/v1/activities/badges', badgeRoute);

app.use(errorMiddleware); // Custom error handling middleware

export default app;