import type { FlipFeelQuestions } from "../models/flipFeelQuestions.model.js";
import type { ChoiceInput, FlipFeelQuestionRepository } from "../repository/flipFeelQuestions.repository.js";
import { AppError } from "../types/appError.type.js";

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
   * Fisher-Yates shuffle algorithm to randomize array order.
   *
   * @param array - The array to shuffle
   * @returns The shuffled array (mutates in place)
   */
  private fisherYatesShuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

  /**
   * Retrieves a randomized subset of questions for a specific category with their choices.
   *
   * @param category - The category to filter questions by
   * @param count - Number of questions to return (min: 5, max: 15, default: 10)
   * @returns Promise resolving to array of randomized questions with their choices
   * @throws {AppError} If count is out of range or not enough questions available
   */
  public async getQuestionsByCategory(category: CategoryEnum, count: number = 10): Promise<FlipFeelQuestions[]> {
    // Validate count parameter
    if (count < 5 || count > 15) {
      throw new AppError(400, "INVALID_COUNT", "Question count must be between 5 and 15", true);
    }

    // Fetch all questions for the category
    const allQuestions = await this.flipFeelRepo.findByCategory(category);

    // Check if enough questions available
    if (allQuestions.length < count) {
      throw new AppError(
        400, 
        "INSUFFICIENT_QUESTIONS", 
        `Not enough questions available. Requested: ${count}, Available: ${allQuestions.length}`, 
        true
      );
    }

    // Shuffle questions using Fisher-Yates
    const shuffledQuestions = this.fisherYatesShuffle([...allQuestions]);

    // Return the requested number of questions
    return shuffledQuestions.slice(0, count);
  }
}
