import express, { Router } from 'express';
import { heronAuthMiddleware } from '../../middlewares/heronAuth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';
import { DecorItemsRepository } from '../../repository/pets/decorItems.repository.js';
import { DecorInventoryRepository } from '../../repository/pets/decorInventory.repository.js';
import { PetsRepository } from '../../repository/pets/pets.repository.js';
import { DecorService } from '../../services/pets/decor.service.js';
import { DecorController } from '../../controllers/pets/decor.controller.js';

const router: Router = express.Router();

const decorItemsRepository = new DecorItemsRepository();
const decorInventoryRepository = new DecorInventoryRepository();
const petsRepository = new PetsRepository();
const decorService = new DecorService(
  decorItemsRepository,
  decorInventoryRepository,
  petsRepository
);
const decorController = new DecorController(decorService);

/**
 * @openapi
 * /decor/:
 *   get:
 *     summary: Get all decor items from marketplace
 *     description: Retrieves all available decor items that can be purchased from the marketplace. Items are ordered by price.
 *     tags:
 *       - Decor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Decor items retrieved successfully
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
 *                   example: DECOR_ITEMS_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: Decor items retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       decor_id:
 *                         type: string
 *                         format: uuid
 *                       decor_name:
 *                         type: string
 *                         example: "Oak Chair"
 *                       decor_type:
 *                         type: string
 *                         enum: [clock, chair, desk, wallpaper, tiles]
 *                       decor_description:
 *                         type: string
 *                         nullable: true
 *                       decor_image_url:
 *                         type: string
 *                       decor_price:
 *                         type: number
 *                         example: 100
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
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
router.get('/', heronAuthMiddleware, asyncHandler(decorController.getAllDecorItems.bind(decorController)));

/**
 * @openapi
 * /decor/type/{decor_type}:
 *   get:
 *     summary: Get decor items by type from marketplace
 *     description: Retrieves all available decor items of a specific type. Items are ordered by price.
 *     tags:
 *       - Decor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: decor_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [clock, chair, desk, wallpaper, tiles]
 *         description: The type of decor to filter by
 *     responses:
 *       "200":
 *         description: Decor items retrieved successfully
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
 *                   example: DECOR_ITEMS_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: Decor items retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DecorItem'
 *       "400":
 *         description: Invalid decor type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               code: INVALID_DECOR_TYPE
 *               message: Invalid decor type.
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
router.get('/type/:decor_type', heronAuthMiddleware, asyncHandler(decorController.getDecorByType.bind(decorController)));

/**
 * @openapi
 * /decor/buy:
 *   post:
 *     summary: Purchase a decor item from marketplace
 *     description: Buys a decor item from the marketplace using pet coins. Each decor can only be owned once.
 *     tags:
 *       - Decor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decor_id
 *             properties:
 *               decor_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the decor item to purchase
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       "201":
 *         description: Decor purchased successfully
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
 *                   example: DECOR_PURCHASED
 *                 message:
 *                   type: string
 *                   example: Decor purchased successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     inventory:
 *                       type: object
 *                       description: New inventory entry (unequipped by default)
 *                     pet:
 *                       type: object
 *                       description: Updated pet entity with reduced coins
 *       "400":
 *         description: Insufficient coins or missing decor_id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingDecorId:
 *                 value:
 *                   success: false
 *                   code: MISSING_DECOR_ID
 *                   message: Decor ID is required.
 *               insufficientCoins:
 *                 value:
 *                   success: false
 *                   code: INSUFFICIENT_COINS
 *                   message: "Not enough coins. Need 100 coins but have 50."
 *       "404":
 *         description: Decor item or pet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               decorNotFound:
 *                 value:
 *                   success: false
 *                   code: DECOR_NOT_FOUND
 *                   message: Decor item not found.
 *               petNotFound:
 *                 value:
 *                   success: false
 *                   code: PET_NOT_FOUND
 *                   message: Pet not found.
 *       "409":
 *         description: Decor already owned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               code: DECOR_ALREADY_OWNED
 *               message: You already own this decor item.
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
router.post('/buy', heronAuthMiddleware, asyncHandler(decorController.buyDecor.bind(decorController)));

/**
 * @openapi
 * /decor/inventory:
 *   get:
 *     summary: Get user's decor inventory
 *     description: Retrieves all decor items currently in the authenticated user's inventory, ordered by acquisition date descending.
 *     tags:
 *       - Decor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Decor inventory retrieved successfully
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
 *                   example: DECOR_INVENTORY_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: Decor inventory retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       inventory_id:
 *                         type: string
 *                         format: uuid
 *                       owner_id:
 *                         type: string
 *                         format: uuid
 *                       decor_item:
 *                         type: object
 *                         description: Full decor item details
 *                       is_equipped:
 *                         type: boolean
 *                         example: false
 *                       acquired_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
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
router.get('/inventory', heronAuthMiddleware, asyncHandler(decorController.getDecorInventory.bind(decorController)));

/**
 * @openapi
 * /decor/inventory/equipped:
 *   get:
 *     summary: Get user's currently equipped decor
 *     description: Retrieves all decor items that are currently equipped by the authenticated user.
 *     tags:
 *       - Decor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Equipped decor retrieved successfully
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
 *                   example: EQUIPPED_DECOR_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: Equipped decor retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       inventory_id:
 *                         type: string
 *                         format: uuid
 *                       owner_id:
 *                         type: string
 *                         format: uuid
 *                       decor_item:
 *                         type: object
 *                         description: Full decor item details
 *                       is_equipped:
 *                         type: boolean
 *                         example: true
 *                       acquired_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
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
router.get('/inventory/equipped', heronAuthMiddleware, asyncHandler(decorController.getEquippedDecor.bind(decorController)));

/**
 * @openapi
 * /decor/equip:
 *   post:
 *     summary: Equip a decor item
 *     description: Equips a decor item from the user's inventory. Only one item of the same type can be equipped at a time — any previously equipped item of the same type is automatically unequipped first.
 *     tags:
 *       - Decor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inventory_id
 *             properties:
 *               inventory_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the inventory entry to equip
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       "200":
 *         description: Decor equipped successfully
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
 *                   example: DECOR_EQUIPPED
 *                 message:
 *                   type: string
 *                   example: Decor equipped successfully
 *                 data:
 *                   type: object
 *                   description: Updated inventory entry with is_equipped set to true
 *       "400":
 *         description: Missing inventory_id or item already equipped
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingInventoryId:
 *                 value:
 *                   success: false
 *                   code: MISSING_INVENTORY_ID
 *                   message: Inventory ID is required.
 *               alreadyEquipped:
 *                 value:
 *                   success: false
 *                   code: ALREADY_EQUIPPED
 *                   message: This decor item is already equipped.
 *       "403":
 *         description: Inventory item does not belong to the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "404":
 *         description: Inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "401":
 *         description: Unauthorized - missing or invalid token
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
router.post('/equip', heronAuthMiddleware, asyncHandler(decorController.equipDecor.bind(decorController)));

/**
 * @openapi
 * /decor/unequip:
 *   post:
 *     summary: Unequip a decor item
 *     description: Unequips a currently equipped decor item from the user's inventory.
 *     tags:
 *       - Decor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inventory_id
 *             properties:
 *               inventory_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the inventory entry to unequip
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       "200":
 *         description: Decor unequipped successfully
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
 *                   example: DECOR_UNEQUIPPED
 *                 message:
 *                   type: string
 *                   example: Decor unequipped successfully
 *                 data:
 *                   type: object
 *                   description: Updated inventory entry with is_equipped set to false
 *       "400":
 *         description: Missing inventory_id or item not currently equipped
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingInventoryId:
 *                 value:
 *                   success: false
 *                   code: MISSING_INVENTORY_ID
 *                   message: Inventory ID is required.
 *               notEquipped:
 *                 value:
 *                   success: false
 *                   code: NOT_EQUIPPED
 *                   message: This decor item is not currently equipped.
 *       "403":
 *         description: Inventory item does not belong to the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "404":
 *         description: Inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "401":
 *         description: Unauthorized - missing or invalid token
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
router.post('/unequip', heronAuthMiddleware, asyncHandler(decorController.unequipDecor.bind(decorController)));

/**
 * @openapi
 * /decor/inventory/{inventory_id}:
 *   delete:
 *     summary: Remove a decor item from inventory
 *     description: Permanently removes a decor item from the user's inventory.
 *     tags:
 *       - Decor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventory_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the inventory entry to remove
 *     responses:
 *       "200":
 *         description: Decor removed from inventory successfully
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
 *                   example: DECOR_REMOVED
 *                 message:
 *                   type: string
 *                   example: Decor removed from inventory successfully
 *                 data:
 *                   nullable: true
 *                   example: null
 *       "403":
 *         description: Inventory item does not belong to the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "404":
 *         description: Inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       "401":
 *         description: Unauthorized - missing or invalid token
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
router.delete('/inventory/:inventory_id', heronAuthMiddleware, asyncHandler(decorController.removeDecorFromInventory.bind(decorController)));

export default router;
