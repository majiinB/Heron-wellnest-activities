import express, { Router } from 'express';
import { MoodCheckInRepository } from '../../repository/activities/moodCheckIn.repository.js';
import { MoodCheckInService } from '../../services/activities/moodCheckIn.service.js';
import { MoodCheckInController } from '../../controllers/activities/moodCheckIn.controller.js';
import { heronAuthMiddleware } from '../../middlewares/heronAuth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';

const router: Router = express.Router();

const moodCheckInRepository: MoodCheckInRepository = new MoodCheckInRepository();
const moodCheckInService = new MoodCheckInService(moodCheckInRepository);
const moodCheckInController = new MoodCheckInController(moodCheckInService);

/**
 * @openapi
 * /mood-check-in/:
 *   post:
 *     summary: Create a new mood check-in
 *     description: Allows a student to create a mood check-in with up to 3 different moods for the current day. Only one check-in per day is allowed.
 *     tags:
 *       - Mood Check-In
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mood_1
 *             properties:
 *               mood_1:
 *                 type: string
 *                 description: Primary mood (required)
 *                 example: "happy"
 *               mood_2:
 *                 type: string
 *                 nullable: true
 *                 description: Secondary mood (optional)
 *                 example: "excited"
 *               mood_3:
 *                 type: string
 *                 nullable: true
 *                 description: Tertiary mood (optional)
 *                 example: "grateful"
 *     responses:
 *       "201":
 *         description: Mood check-in created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: MOOD_CHECKIN_CREATED
 *                 message:
 *                   type: string
 *                   example: Mood check-in created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     checkin_id:
 *                       type: string
 *                       format: uuid
 *                       example: 54a2a768-8e62-41ac-8b6e-e5092881000e
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: 6bf00386-77e5-4a02-9ed9-5f4f294ceb8b
 *                     mood_1:
 *                       type: string
 *                       example: happy
 *                     mood_2:
 *                       type: string
 *                       nullable: true
 *                       example: excited
 *                     mood_3:
 *                       type: string
 *                       nullable: true
 *                       example: grateful
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-02T12:08:11.190Z
 *       "400":
 *         description: Bad request - validation failed or duplicate check-in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingMood:
 *                 value:
 *                   success: false
 *                   code: MISSING_MOOD
 *                   message: At least one mood is required.
 *               invalidMood:
 *                 value:
 *                   success: false
 *                   code: INVALID_MOOD
 *                   message: "The mood 'invalidmood' is not recognized."
 *               duplicateMoods:
 *                 value:
 *                   success: false
 *                   code: DUPLICATE_MOODS
 *                   message: You cannot select the same mood more than once.
 *               checkinExists:
 *                 value:
 *                   success: false
 *                   code: CHECKIN_EXISTS
 *                   message: You have already checked in today.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 value:
 *                   success: false
 *                   code: UNAUTHORIZED
 *                   message: "Unauthorized: User ID missing"
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 value:
 *                   success: false
 *                   code: FORBIDDEN
 *                   message: "Forbidden: student role required"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   code: INTERNAL_SERVER_ERROR
 *                   message: An unexpected error occurred
 */
router.post('/', heronAuthMiddleware, asyncHandler(moodCheckInController.createCheckIn.bind(moodCheckInController)));

/**
 * @openapi
 * /mood-check-in/today:
 *   get:
 *     summary: Check if user has mood check-in for today
 *     description: Retrieves the mood check-in status for the authenticated student for the current day. Returns whether the user has already checked in today.
 *     tags:
 *       - Mood Check-In
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Mood check-in status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: MOOD_CHECKIN_STATUS
 *                 message:
 *                   type: string
 *                   example: Mood check-in status for today retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasCheckedIn:
 *                       type: boolean
 *                       example: true
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 value:
 *                   success: false
 *                   code: UNAUTHORIZED
 *                   message: "Unauthorized: User ID missing"
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 value:
 *                   success: false
 *                   code: FORBIDDEN
 *                   message: "Forbidden: student role required"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   code: INTERNAL_SERVER_ERROR
 *                   message: An unexpected error occurred
 */
router.get('/today', heronAuthMiddleware, asyncHandler(moodCheckInController.getCheckInForToday.bind(moodCheckInController)));

export default router;