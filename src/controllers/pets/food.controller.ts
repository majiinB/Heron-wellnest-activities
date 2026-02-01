import type { NextFunction, Response } from "express";
import type { FoodService } from "../../services/pets/food.service.js";
import type { AuthenticatedRequest } from "../../interface/authRequest.interface.js";
import { validateUser } from "../../utils/authorization.util.js";
import { AppError } from "../../types/appError.type.js";
import type { ApiResponse } from "../../types/apiResponse.type.js";

export class FoodController {
  private foodService: FoodService;

  constructor(foodService: FoodService) {
    this.foodService = foodService;
  }

  public async getAllFoodItems(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const foodItems = await this.foodService.getAllFoodItems();

    const response: ApiResponse = {
      success: true,
      code: "FOOD_ITEMS_RETRIEVED",
      message: "Food items retrieved successfully",
      data: foodItems
    };

    res.status(200).json(response);
  }

  public async buyFood(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { food_id, quantity } = req.body || {};

    validateUser(userId, userRole, "student");

    if (!food_id || !food_id.trim()) {
      throw new AppError(400, "MISSING_FOOD_ID", "Food ID is required.", true);
    }

    const parsedQuantity = quantity ? parseInt(quantity, 10) : 1;
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      throw new AppError(400, "INVALID_QUANTITY", "Quantity must be a positive number.", true);
    }

    const result = await this.foodService.buyFood(userId!, food_id.trim(), parsedQuantity);

    const response: ApiResponse = {
      success: true,
      code: "FOOD_PURCHASED",
      message: "Food purchased successfully",
      data: result
    };

    res.status(201).json(response);
  }

  public async getFoodInventory(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const inventory = await this.foodService.getFoodInventory(userId!);

    const response: ApiResponse = {
      success: true,
      code: "FOOD_INVENTORY_RETRIEVED",
      message: "Food inventory retrieved successfully",
      data: inventory
    };

    res.status(200).json(response);
  }

  public async feedPet(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { food_id } = req.body || {};

    validateUser(userId, userRole, "student");

    if (!food_id || !food_id.trim()) {
      throw new AppError(400, "MISSING_FOOD_ID", "Food ID is required.", true);
    }

    const result = await this.foodService.feedPet(userId!, food_id.trim());

    const response: ApiResponse = {
      success: true,
      code: "PET_FED",
      message: "Pet fed successfully",
      data: result
    };

    res.status(200).json(response);
  }
}
