import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import type { CategoryEnum, FlipFeelQuestionAndAnswers, FlipFeelService } from "../services/flipFeel.service.js";
import { validateUser } from "../utils/authorization util.js";
import { AppError } from "../types/appError.type.js";
import type { ApiResponse } from "../types/apiResponse.type.js";

/**
 *
 * Controller class for managing Flip and Feel questions.
 *
 * @description Provides endpoints to create, retrieve, update, and delete Flip and Feel questions.
 *
 * Handles request validation, user authorization, and response formatting.
 * Delegates business logic to the FlipFeelService.
 *
 * @remarks
 * - All endpoints require the user to be authenticated and have the "student" role.
 * - Validates input data such as content length and ID format.
 * 
 * @example
 * ```typescript
 * const controller = new FlipFeelController(flipFeelService);
 * app.post('/flip-feel', authMiddleware, controller.addEntry.bind(controller));
 * ```
 * @file gratitudeJar.controller.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-02
 * @updated 2025-10-02
 */
export class FlipFeelController {
  private flipFeelService: FlipFeelService;
  private validCategories: string[] = ["school", "opposite_sex", "peers", "family", "crises", "emotions", "recreation"];

  constructor(flipFeelService: FlipFeelService) {
    this.flipFeelService = flipFeelService;
  }

  /**
   * Creates one or more flip and feel questions with their choices.
   *
   * @param req - Authenticated request containing array of questions in body
   * @param res - Response object
   * @param _next - Next function
   * @throws {AppError} If validation fails or user is unauthorized
   */
  public async addFlipAndFeelQuestions(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    if(!userId || !userRole) {
      throw new AppError(401, "UNAUTHORIZED", "User authentication required", true);
    }

    // Validate user (assuming admin/counselor role for creating questions)
    if(userRole !== "admin" && userRole !== "counselor" && userRole !== "super_admin") {
      throw new AppError(403, "FORBIDDEN", "User does not have permission to create questions", true);
    }

    const { questions } = req.body || {};

    // Validate input
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new AppError(400, "INVALID_INPUT", "Questions must be a non-empty array", true);
    }

    const validCategories = this.validCategories;

    // Validate each question structure
    for (const q of questions) {
      if (!q.category || !validCategories.includes(q.category)) {
        throw new AppError(400, "INVALID_CATEGORY", `Category must be one of: ${validCategories.join(", ")}`, true);
      }
      if (!q.question_text || typeof q.question_text !== "string" || q.question_text.trim().length === 0) {
        throw new AppError(400, "INVALID_QUESTION_TEXT", "Each question must have a valid question_text", true);
      }
      if (!Array.isArray(q.choices) || q.choices.length !== 4) {
        throw new AppError(400, "INVALID_CHOICES", "Each question must have exactly 4 choices", true);
      }
    }

    const createdQuestions = await this.flipFeelService.createQuestionAndChoices(
      questions as FlipFeelQuestionAndAnswers[]
    );

    const response: ApiResponse = {
      success: true,
      code: "QUESTIONS_CREATED",
      message: `${createdQuestions.length} question(s) created successfully`,
      data: createdQuestions,
    };

    res.status(201).json(response);
  }

  /**
   * Retrieves randomized flip and feel questions for a specific category.
   *
   * @param req - Authenticated request with category and count in query params
   * @param res - Response object
   * @param _next - Next function
   */
  public async getQuestionsByCategory(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const { category, count } = req.query;

    if (!category || !this.validCategories.includes(category as string)) {
      throw new AppError(400, "INVALID_CATEGORY", `Category must be one of: ${this.validCategories.join(", ")}`, true);
    }

    // Parse and validate count parameter
    let questionCount = 10; // default
    if (count) {
      const parsedCount = parseInt(count as string, 10);
      if (isNaN(parsedCount)) {
        throw new AppError(400, "INVALID_COUNT", "Count must be a valid number", true);
      }
      questionCount = parsedCount;
    }

    const questions = await this.flipFeelService.getQuestionsByCategory(
      category as CategoryEnum, 
      questionCount
    );

    const response: ApiResponse = {
      success: true,
      code: "QUESTIONS_RETRIEVED",
      message: `${questions.length} randomized questions for category '${category}' retrieved successfully`,
      data: { questions },
    };

    res.status(200).json(response);
  }
}