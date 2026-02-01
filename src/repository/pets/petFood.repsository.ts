import { type Repository } from "typeorm";
import { AppDataSource } from "../../config/datasource.config.js";
import { PetFood } from "../../models/pets/petFood.model.js";

export class PetFoodRepository {
  private repo: Repository<PetFood>;

  constructor() {
    this.repo = AppDataSource.getRepository(PetFood);
  }

  public async createFood(
    food_name: string,
    xp_gain: number,
    hunger_fill_amount: number,
    food_price: number,
    food_image_url: string,
    food_description: string | null = null
  ): Promise<PetFood> {
    const food = this.repo.create({
      food_name,
      xp_gain,
      hunger_fill_amount,
      food_price,
      food_image_url,
      food_description,
    });
    return this.repo.save(food);
  }

  public async getFoodById(food_id: string): Promise<PetFood | null> {
    return this.repo.findOne({
      where: {
        food_id,
      },
    });
  }

  public async getFoodByName(food_name: string): Promise<PetFood | null> {
    return this.repo.findOne({
      where: {
        food_name,
      },
    });
  }

  public async getAllFood(): Promise<PetFood[]> {
    return this.repo.find({
      order: {
        food_price: "ASC",
      },
    });
  }

  public async updateFood(food: PetFood): Promise<PetFood> {
    return this.repo.save(food);
  }

  public async deleteFood(food_id: string): Promise<void> {
    await this.repo.delete({ food_id });
  }
}
