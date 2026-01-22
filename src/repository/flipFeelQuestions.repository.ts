import { QueryFailedError, Repository } from "typeorm";
import { FlipFeelQuestions } from "../models/activities/flipFeelQuestions.model.js";
import { AppDataSource } from "../config/datasource.config.js";
import { FlipFeelChoice } from "../models/activities/flipFeelChoices.model.js";
import { AppError } from "../types/appError.type.js";

export enum ClassificationEnum {
  EXCELLING = 'Excelling',
  THRIVING = 'Thriving',
  STRUGGLING = 'Struggling',
  INCRISIS = 'InCrisis'
}

export interface ChoiceInput {
  choice_text: string;
  mood_label: ClassificationEnum;
}

export class FlipFeelQuestionRepository {
  private repo: Repository<FlipFeelQuestions>;

  constructor() {
    this.repo = AppDataSource.getRepository(FlipFeelQuestions);
  }

  async create(category: string, question_text: string, choices: ChoiceInput[]): Promise<FlipFeelQuestions | null> {
  // Validate exactly 4 choices
  if (choices.length !== 4) {
    throw new AppError(400, "INVALID_CHOICES_COUNT", "Exactly 4 choices are required", true);
  }

  try {
    return await AppDataSource.transaction(async (manager) => {
      // Create question
      const question = manager.create(FlipFeelQuestions, { category, question_text });
      const savedQuestion = await manager.save(question);

      // Create all 4 choices
      const choiceEntities = choices.map(choice =>
        manager.create(FlipFeelChoice, {
          question_id: savedQuestion,
          choice_text: choice.choice_text,
          mood_label: choice.mood_label,
        })
      );
      
      await manager.save(FlipFeelChoice, choiceEntities);

      // Return question with choices
      return await manager.findOne(FlipFeelQuestions, {
        where: { question_id: savedQuestion.question_id },
        relations: ["choices"],
      });
    });
  } catch (error) {
    // Handle duplicate question_text
    if (error instanceof QueryFailedError && error.message.includes("duplicate key")) {
      throw new AppError(409, "DUPLICATE_QUESTION", "A question with this text already exists", true);
    }
    throw error;
  }
}

  /**
   * Retrieves all questions for a specific category with their choices.
   *
   * @param category - The category to filter questions by
   * @returns Promise resolving to array of questions with their choices
   */
  async findByCategory(category: string): Promise<FlipFeelQuestions[]> {
    return await this.repo.find({
      where: { category },
      relations: ["choices"],
      order: { created_at: "DESC" },
    });
  }

  async findAll(withChoices = false): Promise<FlipFeelQuestions[]> {
    return await this.repo.find({
      relations: withChoices ? ["choices"] : [],
      order: { created_at: "DESC" },
    });
  }

  async findById(question_id: string, withChoices = false): Promise<FlipFeelQuestions | null> {
    return await this.repo.findOne({
      where: { question_id },
      relations: withChoices ? ["choices"] : [],
    });
  }

  async update(question_id: string, question_text: string): Promise<FlipFeelQuestions | null> {
    const question = await this.findById(question_id);
    if (!question) return null;
    question.question_text = question_text;
    return await this.repo.save(question);
  }

  async delete(question_id: string): Promise<void> {
   await this.repo.delete(question_id);
  }
}
