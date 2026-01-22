import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../interface/authRequest.interface.js";
import type { GratitudeJarService } from "../../services/activities/gratitudeJar.service.js";
import { AppError } from "../../types/appError.type.js";
import { validateUser } from "../../utils/authorization.util.js";
import type { SafeGratitudeJarEntry } from "../../types/safeGratitudeJarEntry.type.js";
import type { ApiResponse } from "../../types/apiResponse.type.js";
import { validate as isUuid } from "uuid";

/**
 * 
 * Controller class for managing Gratitude Jar entries.
 *
 * @description Provides endpoints to create, retrieve, update, and delete gratitude jar entries.
 * 
 * Handles request validation, user authorization, and response formatting.
 * Delegates business logic to the GratitudeJarService.
 * 
 * @remarks
 * - All endpoints require the user to be authenticated and have the "student" role.
 * - Validates input data such as content length and ID format.
 * 
 * @example
 * ```typescript
 * const controller = new GratitudeJarController(gratitudeService);
 * app.post('/gratitude', authMiddleware, controller.addEntry.bind(controller));
 * ```
 * @file gratitudeJar.controller.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-02
 * @updated 2025-10-02
 */
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

    content = content.trim().replace(/\s+/g, ' ');

    if (content.length < 3 || content.length > 500) {
      throw new AppError(400, "BAD_REQUEST", "Content must be between 3 and 500 characters.", true);
    }

    const entry: SafeGratitudeJarEntry = await this.gratitudeService.addEntry(userId!, content);

    const response: ApiResponse = {
      success: true,
      code: "GRATITUDE_ENTRY_CREATED",
      message: "Gratitude entry created successfully",
      data: entry
    }

    res.status(201).json(response);
  }

  /**
   * Retrieves gratitude jar entries for the authenticated user.
   *
   * @param req - The authenticated request containing user information and query parameters.
   * @param res - The response object used to send the result.
   * @param _next - The next middleware function (unused).
   * @returns A promise that resolves when the response is sent.
   *
   * @throws {AppError} If the user is not valid or the limit parameter is invalid.
   *
   * @remarks
   * - Only users with the "student" role are allowed to fetch entries.
   * - Supports pagination via `lastEntryId` and `limit` query parameters.
   * - The `limit` must be a positive number not exceeding 50.
   * - Responds with a JSON object containing the fetched gratitude entries.
   */
  public async getEntriesByUser(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { lastEntryId, limit } = req.query;

    validateUser(userId, userRole, "student");

    const limitNumber = limit ? parseInt(limit as string, 10) : 10;

    if (isNaN(limitNumber) || limitNumber <= 0 || limitNumber > 50) {
      throw new AppError(400, "BAD_REQUEST", "Limit must be a positive number not exceeding 50.", true);
    }

    const result = await this.gratitudeService.getEntriesByUser(userId!, limitNumber, lastEntryId as string | undefined);

    const response: ApiResponse = {
      success: true,
      code: "GRATITUDE_ENTRIES_FETCHED",
      message: "Gratitude entries fetched successfully",
      data: result
    } 

    res.status(200).json(response);
  }

  /**
   * Retrieves a gratitude jar entry by its ID for the authenticated student user.
   *
   * @param req - The authenticated request containing user information and the gratitude entry ID in the route parameters.
   * @param res - The HTTP response object used to send the result.
   * @param _next - The next middleware function (unused).
   * @returns A promise that resolves when the response is sent.
   *
   * @throws {AppError} If the user is not a student, the gratitude ID is invalid, or the entry is not found.
   *
   * @remarks
   * - Validates that the user is authenticated and has the "student" role.
   * - Ensures the gratitude ID is a valid UUID.
   * - Returns a 200 response with the gratitude entry if found.
   * - Throws a 400 error for invalid IDs and a 404 error if the entry does not exist.
   */
  public async getEntryById(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const gratitudeId = req.params.id;

    validateUser(userId, userRole, "student");

    if (!gratitudeId || !isUuid(gratitudeId)) {
      throw new AppError(400, "INVALID_ID", "Gratitude ID must be a valid string.", true);
    }

    const entry: SafeGratitudeJarEntry | null = await this.gratitudeService.getEntryById(gratitudeId , userId!);

    if (!entry) {
      throw new AppError(404, "NOT_FOUND", "Gratitude entry not found.", true);
    }

    const response: ApiResponse = {
      success: true,
      code: "GRATITUDE_ENTRY_FETCHED",
      message: "Gratitude entry fetched successfully",
      data: entry
    }

    res.status(200).json(response);
  }

  /**
   * Updates an existing gratitude entry for the authenticated user.
   *
   * @param req - The authenticated request containing user information, entry ID, and updated content.
   * @param res - The response object used to send the result.
   * @param _next - The next middleware function (unused).
   * @returns A promise that resolves when the response is sent.
   *
   * @throws {AppError} If the user is not authorized, the gratitude ID is invalid, the content is invalid,
   *         or the gratitude entry is not found.
   *
   * Validates:
   * - User authentication and role.
   * - Gratitude entry ID format.
   * - Content is a non-empty string between 3 and 500 characters.
   *
   * On success, responds with a JSON object containing the updated gratitude entry.
   */
  public async updateEntry(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const gratitudeId = req.params.id;
    let { content } = req.body || {};

    validateUser(userId, userRole, "student");

    if (!gratitudeId || !isUuid(gratitudeId)) {
      throw new AppError(400, "INVALID_ID", "Gratitude ID must be a valid string.", true);
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw new AppError(400, "INVALID_CONTENT", "Content must be a non-empty string.", true);
    }

    content = content.trim().replace(/\s+/g, ' ');

    if (content.length < 3 || content.length > 500) {
      throw new AppError(400, "BAD_REQUEST", "Content must be between 3 and 500 characters.", true);
    }

    const updatedEntry = await this.gratitudeService.updateEntry(gratitudeId, userId!, content);
    if (!updatedEntry) {
      throw new AppError(404, "NOT_FOUND", "Gratitude entry not found.", true);
    }

    const response: ApiResponse = {
      success: true,
      code: "GRATITUDE_ENTRY_UPDATED",
      message: "Gratitude entry updated successfully",
      data: updatedEntry
    }

    res.status(200).json(response);
  }

  /**
   * Deletes a gratitude jar entry for the authenticated student user.
   *
   * Validates the user's identity and role, checks the validity of the gratitude entry ID,
   * and attempts to soft-delete the entry. If the entry does not exist, throws a 404 error.
   * Responds with a success message upon successful deletion.
   *
   * @param req - The authenticated request containing user and entry information.
   * @param res - The response object used to send the result.
   * @param _next - The next middleware function (unused).
   * @throws {AppError} If the user is not authorized, the ID is invalid, or the entry is not found.
   * @returns {Promise<void>} A promise that resolves when the response is sent.
   */
  public async deleteEntry(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const gratitudeId = req.params.id;

    validateUser(userId, userRole, "student");

    if (!gratitudeId || !isUuid(gratitudeId)) {
      throw new AppError(400, "INVALID_ID", "Gratitude ID must be a valid string.", true);
    }

    const deleted: SafeGratitudeJarEntry | null = await this.gratitudeService.softDeleteEntry(gratitudeId, userId!);

    if (!deleted) {
      throw new AppError(404, "NOT_FOUND", "Gratitude entry not found.", true);
    }

    const response: ApiResponse = {
      success: true,
      code: "GRATITUDE_ENTRY_DELETED",
      message: "Gratitude entry deleted successfully",
      data: null
    }
    res.status(200).json(response);
  }

}