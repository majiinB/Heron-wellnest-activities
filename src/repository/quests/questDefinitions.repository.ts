import { type Repository } from "typeorm";
import { AppDataSource } from "../../config/datasource.config.js";
import { QuestDefinition } from "../../models/quests/questDefinitions.model.js";

export class QuestDefinitionsRepository {
  private repo: Repository<QuestDefinition>;

  constructor() {
    this.repo = AppDataSource.getRepository(QuestDefinition);
  }

  public async createQuestDefinition(
    data: Partial<QuestDefinition>
  ): Promise<QuestDefinition> {
    const questDefinition = this.repo.create(data as any);
    return this.repo.save(questDefinition) as any;
  }

  public async getQuestDefinitionById(quest_definition_id: string): Promise<QuestDefinition | null> {
    return this.repo.findOne({
      where: {
        quest_definition_id,
      },
    });
  }

  public async getQuestDefinitionByName(name: string): Promise<QuestDefinition | null> {
    return this.repo.findOne({
      where: {
        name,
      },
    });
  }

  public async getAllQuestDefinitions(): Promise<QuestDefinition[]> {
    return this.repo.find({
      order: {
        created_at: "DESC",
      },
    });
  }

  public async getActiveQuestDefinitions(): Promise<QuestDefinition[]> {
    return this.repo.find({
      where: {
        is_active: true,
      },
      order: {
        created_at: "DESC",
      },
    });
  }

  public async getQuestDefinitionsByTag(
    quest_tag: "well-being" | "pet-care" | "pet-interaction"
  ): Promise<QuestDefinition[]> {
    return this.repo.find({
      where: {
        quest_tag,
        is_active: true,
      },
      order: {
        created_at: "DESC",
      },
    });
  }

  public async updateQuestDefinition(questDefinition: QuestDefinition): Promise<QuestDefinition> {
    return this.repo.save(questDefinition);
  }

  public async deleteQuestDefinition(quest_definition_id: string): Promise<void> {
    await this.repo.delete({ quest_definition_id });
  }
}
