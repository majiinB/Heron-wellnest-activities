import { QueryFailedError, Repository } from "typeorm";
import { FlipFeelQuestions } from "../models/flipFeelQuestions.model.js";
import { AppDataSource } from "../config/datasource.config.js";
import { FlipFeelChoice } from "../models/flipFeelChoices.model.js";
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

  async create(category: string, question_text: string, choices: ChoiceInput[]) {
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

  async findById(question_id: string, withChoices = false) {
    return await this.repo.findOne({
      where: { question_id },
      relations: withChoices ? ["choices"] : [],
    });
  }

  async findAll(withChoices = false) {
    return await this.repo.find({
      relations: withChoices ? ["choices"] : [],
      order: { created_at: "DESC" },
    });
  }

  async update(question_id: string, question_text: string) {
    const question = await this.findById(question_id);
    if (!question) return null;
    question.question_text = question_text;
    return await this.repo.save(question);
  }

  async delete(question_id: string) {
    return await this.repo.delete(question_id);
  }
}
