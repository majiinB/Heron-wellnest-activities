import { type Repository } from "typeorm";
import { AppDataSource } from "../../config/datasource.config.js";
import { PetInteraction } from "../../models/pets/petsInteractions.model.js";

export class PetInteractionsRepository {
  private repo: Repository<PetInteraction>;

  constructor() {
    this.repo = AppDataSource.getRepository(PetInteraction);
  }

  public async createInteraction(
    pet_id: string,
    interaction_type: "feed" | "clean" | "play" | "pet" | "sleep"
  ): Promise<PetInteraction> {
    const interaction = this.repo.create({
      pet_id,
      interaction_type,
    });
    return this.repo.save(interaction);
  }

  public async getInteractionById(interaction_id: string): Promise<PetInteraction | null> {
    return this.repo.findOne({
      where: {
        interaction_id,
      },
    });
  }

  public async getInteractionsByPetId(pet_id: string): Promise<PetInteraction[]> {
    return this.repo.find({
      where: {
        pet_id,
      },
      order: {
        timestamp: "DESC",
      },
    });
  }

  public async getRecentInteractionsByPetId(
    pet_id: string,
    limit: number = 10
  ): Promise<PetInteraction[]> {
    return this.repo.find({
      where: {
        pet_id,
      },
      order: {
        timestamp: "DESC",
      },
      take: limit,
    });
  }

  public async getInteractionsByType(
    pet_id: string,
    interaction_type: "feed" | "clean" | "play" | "pet" | "sleep"
  ): Promise<PetInteraction[]> {
    return this.repo.find({
      where: {
        pet_id,
        interaction_type,
      },
      order: {
        timestamp: "DESC",
      },
    });
  }

  public async deleteInteraction(interaction_id: string): Promise<void> {
    await this.repo.delete({ interaction_id });
  }

  public async deleteInteractionsByPetId(pet_id: string): Promise<void> {
    await this.repo.delete({ pet_id });
  }
}
