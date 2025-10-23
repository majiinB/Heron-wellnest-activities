import express, { Router } from 'express';
import { heronAuthMiddleware } from '../middlewares/heronAuth.middleware..js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { FlipFeelService } from '../services/flipFeel.service.js';
import { FlipFeelController } from '../controllers/flipfeel.controller.js';
import { FlipFeelQuestionRepository } from '../repository/flipFeelQuestions.repository.js';

const router: Router = express.Router();
const flipFeelQuestionRepository = new FlipFeelQuestionRepository();
const flipFeelService = new FlipFeelService(flipFeelQuestionRepository);
const flipfeelController = new FlipFeelController(flipFeelService);

/**
 * @openapi
 * /flip-feel:
 *   post:
 *     summary: Create a new flip and feel question
 *     description: Allows a user to create a new flip and feel question with choices.
 *     tags:
 *       - Flip and Feel
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 500
 *                 description: The gratitude content to be stored (meaningful text, not nonsense)
 *                 example: "I'm grateful for my supportive family and friends who always believe in me."
 *     responses:
 *       "201":
 *         description: Gratitude entry created successfully
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
 *                   example: GRATITUDE_ENTRY_CREATED
 *                 message:
 *                   type: string
 *                   example: Gratitude entry created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     gratitude_id:
 *                       type: string
 *                       format: uuid
 *                       example: 54a2a768-8e62-41ac-8b6e-e5092881000e
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: 6bf00386-77e5-4a02-9ed9-5f4f294ceb8b
 *                     content:
 *                       type: string
 *                       example: "I'm grateful for my supportive family and friends who always believe in me."
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-02T12:08:11.190Z
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-02T12:08:11.190Z
 *                     is_deleted:
 *                       type: boolean
 *                       example: false
 *       "400":
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidContent:
 *                 value:
 *                   success: false
 *                   code: INVALID_CONTENT
 *                   message: Content must be a non-empty string.
 *               contentLength:
 *                 value:
 *                   success: false
 *                   code: BAD_REQUEST
 *                   message: Content must be between 3 and 500 characters.
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
router.post('/', heronAuthMiddleware, asyncHandler(flipfeelController.addFlipAndFeelQuestions.bind(flipfeelController)));

export default router;