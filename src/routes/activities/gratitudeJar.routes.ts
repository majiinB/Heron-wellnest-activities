import express, { Router } from 'express';
import { heronAuthMiddleware } from '../../middlewares/heronAuth.middleware.js';
import { GratitudeJarController } from '../../controllers/activities/gratitudeJar.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';
import { GratitudeEntryRepository } from '../../repository/activities/gratitudeEntry.repository.js';
import { GratitudeJarService } from '../../services/activities/gratitudeJar.service.js';

const router: Router = express.Router();
const gratitudeEntryRepository = new GratitudeEntryRepository();
const gratitudeJarService = new GratitudeJarService(gratitudeEntryRepository);
const gratitudeJarController = new GratitudeJarController(gratitudeJarService);

/**
 * @openapi
 * /gratitude-jar/:
 *   post:
 *     summary: Create a new gratitude jar entry
 *     description: Allows a student to create a gratitude jar entry with encrypted content. Content must be meaningful and between 3-500 characters.
 *     tags:
 *       - Gratitude Jar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 500
 *                 description: The gratitude content to be stored (meaningful text, not nonsense)
 *                 example: "I'm grateful for my supportive family and friends who always believe in me."
 *     responses:
 *       "201":
 *         description: Gratitude entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: GRATITUDE_ENTRY_CREATED
 *                 message:
 *                   type: string
 *                   example: Gratitude entry created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     gratitude_id:
 *                       type: string
 *                       format: uuid
 *                       example: 54a2a768-8e62-41ac-8b6e-e5092881000e
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: 6bf00386-77e5-4a02-9ed9-5f4f294ceb8b
 *                     content:
 *                       type: string
 *                       example: "I'm grateful for my supportive family and friends who always believe in me."
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-02T12:08:11.190Z
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-02T12:08:11.190Z
 *                     is_deleted:
 *                       type: boolean
 *                       example: false
 *       "400":
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidContent:
 *                 value:
 *                   success: false
 *                   code: INVALID_CONTENT
 *                   message: Content must be a non-empty string.
 *               contentLength:
 *                 value:
 *                   success: false
 *                   code: BAD_REQUEST
 *                   message: Content must be between 3 and 500 characters.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 value:
 *                   success: false
 *                   code: UNAUTHORIZED
 *                   message: "Unauthorized: User ID missing"
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 value:
 *                   success: false
 *                   code: FORBIDDEN
 *                   message: "Forbidden: student role required"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   code: INTERNAL_SERVER_ERROR
 *                   message: An unexpected error occurred
 */
router.post('/', heronAuthMiddleware, asyncHandler(gratitudeJarController.addEntry.bind(gratitudeJarController)));

/**
 * @openapi
 * /gratitude-jar/:
 *   get:
 *     summary: Retrieve gratitude jar entries for a student
 *     description: Retrieves all gratitude jar entries for the authenticated student, including decrypted content. Supports pagination via `limit` and `lastEntryId` query parameters.
 *     tags:
 *       - Gratitude Jar
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of entries to retrieve (default 10, max 50)
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - name: lastEntryId
 *         in: query
 *         description: The ID of the last gratitude entry from the previous page (for pagination)
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       "200":
 *         description: Gratitude entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: GRATITUDE_ENTRIES_FETCHED
 *                 message:
 *                   type: string
 *                   example: Gratitude entries fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     entries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           gratitude_id:
 *                             type: string
 *                             format: uuid
 *                           user_id:
 *                             type: string
 *                             format: uuid
 *                           content:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                           is_deleted:
 *                             type: boolean
 *                     hasMore:
 *                       type: boolean
 *                     nextCursor:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *       "400":
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidLimit:
 *                 value:
 *                   success: false
 *                   code: BAD_REQUEST
 *                   message: Limit must be a positive number not exceeding 50.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 value:
 *                   success: false
 *                   code: UNAUTHORIZED
 *                   message: "Unauthorized: User ID missing"
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 value:
 *                   success: false
 *                   code: FORBIDDEN
 *                   message: "Forbidden: student role required"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   code: INTERNAL_SERVER_ERROR
 *                   message: An unexpected error occurred
 */
router.get('/', heronAuthMiddleware, asyncHandler(gratitudeJarController.getEntriesByUser.bind(gratitudeJarController)));

/**
 * @openapi
 * /gratitude-jar/{id}:
 *   get:
 *     summary: Retrieve a specific gratitude jar entry by ID
 *     description: Retrieves a single gratitude jar entry by its unique identifier for the authenticated student, including decrypted content.
 *     tags:
 *       - Gratitude Jar
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique identifier of the gratitude jar entry
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 54a2a768-8e62-41ac-8b6e-e5092881000e
 *     responses:
 *       "200":
 *         description: Gratitude entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: GRATITUDE_ENTRY_FETCHED
 *                 message:
 *                   type: string
 *                   example: Gratitude entry fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     gratitude_id:
 *                       type: string
 *                       format: uuid
 *                       example: 54a2a768-8e62-41ac-8b6e-e5092881000e
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: 6bf00386-77e5-4a02-9ed9-5f4f294ceb8b
 *                     content:
 *                       type: string
 *                       example: "I'm grateful for my supportive family and friends who always believe in me."
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-02T12:08:11.190Z
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-02T12:08:11.190Z
 *                     is_deleted:
 *                       type: boolean
 *                       example: false
 *       "400":
 *         description: Bad request - invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId:
 *                 value:
 *                   success: false
 *                   code: INVALID_ID
 *                   message: Gratitude ID must be a valid string.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 value:
 *                   success: false
 *                   code: UNAUTHORIZED
 *                   message: "Unauthorized: User ID missing"
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 value:
 *                   success: false
 *                   code: FORBIDDEN
 *                   message: "Forbidden: student role required"
 *       "404":
 *         description: Not found - gratitude entry does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   code: NOT_FOUND
 *                   message: Gratitude entry not found.
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   code: INTERNAL_SERVER_ERROR
 *                   message: An unexpected error occurred
 */
router.get('/:id', heronAuthMiddleware, asyncHandler(gratitudeJarController.getEntryById.bind(gratitudeJarController)));

/**
 * @openapi
 * /gratitude-jar/{id}:
 *   put:
 *     summary: Update a gratitude jar entry
 *     description: Updates an existing gratitude jar entry with new content for the authenticated student. Content must be meaningful and between 3-500 characters.
 *     tags:
 *       - Gratitude Jar
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique identifier of the gratitude jar entry to update
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 54a2a768-8e62-41ac-8b6e-e5092881000e
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 500
 *                 description: The updated gratitude content (meaningful text, not nonsense)
 *                 example: "I'm grateful for the beautiful sunset and peaceful moments today."
 *     responses:
 *       "200":
 *         description: Gratitude entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: GRATITUDE_ENTRY_UPDATED
 *                 message:
 *                   type: string
 *                   example: Gratitude entry updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     gratitude_id:
 *                       type: string
 *                       format: uuid
 *                       example: 54a2a768-8e62-41ac-8b6e-e5092881000e
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: 6bf00386-77e5-4a02-9ed9-5f4f294ceb8b
 *                     content:
 *                       type: string
 *                       example: "I'm grateful for the beautiful sunset and peaceful moments today."
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-02T12:08:11.190Z
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-02T14:15:30.250Z
 *                     is_deleted:
 *                       type: boolean
 *                       example: false
 *       "400":
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId:
 *                 value:
 *                   success: false
 *                   code: INVALID_ID
 *                   message: Gratitude ID must be a valid string.
 *               invalidContent:
 *                 value:
 *                   success: false
 *                   code: INVALID_CONTENT
 *                   message: Content must be a non-empty string.
 *               contentLength:
 *                 value:
 *                   success: false
 *                   code: BAD_REQUEST
 *                   message: Content must be between 3 and 500 characters.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 value:
 *                   success: false
 *                   code: UNAUTHORIZED
 *                   message: "Unauthorized: User ID missing"
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 value:
 *                   success: false
 *                   code: FORBIDDEN
 *                   message: "Forbidden: student role required"
 *       "404":
 *         description: Not found - gratitude entry does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   code: NOT_FOUND
 *                   message: Gratitude entry not found.
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   code: INTERNAL_SERVER_ERROR
 *                   message: An unexpected error occurred
 */
router.put('/:id', heronAuthMiddleware, asyncHandler(gratitudeJarController.updateEntry.bind(gratitudeJarController)));

/**
 * @openapi
 * /gratitude-jar/{id}:
 *   delete:
 *     summary: Delete a gratitude jar entry
 *     description: Soft deletes an existing gratitude jar entry for the authenticated student. The entry is marked as deleted but not permanently removed from the database.
 *     tags:
 *       - Gratitude Jar
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique identifier of the gratitude jar entry to delete
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 54a2a768-8e62-41ac-8b6e-e5092881000e
 *     responses:
 *       "200":
 *         description: Gratitude entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: GRATITUDE_ENTRY_DELETED
 *                 message:
 *                   type: string
 *                   example: Gratitude entry deleted successfully
 *                 data:
 *                   type: null
 *                   example: null
 *       "400":
 *         description: Bad request - invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId:
 *                 value:
 *                   success: false
 *                   code: INVALID_ID
 *                   message: Gratitude ID must be a valid string.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 value:
 *                   success: false
 *                   code: UNAUTHORIZED
 *                   message: "Unauthorized: User ID missing"
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 value:
 *                   success: false
 *                   code: FORBIDDEN
 *                   message: "Forbidden: student role required"
 *       "404":
 *         description: Not found - gratitude entry does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   code: NOT_FOUND
 *                   message: Gratitude entry not found.
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   code: INTERNAL_SERVER_ERROR
 *                   message: An unexpected error occurred
 */
router.delete('/:id', heronAuthMiddleware, asyncHandler(gratitudeJarController.deleteEntry.bind(gratitudeJarController)));

export default router;