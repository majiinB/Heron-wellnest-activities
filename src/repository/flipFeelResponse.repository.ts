import { AppDataSource } from "../config/datasource.config.js";
import { FlipFeelResponse } from "../models/activities/flipFeelResponse.model.js";
import { FlipFeelQuestions } from "../models/activities/flipFeelQuestions.model.js";
import { FlipFeelChoice } from "../models/activities/flipFeelChoices.model.js";
import { Repository } from "typeorm";
import type { FlipFeel } from "../models/activities/flipFeel.model.js";

export class FlipFeelResponseRepository {
  private repo: Repository<FlipFeelResponse>;

  constructor() {
    this.repo = AppDataSource.getRepository(FlipFeelResponse);
  }

  async create(session: FlipFeel, question: FlipFeelQuestions, choice: FlipFeelChoice): Promise<FlipFeelResponse> {
    const response = this.repo.create({
      flip_feel_id: session,
      question_id: question,
      choice_id: choice,
    });
    return await this.repo.save(response);
  }

  /**
   * Finds a response by its ID.
   *
   * @param response_id - The response ID
   * @returns Promise resolving to the response or null
   */
  async findById(response_id: string): Promise<FlipFeelResponse | null> {
    return await this.repo.findOne({
      where: { response_id },
      relations: ["flip_feel_id", "question_id", "choice_id"],
    });
  }

  async findByQuestion(question_id: string): Promise<FlipFeelResponse[]> {
    return await this.repo.find({
      where: { question_id: { question_id } },
      relations: ["choice_id"],
    });
  }

  async delete(response_id: string): Promise<void> {
   await this.repo.delete(response_id);
  }
}
