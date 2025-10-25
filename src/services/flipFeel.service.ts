import type { FlipFeel } from "../models/flipFeel.model.js";
import type { FlipFeelQuestions } from "../models/flipFeelQuestions.model.js";
import type { ResponseInput } from "../repository/flipFeel.repository.js";
import { type ChoiceInput, FlipFeelQuestionRepository } from "../repository/flipFeelQuestions.repository.js";
import { FlipFeelRepository } from "../repository/flipFeel.repository.js";
import { AppError } from "../types/appError.type.js";
import { publishMessage } from "../utils/pubsub.util.js";
import { env } from "../config/env.config.js";

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
  private flipFeelRepoSession : FlipFeelRepository;

  /**
   * Creates an instance of the FlipFeel service.
   *
   * @param flipFeelRepo - The repository used to manage flip and feel questions.
   */
  constructor(flipFeelRepo : FlipFeelQuestionRepository, flipFeelRepoSession : FlipFeelRepository) {
    this.flipFeelRepo = flipFeelRepo;
    this.flipFeelRepoSession = flipFeelRepoSession;
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

  /**
   * Records a complete flip and feel session with user responses.
   *
   * @param user_id - The ID of the user submitting responses
   * @param responses - Array of question-choice pairs
   * @returns Promise resolving to the created session with responses
   * @throws {AppError} If responses are invalid or empty
   */
  public async submitResponses(user_id: string, responses: ResponseInput[]): Promise<FlipFeel> {
    // Validate responses array
    if (!Array.isArray(responses) || responses.length === 0) {
      throw new AppError(400, "INVALID_RESPONSES", "Responses must be a non-empty array", true);
    }

    // Validate each response has required fields
    for (const response of responses) {
      if (!response.question_id || !response.choice_id) {
        throw new AppError(
          400,
          "INVALID_RESPONSE_FORMAT",
          "Each response must have question_id and choice_id",
          true
        );
      }
    }

    try {
      // Create session with responses in one transaction
      const createdSession = await this.flipFeelRepoSession.createSessionWithResponses(user_id, responses);

      await publishMessage(env.PUBSUB_ACTIVITY_TOPIC, {
        eventType: 'FLIP_FEEL_ENTRY_CREATED',
        userId: user_id,
        checkInId: createdSession.flip_feel_id,
        timestamp: new Date().toISOString(),
      });

      return createdSession;
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid question_id or choice_id")) {
        throw new AppError(400, "INVALID_QUESTION_OR_CHOICE", error.message, true);
      }
      throw error;
    }
  }

  /**
   * Retrieves a user's flip and feel session history.
   *
   * @param user_id - The ID of the user
   * @param withResponses - Whether to include response details (default: false)
   * @returns Promise resolving to array of sessions
   */
  public async getUserSessions(user_id: string, withResponses: boolean = false): Promise<FlipFeel[]> {
    return await this.flipFeelRepoSession.getSessionsByUser(user_id, withResponses);
  }

  /**
   * Retrieves a specific session with all its responses.
   *
   * @param flip_feel_id - The session ID
   * @returns Promise resolving to the session with responses
   * @throws {AppError} If session not found
   */
  public async getSessionById(flip_feel_id: string): Promise<FlipFeel> {
    const session = await this.flipFeelRepoSession.getSessionWithResponses(flip_feel_id);
    
    if (!session) {
      throw new AppError(404, "SESSION_NOT_FOUND", "Flip and feel session not found", true);
    }

    return session;
  }
}
