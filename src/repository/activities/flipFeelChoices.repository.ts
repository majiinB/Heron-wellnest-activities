import { AppDataSource } from "../../config/datasource.config.js";
import { FlipFeelChoice } from "../../models/activities/flipFeelChoices.model.js";
import { FlipFeelQuestions } from "../../models/activities/flipFeelQuestions.model.js";
import { Repository } from "typeorm";

export class FlipFeelChoiceRepository {
  private repo: Repository<FlipFeelChoice>;

  constructor() {
    this.repo = AppDataSource.getRepository(FlipFeelChoice);
  }

  async create(question: FlipFeelQuestions, choice_text: string, mood_label: string): Promise<FlipFeelChoice> {
    const choice = this.repo.create({
      question_id: question,
      choice_text,
      mood_label,
    });
    return await this.repo.save(choice);
  }

  async findById(choice_id: string): Promise<FlipFeelChoice | null> {
    return await this.repo.findOne({
      where: { choice_id },
      relations: ["question_id"],
    });
  }

  async findByQuestion(question_id: string): Promise<FlipFeelChoice[]> {
    return await this.repo.find({
      where: { question_id: { question_id } },
      order: { created_at: "ASC" },
    });
  }

  async delete(choice_id: string): Promise<void> {
   await this.repo.delete(choice_id);
  }
}
