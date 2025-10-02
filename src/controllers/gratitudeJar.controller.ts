import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import type { GratitudeJarService } from "../services/gratitudeJar.service.js";
import { AppError } from "../types/appError.type.js";
import { validateUser } from "../utils/authorization util.js";
import type { SafeGratitudeJarEntry } from "../types/safeGratitudeJarEntry.type.js";

export class GratitudeJarController {
  private gratitudeService: GratitudeJarService;

  constructor(gratitudeService: GratitudeJarService) {
    this.gratitudeService = gratitudeService;
  }

  /**
   * Adds a new gratitude jar entry for the authenticated student user.
   *
   * Validates the user's identity and role, ensures the content is a non-empty string
   * between 3 and 500 characters, and then creates the entry using the gratitude service.
   * Responds with the created entry on success.
   *
   * @param req - The authenticated request containing the user and entry content.
   * @param res - The response object used to send the result.
   * @param _next - The next middleware function (unused).
   * @throws {AppError} If the user is not a student, or if the content is invalid.
   * @returns {Promise<void>} A promise that resolves when the response is sent.
   */
  public async addEntry(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    let { content } = req.body || {};

    validateUser(userId, userRole, "student");
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw new AppError(400, "INVALID_CONTENT", "Content must be a non-empty string.", true);
    }

    content = content.trim();

    if (content.length < 3 || content.length > 500) {
      throw new AppError(400, "BAD_REQUEST", "Content must be between 3 and 500 characters.", true);
    }

    const entry: SafeGratitudeJarEntry = await this.gratitudeService.addEntry(userId!, content);

    res.status(201).json({
      success: true,
      code: "GRATITUDE_ENTRY_CREATED",
      message: "Gratitude entry created successfully",
      data: entry
    });
  }

}
  