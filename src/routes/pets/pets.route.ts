import express, { Router } from 'express';
import { PetsRepository } from '../../repository/pets/pets.repository.js';
import { PetsService } from '../../services/pets/pets.service.js';
import { PetsController } from '../../controllers/pets/pets.controller.js';
import { heronAuthMiddleware } from '../../middlewares/heronAuth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';

const router: Router = express.Router();

const petsRepository = new PetsRepository();
const petsService = new PetsService(petsRepository);
const petsController = new PetsController(petsService);

/**
 * @openapi
 * /pets/:
 *   get:
 *     summary: Get comprehensive pet stats
 *     description: Retrieves detailed statistics for the authenticated user's pet, including hunger, energy, cleanliness, happiness, experience, level, coins, and sleep status. Automatically creates a pet with default name "Heron" if one doesn't exist.
 *     tags:
 *       - Pets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Pet stats retrieved successfully
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
 *                   example: PET_STATS_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: Pet stats retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     pet:
 *                       type: object
 *                       description: Complete pet entity
 *                       properties:
 *                         pet_id:
 *                           type: string
 *                           format: uuid
 *                           example: "e537b676-3e23-43f4-bb82-160e2b078c25"
 *                         owner_id:
 *                           type: string
 *                           format: uuid
 *                           example: "c81daef9-bc32-4624-a595-3cdb0f66d559"
 *                         name:
 *                           type: string
 *                           example: "Heron"
 *                         species:
 *                           type: string
 *                           example: "heron"
 *                         level:
 *                           type: number
 *                           example: 1
 *                         experience:
 *                           type: number
 *                           example: 0
 *                         age_stage:
 *                           type: string
 *                           example: "infant"
 *                         pet_mood:
 *                           type: string
 *                           example: "excited"
 *                         pet_coin:
 *                           type: number
 *                           example: 500
 *                         pet_energy:
 *                           type: number
 *                           example: 100
 *                         pet_hunger:
 *                           type: number
 *                           example: 100
 *                         pet_cleanliness:
 *                           type: number
 *                           example: 100
 *                         pet_happiness:
 *                           type: number
 *                           example: 100
 *                         last_interaction_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-02-02T00:53:26.196Z"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-02-02T00:53:26.196Z"
 *                         sleep_until:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           example: null
 *                     level:
 *                       type: number
 *                       example: 1
 *                     coins:
 *                       type: number
 *                       example: 500
 *                     stats:
 *                       type: object
 *                       properties:
 *                         hunger:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: number
 *                               example: 80
 *                             percentage:
 *                               type: number
 *                               example: 80
 *                         energy:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: number
 *                               example: 65
 *                             percentage:
 *                               type: number
 *                               example: 65
 *                         cleanliness:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: number
 *                               example: 90
 *                             percentage:
 *                               type: number
 *                               example: 90
 *                         happiness:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: number
 *                               example: 75
 *                             percentage:
 *                               type: number
 *                               example: 75
 *                         experience:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: number
 *                               example: 450
 *                             percentage:
 *                               type: number
 *                               example: 60
 *                             nextLevelXP:
 *                               type: number
 *                               example: 750
 *                     isSleeping:
 *                       type: boolean
 *                       example: false
 *                     sleepRemainingMinutes:
 *                       type: number
 *                       nullable: true
 *                       example: null
 *                     canWakeUp:
 *                       type: boolean
 *                       example: false
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', heronAuthMiddleware, asyncHandler(petsController.getPetStats.bind(petsController)));

/**
 * @openapi
 * /pets/:
 *   post:
 *     summary: Create a new pet with custom name
 *     description: Creates a pet for the authenticated user with a custom name. Only one pet per user is allowed. If a pet already exists, returns an error.
 *     tags:
 *       - Pets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name for the pet
 *                 example: "Fluffy"
 *     responses:
 *       "201":
 *         description: Pet created successfully
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
 *                   example: PET_CREATED
 *                 message:
 *                   type: string
 *                   example: Pet created successfully
 *                 data:
 *                   type: object
 *                   description: Pet entity
 *       "400":
 *         description: Bad request - missing name or pet already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingName:
 *                 value:
 *                   success: false
 *                   code: MISSING_NAME
 *                   message: Pet name is required.
 *               petExists:
 *                 value:
 *                   success: false
 *                   code: PET_EXISTS
 *                   message: Owner already has a pet.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', heronAuthMiddleware, asyncHandler(petsController.createPet.bind(petsController)));

/**
 * @openapi
 * /pets/pet:
 *   post:
 *     summary: Pet/tap the pet
 *     description: Interact with the pet by petting/tapping it. Awards 1 coin and increases happiness by 1. Decreases energy by 1.
 *     tags:
 *       - Pets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Pet petted successfully
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
 *                   example: PET_PETTED
 *                 message:
 *                   type: string
 *                   example: Pet petted successfully
 *                 data:
 *                   type: object
 *                   description: Updated pet entity
 *                   properties:
 *                     pet_id:
 *                       type: string
 *                       format: uuid
 *                       example: "e537b676-3e23-43f4-bb82-160e2b078c25"
 *                     owner_id:
 *                       type: string
 *                       format: uuid
 *                       example: "c81daef9-bc32-4624-a595-3cdb0f66d559"
 *                     name:
 *                       type: string
 *                       example: "Heron"
 *                     species:
 *                       type: string
 *                       example: "heron"
 *                     level:
 *                       type: number
 *                       example: 1
 *                     experience:
 *                       type: number
 *                       example: 0
 *                     age_stage:
 *                       type: string
 *                       example: "infant"
 *                     pet_mood:
 *                       type: string
 *                       example: "excited"
 *                     pet_coin:
 *                       type: number
 *                       example: 501
 *                     pet_energy:
 *                       type: number
 *                       example: 99
 *                     pet_hunger:
 *                       type: number
 *                       example: 100
 *                     pet_cleanliness:
 *                       type: number
 *                       example: 100
 *                     pet_happiness:
 *                       type: number
 *                       example: 100
 *                     last_interaction_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-02-02T00:58:26.150Z"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-02-02T00:53:26.196Z"
 *                     sleep_until:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *       "400":
 *         description: Bad request - pet is sleeping
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               petSleeping:
 *                 value:
 *                   success: false
 *                   code: PET_SLEEPING
 *                   message: Pet is currently sleeping.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/pet', heronAuthMiddleware, asyncHandler(petsController.petThePet.bind(petsController)));

/**
 * @openapi
 * /pets/sleep:
 *   post:
 *     summary: Put pet to sleep
 *     description: Puts the pet to sleep for 1 hour. Pet cannot interact during this time but will wake up with restored energy and earn 5 coins.
 *     tags:
 *       - Pets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Pet is now sleeping
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
 *                   example: PET_SLEEPING
 *                 message:
 *                   type: string
 *                   example: Pet is now sleeping
 *                 data:
 *                   type: object
 *                   description: Updated pet entity
 *                   properties:
 *                     pet_id:
 *                       type: string
 *                       format: uuid
 *                       example: "e537b676-3e23-43f4-bb82-160e2b078c25"
 *                     owner_id:
 *                       type: string
 *                       format: uuid
 *                       example: "c81daef9-bc32-4624-a595-3cdb0f66d559"
 *                     name:
 *                       type: string
 *                       example: "Heron"
 *                     species:
 *                       type: string
 *                       example: "heron"
 *                     level:
 *                       type: number
 *                       example: 1
 *                     experience:
 *                       type: number
 *                       example: 0
 *                     age_stage:
 *                       type: string
 *                       example: "infant"
 *                     pet_mood:
 *                       type: string
 *                       example: "sleepy"
 *                     pet_coin:
 *                       type: number
 *                       example: 501
 *                     pet_energy:
 *                       type: number
 *                       example: 99
 *                     pet_hunger:
 *                       type: number
 *                       example: 100
 *                     pet_cleanliness:
 *                       type: number
 *                       example: 100
 *                     pet_happiness:
 *                       type: number
 *                       example: 100
 *                     last_interaction_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-02-02T01:04:22.817Z"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-02-02T00:53:26.196Z"
 *                     sleep_until:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: "2026-02-02T02:04:22.817Z"
 *       "400":
 *         description: Bad request - pet is already sleeping
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadySleeping:
 *                 value:
 *                   success: false
 *                   code: PET_ALREADY_SLEEPING
 *                   message: Pet is already sleeping.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/sleep', heronAuthMiddleware, asyncHandler(petsController.sleepPet.bind(petsController)));

/**
 * @openapi
 * /pets/wake:
 *   post:
 *     summary: Wake pet up from sleep
 *     description: Wakes the pet up after completing the required 1-hour sleep duration. Awards 5 coins, restores energy to 100, but decreases hunger and cleanliness.
 *     tags:
 *       - Pets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Pet woke up successfully
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
 *                   example: PET_AWAKE
 *                 message:
 *                   type: string
 *                   example: Pet woke up successfully
 *                 data:
 *                   type: object
 *                   description: Updated pet entity
 *       "400":
 *         description: Bad request - pet not sleeping or sleep duration not completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notSleeping:
 *                 value:
 *                   success: false
 *                   code: PET_NOT_SLEEPING
 *                   message: Pet is not sleeping.
 *               sleepNotCompleted:
 *                 value:
 *                   success: false
 *                   code: SLEEP_NOT_COMPLETED
 *                   message: Pet needs to sleep for 45 more minute(s).
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/wake', heronAuthMiddleware, asyncHandler(petsController.wakePet.bind(petsController)));

/**
 * @openapi
 * /pets/bath:
 *   post:
 *     summary: Complete bath minigame
 *     description: Completes the bath minigame. Sets cleanliness to 100, awards 8 coins, and decreases energy by 10.
 *     tags:
 *       - Pets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Bath minigame completed successfully
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
 *                   example: BATH_COMPLETED
 *                 message:
 *                   type: string
 *                   example: Bath minigame completed successfully
 *                 data:
 *                   type: object
 *                   description: Updated pet entity
 *       "400":
 *         description: Bad request - pet is sleeping or insufficient energy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               petSleeping:
 *                 value:
 *                   success: false
 *                   code: PET_SLEEPING
 *                   message: Pet is currently sleeping.
 *               insufficientEnergy:
 *                 value:
 *                   success: false
 *                   code: INSUFFICIENT_ENERGY
 *                   message: Pet does not have enough energy to take a bath.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/bath', heronAuthMiddleware, asyncHandler(petsController.completeBathMinigame.bind(petsController)));

/**
 * @openapi
 * /pets/bounce:
 *   post:
 *     summary: Complete bounce/couch minigame
 *     description: Completes the bounce/couch minigame. Awards 10 coins, increases happiness by 15, decreases energy by 15, and decreases cleanliness by 5.
 *     tags:
 *       - Pets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Bounce minigame completed successfully
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
 *                   example: BOUNCE_COMPLETED
 *                 message:
 *                   type: string
 *                   example: Bounce minigame completed successfully
 *                 data:
 *                   type: object
 *                   description: Updated pet entity
 *       "400":
 *         description: Bad request - pet is sleeping or insufficient energy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               petSleeping:
 *                 value:
 *                   success: false
 *                   code: PET_SLEEPING
 *                   message: Pet is currently sleeping.
 *               insufficientEnergy:
 *                 value:
 *                   success: false
 *                   code: INSUFFICIENT_ENERGY
 *                   message: Pet does not have enough energy to play.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/bounce', heronAuthMiddleware, asyncHandler(petsController.completeBounceMinigame.bind(petsController)));

/**
 * @openapi
 * /pets/name:
 *   patch:
 *     summary: Update pet name
 *     description: Updates the pet's name. Can be used to rename the pet at any time.
 *     tags:
 *       - Pets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the pet
 *                 example: "Buddy"
 *     responses:
 *       "200":
 *         description: Pet name updated successfully
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
 *                   example: PET_NAME_UPDATED
 *                 message:
 *                   type: string
 *                   example: Pet name updated successfully
 *                 data:
 *                   type: object
 *                   description: Updated pet entity
 *       "400":
 *         description: Bad request - missing name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingName:
 *                 value:
 *                   success: false
 *                   code: MISSING_NAME
 *                   message: Pet name is required.
 *       "404":
 *         description: Pet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               petNotFound:
 *                 value:
 *                   success: false
 *                   code: PET_NOT_FOUND
 *                   message: Pet not found.
 *       "401":
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "403":
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/name', heronAuthMiddleware, asyncHandler(petsController.updatePetName.bind(petsController)));

export default router;
