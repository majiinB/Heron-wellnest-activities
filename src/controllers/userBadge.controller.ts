import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import type { UserBadgeService } from "../services/userBadge.service.js";
import { validateUser } from "../utils/authorization.util.js";
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
 * @updated 2025-11-11
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
   * Retrieves all badges that the authenticated student user can obtain and sends them in a standardized API response.
   *
   * This handler:
   * - Validates the authenticated user's identity and role ("student") via `validateUser`.
   * - Calls `this.userBadgeService.getAllObtainableBadges` with the authenticated user's id.
   * - Responds with HTTP 200 and an ApiResponse containing the badges and the total count.
   *
   * @param req - AuthenticatedRequest containing the authenticated user's claims (expected to include `sub` and `role`).
   * @param res - Express Response used to send the JSON ApiResponse.
   * @param _next - Express NextFunction (unused) provided to match the middleware/controller signature.
   *
   * @returns A Promise that resolves when the response has been sent (Promise<void>).
   *
   * @throws May throw if `validateUser` fails (e.g. unauthorized/forbidden) or if `userBadgeService.getAllObtainableBadges` rejects.
   *
   */
  public async getAllObtainableBadges(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const badges = await this.userBadgeService.getAllObtainableBadges(userId!);

    const response: ApiResponse = {
      success: true,
      code: "ALL_OBTAINABLE_BADGES_RETRIEVED",
      message: "All obtainable badges retrieved successfully",
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
