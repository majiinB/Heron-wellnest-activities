import { type Repository } from "typeorm";
import { AppDataSource } from "../../config/datasource.config.js";
import { FoodInventory } from "../../models/pets/foodInventory.model.js";
import { PetFood } from "../../models/pets/petFood.model.js";

export class FoodInventoryRepository {
  private repo: Repository<FoodInventory>;

  constructor() {
    this.repo = AppDataSource.getRepository(FoodInventory);
  }

  public async addFoodToInventory(
    owner_id: string,
    food_id: PetFood,
    quantity: number = 1
  ): Promise<FoodInventory> {
    const inventory = this.repo.create({
      owner_id,
      food_id,
      quantity,
    });
    return this.repo.save(inventory);
  }

  public async getInventoryById(inventory_id: string): Promise<FoodInventory | null> {
    return this.repo.findOne({
      where: {
        inventory_id,
      },
      relations: ["food_id"],
    });
  }

  public async getInventoryByOwnerAndFood(
    owner_id: string,
    food_id: PetFood
  ): Promise<FoodInventory | null> {
    return this.repo.findOne({
      where: {
        owner_id,
        food_id,
      },
      relations: ["food_id"],
    });
  }

  public async getInventoryByOwnerId(owner_id: string): Promise<FoodInventory[]> {
    return this.repo.find({
      where: {
        owner_id,
      },
      relations: ["food_id"],
      order: {
        acquired_at: "DESC",
      },
    });
  }

  public async updateInventory(inventory: FoodInventory): Promise<FoodInventory> {
    return this.repo.save(inventory);
  }

  public async updateQuantity(
    inventory_id: string,
    quantity: number
  ): Promise<FoodInventory | null> {
    const inventory = await this.getInventoryById(inventory_id);
    if (!inventory) {
      return null;
    }

    inventory.quantity = quantity;
    return this.repo.save(inventory);
  }

  public async incrementQuantity(
    owner_id: string,
    food_id: PetFood,
    amount: number = 1
  ): Promise<FoodInventory | null> {
    const inventory = await this.getInventoryByOwnerAndFood(owner_id, food_id);
    if (!inventory) {
      return null;
    }

    inventory.quantity += amount;
    return this.repo.save(inventory);
  }

  public async decrementQuantity(
    owner_id: string,
    food_id: PetFood,
    amount: number = 1
  ): Promise<FoodInventory | null> {
    const inventory = await this.getInventoryByOwnerAndFood(owner_id, food_id);
    if (!inventory) {
      return null;
    }

    inventory.quantity = Math.max(0, inventory.quantity - amount);
    return this.repo.save(inventory);
  }

  public async deleteInventoryItem(inventory_id: string): Promise<void> {
    await this.repo.delete({ inventory_id });
  }

  public async deleteInventoryByOwnerId(owner_id: string): Promise<void> {
    await this.repo.delete({ owner_id });
  }
}
