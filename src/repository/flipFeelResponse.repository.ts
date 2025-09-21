import { AppDataSource } from "../config/datasource.config.js";
import { FlipFeelResponse } from "../models/flipFeelResponse.model.js";
import { FlipFeelQuestions } from "../models/flipFeelQuestions.model.js";
import { FlipFeelChoice } from "../models/flipFeelChoices.model.js";
import { Repository } from "typeorm";

export class FlipFeelResponseRepository {
  private repo: Repository<FlipFeelResponse>;

  constructor() {
    this.repo = AppDataSource.getRepository(FlipFeelResponse);
  }

  async create(user_id: string, question: FlipFeelQuestions, choice: FlipFeelChoice) {
    const response = this.repo.create({
      user_id,
      question_id: question,
      choice_id: choice,
    });
    return await this.repo.save(response);
  }

  async findById(response_id: string) {
    return await this.repo.findOne({
      where: { response_id },
      relations: ["question_id", "choice_id"],
    });
  }

  async findByUser(user_id: string) {
    return await this.repo.find({
      where: { user_id },
      relations: ["question_id", "choice_id"],
      order: { created_at: "DESC" },
    });
  }

  async findByQuestion(question_id: string) {
    return await this.repo.find({
      where: { question_id: { question_id } },
      relations: ["choice_id"],
    });
  }

  async delete(response_id: string) {
    return await this.repo.delete(response_id);
  }
}
