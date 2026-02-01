import type { NextFunction, Response } from "express";
import type { PetsService } from "../../services/pets/pets.service.js";
import type { AuthenticatedRequest } from "../../interface/authRequest.interface.js";
import { validateUser } from "../../utils/authorization.util.js";
import { AppError } from "../../types/appError.type.js";
import type { ApiResponse } from "../../types/apiResponse.type.js";

export class PetsController {
  private petsService: PetsService;

  constructor(petsService: PetsService) {
    this.petsService = petsService;
  }

  public async getPetStats(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const stats = await this.petsService.getPetStats(userId!);

    const response: ApiResponse = {
      success: true,
      code: "PET_STATS_RETRIEVED",
      message: "Pet stats retrieved successfully",
      data: stats
    };

    res.status(200).json(response);
  }

  public async createPet(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { name } = req.body || {};

    validateUser(userId, userRole, "student");

    if (!name || !name.trim()) {
      throw new AppError(400, "MISSING_NAME", "Pet name is required.", true);
    }

    const pet = await this.petsService.createPet(userId!, name.trim());

    const response: ApiResponse = {
      success: true,
      code: "PET_CREATED",
      message: "Pet created successfully",
      data: pet
    };

    res.status(201).json(response);
  }

  public async petThePet(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const pet = await this.petsService.petThePet(userId!);

    const response: ApiResponse = {
      success: true,
      code: "PET_PETTED",
      message: "Pet petted successfully",
      data: pet
    };

    res.status(200).json(response);
  }

  public async sleepPet(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const pet = await this.petsService.sleepPet(userId!);

    const response: ApiResponse = {
      success: true,
      code: "PET_SLEEPING",
      message: "Pet is now sleeping",
      data: pet
    };

    res.status(200).json(response);
  }

  public async wakePet(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const pet = await this.petsService.wakePet(userId!);

    const response: ApiResponse = {
      success: true,
      code: "PET_AWAKE",
      message: "Pet woke up successfully",
      data: pet
    };

    res.status(200).json(response);
  }

  public async completeBathMinigame(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const pet = await this.petsService.completeBathMinigame(userId!);

    const response: ApiResponse = {
      success: true,
      code: "BATH_COMPLETED",
      message: "Bath minigame completed successfully",
      data: pet
    };

    res.status(200).json(response);
  }

  public async completeBounceMinigame(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    validateUser(userId, userRole, "student");

    const pet = await this.petsService.completeBounceMinigame(userId!);

    const response: ApiResponse = {
      success: true,
      code: "BOUNCE_COMPLETED",
      message: "Bounce minigame completed successfully",
      data: pet
    };

    res.status(200).json(response);
  }

  public async updatePetName(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const { name } = req.body || {};

    validateUser(userId, userRole, "student");

    if (!name || !name.trim()) {
      throw new AppError(400, "MISSING_NAME", "Pet name is required.", true);
    }

    const pet = await this.petsService.updatePetName(userId!, name.trim());

    const response: ApiResponse = {
      success: true,
      code: "PET_NAME_UPDATED",
      message: "Pet name updated successfully",
      data: pet
    };

    res.status(200).json(response);
  }
}
