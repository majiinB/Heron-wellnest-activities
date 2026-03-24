import { QueryFailedError, type Repository } from "typeorm";
import { AppDataSource } from "../../config/datasource.config.js";
import { UserQuest } from "../../models/quests/userQuests.model.js";

export class UserQuestsRepository {
  private repo: Repository<UserQuest>;

  constructor() {
    this.repo = AppDataSource.getRepository(UserQuest);
  }

  private getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private isUniqueConstraintError(error: unknown): error is QueryFailedError & {
    driverError: { code?: string };
  } {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    return error.driverError?.code === "23505";
  }

  public async createUserQuest(
    owner_id: string,
    daily_quest_id: string,
    expires_at: Date | null = null,
    status: "pending" | "complete" | "claimed" | "expired" = "pending",
    quest_date: string = this.getLocalDateString()
  ): Promise<UserQuest> {
    const userQuest = this.repo.create({
      owner_id,
      daily_quest_id: { daily_quest_id } as any,
      quest_date,
      expires_at,
      status,
    });

    try {
      return await this.repo.save(userQuest);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        const existingQuest = await this.getUserQuestByOwnerDailyQuestAndDate(
          owner_id,
          daily_quest_id,
          quest_date
        );

        if (existingQuest) {
          return existingQuest;
        }
      }

      throw error;
    }
  }

  public async getUserQuestByOwnerDailyQuestAndDate(
    owner_id: string,
    daily_quest_id: string,
    quest_date: string
  ): Promise<UserQuest | null> {
    return this.repo
      .createQueryBuilder("userQuest")
      .leftJoinAndSelect("userQuest.daily_quest_id", "dailyQuest")
      .leftJoinAndSelect("dailyQuest.quest_definition_id", "questDefinition")
      .where("userQuest.owner_id = :owner_id", { owner_id })
      .andWhere("dailyQuest.daily_quest_id = :daily_quest_id", { daily_quest_id })
      .andWhere("userQuest.quest_date = :quest_date", { quest_date })
      .orderBy("userQuest.created_at", "DESC")
      .getOne();
  }

  public async getUserQuestById(user_quest_id: string): Promise<UserQuest | null> {
    return this.repo.findOne({
      where: {
        user_quest_id,
      },
      relations: ["daily_quest_id", "daily_quest_id.quest_definition_id"],
    });
  }

  public async getUserQuestsByOwnerId(owner_id: string): Promise<UserQuest[]> {
    return this.repo.find({
      where: {
        owner_id,
      },
      relations: ["daily_quest_id", "daily_quest_id.quest_definition_id"],
      order: {
        created_at: "DESC",
      },
    });
  }

  public async getUserQuestsByOwnerIdAndStatus(
    owner_id: string,
    status: "pending" | "complete" | "claimed" | "expired"
  ): Promise<UserQuest[]> {
    return this.repo.find({
      where: {
        owner_id,
        status,
      },
      relations: ["daily_quest_id", "daily_quest_id.quest_definition_id"],
      order: {
        created_at: "DESC",
      },
    });
  }

  public async getUserQuestsByStatus(
    status: "pending" | "complete" | "claimed" | "expired"
  ): Promise<UserQuest[]> {
    return this.repo.find({
      where: {
        status,
      },
      relations: ["daily_quest_id", "daily_quest_id.quest_definition_id"],
      order: {
        created_at: "DESC",
      },
    });
  }

  public async updateUserQuest(userQuest: UserQuest): Promise<UserQuest> {
    return this.repo.save(userQuest);
  }

  public async updateUserQuestStatus(
    user_quest_id: string,
    status: "pending" | "complete" | "claimed" | "expired",
    completed_at: Date | null = null
  ): Promise<UserQuest | null> {
    const userQuest = await this.getUserQuestById(user_quest_id);
    if (!userQuest) {
      return null;
    }

    userQuest.status = status;
    if (completed_at) {
      userQuest.completed_at = completed_at;
    }

    return this.repo.save(userQuest);
  }

  public async deleteUserQuest(user_quest_id: string): Promise<void> {
    await this.repo.delete({ user_quest_id });
  }
}
