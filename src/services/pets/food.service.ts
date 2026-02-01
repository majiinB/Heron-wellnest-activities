import type { PetFoodRepository } from "../../repository/pets/petFood.repsository.js";
import type { FoodInventoryRepository } from "../../repository/pets/foodInventory.repository.js";
import type { PetsRepository } from "../../repository/pets/pets.repository.js";
import type { PetFood } from "../../models/pets/petFood.model.js";
import type { FoodInventory } from "../../models/pets/foodInventory.model.js";
import type { Pet } from "../../models/pets/pets.model.js";
import { AppError } from "../../types/appError.type.js";
import { PetsService } from "./pets.service.js";

export class FoodService {
  private petFoodRepo: PetFoodRepository;
  private foodInventoryRepo: FoodInventoryRepository;
  private petsRepo: PetsRepository;
  private petsService: PetsService;
  private readonly COIN_LIMIT = 9999;
  private readonly HUNGER_LIMIT = 100;

  constructor(
    petFoodRepo: PetFoodRepository,
    foodInventoryRepo: FoodInventoryRepository,
    petsRepo: PetsRepository,
    petsService: PetsService
  ) {
    this.petFoodRepo = petFoodRepo;
    this.foodInventoryRepo = foodInventoryRepo;
    this.petsRepo = petsRepo;
    this.petsService = petsService;
  }

  /**
   * Get all available food items from the marketplace
   * @returns Array of all food items
   */
  public async getAllFoodItems(): Promise<PetFood[]> {
    return this.petFoodRepo.getAllFood();
  }

  /**
   * Purchase food from the marketplace
   * @param owner_id - The UUID of the pet owner
   * @param food_id - The UUID of the food item to purchase
   * @param quantity - Number of items to purchase (default: 1)
   * @returns Updated food inventory and pet
   * @throws AppError if insufficient coins or food not found
   */
  public async buyFood(
    owner_id: string,
    food_id: string,
    quantity: number = 1
  ): Promise<{ inventory: FoodInventory; pet: Pet }> {
    // Validate quantity
    if (quantity <= 0) {
      throw new AppError(400, "INVALID_QUANTITY", "Quantity must be greater than 0.", true);
    }

    // Get food details
    const food = await this.petFoodRepo.getFoodById(food_id);
    if (!food) {
      throw new AppError(404, "FOOD_NOT_FOUND", "Food item not found.", true);
    }

    // Get pet details
    const pet = await this.petsRepo.getPetByOwnerId(owner_id);
    if (!pet) {
      throw new AppError(404, "PET_NOT_FOUND", "Pet not found.", true);
    }

    // Calculate total cost
    const totalCost = food.food_price * quantity;

    // Check if pet has enough coins
    if (pet.pet_coin < totalCost) {
      throw new AppError(
        400,
        "INSUFFICIENT_COINS",
        `Not enough coins. Need ${totalCost} coins but have ${pet.pet_coin}.`,
        true
      );
    }

    // Deduct coins from pet
    const updatedPet = await this.petsRepo.updatePetStats(pet.pet_id, {
      pet_coin: pet.pet_coin - totalCost,
      last_interaction_at: new Date(),
    });

    if (!updatedPet) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to update pet coins.", true);
    }

    // Check if food already exists in inventory
    const existingInventory = await this.foodInventoryRepo.getInventoryByOwnerAndFood(
      owner_id,
      food
    );

    let inventory: FoodInventory;

    if (existingInventory) {
      // Increment existing quantity
      const updated = await this.foodInventoryRepo.updateQuantity(
        existingInventory.inventory_id,
        existingInventory.quantity + quantity
      );
      if (!updated) {
        throw new AppError(500, "UPDATE_FAILED", "Failed to update inventory.", true);
      }
      inventory = updated;
    } else {
      // Create new inventory record
      inventory = await this.foodInventoryRepo.addFoodToInventory(owner_id, food, quantity);
    }

    return { inventory, pet: updatedPet };
  }

  /**
   * Get all food items in owner's inventory
   * @param owner_id - The UUID of the pet owner
   * @returns Array of food inventory items
   */
  public async getFoodInventory(owner_id: string): Promise<FoodInventory[]> {
    return this.foodInventoryRepo.getInventoryByOwnerId(owner_id);
  }

  /**
   * Feed pet with food from inventory
   * Awards 2 coins per BA rules
   * @param owner_id - The UUID of the pet owner
   * @param food_id - The UUID of the food item to use
   * @returns Updated pet and inventory
   * @throws AppError if pet is sleeping, food not in inventory, or insufficient quantity
   */
  public async feedPet(
    owner_id: string,
    food_id: string
  ): Promise<{ pet: Pet; inventory: FoodInventory | null }> {
    // Get pet details
    const pet = await this.petsRepo.getPetByOwnerId(owner_id);
    if (!pet) {
      throw new AppError(404, "PET_NOT_FOUND", "Pet not found.", true);
    }

    // Check if pet is sleeping
    const now = Date.now();
    if (pet.sleep_until !== null && now < pet.sleep_until.getTime()) {
      throw new AppError(400, "PET_SLEEPING", "Pet is currently sleeping.", true);
    }

    // Get food details
    const food = await this.petFoodRepo.getFoodById(food_id);
    if (!food) {
      throw new AppError(404, "FOOD_NOT_FOUND", "Food item not found.", true);
    }

    // Get food from inventory
    const inventory = await this.foodInventoryRepo.getInventoryByOwnerAndFood(owner_id, food);
    if (!inventory) {
      throw new AppError(404, "FOOD_NOT_IN_INVENTORY", "Food not found in inventory.", true);
    }

    // Check if inventory has food
    if (inventory.quantity <= 0) {
      throw new AppError(400, "INSUFFICIENT_QUANTITY", "No food items left in inventory.", true);
    }

    // Calculate new hunger (cap at 100)
    const newHunger = Math.min(pet.pet_hunger + food.hunger_fill_amount, this.HUNGER_LIMIT);

    // Update pet stats: increase hunger, add XP, award 2 coins (BA rules)
    const updatedPet = await this.petsRepo.updatePetStats(pet.pet_id, {
      pet_hunger: newHunger,
      experience: pet.experience + food.xp_gain,
      pet_coin: Math.min(pet.pet_coin + 2, this.COIN_LIMIT),
      last_interaction_at: new Date(),
    });

    if (!updatedPet) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to update pet.", true);
    }

    // Check and update level based on new XP
    const leveledUpPet = await this.petsService.updatePetLevel(updatedPet);
    if (!leveledUpPet) {
      throw new AppError(500, "LEVEL_UPDATE_FAILED", "Failed to update pet level.", true);
    }

    // Decrement food quantity
    const newQuantity = inventory.quantity - 1;
    let updatedInventory: FoodInventory | null = null;

    if (newQuantity > 0) {
      // Update quantity
      updatedInventory = await this.foodInventoryRepo.updateQuantity(
        inventory.inventory_id,
        newQuantity
      );
    } else {
      // Delete inventory item if quantity reaches 0
      await this.foodInventoryRepo.deleteInventoryItem(inventory.inventory_id);
    }

    return { pet: leveledUpPet, inventory: updatedInventory };
  }
}
