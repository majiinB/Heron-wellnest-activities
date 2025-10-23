import type { FlipFeelQuestions } from "../models/flipFeelQuestions.model.js";
import type { ChoiceInput, FlipFeelQuestionRepository } from "../repository/flipFeelQuestions.repository.js";

export type CategoryEnum = "school" | "opposite_sex" | "peers" | "family" | "crises" | "emotions" | "recreation";

export type FlipFeelQuestionAndAnswers = {
  category: CategoryEnum;
  question_text: string;
  choices: ChoiceInput[];
}

/**
 * Service class for managing Flip and Feel questions.
 *
 * @description Provides methods to create, retrieve, update, and delete flip and feel questions.
 * Handles content encryption/decryption before interacting with the repository layer.
 *
 * @remarks
 * - Soft delete marks an entry as deleted without removing it from the database.
 * - Hard delete permanently removes the entry from the database.
 * - Designed for ephemeral storage: entries can be periodically cleared
 *
 * @example
 * ```typescript
 * const service = new FlipFeelService(flipFeelRepo);
 * ```
 *
 * @file flipFeel.service.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-10-23
 */
export class FlipFeelService {
  private flipFeelRepo : FlipFeelQuestionRepository;

  /**
   * Creates an instance of the FlipFeel service.
   *
   * @param flipFeelRepo - The repository used to manage flip and feel questions.
   */
  constructor(flipFeelRepo : FlipFeelQuestionRepository) {
    this.flipFeelRepo = flipFeelRepo;
  }

  /**
   * Creates multiple flip and feel questions with their choices.
   *
   * @param questionsAndAnswers - Array of questions, each with exactly 4 choices.
   * @returns Promise resolving to array of created questions with their choices.
   * @throws {AppError} If any question doesn't have exactly 4 choices or if duplicate questions exist.
   */
  public async createQuestionAndChoices(questionsAndAnswers: FlipFeelQuestionAndAnswers[]): Promise<(FlipFeelQuestions | null)[]> {
    const createdQuestions = await Promise.all(questionsAndAnswers.map(({ category, question_text, choices }) =>
      this.flipFeelRepo.create(category, question_text, choices)
    ));
    return createdQuestions;
  }

}
