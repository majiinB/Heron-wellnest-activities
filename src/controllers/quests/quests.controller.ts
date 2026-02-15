import type { NextFunction, Response } from "express";
import type { QuestsService } from "../../services/quests/quests.service.js";
import type { AuthenticatedRequest } from "../../interface/authRequest.interface.js";
import { validateUser } from "../../utils/authorization.util.js";
import { AppError } from "../../types/appError.type.js";
import type { ApiResponse } from "../../types/apiResponse.type.js";
import { validate as isUuid } from "uuid";

/**
 * Controller class for handling Quest-related HTTP requests.
 * 
 * @description This class provides methods to handle retrieving daily quests,
 * claiming completed quests, and getting quest statistics.
 * It interacts with the `QuestsService` to perform business logic and data manipulation.
 * Each method corresponds to an endpoint and is responsible for validating input, 
 * invoking service methods, and formatting responses.
 * 
 * @remarks
 * - Input validation is performed to ensure required fields are present and valid.
 * - User authentication and role validation are enforced to restrict access to authorized users only.
 * - Responses are standardized using the `ApiResponse` type.
 * - Quest records are lazily created when users first request their daily quests.
 * 
 * @example
 * ```typescript
 * const controller = new QuestsController(questsService);
 * app.get('/quests/daily', controller.handleGetUserQuestsForTheDay.bind(controller));
 * ```
 * 
 * @file quests.controller.ts
 * 
 * @author Arthur M. Artugue
 * @created 2026-02-15
 */
export class QuestsController {
  private questsService: QuestsService;

  constructor(questsService: QuestsService) {
    this.questsService = questsService;
  }

  /**
   * Handles the retrieval of user's quests for the current day.
   * 
   * Validates the user's identity and role. Implements lazy loading - if the user 
   * doesn't have UserQuest records for today's DailyQuests, they will be automatically created.
   * Returns all quests with their full details including quest definitions and rewards.
   * 
   * @param req - The authenticated request containing user information.
   * @param res - The response object used to send the result back to the client.
   * @param _next - The next middleware function (unused).
   * @throws {AppError} If validation fails for the user.
   */
  public async handleGetUserQuestsForTheDay(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const quests = await this.questsService.getUserQuestsForTheDay(userId!);

    const response: ApiResponse = {
      success: true,
      code: "QUESTS_RETRIEVED",
      message: "Daily quests retrieved successfully",
      data: quests,
    };

    res.status(200).json(response);
    return;
  }

  /**
   * Handles claiming a completed quest.
   * 
   * Validates the user's identity and role, and the quest ID format.
   * Only quests with "complete" status can be claimed. The quest completion 
   * is marked by a separate background worker.
   * On successful claim, the quest status is updated to "claimed".
   * 
   * @param req - The authenticated request containing user information and quest ID.
   * @param res - The response object used to send the result back to the client.
   * @param _next - The next middleware function (unused).
   * @throws {AppError} If validation fails, quest not found, not owned by user,
   *                    not completed yet, already claimed, or expired.
   */
  public async handleClaimQuest(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { user_quest_id } = req.body || {};

    validateUser(userId, userRole, "student");

    if (!user_quest_id || !user_quest_id.trim()) {
      throw new AppError(
        400,
        "MISSING_QUEST_ID",
        "Quest ID is required",
        true
      );
    }

    const trimmedQuestId = user_quest_id.trim();

    if (!isUuid(trimmedQuestId)) {
      throw new AppError(
        400,
        "INVALID_QUEST_ID",
        "Invalid quest ID format",
        true
      );
    }

    const claimedQuest = await this.questsService.claimQuest(userId!, trimmedQuestId);

    const response: ApiResponse = {
      success: true,
      code: "QUEST_CLAIMED",
      message: "Quest claimed successfully",
      data: claimedQuest,
    };

    res.status(200).json(response);
    return;
  }

  /**
   * Handles the retrieval of quest statistics for the current day.
   * 
   * Validates the user's identity and role.
   * Returns a summary of the user's quest progress including counts of 
   * total, pending, complete, claimed, and expired quests.
   * 
   * @param req - The authenticated request containing user information.
   * @param res - The response object used to send the result back to the client.
   * @param _next - The next middleware function (unused).
   * @throws {AppError} If validation fails for the user.
   */
  public async handleGetQuestStats(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const stats = await this.questsService.getQuestStats(userId!);

    const response: ApiResponse = {
      success: true,
      code: "QUEST_STATS_RETRIEVED",
      message: "Quest statistics retrieved successfully",
      data: stats,
    };

    res.status(200).json(response);
    return;
  }
}
