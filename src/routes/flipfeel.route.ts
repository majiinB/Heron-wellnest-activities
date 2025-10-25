import express, { Router } from 'express';
import { heronAuthMiddleware } from '../middlewares/heronAuth.middleware..js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { FlipFeelService } from '../services/flipFeel.service.js';
import { FlipFeelController } from '../controllers/flipfeel.controller.js';
import { FlipFeelQuestionRepository } from '../repository/flipFeelQuestions.repository.js';
import { FlipFeelRepository } from '../repository/flipFeel.repository.js';

const router: Router = express.Router();
const flipFeelQuestionRepository = new FlipFeelQuestionRepository();
const flipFeelRepository = new FlipFeelRepository();
const flipFeelService = new FlipFeelService(flipFeelQuestionRepository, flipFeelRepository);
const flipfeelController = new FlipFeelController(flipFeelService);

/**
 * @openapi
 * /flip-and-feel/:
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
 * /flip-and-feel/:
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

/**
 * @openapi
 * /flip-and-feel/responses:
 *   post:
 *     summary: Submit flip and feel responses
 *     description: Allows students to submit their answers to flip and feel questions. Creates a complete session with all responses in a single transaction.
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
 *               - responses
 *             properties:
 *               responses:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of question-choice pairs representing the user's answers
 *                 items:
 *                   type: object
 *                   required:
 *                     - question_id
 *                     - choice_id
 *                   properties:
 *                     question_id:
 *                       type: string
 *                       format: uuid
 *                       description: The UUID of the question being answered
 *                       example: "69da9115-f0a9-40bb-b8f5-5d5099c63e70"
 *                     choice_id:
 *                       type: string
 *                       format: uuid
 *                       description: The UUID of the selected choice for this question
 *                       example: "d4b04cc7-330b-4cb6-9848-c5d13e185e4c"
 *           examples:
 *             typicalSubmission:
 *               summary: Submit 5 responses
 *               value:
 *                 responses:
 *                   - question_id: "69da9115-f0a9-40bb-b8f5-5d5099c63e70"
 *                     choice_id: "d4b04cc7-330b-4cb6-9848-c5d13e185e4c"
 *                   - question_id: "ba7d60d0-7b5a-4d02-ac64-89eb14f89852"
 *                     choice_id: "c67b735d-e730-48dd-ae5b-a02e7d7c36ce"
 *                   - question_id: "8efd0ea1-a5e5-4934-8c77-ea4dd9f70e45"
 *                     choice_id: "68c67a95-621e-4bdc-a7c1-f727c03b1fa6"
 *                   - question_id: "c8228251-00df-420c-8360-a26780692a96"
 *                     choice_id: "492dcc8f-ba2b-4628-8537-c2538fed52f5"
 *                   - question_id: "af3dc10a-18fc-4e87-b1e7-07ced0aa6536"
 *                     choice_id: "ea1882ca-1e0e-42a7-9da9-70fe1d44d4df"
 *     responses:
 *       "201":
 *         description: Responses submitted successfully and session created
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
 *                   example: RESPONSES_SUBMITTED
 *                 message:
 *                   type: string
 *                   example: "Flip and feel responses submitted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                       properties:
 *                         flip_feel_id:
 *                           type: string
 *                           format: uuid
 *                           description: The unique identifier for this session
 *                           example: "034aa7ed-ead8-41ad-8549-c7f4e4488801"
 *                         user_id:
 *                           type: string
 *                           format: uuid
 *                           description: The ID of the user who submitted the responses
 *                           example: "6a4952ff-f93d-48ff-a8fc-8544182f69c0"
 *                         responses:
 *                           type: array
 *                           description: Array of response records created for this session
 *                           items:
 *                             type: object
 *                             properties:
 *                               response_id:
 *                                 type: string
 *                                 format: uuid
 *                                 description: Unique identifier for this response
 *                                 example: "7fbfa788-9c23-4951-ac4e-2e8f0eec47fe"
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 *                                 description: Timestamp when the response was recorded
 *                                 example: "2025-10-23T17:05:32.760Z"
 *                         started_at:
 *                           type: string
 *                           format: date-time
 *                           description: Timestamp when the session started
 *                           example: "2025-10-23T17:05:32.760Z"
 *                         finished_at:
 *                           type: string
 *                           format: date-time
 *                           description: Timestamp when the session was completed
 *                           example: "2025-10-23T17:05:32.760Z"
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
 *                   message: Responses must be a non-empty array
 *               invalidQuestionId:
 *                 value:
 *                   success: false
 *                   code: INVALID_QUESTION_ID
 *                   message: Each response must have a valid question_id
 *               invalidChoiceId:
 *                 value:
 *                   success: false
 *                   code: INVALID_CHOICE_ID
 *                   message: Each response must have a valid choice_id
 *               invalidQuestionOrChoice:
 *                 value:
 *                   success: false
 *                   code: INVALID_QUESTION_OR_CHOICE
 *                   message: Invalid question_id or choice_id
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
router.post('/responses', heronAuthMiddleware, asyncHandler(flipfeelController.submitResponses.bind(flipfeelController)));

/**
 * @openapi
 * /flip-and-feel/sessions:
 *   get:
 *     summary: Retrieve user's flip and feel session history
 *     description: Retrieves all flip and feel sessions for the authenticated user. Can optionally include detailed response information for each session.
 *     tags:
 *       - Flip and Feel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: withResponses
 *         in: query
 *         required: false
 *         description: Include detailed response information for each session (question and choice details)
 *         schema:
 *           type: boolean
 *           default: false
 *           example: false
 *     responses:
 *       "200":
 *         description: Sessions retrieved successfully
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
 *                   example: SESSIONS_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: "Retrieved 1 session(s)"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       description: Array of user's flip and feel sessions, ordered by most recent first
 *                       items:
 *                         type: object
 *                         properties:
 *                           flip_feel_id:
 *                             type: string
 *                             format: uuid
 *                             description: Unique identifier for this session
 *                             example: "034aa7ed-ead8-41ad-8549-c7f4e4488801"
 *                           user_id:
 *                             type: string
 *                             format: uuid
 *                             description: The ID of the user who completed this session
 *                             example: "6a4952ff-f93d-48ff-a8fc-8544182f69c0"
 *                           started_at:
 *                             type: string
 *                             format: date-time
 *                             description: Timestamp when the session started
 *                             example: "2025-10-23T17:05:32.760Z"
 *                           finished_at:
 *                             type: string
 *                             format: date-time
 *                             description: Timestamp when the session was completed
 *                             example: "2025-10-23T17:05:32.760Z"
 *                           responses:
 *                             type: array
 *                             description: Array of responses (only included if withResponses=true)
 *                             items:
 *                               type: object
 *                               properties:
 *                                 response_id:
 *                                   type: string
 *                                   format: uuid
 *                                 question_id:
 *                                   type: object
 *                                   properties:
 *                                     question_id:
 *                                       type: string
 *                                       format: uuid
 *                                     question_text:
 *                                       type: string
 *                                     category:
 *                                       type: string
 *                                 choice_id:
 *                                   type: object
 *                                   properties:
 *                                     choice_id:
 *                                       type: string
 *                                       format: uuid
 *                                     choice_text:
 *                                       type: string
 *                                     mood_label:
 *                                       type: string
 *                                 created_at:
 *                                   type: string
 *                                   format: date-time
 *             examples:
 *               withoutResponses:
 *                 summary: Basic session list
 *                 value:
 *                   success: true
 *                   code: SESSIONS_RETRIEVED
 *                   message: "Retrieved 1 session(s)"
 *                   data:
 *                     sessions:
 *                       - flip_feel_id: "034aa7ed-ead8-41ad-8549-c7f4e4488801"
 *                         user_id: "6a4952ff-f93d-48ff-a8fc-8544182f69c0"
 *                         started_at: "2025-10-23T17:05:32.760Z"
 *                         finished_at: "2025-10-23T17:05:32.760Z"
 *               emptySessions:
 *                 summary: No sessions found
 *                 value:
 *                   success: true
 *                   code: SESSIONS_RETRIEVED
 *                   message: "Retrieved 0 session(s)"
 *                   data:
 *                     sessions: []
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
router.get('/sessions', heronAuthMiddleware, asyncHandler(flipfeelController.getUserSessions.bind(flipfeelController)));

/**
 * @openapi
 * /flip-and-feel/sessions/{id}:
 *   get:
 *     summary: Retrieve a specific flip and feel session by ID
 *     description: Retrieves detailed information about a specific flip and feel session, including all responses with full question and choice details. User can only access their own sessions.
 *     tags:
 *       - Flip and Feel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique identifier of the session to retrieve
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "034aa7ed-ead8-41ad-8549-c7f4e4488801"
 *     responses:
 *       "200":
 *         description: Session retrieved successfully
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
 *                   example: SESSION_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: "Session retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                       properties:
 *                         flip_feel_id:
 *                           type: string
 *                           format: uuid
 *                           description: Unique identifier for this session
 *                           example: "034aa7ed-ead8-41ad-8549-c7f4e4488801"
 *                         user_id:
 *                           type: string
 *                           format: uuid
 *                           description: The ID of the user who completed this session
 *                           example: "6a4952ff-f93d-48ff-a8fc-8544182f69c0"
 *                         responses:
 *                           type: array
 *                           description: Array of all responses submitted in this session with full details
 *                           items:
 *                             type: object
 *                             properties:
 *                               response_id:
 *                                 type: string
 *                                 format: uuid
 *                                 description: Unique identifier for this response
 *                                 example: "7fbfa788-9c23-4951-ac4e-2e8f0eec47fe"
 *                               question_id:
 *                                 type: object
 *                                 description: Full details of the question that was answered
 *                                 properties:
 *                                   question_id:
 *                                     type: string
 *                                     format: uuid
 *                                     example: "69da9115-f0a9-40bb-b8f5-5d5099c63e70"
 *                                   question_text:
 *                                     type: string
 *                                     example: "What helps you stay interested during your classes?"
 *                                   category:
 *                                     type: string
 *                                     example: "school"
 *                                   created_at:
 *                                     type: string
 *                                     format: date-time
 *                                     example: "2025-10-23T13:03:02.561Z"
 *                                   updated_at:
 *                                     type: string
 *                                     format: date-time
 *                                     example: "2025-10-23T13:03:02.561Z"
 *                               choice_id:
 *                                 type: object
 *                                 description: Full details of the choice that was selected
 *                                 properties:
 *                                   choice_id:
 *                                     type: string
 *                                     format: uuid
 *                                     example: "d4b04cc7-330b-4cb6-9848-c5d13e185e4c"
 *                                   choice_text:
 *                                     type: string
 *                                     example: "I stay interested when lessons are interactive or meaningful."
 *                                   mood_label:
 *                                     type: string
 *                                     enum: [Excelling, Thriving, Struggling, InCrisis]
 *                                     example: "Thriving"
 *                                   created_at:
 *                                     type: string
 *                                     format: date-time
 *                                     example: "2025-10-23T13:03:02.561Z"
 *                                   updated_at:
 *                                     type: string
 *                                     format: date-time
 *                                     example: "2025-10-23T13:03:02.561Z"
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 *                                 description: Timestamp when this response was recorded
 *                                 example: "2025-10-23T17:05:32.760Z"
 *                         started_at:
 *                           type: string
 *                           format: date-time
 *                           description: Timestamp when the session started
 *                           example: "2025-10-23T17:05:32.760Z"
 *                         finished_at:
 *                           type: string
 *                           format: date-time
 *                           description: Timestamp when the session was completed
 *                           example: "2025-10-23T17:05:32.760Z"
 *       "400":
 *         description: Bad request - invalid session ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidSessionId:
 *                 value:
 *                   success: false
 *                   code: INVALID_SESSION_ID
 *                   message: Session ID must be a valid string
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
 *         description: Forbidden - session belongs to another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 value:
 *                   success: false
 *                   code: FORBIDDEN
 *                   message: You do not have permission to access this session
 *       "404":
 *         description: Not found - session does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   code: SESSION_NOT_FOUND
 *                   message: Flip and feel session not found
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
router.get('/sessions/:id', heronAuthMiddleware, asyncHandler(flipfeelController.getSessionById.bind(flipfeelController)));

export default router;