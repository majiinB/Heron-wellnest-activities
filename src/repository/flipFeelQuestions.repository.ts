import { Repository } from "typeorm";
import { FlipFeelQuestions } from "../models/flipFeelQuestions.model.js";
import { AppDataSource } from "../config/datasource.config.js";

export class FlipFeelQuestionRepository {
  private repo: Repository<FlipFeelQuestions>;

  constructor() {
    this.repo = AppDataSource.getRepository(FlipFeelQuestions);
  }

  async create(question_text: string) {
    const question = this.repo.create({ question_text });
    return await this.repo.save(question);
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
