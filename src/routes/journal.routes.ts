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


/**
 * @openapi
 * /api/v1/activities/mind-mirror/:
 *   post:
 *     summary: Create a new journal entry
 *     description: Allows a student to create a journal entry with an encrypted title and content.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *                 example: "Test journal 2"
 *               content:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 2000
 *                 example: "Once upon a time ako ay nagawa ng api para sa thesis namin"
 *     responses:
 *       '201':
 *         description: Journal entry created successfully
 *       '400':
 *         description: Bad request - validation failed
 *       '401':
 *         description: Unauthorized - missing or invalid token
 *       '403':
 *         description: Forbidden - insufficient permissions
 *       '500':
 *         description: Internal server error
 */
router.post('/', heronAuthMiddleware, asyncHandler(journalController.handleJournalEntryCreation.bind(journalController)));

router.get('/', heronAuthMiddleware, asyncHandler(journalController.handleJournalEntryRetrieval.bind(journalController)));

router.get('/:id', heronAuthMiddleware, asyncHandler(journalController.handleSpecificJournalEntryRetrieval.bind(journalController)));

router.put('/:id', heronAuthMiddleware, asyncHandler(journalController.handleJournalEntryUpdate.bind(journalController)));

router.delete('/:id', heronAuthMiddleware, asyncHandler(journalController.handleJournalEntryDelete.bind(journalController)));

export default router;