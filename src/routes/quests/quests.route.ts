 import express, { type Router } from "express";
import { heronAuthMiddleware } from "../../middlewares/heronAuth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.util.js";
import { DailyQuestsRepository } from "../../repository/quests/dailyQuests.repository.js";
import { UserQuestsRepository } from "../../repository/quests/userQuests.repository.js";
import { QuestDefinitionsRepository } from "../../repository/quests/questDefinitions.repository.js";
import { QuestsService } from "../../services/quests/quests.service.js";
import { QuestsController } from "../../controllers/quests/quests.controller.js";

const router: Router = express.Router();

const dailyQuestsRepository = new DailyQuestsRepository();
const userQuestsRepository = new UserQuestsRepository();
const questDefinitionsRepository = new QuestDefinitionsRepository();
const questsService = new QuestsService(
  dailyQuestsRepository,
  userQuestsRepository,
  questDefinitionsRepository
);
const questsController = new QuestsController(questsService);

/**
 * @openapi
 * /quests/daily:
 *   get:
 *     summary: Get user's daily quests
 *     description: Retrieves all quests assigned to the authenticated user for the current day. Implements lazy loading - if the user doesn't have UserQuest records for today's DailyQuests, they will be automatically created. Returns both global and personalized quests with full details including quest definitions and rewards.
 *     tags:
 *       - Quests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Daily quests retrieved successfully
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
 *                   example: QUESTS_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: Daily quests retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_quest_id:
 *                         type: string
 *                         format: uuid
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       owner_id:
 *                         type: string
 *                         format: uuid
 *                         example: "c81daef9-bc32-4624-a595-3cdb0f66d559"
 *                       daily_quest_id:
 *                         type: object
 *                         properties:
 *                           daily_quest_id:
 *                             type: string
 *                             format: uuid
 *                           scope:
 *                             type: string
 *                             enum: [global, personalized]
 *                             example: "global"
 *                           quest_definition_id:
 *                             type: object
 *                             properties:
 *                               quest_definition_id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                                 example: "Complete 3 mood check-ins"
 *                               description:
 *                                 type: string
 *                                 example: "Track your mood 3 times today"
 *                               reward_money:
 *                                 type: number
 *                                 example: 10
 *                               reward_experience:
 *                                 type: number
 *                                 example: 50
 *                               hunger_recovery:
 *                                 type: number
 *                                 example: 5
 *                               reward_food_id:
 *                                 type: string
 *                                 format: uuid
 *                                 nullable: true
 *                               reward_decoration_id:
 *                                 type: string
 *                                 format: uuid
 *                                 nullable: true
 *                               quest_tag:
 *                                 type: string
 *                                 enum: [well-being, pet-care, pet-interaction]
 *                                 example: "well-being"
 *                               reward_type:
 *                                 type: string
 *                                 enum: [coins, xp, food, decoration]
 *                                 example: "coins"
 *                               system_message:
 *                                 type: string
 *                                 nullable: true
 *                               is_active:
 *                                 type: boolean
 *                                 example: true
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                       expires_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2026-02-15T23:59:59.999Z"
 *                       status:
 *                         type: string
 *                         enum: [pending, complete, claimed, expired]
 *                         example: "pending"
 *                       completed_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/daily', heronAuthMiddleware, asyncHandler(questsController.handleGetUserQuestsForTheDay.bind(questsController)));

/**
 * @openapi
 * /quests/claim:
 *   post:
 *     summary: Claim a completed quest
 *     description: Claims a quest that has been marked as "complete" by the background worker. Only quests with "complete" status can be claimed. Once claimed, the quest rewards are granted and the status is updated to "claimed".
 *     tags:
 *       - Quests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_quest_id
 *             properties:
 *               user_quest_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the user quest to claim
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       "200":
 *         description: Quest claimed successfully
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
 *                   example: QUEST_CLAIMED
 *                 message:
 *                   type: string
 *                   example: Quest claimed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_quest_id:
 *                       type: string
 *                       format: uuid
 *                     owner_id:
 *                       type: string
 *                       format: uuid
 *                     daily_quest_id:
 *                       type: object
 *                       description: Daily quest with full quest definition details
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       example: "claimed"
 *                     completed_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       "400":
 *         description: Bad request - missing quest ID, invalid format, quest not complete, already claimed, or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingQuestId:
 *                 value:
 *                   success: false
 *                   code: MISSING_QUEST_ID
 *                   message: Quest ID is required
 *               invalidQuestId:
 *                 value:
 *                   success: false
 *                   code: INVALID_QUEST_ID
 *                   message: Invalid quest ID format
 *               questNotComplete:
 *                 value:
 *                   success: false
 *                   code: QUEST_NOT_COMPLETE
 *                   message: "Quest must be completed before it can be claimed. Current status: pending"
 *               questAlreadyClaimed:
 *                 value:
 *                   success: false
 *                   code: QUEST_ALREADY_CLAIMED
 *                   message: Quest has already been claimed
 *               questExpired:
 *                 value:
 *                   success: false
 *                   code: QUEST_EXPIRED
 *                   message: Quest has expired and cannot be claimed
 *       "403":
 *         description: Forbidden - user does not own the quest
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               code: QUEST_NOT_OWNED
 *               message: You do not own this quest
 *       "404":
 *         description: Quest not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               code: QUEST_NOT_FOUND
 *               message: Quest not found
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/claim', heronAuthMiddleware, asyncHandler(questsController.handleClaimQuest.bind(questsController)));

/**
 * @openapi
 * /quests/stats:
 *   get:
 *     summary: Get quest statistics for the day
 *     description: Retrieves a summary of the authenticated user's quest progress for the current day, including counts of total, pending, complete, claimed, and expired quests.
 *     tags:
 *       - Quests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Quest statistics retrieved successfully
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
 *                   example: QUEST_STATS_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: Quest statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       description: Total number of quests for today
 *                       example: 5
 *                     pending:
 *                       type: number
 *                       description: Number of quests not yet completed
 *                       example: 2
 *                     complete:
 *                       type: number
 *                       description: Number of completed quests waiting to be claimed
 *                       example: 2
 *                     claimed:
 *                       type: number
 *                       description: Number of quests already claimed
 *                       example: 1
 *                     expired:
 *                       type: number
 *                       description: Number of expired quests
 *                       example: 0
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', heronAuthMiddleware, asyncHandler(questsController.handleGetQuestStats.bind(questsController)));

export default router;
