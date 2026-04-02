import { AppError } from "../../types/appError.type.js";
import { DailyQuestsRepository } from "../../repository/quests/dailyQuests.repository.js";
import { UserQuestsRepository } from "../../repository/quests/userQuests.repository.js";
import { QuestDefinitionsRepository } from "../../repository/quests/questDefinitions.repository.js";
import { PetsRepository } from "../../repository/pets/pets.repository.js";
import { PetsService } from "../pets/pets.service.js";
import type { UserQuest } from "../../models/quests/userQuests.model.js";
import type { DailyQuest } from "../../models/quests/dailyQuests.model.js";
import { FoodInventoryRepository } from "../../repository/pets/foodInventory.repository.js";
import { PetFoodRepository } from "../../repository/pets/petFood.repsository.js";

export class QuestsService {
  private dailyQuestsRepo: DailyQuestsRepository;
  private userQuestsRepo: UserQuestsRepository;
  private questDefinitionsRepo: QuestDefinitionsRepository;
  private petsRepo: PetsRepository;
  private petsService: PetsService;
  private foodInventoryRepo: FoodInventoryRepository;
  private petFoodRepo: PetFoodRepository;
  private readonly COIN_LIMIT=9999;
  private readonly HUNGER_LIMIT=100;

  constructor(
    dailyQuestsRepo: DailyQuestsRepository,
    userQuestsRepo: UserQuestsRepository,
    questDefinitionsRepo: QuestDefinitionsRepository,
    petsRepo: PetsRepository,
    petsService: PetsService,
    foodInventoryRepo: FoodInventoryRepository,
    petFoodRepo: PetFoodRepository
  ) {
    this.dailyQuestsRepo = dailyQuestsRepo;
    this.userQuestsRepo = userQuestsRepo;
    this.questDefinitionsRepo = questDefinitionsRepo;
    this.petsRepo = petsRepo;
    this.petsService = petsService;
    this.foodInventoryRepo = foodInventoryRepo;
    this.petFoodRepo = petFoodRepo;
  }

  /**
   * Check if a date is today (same calendar day in local time)
   * @param date - Date to check
   * @returns True if the date is today
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    const checkDate = new Date(date);
    
    return (
      checkDate.getFullYear() === today.getFullYear() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getDate() === today.getDate()
    );
  }

  private getDailyQuestId(userQuest: UserQuest): string {
    return typeof userQuest.daily_quest_id === "object" && userQuest.daily_quest_id !== null
      ? userQuest.daily_quest_id.daily_quest_id
      : (userQuest.daily_quest_id as unknown as string);
  }

  private getQuestStatusPriority(status: string): number {
    const statusPriority: Record<string, number> = {
      pending: 0,
      expired: 1,
      complete: 2,
      claimed: 3,
    };

    return statusPriority[status] ?? -1;
  }

  private shouldReplaceQuest(existingQuest: UserQuest, candidateQuest: UserQuest): boolean {
    const existingPriority = this.getQuestStatusPriority(existingQuest.status);
    const candidatePriority = this.getQuestStatusPriority(candidateQuest.status);

    if (candidatePriority !== existingPriority) {
      return candidatePriority > existingPriority;
    }

    return candidateQuest.created_at > existingQuest.created_at;
  }

  private deduplicateUserQuests(userQuests: UserQuest[]): Map<string, UserQuest> {
    const deduplicatedMap = new Map<string, UserQuest>();

    for (const userQuest of userQuests) {
      const dailyQuestId = this.getDailyQuestId(userQuest);
      const existingQuest = deduplicatedMap.get(dailyQuestId);

      if (!existingQuest || this.shouldReplaceQuest(existingQuest, userQuest)) {
        deduplicatedMap.set(dailyQuestId, userQuest);
      }
    }

    return deduplicatedMap;
  }

  /**
   * Get today's daily quests (both global and personalized for the user)
   * @param owner_id - Optional user ID to include personalized quests
   * @returns Array of today's daily quests
   */
  private async getTodaysDailyQuests(owner_id?: string): Promise<DailyQuest[]> {
    // Get all global daily quests
    const globalQuests = await this.dailyQuestsRepo.getGlobalDailyQuests();

    // Filter to only today's quests
    const todaysGlobalQuests = globalQuests.filter((quest) => 
      this.isToday(quest.timestamp)
    );

    // If owner_id provided, also get their personalized quests
    if (owner_id) {
      const personalizedQuests = await this.dailyQuestsRepo.getDailyQuestsByTargetUserId(owner_id);
      const todaysPersonalizedQuests = personalizedQuests.filter((quest) =>
        this.isToday(quest.timestamp)
      );

      return [...todaysGlobalQuests, ...todaysPersonalizedQuests];
    }

    return todaysGlobalQuests;
  }

  /**
   * Get all user quests for today, creating records lazily if they don't exist
   * This implements lazy loading - UserQuest records are only created when requested
   * @param owner_id - The UUID of the quest owner
   * @returns Array of user quests for today with full quest details
   */
  public async getUserQuestsForTheDay(owner_id: string): Promise<UserQuest[]> {
    // Get all user quests for this owner
    const existingUserQuests = await this.userQuestsRepo.getUserQuestsByOwnerId(owner_id);

    // Filter to only today's quests
    const todaysUserQuests = existingUserQuests.filter((userQuest) =>
      this.isToday(userQuest.created_at)
    );

    // Deduplicate existing records for today in case legacy duplicates already exist
    const deduplicatedMap = this.deduplicateUserQuests(todaysUserQuests);

    // Get today's daily quests (global + personalized)
    const todaysDailyQuests = await this.getTodaysDailyQuests(owner_id);

    // Find which daily quests don't have user quest records yet
    const existingDailyQuestIds = new Set(deduplicatedMap.keys());

    const missingDailyQuests = todaysDailyQuests.filter(
      (dq) => !existingDailyQuestIds.has(dq.daily_quest_id)
    );

    // Lazily create UserQuest records for missing daily quests
    const newUserQuests: UserQuest[] = [];
    for (const dailyQuest of missingDailyQuests) {
      // Calculate expiration time (end of day - midnight)
      const expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999);

      const newUserQuest = await this.userQuestsRepo.createUserQuest(
        owner_id,
        dailyQuest.daily_quest_id,
        expiresAt,
        "pending"
      );

      newUserQuests.push(newUserQuest);
    }

    // Fetch the newly created quests with their relations and merge into deduplicated map
    if (newUserQuests.length > 0) {
      for (const newQuest of newUserQuests) {
        const questWithRelations = await this.userQuestsRepo.getUserQuestById(
          newQuest.user_quest_id
        );
        if (questWithRelations) {
          const dailyQuestId = this.getDailyQuestId(questWithRelations);
          const existingQuest = deduplicatedMap.get(dailyQuestId);

          if (!existingQuest || this.shouldReplaceQuest(existingQuest, questWithRelations)) {
            deduplicatedMap.set(dailyQuestId, questWithRelations);
          }
        }
      }
    }

    return Array.from(deduplicatedMap.values()).sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    );
  }

  /**
   * Claim a completed quest
   * Can only claim if the quest status is "complete"
   * The quest completion is marked by a separate worker
   * @param owner_id - The UUID of the quest owner
   * @param user_quest_id - The UUID of the user quest to claim
   * @returns Updated UserQuest with "claimed" status
   * @throws AppError if quest not found, not owned by user, not complete, or already claimed
   */
  public async claimQuest(owner_id: string, user_quest_id: string): Promise<UserQuest> {
    // Get the user quest
    const userQuest = await this.userQuestsRepo.getUserQuestById(user_quest_id);

    if (!userQuest) {
      throw new AppError(404, "QUEST_NOT_FOUND", "Quest not found");
    }

    // Verify ownership
    if (userQuest.owner_id !== owner_id) {
      throw new AppError(403, "QUEST_NOT_OWNED", "You do not own this quest");
    }

    // Check if quest is already claimed
    if (userQuest.status === "claimed") {
      throw new AppError(400, "QUEST_ALREADY_CLAIMED", "Quest has already been claimed");
    }

    // Check if quest is expired
    if (userQuest.status === "expired") {
      throw new AppError(400, "QUEST_EXPIRED", "Quest has expired and cannot be claimed");
    }

    // Can only claim if status is "complete"
    if (userQuest.status !== "complete") {
      throw new AppError(
        400,
        "QUEST_NOT_COMPLETE",
        "Quest must be completed before it can be claimed. Current status: " + userQuest.status
      );
    }

    // Perform the reward logic
    const questDef = userQuest.daily_quest_id.quest_definition_id;
    const pet = await this.petsRepo.getPetByOwnerId(owner_id);

    if (!pet) {
      throw new AppError(404, "PET_NOT_FOUND", "Pet not found for the user");
    }

    const updatedPet = await this.petsRepo.updatePetStats(pet.pet_id, {
      pet_coin: Math.min(pet.pet_coin + questDef.reward_money, this.COIN_LIMIT),
      experience: pet.experience + questDef.reward_experience,
      pet_hunger: Math.min(pet.pet_hunger + questDef.hunger_recovery, this.HUNGER_LIMIT),
    });

    if (!updatedPet) {
      throw new AppError(500, "UPDATE_FAILED", "Failed to update pet rewards");
    }

    const leveledUpPet = await this.petsService.updatePetLevel(updatedPet);
    if (!leveledUpPet) {
      throw new AppError(500, "LEVEL_UPDATE_FAILED", "Failed to update pet level");
    }

    if(questDef.reward_type === "food" && questDef.reward_food_id) {
      const rewardPetFood = await this.petFoodRepo.getFoodById(questDef.reward_food_id);

      if (!rewardPetFood) {
        throw new AppError(404, "FOOD_NOT_FOUND", "Reward food item not found");
      }

      // Check if food already exists in inventory
      const existingInventory = await this.foodInventoryRepo.getInventoryByOwnerAndFood(
        owner_id,
        rewardPetFood
      );
      
      if (existingInventory) {
        // Increment existing quantity
        const updated = await this.foodInventoryRepo.updateQuantity(
          existingInventory.inventory_id,
          existingInventory.quantity + 1
        );
        if (!updated) {
          throw new AppError(500, "UPDATE_FAILED", "Failed to update inventory.", true);
        }
      } else {
        // Create new inventory record
        await this.foodInventoryRepo.addFoodToInventory(owner_id, rewardPetFood, 1);
      }
    }

    // Mark as claimed
    const claimedQuest = await this.userQuestsRepo.updateUserQuestStatus(
      user_quest_id,
      "claimed"
    );

    if (!claimedQuest) {
      throw new AppError(500, "QUEST_CLAIM_FAILED", "Failed to claim quest");
    }

    return claimedQuest;
  }

  /**
   * Get quest statistics for a user
   * @param owner_id - The UUID of the quest owner
   * @returns Object with quest counts by status
   */
  public async getQuestStats(owner_id: string): Promise<{
    total: number;
    pending: number;
    complete: number;
    claimed: number;
    expired: number;
  }> {
    const todaysQuests = await this.getUserQuestsForTheDay(owner_id);

    const stats = {
      total: todaysQuests.length,
      pending: todaysQuests.filter((q) => q.status === "pending").length,
      complete: todaysQuests.filter((q) => q.status === "complete").length,
      claimed: todaysQuests.filter((q) => q.status === "claimed").length,
      expired: todaysQuests.filter((q) => q.status === "expired").length,
    };

    return stats;
  }
}
