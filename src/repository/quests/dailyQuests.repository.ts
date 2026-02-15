import { type Repository } from "typeorm";
import { AppDataSource } from "../../config/datasource.config.js";
import { DailyQuest } from "../../models/quests/dailyQuests.model.js";

export class DailyQuestsRepository {
  private repo: Repository<DailyQuest>;

  constructor() {
    this.repo = AppDataSource.getRepository(DailyQuest);
  }

  public async createDailyQuest(
    quest_definition_id: string,
    scope: "global" | "personalized",
    target_user_id: string | null = null
  ): Promise<DailyQuest> {
    const dailyQuest = this.repo.create({
      quest_definition_id: { quest_definition_id } as any,
      scope,
      target_user_id,
    });
    return this.repo.save(dailyQuest);
  }

  public async getDailyQuestById(daily_quest_id: string): Promise<DailyQuest | null> {
    return this.repo.findOne({
      where: {
        daily_quest_id,
      },
      relations: ["quest_definition_id"],
    });
  }

  public async getDailyQuestsByScope(scope: "global" | "personalized"): Promise<DailyQuest[]> {
    return this.repo.find({
      where: {
        scope,
      },
      relations: ["quest_definition_id"],
      order: {
        timestamp: "DESC",
      },
    });
  }

  public async getDailyQuestsByTargetUserId(target_user_id: string): Promise<DailyQuest[]> {
    return this.repo.find({
      where: {
        target_user_id,
      },
      relations: ["quest_definition_id"],
      order: {
        timestamp: "DESC",
      },
    });
  }

  public async getGlobalDailyQuests(): Promise<DailyQuest[]> {
    return this.repo.find({
      where: {
        scope: "global",
      },
      relations: ["quest_definition_id"],
      order: {
        timestamp: "DESC",
      },
    });
  }

  public async updateDailyQuest(dailyQuest: DailyQuest): Promise<DailyQuest> {
    return this.repo.save(dailyQuest);
  }

  public async deleteDailyQuest(daily_quest_id: string): Promise<void> {
    await this.repo.delete({ daily_quest_id });
  }
}
