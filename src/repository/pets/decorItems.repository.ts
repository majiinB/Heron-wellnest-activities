import { type Repository } from "typeorm";
import { AppDataSource } from "../../config/datasource.config.js";
import { DecorItem } from "../../models/pets/decorItems.model.js";

export class DecorItemsRepository {
  private repo: Repository<DecorItem>;

  constructor() {
    this.repo = AppDataSource.getRepository(DecorItem);
  }

  public async createDecorItem(
    decor_name: string,
    decor_type: "clock" | "chair" | "desk" | "wallpaper" | "tiles",
    decor_image_url: string,
    decor_price: number,
    decor_description: string | null = null
  ): Promise<DecorItem> {
    const decor = this.repo.create({
      decor_name,
      decor_type,
      decor_image_url,
      decor_price,
      decor_description,
    });
    return this.repo.save(decor);
  }

  public async getDecorById(decor_id: string): Promise<DecorItem | null> {
    return this.repo.findOne({
      where: {
        decor_id,
      },
    });
  }

  public async getDecorByName(decor_name: string): Promise<DecorItem | null> {
    return this.repo.findOne({
      where: {
        decor_name,
      },
    });
  }

  public async getAllDecor(): Promise<DecorItem[]> {
    return this.repo.find({
      order: {
        decor_price: "ASC",
      },
    });
  }

  public async getDecorByType(
    decor_type: "clock" | "chair" | "desk" | "wallpaper" | "tiles"
  ): Promise<DecorItem[]> {
    return this.repo.find({
      where: {
        decor_type,
      },
      order: {
        decor_price: "ASC",
      },
    });
  }

  public async updateDecor(decor: DecorItem): Promise<DecorItem> {
    return this.repo.save(decor);
  }

  public async deleteDecor(decor_id: string): Promise<void> {
    await this.repo.delete({ decor_id });
  }
}
