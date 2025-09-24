import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import type { NextFunction, Response} from "express";
import type { JournalService } from "../services/journal.service.js";
import type { ApiResponse } from "../types/apiResponse.type.js";
import { AppError } from "../types/appError.type.js";

export class JournalController {
  private journalService: JournalService;

  constructor(journalService: JournalService){
    this.journalService = journalService
  }

  public async handleJournalEntryCreation(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { title, content } = req.body || {};

    // Request validation
    if (!userId) {
      throw new AppError(
        401,
        'UNAUTHORIZED',
        "Unauthorized: User ID missing",
        true
      );
    }

    if (!userRole) {
      throw new AppError(
        401,
        'FORBIDDEN',
        "Forbidden: Insufficient permissions",
        true
      );
    }

    if (userRole !== 'student') {
      throw new AppError(
        403,
        'FORBIDDEN',
        "Forbidden: Insufficient permissions",
        true
      );
    }

    // Validate title and content
    if (!title || !title.trim() || !content || !content.trim()) {
      throw new AppError(
        400,
        'BAD_REQUEST',
        "Bad Request: Title and content are required",
        true
      );
    }

    const titleNum = title.trim().length;
    const contentNum = content.trim().length;

    if (titleNum < 5 || titleNum > 100) {
      throw new AppError(
        400,
        'BAD_REQUEST',
        "Bad Request: Title must be between 5 and 100 characters",
        true
      );
    }

    if (contentNum < 20 || contentNum > 2000) {
      throw new AppError(
        400,
        'BAD_REQUEST',
        "Bad Request: Content must be between 20 and 2000 characters",
        true
      );
    }

    // Create journal entry
    const journalEntry = await this.journalService.createEntry(userId, title.trim(), content.trim());

    const response: ApiResponse = {
      success: true,
      code: "JOURNAL_ENTRY_CREATED",
      message: "Journal entry created successfully",
      data: journalEntry
    };

    res.status(201).json(response);

    return; 
  }

  public async handleJournalEntryRetrieval(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    return; 
  }

  public async handleSpecificJournalEntryRetrieval(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    return; 
  }

  public async handleJournalEntryUpdate(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    return; 
  }

  public async handleJournalEntryDelete(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    return; 
  }
}