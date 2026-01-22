import { Repository } from "typeorm";
import { AppDataSource } from "../config/datasource.config.js";
import { FlipFeel } from "../models/activities/flipFeel.model.js";
import { FlipFeelResponse } from "../models/activities/flipFeelResponse.model.js";
import { FlipFeelQuestions } from "../models/activities/flipFeelQuestions.model.js";
import { FlipFeelChoice } from "../models/activities/flipFeelChoices.model.js";

export interface ResponseInput {
  question_id: string;
  choice_id: string;
}

/**
 * Repository for managing flip and feel sessions and responses.
 * 
 * @description Handles creation and retrieval of flip and feel sessions with their responses.
 * A session represents a single attempt of answering questions, with multiple responses linked to it.
 */
export class FlipFeelRepository {
  private sessionRepo: Repository<FlipFeel>;
  private responseRepo: Repository<FlipFeelResponse>;

  constructor() {
    this.sessionRepo = AppDataSource.getRepository(FlipFeel);
    this.responseRepo = AppDataSource.getRepository(FlipFeelResponse);
  }

  /**
   * Creates a new flip and feel session.
   *
   * @param user_id - The ID of the user starting the session
   * @returns Promise resolving to the created session
   */
  async createSession(user_id: string): Promise<FlipFeel> {
    const session = this.sessionRepo.create({
      user_id,
      started_at: new Date(),
    });
    return await this.sessionRepo.save(session);
  }

  /**
   * Completes a flip and feel session by setting the finished_at timestamp.
   *
   * @param flip_feel_id - The ID of the session to complete
   * @returns Promise resolving to the updated session
   */
  async completeSession(flip_feel_id: string): Promise<FlipFeel | null> {
    const session = await this.sessionRepo.findOne({ where: { flip_feel_id } });
    if (!session) return null;

    session.finished_at = new Date();
    return await this.sessionRepo.save(session);
  }

  /**
   * Records multiple responses for a flip and feel session.
   *
   * @param flip_feel_id - The session ID these responses belong to
   * @param responses - Array of question-choice pairs
   * @returns Promise resolving to array of created responses
   */
  async createResponses(flip_feel_id: string, responses: ResponseInput[]): Promise<FlipFeelResponse[]> {
    return await AppDataSource.transaction(async (manager) => {
      // Verify session exists
      const session = await manager.findOne(FlipFeel, { where: { flip_feel_id } });
      if (!session) {
        throw new Error("Session not found");
      }

      // Create all responses
      const responseEntities = await Promise.all(
        responses.map(async ({ question_id, choice_id }) => {
          const question = await manager.findOne(FlipFeelQuestions, { where: { question_id } });
          const choice = await manager.findOne(FlipFeelChoice, { where: { choice_id } });

          if (!question || !choice) {
            throw new Error(`Invalid question_id or choice_id`);
          }

          return manager.create(FlipFeelResponse, {
            flip_feel_id: session,
            question_id: question,
            choice_id: choice,
          });
        })
      );

      return await manager.save(FlipFeelResponse, responseEntities);
    });
  }

  /**
   * Records a complete flip and feel session with responses in one transaction.
   *
   * @param user_id - The ID of the user
   * @param responses - Array of question-choice pairs
   * @returns Promise resolving to the completed session with responses
   */
  async createSessionWithResponses(user_id: string, responses: ResponseInput[]): Promise<FlipFeel> {
    return await AppDataSource.transaction(async (manager) => {
      // Create session
      const session = manager.create(FlipFeel, {
        user_id,
        started_at: new Date(),
        finished_at: new Date(), // Complete immediately
      });
      const savedSession = await manager.save(session);

      // Create all responses
      const responseEntities = await Promise.all(
        responses.map(async ({ question_id, choice_id }) => {
          const question = await manager.findOne(FlipFeelQuestions, { where: { question_id } });
          const choice = await manager.findOne(FlipFeelChoice, { where: { choice_id } });

          if (!question || !choice) {
            throw new Error(`Invalid question_id or choice_id`);
          }

          return manager.create(FlipFeelResponse, {
            flip_feel_id: savedSession,
            question_id: question,
            choice_id: choice,
          });
        })
      );

      await manager.save(FlipFeelResponse, responseEntities);

      // Return session with responses
      return await manager.findOne(FlipFeel, {
        where: { flip_feel_id: savedSession.flip_feel_id },
        relations: ["responses"],
      }) as FlipFeel;
    });
  }

  /**
   * Retrieves a session with all its responses.
   *
   * @param flip_feel_id - The session ID
   * @returns Promise resolving to the session with responses or null
   */
  async getSessionWithResponses(flip_feel_id: string): Promise<FlipFeel | null> {
    return await this.sessionRepo.findOne({
      where: { flip_feel_id },
      relations: ["responses", "responses.question_id", "responses.choice_id"],
    });
  }

  /**
   * Retrieves all sessions for a user.
   *
   * @param user_id - The user ID
   * @param withResponses - Whether to include responses (default: false)
   * @returns Promise resolving to array of sessions
   */
  async getSessionsByUser(user_id: string, withResponses: boolean = false): Promise<FlipFeel[]> {
    return await this.sessionRepo.find({
      where: { user_id },
      relations: withResponses ? ["responses", "responses.question_id", "responses.choice_id"] : [],
      order: { started_at: "DESC" },
    });
  }
}