import { type Repository } from "typeorm";
import { AppDataSource } from "../../config/datasource.config.js";
import { DecorInventory } from "../../models/pets/decorInventory.model.js";
import { DecorItem } from "../../models/pets/decorItems.model.js";

export class DecorInventoryRepository {
  private repo: Repository<DecorInventory>;

  constructor() {
    this.repo = AppDataSource.getRepository(DecorInventory);
  }

  public async addDecorToInventory(
    owner_id: string,
    decor_id: DecorItem,
    is_equipped: boolean = false
  ): Promise<DecorInventory> {
    const inventory = this.repo.create({
      owner_id,
      decor_id,
      is_equipped,
    });
    return this.repo.save(inventory);
  }

  public async getInventoryById(inventory_id: string): Promise<DecorInventory | null> {
    return this.repo.findOne({
      where: {
        inventory_id,
      },
      relations: ["decor_id"],
    });
  }

  public async getInventoryByOwnerAndDecor(
    owner_id: string,
    decor_id: DecorItem
  ): Promise<DecorInventory | null> {
    return this.repo.findOne({
      where: {
        owner_id,
        decor_id,
      },
      relations: ["decor_id"],
    });
  }

  public async getInventoryByOwnerId(owner_id: string): Promise<DecorInventory[]> {
    return this.repo.find({
      where: {
        owner_id,
      },
      relations: ["decor_id"],
      order: {
        acquired_at: "DESC",
      },
    });
  }

  public async getEquippedDecorByOwnerId(owner_id: string): Promise<DecorInventory[]> {
    return this.repo.find({
      where: {
        owner_id,
        is_equipped: true,
      },
      relations: ["decor_id"],
    });
  }

  public async updateInventory(inventory: DecorInventory): Promise<DecorInventory> {
    return this.repo.save(inventory);
  }

  public async equipDecor(inventory_id: string): Promise<DecorInventory | null> {
    const inventory = await this.getInventoryById(inventory_id);
    if (!inventory) {
      return null;
    }

    inventory.is_equipped = true;
    return this.repo.save(inventory);
  }

  public async unequipDecor(inventory_id: string): Promise<DecorInventory | null> {
    const inventory = await this.getInventoryById(inventory_id);
    if (!inventory) {
      return null;
    }

    inventory.is_equipped = false;
    return this.repo.save(inventory);
  }

  public async unequipAllDecorByType(
    owner_id: string,
    decor_type: "clock" | "chair" | "desk" | "wallpaper" | "tiles"
  ): Promise<void> {
    const inventory = await this.repo.find({
      where: {
        owner_id,
        is_equipped: true,
      },
      relations: ["decor_id"],
    });

    for (const item of inventory) {
      if (item.decor_id.decor_type === decor_type) {
        item.is_equipped = false;
        await this.repo.save(item);
      }
    }
  }

  public async deleteInventoryItem(inventory_id: string): Promise<void> {
    await this.repo.delete({ inventory_id });
  }

  public async deleteInventoryByOwnerId(owner_id: string): Promise<void> {
    await this.repo.delete({ owner_id });
  }
}
