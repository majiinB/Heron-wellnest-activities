import type { NextFunction, Response } from "express";
import type { DecorService } from "../../services/pets/decor.service.js";
import type { AuthenticatedRequest } from "../../interface/authRequest.interface.js";
import { validateUser } from "../../utils/authorization.util.js";
import { AppError } from "../../types/appError.type.js";
import type { ApiResponse } from "../../types/apiResponse.type.js";

export class DecorController {
  private decorService: DecorService;

  constructor(decorService: DecorService) {
    this.decorService = decorService;
  }

  public async getAllDecorItems(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const decorItems = await this.decorService.getAllDecorItems();

    const response: ApiResponse = {
      success: true,
      code: "DECOR_ITEMS_RETRIEVED",
      message: "Decor items retrieved successfully",
      data: decorItems
    };

    res.status(200).json(response);
  }

  public async getDecorByType(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { decor_type } = req.params;

    validateUser(userId, userRole, "student");

    const validTypes = ["clock", "chair", "desk", "wallpaper", "tiles"] as const;
    if (!validTypes.includes(decor_type as typeof validTypes[number])) {
      throw new AppError(400, "INVALID_DECOR_TYPE", "Invalid decor type.", true);
    }

    const decorItems = await this.decorService.getDecorByType(decor_type as typeof validTypes[number]);

    const response: ApiResponse = {
      success: true,
      code: "DECOR_ITEMS_RETRIEVED",
      message: "Decor items retrieved successfully",
      data: decorItems
    };

    res.status(200).json(response);
  }

  public async buyDecor(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { decor_id } = req.body || {};

    validateUser(userId, userRole, "student");

    if (!decor_id || !decor_id.trim()) {
      throw new AppError(400, "MISSING_DECOR_ID", "Decor ID is required.", true);
    }

    const result = await this.decorService.buyDecor(userId!, decor_id.trim());

    const response: ApiResponse = {
      success: true,
      code: "DECOR_PURCHASED",
      message: "Decor purchased successfully",
      data: result
    };

    res.status(201).json(response);
  }

  public async getDecorInventory(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const inventory = await this.decorService.getDecorInventory(userId!);

    const response: ApiResponse = {
      success: true,
      code: "DECOR_INVENTORY_RETRIEVED",
      message: "Decor inventory retrieved successfully",
      data: inventory
    };

    res.status(200).json(response);
  }

  public async getEquippedDecor(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const equipped = await this.decorService.getEquippedDecor(userId!);

    const response: ApiResponse = {
      success: true,
      code: "EQUIPPED_DECOR_RETRIEVED",
      message: "Equipped decor retrieved successfully",
      data: equipped
    };

    res.status(200).json(response);
  }

  public async equipDecor(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { inventory_id } = req.body || {};

    validateUser(userId, userRole, "student");

    if (!inventory_id || !inventory_id.trim()) {
      throw new AppError(400, "MISSING_INVENTORY_ID", "Inventory ID is required.", true);
    }

    const inventory = await this.decorService.equipDecor(userId!, inventory_id.trim());

    const response: ApiResponse = {
      success: true,
      code: "DECOR_EQUIPPED",
      message: "Decor equipped successfully",
      data: inventory
    };

    res.status(200).json(response);
  }

  public async unequipDecor(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { inventory_id } = req.body || {};

    validateUser(userId, userRole, "student");

    if (!inventory_id || !inventory_id.trim()) {
      throw new AppError(400, "MISSING_INVENTORY_ID", "Inventory ID is required.", true);
    }

    const inventory = await this.decorService.unequipDecor(userId!, inventory_id.trim());

    const response: ApiResponse = {
      success: true,
      code: "DECOR_UNEQUIPPED",
      message: "Decor unequipped successfully",
      data: inventory
    };

    res.status(200).json(response);
  }

  public async removeDecorFromInventory(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { inventory_id } = req.params;

    validateUser(userId, userRole, "student");

    if (!inventory_id || !inventory_id.trim()) {
      throw new AppError(400, "MISSING_INVENTORY_ID", "Inventory ID is required.", true);
    }

    await this.decorService.removeDecorFromInventory(userId!, inventory_id.trim());

    const response: ApiResponse = {
      success: true,
      code: "DECOR_REMOVED",
      message: "Decor removed from inventory successfully",
      data: null
    };

    res.status(200).json(response);
  }
}
