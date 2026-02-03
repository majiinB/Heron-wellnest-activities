import express, { Router } from 'express';
import { heronAuthMiddleware } from '../../middlewares/heronAuth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.util.js';
import { PetFoodRepository } from '../../repository/pets/petFood.repsository.js';
import { FoodInventoryRepository } from '../../repository/pets/foodInventory.repository.js';
import { PetsRepository } from '../../repository/pets/pets.repository.js';
import { PetsService } from '../../services/pets/pets.service.js';
import { FoodService } from '../../services/pets/food.service.js';
import { FoodController } from '../../controllers/pets/food.controller.js';

const router: Router = express.Router();

const petFoodRepository = new PetFoodRepository();
const foodInventoryRepository = new FoodInventoryRepository();
const petsRepository = new PetsRepository();
const petsService = new PetsService(petsRepository);
const foodService = new FoodService(
  petFoodRepository,
  foodInventoryRepository,
  petsRepository,
  petsService
);
const foodController = new FoodController(foodService);

/**
 * @openapi
 * /food/:
 *   get:
 *     summary: Get all food items from marketplace
 *     description: Retrieves all available food items that can be purchased from the marketplace. Items are ordered by price.
 *     tags:
 *       - Food
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Food items retrieved successfully
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
 *                   example: FOOD_ITEMS_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: Food items retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       food_id:
 *                         type: string
 *                         format: uuid
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       food_name:
 *                         type: string
 *                         example: "Apple"
 *                       food_price:
 *                         type: number
 *                         example: 5
 *                       hunger_fill_amount:
 *                         type: number
 *                         example: 20
 *                       xp_gain:
 *                         type: number
 *                         example: 10
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
router.get('/', heronAuthMiddleware, asyncHandler(foodController.getAllFoodItems.bind(foodController)));

/**
 * @openapi
 * /food/buy:
 *   post:
 *     summary: Purchase food from marketplace
 *     description: Buys food items from the marketplace using pet coins. If the food already exists in inventory, quantity is incremented. Otherwise, a new inventory entry is created.
 *     tags:
 *       - Food
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - food_id
 *             properties:
 *               food_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the food item to purchase
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               quantity:
 *                 type: number
 *                 description: Number of items to purchase (default is 1)
 *                 example: 3
 *                 minimum: 1
 *     responses:
 *       "201":
 *         description: Food purchased successfully
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
 *                   example: FOOD_PURCHASED
 *                 message:
 *                   type: string
 *                   example: Food purchased successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     inventory:
 *                       type: object
 *                       properties:
 *                         inventory_id:
 *                           type: string
 *                           format: uuid
 *                         owner_id:
 *                           type: string
 *                           format: uuid
 *                         food:
 *                           type: object
 *                           description: Food item details
 *                         quantity:
 *                           type: number
 *                           example: 3
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                     pet:
 *                       type: object
 *                       description: Updated pet entity with reduced coins
 *       "400":
 *         description: Bad request - invalid quantity, insufficient coins, or missing food_id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFoodId:
 *                 value:
 *                   success: false
 *                   code: MISSING_FOOD_ID
 *                   message: Food ID is required.
 *               invalidQuantity:
 *                 value:
 *                   success: false
 *                   code: INVALID_QUANTITY
 *                   message: Quantity must be a positive number.
 *               insufficientCoins:
 *                 value:
 *                   success: false
 *                   code: INSUFFICIENT_COINS
 *                   message: "Not enough coins. Need 15 coins but have 10."
 *       "404":
 *         description: Food item or pet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               foodNotFound:
 *                 value:
 *                   success: false
 *                   code: FOOD_NOT_FOUND
 *                   message: Food item not found.
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
router.post('/buy', heronAuthMiddleware, asyncHandler(foodController.buyFood.bind(foodController)));

/**
 * @openapi
 * /food/inventory:
 *   get:
 *     summary: Get user's food inventory
 *     description: Retrieves all food items currently in the authenticated user's inventory, including quantities and food details.
 *     tags:
 *       - Food
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Food inventory retrieved successfully
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
 *                   example: FOOD_INVENTORY_RETRIEVED
 *                 message:
 *                   type: string
 *                   example: Food inventory retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       inventory_id:
 *                         type: string
 *                         format: uuid
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       owner_id:
 *                         type: string
 *                         format: uuid
 *                       food:
 *                         type: object
 *                         properties:
 *                           food_id:
 *                             type: string
 *                             format: uuid
 *                           food_name:
 *                             type: string
 *                             example: "Apple"
 *                           food_price:
 *                             type: number
 *                             example: 5
 *                           hunger_fill_amount:
 *                             type: number
 *                             example: 20
 *                           xp_gain:
 *                             type: number
 *                             example: 10
 *                       quantity:
 *                         type: number
 *                         example: 5
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
router.get('/inventory', heronAuthMiddleware, asyncHandler(foodController.getFoodInventory.bind(foodController)));

/**
 * @openapi
 * /food/feed:
 *   post:
 *     summary: Feed pet with food from inventory
 *     description: Feeds the pet using a food item from the user's inventory. Increases hunger, awards 2 coins, grants XP, and may trigger level-up. Decreases inventory quantity by 1 (removes if quantity reaches 0). Pet must not be sleeping.
 *     tags:
 *       - Food
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - food_id
 *             properties:
 *               food_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the food item to feed
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       "200":
 *         description: Pet fed successfully
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
 *                   example: PET_FED
 *                 message:
 *                   type: string
 *                   example: Pet fed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     pet:
 *                       type: object
 *                       description: Updated pet entity with increased hunger, XP, coins, and potentially new level
 *                     inventory:
 *                       type: object
 *                       nullable: true
 *                       description: Updated inventory with decreased quantity, or null if item was removed
 *                       properties:
 *                         inventory_id:
 *                           type: string
 *                           format: uuid
 *                         owner_id:
 *                           type: string
 *                           format: uuid
 *                         food:
 *                           type: object
 *                         quantity:
 *                           type: number
 *                           example: 2
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       "400":
 *         description: Bad request - pet is sleeping, food not in inventory, or insufficient quantity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFoodId:
 *                 value:
 *                   success: false
 *                   code: MISSING_FOOD_ID
 *                   message: Food ID is required.
 *               petSleeping:
 *                 value:
 *                   success: false
 *                   code: PET_SLEEPING
 *                   message: Pet is currently sleeping.
 *               insufficientQuantity:
 *                 value:
 *                   success: false
 *                   code: INSUFFICIENT_QUANTITY
 *                   message: No food items left in inventory.
 *       "404":
 *         description: Food item, pet, or inventory entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               foodNotFound:
 *                 value:
 *                   success: false
 *                   code: FOOD_NOT_FOUND
 *                   message: Food item not found.
 *               petNotFound:
 *                 value:
 *                   success: false
 *                   code: PET_NOT_FOUND
 *                   message: Pet not found.
 *               foodNotInInventory:
 *                 value:
 *                   success: false
 *                   code: FOOD_NOT_IN_INVENTORY
 *                   message: Food not found in inventory.
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
router.post('/feed', heronAuthMiddleware, asyncHandler(foodController.feedPet.bind(foodController)));

export default router;
