import type { NextFunction, Response } from "express";
import type { MoodCheckInService } from "../services/moodCheckIn.service.js";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import { validateUser } from "../utils/authorization.util.js";
import { AppError } from "../types/appError.type.js";
import { isValidMood } from "../utils/mood.util.js";
import type { ApiResponse } from "../types/apiResponse.type.js";

export class MoodCheckInController {
  private moodCheckInService: MoodCheckInService;

  constructor(moodCheckInService: MoodCheckInService) {
    this.moodCheckInService = moodCheckInService;
  }

  public async createCheckIn(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    let { mood_1, mood_2, mood_3 } = req.body || {};

    validateUser(userId, userRole, "student");

    if (!mood_1) {
      throw new AppError(400, "MISSING_MOOD", "At least one mood is required.", true);
    }

    mood_1 = mood_1.trim().toLowerCase();
    mood_2 = mood_2 ? mood_2.trim().toLowerCase() : null;
    mood_3 = mood_3 ? mood_3.trim().toLowerCase() : null;

    const moods = [mood_1, mood_2, mood_3].filter(Boolean);

    for (const mood of moods) {
      if (!isValidMood(mood)) {
        throw new AppError(400, "INVALID_MOOD", `The mood '${mood}' is not recognized.`, true);
      }
    }

    // Check for duplicates
    const uniqueMoods = new Set(moods);
    if (uniqueMoods.size !== moods.length) {
      throw new AppError(400, "DUPLICATE_MOODS", "You cannot select the same mood more than once.", true);
    }

    const checkIn = await this.moodCheckInService.createCheckIn(userId!, mood_1, mood_2, mood_3);
  
    const response:  ApiResponse = {
      success: true,
      code: "MOOD_CHECKIN_CREATED",
      message: "Mood check-in created successfully",
      data: checkIn
    };

    res.status(201).json(response);

  }

  public async getCheckInForToday(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const hasCheckedIn = await this.moodCheckInService.getCheckInForToday(userId!);

    const response: ApiResponse = {
      success: true,
      code: "MOOD_CHECKIN_STATUS",
      message: "Mood check-in status for today retrieved successfully",
      data: { hasCheckedIn }
    };

    res.status(200).json(response);
  }

}