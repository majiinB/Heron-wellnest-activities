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
 * /flip-feel/:
 *   post:
 *     summary: Create multiple flip and feel questions
 *     description: Allows counselors/admins to create one or more flip and feel questions with their choices. Each question must have exactly 4 choices and belong to a category.
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
 *               - questions
 *             properties:
 *               questions:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - category
 *                     - question_text
 *                     - choices
 *                   properties:
 *                     category:
 *                       type: string
 *                       enum: [school, opposite_sex, peers, family, crises, emotions, recreation]
 *                       description: The category this question belongs to
 *                       example: emotions
 *                     question_text:
 *                       type: string
 *                       minLength: 1
 *                       description: The question text
 *                       example: "How are you feeling today?"
 *                     choices:
 *                       type: array
 *                       minItems: 4
 *                       maxItems: 4
 *                       items:
 *                         type: object
 *                         required:
 *                           - choice_text
 *                           - mood_label
 *                         properties:
 *                           choice_text:
 *                             type: string
 *                             description: The text of the choice
 *                             example: "Happy and energetic"
 *                           mood_label:
 *                             type: string
 *                             enum: [Excelling, Thriving, Struggling, InCrisis]
 *                             description: The mood classification for this choice
 *                             example: "Excelling"
 *           examples:
 *             singleQuestion:
 *               summary: Create a single question
 *               value:
 *                 questions:
 *                   - category: emotions
 *                     question_text: "How are you feeling today?"
 *                     choices:
 *                       - choice_text: "Happy and energetic"
 *                         mood_label: "Excelling"
 *                       - choice_text: "Content and peaceful"
 *                         mood_label: "Thriving"
 *                       - choice_text: "A bit down"
 *                         mood_label: "Struggling"
 *                       - choice_text: "Overwhelmed"
 *                         mood_label: "InCrisis"
 *             multipleQuestions:
 *               summary: Create multiple questions
 *               value:
 *                 questions:
 *                   - category: emotions
 *                     question_text: "How are you feeling today?"
 *                     choices:
 *                       - choice_text: "Happy and energetic"
 *                         mood_label: "Excelling"
 *                       - choice_text: "Content and peaceful"
 *                         mood_label: "Thriving"
 *                       - choice_text: "A bit down"
 *                         mood_label: "Struggling"
 *                       - choice_text: "Overwhelmed"
 *                         mood_label: "InCrisis"
 *                   - category: school
 *                     question_text: "How are your studies going?"
 *                     choices:
 *                       - choice_text: "Great! I'm on top of everything"
 *                         mood_label: "Excelling"
 *                       - choice_text: "Going well"
 *                         mood_label: "Thriving"
 *                       - choice_text: "Falling behind a bit"
 *                         mood_label: "Struggling"
 *                       - choice_text: "Very overwhelmed"
 *                         mood_label: "InCrisis"
 *     responses:
 *       "201":
 *         description: Questions created successfully
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
 *                   example: QUESTIONS_CREATED
 *                 message:
 *                   type: string
 *                   example: "2 question(s) created successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question_id:
 *                         type: string
 *                         format: uuid
 *                         example: 54a2a768-8e62-41ac-8b6e-e5092881000e
 *                       category:
 *                         type: string
 *                         example: emotions
 *                       question_text:
 *                         type: string
 *                         example: "How are you feeling today?"
 *                       choices:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             choice_id:
 *                               type: string
 *                               format: uuid
 *                             choice_text:
 *                               type: string
 *                             mood_label:
 *                               type: string
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-23T12:08:11.190Z
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-23T12:08:11.190Z
 *       "400":
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidInput:
 *                 value:
 *                   success: false
 *                   code: INVALID_INPUT
 *                   message: Questions must be a non-empty array
 *               invalidCategory:
 *                 value:
 *                   success: false
 *                   code: INVALID_CATEGORY
 *                   message: "Category must be one of: school, opposite_sex, peers, family, crises, emotions, recreation"
 *               invalidChoices:
 *                 value:
 *                   success: false
 *                   code: INVALID_CHOICES
 *                   message: Each question must have exactly 4 choices
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
 *                   message: User authentication required
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
 *                   message: User does not have permission to create questions
 *       "409":
 *         description: Conflict - duplicate question
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               duplicateQuestion:
 *                 value:
 *                   success: false
 *                   code: DUPLICATE_QUESTION
 *                   message: A question with this text already exists
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

/**
 * @openapi
 * /flip-feel/:
 *   get:
 *     summary: Retrieve randomized flip and feel questions by category
 *     description: Retrieves a randomized subset of flip and feel questions for a specific category with their choices. Questions are shuffled using Fisher-Yates algorithm to ensure variety.
 *     tags:
 *       - Flip and Feel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         required: true
 *         description: The category of questions to retrieve
 *         schema:
 *           type: string
 *           enum:
 *             - school
 *             - opposite_sex
 *             - peers
 *             - family
 *             - crises
 *             - emotions
 *             - recreation
 *           example: emotions
 *       - name: count
 *         in: query
 *         required: false
 *         description: Number of randomized questions to return (min 5, max 15, default 10)
 *         schema:
 *           type: integer
 *           minimum: 5
 *           maximum: 15
 *           default: 10
 *           example: 10
 *     responses:
 *       "200":
 *         description: Questions retrieved successfully
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
 *                   example: QUESTIONS_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: "10 randomized questions for category 'emotions' retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           question_id:
 *                             type: string
 *                             format: uuid
 *                             example: 54a2a768-8e62-41ac-8b6e-e5092881000e
 *                           category:
 *                             type: string
 *                             example: emotions
 *                           question_text:
 *                             type: string
 *                             example: "How are you feeling today?"
 *                           choices:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 choice_id:
 *                                   type: string
 *                                   format: uuid
 *                                 choice_text:
 *                                   type: string
 *                                   example: "Happy and energetic"
 *                                 mood_label:
 *                                   type: string
 *                                   example: "Excelling"
 *                                 created_at:
 *                                   type: string
 *                                   format: date-time
 *                                 updated_at:
 *                                   type: string
 *                                   format: date-time
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-10-23T12:08:11.190Z
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-10-23T12:08:11.190Z
 *       "400":
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidCategory:
 *                 value:
 *                   success: false
 *                   code: INVALID_CATEGORY
 *                   message: "Category must be one of: school, opposite_sex, peers, family, crises, emotions, recreation"
 *               invalidCount:
 *                 value:
 *                   success: false
 *                   code: INVALID_COUNT
 *                   message: Question count must be between 5 and 15
 *               insufficientQuestions:
 *                 value:
 *                   success: false
 *                   code: INSUFFICIENT_QUESTIONS
 *                   message: "Not enough questions available. Requested: 10, Available: 5"
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
router.get('/', heronAuthMiddleware, asyncHandler(flipfeelController.getQuestionsByCategory.bind(flipfeelController)));
export default router;