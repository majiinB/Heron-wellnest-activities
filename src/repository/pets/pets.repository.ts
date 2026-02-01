import { type Repository } from "typeorm";
import { AppDataSource } from "../../config/datasource.config.js";
import { Pet } from "../../models/pets/pets.model.js";

export class PetsRepository {
  private repo: Repository<Pet>;

  constructor() {
    this.repo = AppDataSource.getRepository(Pet);
  }

  public async createPet(
    owner_id: string,
    name: string,
    species: string = "heron"
  ): Promise<Pet> {
    const pet = this.repo.create({
      owner_id,
      name,
      species,
    });
    return this.repo.save(pet);
  }

  public async getPetByOwnerId(owner_id: string): Promise<Pet | null> {
    return this.repo.findOne({
      where: {
        owner_id,
      },
    });
  }

  public async getPetById(pet_id: string): Promise<Pet | null> {
    return this.repo.findOne({
      where: {
        pet_id,
      },
    });
  }

  public async updatePet(pet: Pet): Promise<Pet> {
    return this.repo.save(pet);
  }

  public async updatePetStats(
    pet_id: string,
    updates: {
      pet_energy?: number;
      pet_hunger?: number;
      pet_cleanliness?: number;
      pet_happiness?: number;
      pet_mood?: string;
      pet_coin?: number;
      experience?: number;
      level?: number;
      age_stage?: string;
      last_interaction_at?: Date;
      sleep_until?: Date | null;
    }
  ): Promise<Pet | null> {
    const pet = await this.getPetById(pet_id);
    if (!pet) {
      return null;
    }

    Object.assign(pet, updates);
    return this.repo.save(pet);
  }

  public async checkIfOwnerHasPet(owner_id: string): Promise<boolean> {
    const pet = await this.getPetByOwnerId(owner_id);
    return pet !== null;
  }

  public async deletePet(pet_id: string): Promise<void> {
    await this.repo.delete({ pet_id });
  }
}
