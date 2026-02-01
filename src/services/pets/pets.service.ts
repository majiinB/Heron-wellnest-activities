import type { PetsRepository } from "../../repository/pets/pets.repository.js";
import type { Pet } from "../../models/pets/pets.model.js";
import { AppError } from "../../types/appError.type.js";

export class PetsService {
  private petsRepo: PetsRepository;
  private readonly COIN_LIMIT=9999;
  private readonly ENERGY_LIMIT=100;
  private readonly HUNGER_LIMIT=100;
  private readonly CLEANLINESS_LIMIT=100;
  private readonly HAPPINESS_LIMIT=100;
  private readonly MAX_LEVEL=50;
  private readonly BASE_EXP_PER_LEVEL=100; // Base XP needed for level 2

  constructor(petsRepo: PetsRepository) {
    this.petsRepo = petsRepo;
  }

  /**
   * Calculate required XP for a specific level
   * Uses scaling formula: level * BASE_EXP * 1.5
   * @param level - Target level
   * @returns Required total XP to reach that level
   */
  private calculateRequiredXP(level: number): number {
    if (level <= 1) return 0;
    
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      // Each level requires more XP than the previous
      totalXP += Math.floor(this.BASE_EXP_PER_LEVEL * i * 1.5);
    }
    return totalXP;
  }

  /**
   * Calculate current level and age stage from total experience
   * @param experience - Total experience points
   * @returns Object with level and age_stage
   */
  private calculateLevelFromXP(experience: number): { level: number; age_stage: "infant" | "teen" | "adult" } {
    let level = 1;
    
    // Find highest level the pet has reached
    for (let i = 2; i <= this.MAX_LEVEL; i++) {
      const requiredXP = this.calculateRequiredXP(i);
      if (experience >= requiredXP) {
        level = i;
      } else {
        break;
      }
    }

    // Determine age stage based on level
    let age_stage: "infant" | "teen" | "adult";
    if (level <= 15) {
      age_stage = "infant";
    } else if (level <= 35) {
      age_stage = "teen";
    } else {
      age_stage = "adult";
    }

    return { level, age_stage };
  }

  /**
   * Update pet level based on current experience
   * Should be called after any XP gain
   * @param pet - Pet object to update
   * @returns Updated pet or null if update fails
   */
  public async updatePetLevel(pet: Pet): Promise<Pet | null> {
    const { level, age_stage } = this.calculateLevelFromXP(pet.experience);

    // Only update if level or age_stage changed
    if (level === pet.level && age_stage === pet.age_stage) {
      return pet;
    }

    return this.petsRepo.updatePetStats(pet.pet_id, {
      level,
      age_stage,
    });
  }

  /**
   * Get pet details by owner ID
   * Creates a new pet with default name "Heron" if owner doesn't have one
   * @param owner_id - The UUID of the pet owner
   * @returns Pet object
   */
  public async getPetByOwnerId(owner_id: string): Promise<Pet> {
    let pet = await this.petsRepo.getPetByOwnerId(owner_id);

    // If no pet exists, create one automatically
    if (!pet) {
      pet = await this.petsRepo.createPet(owner_id, "Heron", "heron");
    }

    return pet;
  }

  /**
   * Create a new pet for an owner with custom name
   * @param owner_id - The UUID of the pet owner
   * @param name - The name of the pet
   * @returns Newly created Pet object
   * @throws AppError if owner already has a pet
   */
  public async createPet(owner_id: string, name: string): Promise<Pet> {
    const existingPet = await this.petsRepo.getPetByOwnerId(owner_id);
    
    if (existingPet) {
      throw new AppError(400, "PET_EXISTS", "Owner already has a pet.", true);
    }

    return this.petsRepo.createPet(owner_id, name, "heron");
  }

  /**
   * Update/rename pet
   * @param owner_id - The UUID of the pet owner
   * @param name - The new name for the pet
   * @returns Updated Pet object
   * @throws AppError if pet not found or name is invalid
   */
  public async updatePetName(owner_id: string, name: string): Promise<Pet> {
    const pet = await this.petsRepo.getPetByOwnerId(owner_id);
    
    if (!pet) {
      throw new AppError(404, "PET_NOT_FOUND", "Pet not found.", true);
    }

    const updatedPet = await this.petsRepo.updatePetStats(pet.pet_id, {
      name: name,
      last_interaction_at: new Date(),
    });

    if (!updatedPet) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to update pet name.", true);
    }

    return updatedPet;
  }

  /**
   * Pet/tap the pet to gain 1 coin
   * @param owner_id - The UUID of the pet owner
   * @returns Updated Pet object
   * @throws AppError if pet is sleeping
   */
  public async petThePet(owner_id: string): Promise<Pet> {
    const pet = await this.getPetByOwnerId(owner_id);

    // Check if pet is sleeping
    const now = Date.now();
    if (pet.sleep_until !== null && now < pet.sleep_until.getTime()) {
      throw new AppError(400, "PET_SLEEPING", "Pet is currently sleeping.", true);
    }

    // Add 1 coin, add 1 happiness, decrease energy and update last interaction timestamp
    const updatedPet = await this.petsRepo.updatePetStats(pet.pet_id, {
      pet_coin: Math.min(pet.pet_coin + 1, this.COIN_LIMIT),
      pet_happiness: Math.min(pet.pet_happiness + 1, this.HAPPINESS_LIMIT),
      pet_energy: Math.max(pet.pet_energy - 1, 0),
      last_interaction_at: new Date(),
    });

    if (!updatedPet) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to update pet.", true);
    }

    return updatedPet;
  }

  /**
   * Put pet to sleep for 1 hour
   * @param owner_id - The UUID of the pet owner
   * @returns Updated Pet object
   * @throws AppError if pet is already sleeping
   */
  public async sleepPet(owner_id: string): Promise<Pet> {
    const pet = await this.getPetByOwnerId(owner_id);

    // Check if pet is already sleeping
    const now = new Date();
    if (pet.sleep_until !== null && now < pet.sleep_until) {
      throw new AppError(400, "PET_ALREADY_SLEEPING", "Pet is already sleeping.", true);
    }

    // Set sleep_until to 1 hour from now
    const sleepUntil = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour in milliseconds

    const updatedPet = await this.petsRepo.updatePetStats(pet.pet_id, {
      sleep_until: sleepUntil,
      pet_mood: "sleepy",
      last_interaction_at: new Date(),
    });

    if (!updatedPet) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to update pet.", true);
    }

    return updatedPet;
  }

  /**
   * Wake pet up from sleep
   * Awards 5 coins and restores energy to full
   * @param owner_id - The UUID of the pet owner
   * @returns Updated Pet object
   * @throws AppError if pet is not sleeping or sleep duration not completed
   */
  public async wakePet(owner_id: string): Promise<Pet> {
    const pet = await this.getPetByOwnerId(owner_id);

    // Check if pet is sleeping
    if (pet.sleep_until === null) {
      throw new AppError(400, "PET_NOT_SLEEPING", "Pet is not sleeping.", true);
    }

    // Check if sleep duration is completed (1 hour)
    const now = new Date();
    if (now < pet.sleep_until) {
      const remainingTime = Math.ceil((pet.sleep_until.getTime() - now.getTime()) / 1000 / 60);
      throw new AppError(
        400, 
        "SLEEP_NOT_COMPLETED", 
        `Pet needs to sleep for ${remainingTime} more minute(s).`, 
        true
      );
    }

    // Wake pet: clear sleep_until, restore energy, add 5 coins, change mood, make the pet hungry, make pet a bit dirty, update last interaction timestamp
    const updatedPet = await this.petsRepo.updatePetStats(pet.pet_id, {
      sleep_until: null,
      pet_energy: this.ENERGY_LIMIT,
      pet_coin: Math.min(pet.pet_coin + 5, this.COIN_LIMIT),
      pet_hunger: Math.max(pet.pet_hunger - 20, 0),
      pet_mood: pet.pet_hunger <= 10 ? "sad" : "excited",
      pet_cleanliness: Math.max(pet.pet_cleanliness - 10, 0),
      last_interaction_at: new Date(),
    });

    if (!updatedPet) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to update pet.", true);
    }

    return updatedPet;
  }

  /**
   * Complete bath minigame
   * Awards 8 coins and sets cleanliness to 100%
   * @param owner_id - The UUID of the pet owner
   * @returns Updated Pet object
   * @throws AppError if pet is sleeping
   */
  public async completeBathMinigame(owner_id: string): Promise<Pet> {
    const pet = await this.getPetByOwnerId(owner_id);

    // Check if pet is sleeping
    const now = Date.now();
    if (pet.sleep_until !== null && now < pet.sleep_until.getTime()) {
      throw new AppError(400, "PET_SLEEPING", "Pet is currently sleeping.", true);
    }

    // Check if pet has enough energy to take a bath
    if (pet.pet_energy < 10) {
      throw new AppError(400, "INSUFFICIENT_ENERGY", "Pet does not have enough energy to take a bath.", true);
    }

    // Set cleanliness to 100, add 8 coins (BA rules), decrease energy
    const updatedPet = await this.petsRepo.updatePetStats(pet.pet_id, {
      pet_cleanliness: this.CLEANLINESS_LIMIT,
      pet_coin: Math.min(pet.pet_coin + 8, this.COIN_LIMIT),
      pet_energy: Math.max(pet.pet_energy - 10, 0),
      last_interaction_at: new Date(),
    });

    if (!updatedPet) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to update pet.", true);
    }

    return updatedPet;
  }

  /**
   * Complete bounce/couch minigame
   * Awards 10 coins and increases happiness
   * @param owner_id - The UUID of the pet owner
   * @returns Updated Pet object
   * @throws AppError if pet is sleeping
   */
  public async completeBounceMinigame(owner_id: string): Promise<Pet> {
    const pet = await this.getPetByOwnerId(owner_id);

    // Check if pet is sleeping
    const now = Date.now();
    if (pet.sleep_until !== null && now < pet.sleep_until.getTime()) {
      throw new AppError(400, "PET_SLEEPING", "Pet is currently sleeping.", true);
    }

    // Check if pet has enough energy to play
    if (pet.pet_energy < 15) {
      throw new AppError(400, "INSUFFICIENT_ENERGY", "Pet does not have enough energy to play.", true);
    }

    // Add 10 coins, increase happiness, decrease energy
    const updatedPet = await this.petsRepo.updatePetStats(pet.pet_id, {
      pet_coin: Math.min(pet.pet_coin + 10, this.COIN_LIMIT),
      pet_happiness: Math.min(pet.pet_happiness + 15, this.HAPPINESS_LIMIT),
      pet_energy: Math.max(pet.pet_energy - 15, 0),
      pet_cleanliness: Math.max(pet.pet_cleanliness - 5, 0),
      last_interaction_at: new Date(),
    });

    if (!updatedPet) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to update pet.", true);
    }

    return updatedPet;
  }

  /**
   * Get comprehensive pet stats including sleep status
   * @param owner_id - The UUID of the pet owner
   * @returns Pet stats with sleep information and percentages
   */
  public async getPetStats(owner_id: string): Promise<{
    pet: Pet;
    level: number;
    coins: number;
    stats: {
      hunger: { value: number; percentage: number };
      energy: { value: number; percentage: number };
      cleanliness: { value: number; percentage: number };
      happiness: { value: number; percentage: number };
      experience: { value: number; percentage: number; nextLevelXP: number };
    };
    isSleeping: boolean;
    sleepRemainingMinutes: number | null;
    canWakeUp: boolean;
  }> {
    const pet = await this.getPetByOwnerId(owner_id);

    const now = new Date();
    const isSleeping = pet.sleep_until !== null && now < pet.sleep_until;
    const canWakeUp = pet.sleep_until !== null && now >= pet.sleep_until;
    
    let sleepRemainingMinutes: number | null = null;
    if (isSleeping && pet.sleep_until) {
      sleepRemainingMinutes = Math.ceil((pet.sleep_until.getTime() - now.getTime()) / 1000 / 60);
    }

    // Calculate experience percentage (progress to next level)
    const currentLevelXP = this.calculateRequiredXP(pet.level);
    const nextLevelXP = this.calculateRequiredXP(pet.level + 1);
    const xpInCurrentLevel = pet.experience - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
    const experiencePercentage = pet.level >= this.MAX_LEVEL 
      ? 100 
      : Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));

    return {
      pet,
      level: pet.level,
      coins: pet.pet_coin,
      stats: {
        hunger: {
          value: pet.pet_hunger,
          percentage: Math.floor((pet.pet_hunger / this.HUNGER_LIMIT) * 100),
        },
        energy: {
          value: pet.pet_energy,
          percentage: Math.floor((pet.pet_energy / this.ENERGY_LIMIT) * 100),
        },
        cleanliness: {
          value: pet.pet_cleanliness,
          percentage: Math.floor((pet.pet_cleanliness / this.CLEANLINESS_LIMIT) * 100),
        },
        happiness: {
          value: pet.pet_happiness,
          percentage: Math.floor((pet.pet_happiness / this.HAPPINESS_LIMIT) * 100),
        },
        experience: {
          value: pet.experience,
          percentage: experiencePercentage,
          nextLevelXP: pet.level >= this.MAX_LEVEL ? nextLevelXP : nextLevelXP,
        },
      },
      isSleeping,
      sleepRemainingMinutes,
      canWakeUp,
    };
  }
}
