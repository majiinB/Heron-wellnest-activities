import type { DecorItemsRepository } from "../../repository/pets/decorItems.repository.js";
import type { DecorInventoryRepository } from "../../repository/pets/decorInventory.repository.js";
import type { PetsRepository } from "../../repository/pets/pets.repository.js";
import type { DecorItem } from "../../models/pets/decorItems.model.js";
import type { DecorInventory } from "../../models/pets/decorInventory.model.js";
import type { Pet } from "../../models/pets/pets.model.js";
import { AppError } from "../../types/appError.type.js";

export class DecorService {
  private decorItemsRepo: DecorItemsRepository;
  private decorInventoryRepo: DecorInventoryRepository;
  private petsRepo: PetsRepository;
  private readonly COIN_LIMIT = 9999;

  constructor(
    decorItemsRepo: DecorItemsRepository,
    decorInventoryRepo: DecorInventoryRepository,
    petsRepo: PetsRepository
  ) {
    this.decorItemsRepo = decorItemsRepo;
    this.decorInventoryRepo = decorInventoryRepo;
    this.petsRepo = petsRepo;
  }

  /**
   * Get all available decor items from the marketplace
   * @returns Array of all decor items
   */
  public async getAllDecorItems(): Promise<DecorItem[]> {
    return this.decorItemsRepo.getAllDecor();
  }

  /**
   * Get all decor items of a specific type from the marketplace
   * @param decor_type - The type of decor to filter by
   * @returns Array of matching decor items
   */
  public async getDecorByType(
    decor_type: "clock" | "chair" | "desk" | "wallpaper" | "tiles"
  ): Promise<DecorItem[]> {
    return this.decorItemsRepo.getDecorByType(decor_type);
  }

  /**
   * Purchase a decor item from the marketplace
   * @param owner_id - The UUID of the pet owner
   * @param decor_id - The UUID of the decor item to purchase
   * @returns The new inventory entry and updated pet
   * @throws AppError if insufficient coins, decor not found, or already owned
   */
  public async buyDecor(
    owner_id: string,
    decor_id: string
  ): Promise<{ inventory: DecorInventory; pet: Pet }> {
    // Get decor details
    const decor = await this.decorItemsRepo.getDecorById(decor_id);
    if (!decor) {
      throw new AppError(404, "DECOR_NOT_FOUND", "Decor item not found.", true);
    }

    // Get pet details
    const pet = await this.petsRepo.getPetByOwnerId(owner_id);
    if (!pet) {
      throw new AppError(404, "PET_NOT_FOUND", "Pet not found.", true);
    }

    // Check if owner already owns this decor
    const existing = await this.decorInventoryRepo.getInventoryByOwnerAndDecor(owner_id, decor);
    if (existing) {
      throw new AppError(409, "DECOR_ALREADY_OWNED", "You already own this decor item.", true);
    }

    // Check if pet has enough coins
    if (pet.pet_coin < decor.decor_price) {
      throw new AppError(
        400,
        "INSUFFICIENT_COINS",
        `Not enough coins. Need ${decor.decor_price} coins but have ${pet.pet_coin}.`,
        true
      );
    }

    // Deduct coins from pet
    const updatedPet = await this.petsRepo.updatePetStats(pet.pet_id, {
      pet_coin: pet.pet_coin - decor.decor_price,
      last_interaction_at: new Date(),
    });

    if (!updatedPet) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to update pet coins.", true);
    }

    // Add decor to inventory (unequipped by default)
    const inventory = await this.decorInventoryRepo.addDecorToInventory(owner_id, decor, false);

    return { inventory, pet: updatedPet };
  }

  /**
   * Get all decor items in owner's inventory
   * @param owner_id - The UUID of the pet owner
   * @returns Array of decor inventory items
   */
  public async getDecorInventory(owner_id: string): Promise<DecorInventory[]> {
    return this.decorInventoryRepo.getInventoryByOwnerId(owner_id);
  }

  /**
   * Get all currently equipped decor items for an owner
   * @param owner_id - The UUID of the pet owner
   * @returns Array of equipped decor inventory items
   */
  public async getEquippedDecor(owner_id: string): Promise<DecorInventory[]> {
    return this.decorInventoryRepo.getEquippedDecorByOwnerId(owner_id);
  }

  /**
   * Equip a decor item from the owner's inventory.
   * Only one decor of the same type can be equipped at a time —
   * any previously equipped item of the same type is unequipped first.
   * @param owner_id - The UUID of the pet owner
   * @param inventory_id - The UUID of the inventory entry to equip
   * @returns The updated inventory entry
   * @throws AppError if the inventory entry is not found or does not belong to the owner
   */
  public async equipDecor(
    owner_id: string,
    inventory_id: string
  ): Promise<DecorInventory> {
    const inventory = await this.decorInventoryRepo.getInventoryById(inventory_id);
    if (!inventory) {
      throw new AppError(404, "INVENTORY_NOT_FOUND", "Inventory item not found.", true);
    }

    if (inventory.owner_id !== owner_id) {
      throw new AppError(403, "FORBIDDEN", "You do not own this inventory item.", true);
    }

    if (inventory.is_equipped) {
      throw new AppError(400, "ALREADY_EQUIPPED", "This decor item is already equipped.", true);
    }

    // Unequip any currently equipped decor of the same type
    await this.decorInventoryRepo.unequipAllDecorByType(owner_id, inventory.decor_item.decor_type);

    const equipped = await this.decorInventoryRepo.equipDecor(inventory_id);
    if (!equipped) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to equip decor.", true);
    }

    return equipped;
  }

  /**
   * Unequip a decor item from the owner's inventory
   * @param owner_id - The UUID of the pet owner
   * @param inventory_id - The UUID of the inventory entry to unequip
   * @returns The updated inventory entry
   * @throws AppError if the inventory entry is not found or does not belong to the owner
   */
  public async unequipDecor(
    owner_id: string,
    inventory_id: string
  ): Promise<DecorInventory> {
    const inventory = await this.decorInventoryRepo.getInventoryById(inventory_id);
    if (!inventory) {
      throw new AppError(404, "INVENTORY_NOT_FOUND", "Inventory item not found.", true);
    }

    if (inventory.owner_id !== owner_id) {
      throw new AppError(403, "FORBIDDEN", "You do not own this inventory item.", true);
    }

    if (!inventory.is_equipped) {
      throw new AppError(400, "NOT_EQUIPPED", "This decor item is not currently equipped.", true);
    }

    const unequipped = await this.decorInventoryRepo.unequipDecor(inventory_id);
    if (!unequipped) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to unequip decor.", true);
    }

    return unequipped;
  }

  /**
   * Remove a decor item from the owner's inventory
   * @param owner_id - The UUID of the pet owner
   * @param inventory_id - The UUID of the inventory entry to remove
   * @throws AppError if the inventory entry is not found or does not belong to the owner
   */
  public async removeDecorFromInventory(
    owner_id: string,
    inventory_id: string
  ): Promise<void> {
    const inventory = await this.decorInventoryRepo.getInventoryById(inventory_id);
    if (!inventory) {
      throw new AppError(404, "INVENTORY_NOT_FOUND", "Inventory item not found.", true);
    }

    if (inventory.owner_id !== owner_id) {
      throw new AppError(403, "FORBIDDEN", "You do not own this inventory item.", true);
    }

    await this.decorInventoryRepo.deleteInventoryItem(inventory_id);
  }
}
