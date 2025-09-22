import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import type { NextFunction, Response} from "express";
import type { JournalService } from "../services/journal.service.js";

export class JournalController {
  private journalService: JournalService;

  constructor(journalService: JournalService){
    this.journalService = journalService
  }

  public async handleJournalEntryCreation(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
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