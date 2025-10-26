import express, { Router } from 'express';
import { heronAuthMiddleware } from '../middlewares/heronAuth.middleware..js';
import { UserBadgeController } from '../controllers/userBadge.controller.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { UserBadgeRepository } from '../repository/userBadge.repository.js';
import { UserBadgeService } from '../services/userBadge.service.js';

const router: Router = express.Router();
const userBadgeRepository = new UserBadgeRepository();
const userBadgeService = new UserBadgeService(userBadgeRepository);
const userBadgeController = new UserBadgeController(userBadgeService);

/**
 * @openapi
 * /badges/:
 *   get:
 *     summary: Retrieve all badges obtained by the authenticated user
 *     description: Fetches all badges that the authenticated student has earned, including badge details such as name, description, icon URL, and the timestamp when the badge was awarded.
 *     tags:
 *       - User Badges
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: User badges retrieved successfully
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
 *                   example: USER_BADGES_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: User badges retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     badges:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           badge_id:
 *                             type: string
 *                             format: uuid
 *                             example: 54a2a768-8e62-41ac-8b6e-e5092881000e
 *                           name:
 *                             type: string
 *                             example: "First Journal"
 *                           description:
 *                             type: string
 *                             nullable: true
 *                             example: "Created your first journal entry"
 *                           icon_url:
 *                             type: string
 *                             nullable: true
 *                             example: "https://example.com/badges/first-journal.png"
 *                           awarded_at:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-10-26T12:08:11.190Z
 *                     total:
 *                       type: integer
 *                       example: 5
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
router.get('/', heronAuthMiddleware, asyncHandler(userBadgeController.getUserBadges.bind(userBadgeController)));

/**
 * @openapi
 * /badges/count:
 *   get:
 *     summary: Retrieve the total count of badges obtained by the authenticated user
 *     description: Fetches the total number of badges that the authenticated student has earned.
 *     tags:
 *       - User Badges
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: User badge count retrieved successfully
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
 *                   example: USER_BADGE_COUNT_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: User badge count retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 5
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
router.get('/count', heronAuthMiddleware, asyncHandler(userBadgeController.getUserBadgeCount.bind(userBadgeController)));

export default router;
