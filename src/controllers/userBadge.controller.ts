import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import type { UserBadgeService } from "../services/userBadge.service.js";
import { AppError } from "../types/appError.type.js";
import { validateUser } from "../utils/authorization util.js";
import type { ApiResponse } from "../types/apiResponse.type.js";

/**
 * Controller class for managing user badges.
 *
 * @description Provides endpoints to retrieve user badges and check badge ownership.
 * 
 * Handles request validation, user authorization, and response formatting.
 * Delegates business logic to the UserBadgeService.
 * 
 * @remarks
 * - All endpoints require the user to be authenticated and have the "student" role.
 * - Returns badges with selected details (badge_id, name, description, icon_url, awarded_at).
 * 
 * @example
 * ```typescript
 * const controller = new UserBadgeController(userBadgeService);
 * app.get('/badges', authMiddleware, controller.getUserBadges.bind(controller));
 * ```
 * @file userBadge.controller.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-26
 * @updated 2025-10-26
 */
export class UserBadgeController {
  private userBadgeService: UserBadgeService;

  constructor(userBadgeService: UserBadgeService) {
    this.userBadgeService = userBadgeService;
  }

  /**
   * Retrieves all badges that the authenticated user has obtained.
   *
   * Validates the user's identity and role, then fetches all badges the user has earned.
   * Returns badge details including badge_id, name, description, icon_url, and awarded_at timestamp.
   *
   * @param req - The authenticated request containing user information.
   * @param res - The response object used to send the result.
   * @param _next - The next middleware function (unused).
   * @returns A promise that resolves when the response is sent.
   *
   * @throws {AppError} If the user is not valid or not authorized.
   *
   * @remarks
   * - Only users with the "student" role are allowed to fetch their badges.
   * - Badges are returned in descending order by awarded_at (most recent first).
   * - Responds with a JSON object containing an array of badge objects.
   */
  public async getUserBadges(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const badges = await this.userBadgeService.getUserBadges(userId!);

    const response: ApiResponse = {
      success: true,
      code: "USER_BADGES_RETRIEVED",
      message: "User badges retrieved successfully",
      data: {
        badges,
        total: badges.length
      }
    };

    res.status(200).json(response);
  }

  /**
   * Retrieves the total count of badges the authenticated user has obtained.
   *
   * Validates the user's identity and role, then fetches the total number of badges earned.
   *
   * @param req - The authenticated request containing user information.
   * @param res - The response object used to send the result.
   * @param _next - The next middleware function (unused).
   * @returns A promise that resolves when the response is sent.
   *
   * @throws {AppError} If the user is not valid or not authorized.
   *
   * @remarks
   * - Only users with the "student" role are allowed to fetch their badge count.
   * - Responds with a JSON object containing the total count of badges.
   */
  public async getUserBadgeCount(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const count = await this.userBadgeService.getUserBadgeCount(userId!);

    const response: ApiResponse = {
      success: true,
      code: "USER_BADGE_COUNT_RETRIEVED",
      message: "User badge count retrieved successfully",
      data: {
        count
      }
    };

    res.status(200).json(response);
  }
}
