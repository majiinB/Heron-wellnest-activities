import express, { Router } from 'express';
import { heronAuthMiddleware } from '../middlewares/heronAuth.middleware..js';
import { JournalController } from '../controllers/journal.controller.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { JournalEntryRepository } from '../repository/journalEntry.repository.js';
import { JournalService } from '../services/journal.service.js';

const router: Router = express.Router();
const journalRepository = new JournalEntryRepository();
const journalService = new JournalService(journalRepository);
const journalController = new JournalController(journalService);


router.post('/', heronAuthMiddleware, asyncHandler(journalController.handleJournalEntryCreation.bind(journalController)));

router.get('/', heronAuthMiddleware, asyncHandler(journalController.handleJournalEntryRetrieval.bind(journalController)));

router.get('/:id', heronAuthMiddleware, asyncHandler(journalController.handleSpecificJournalEntryRetrieval.bind(journalController)));

router.put('/:id', heronAuthMiddleware, asyncHandler(journalController.handleJournalEntryUpdate.bind(journalController)));

router.delete('/:id', heronAuthMiddleware, asyncHandler(journalController.handleJournalEntryDelete.bind(journalController)));