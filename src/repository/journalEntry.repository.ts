import type { Repository } from "typeorm";
import { AppDataSource } from "../config/datasource.config.js";
import { JournalEntry } from "../models/journalEntry.model.js";

/**
 * Repository class for managing journal entry entities in the database.
 *
 * @description Provides methods for creating, retrieving, updating, soft deleting, and hard deleting journal entries.
 * All operations are performed using TypeORM's Repository API.
 *
 * @remarks
 * - Soft deletes are performed by setting the `is_deleted` flag to `true`, preserving the entry in the database.
 * - Hard deletes permanently remove the entry from the database.
 * - Entries marked as deleted (`is_deleted: true`) are excluded from most retrieval operations.
 *
 * @example
 * ```typescript
 * const repo = new JournalEntryRepository();
 * const entry = await repo.createEntry(userId, encryptedContent, { happy: 5 });
 * const allEntries = await repo.findByUser(userId);
 * ```
 * 
 * @file journalEntry.repository.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-09-21
 */
export class JournalEntryRepository {
  private repo: Repository<JournalEntry>;

  constructor() {
    this.repo = AppDataSource.getRepository(JournalEntry);
  }

  /**
   * Creates a new journal entry for a user.
   *
   * @param user_id - The unique identifier of the user creating the entry.
   * @param content_encrypted - The encrypted content of the journal entry.
   * @param mood - (Optional) An object representing the user's mood, where keys are mood types and values are their respective scores.
   * @returns A promise that resolves to the saved journal entry entity.
   */
  async createEntry(user_id: string, content_encrypted: string, mood?: Record<string, number>) {
    const entry = this.repo.create({
      user_id,
      content_encrypted,
      mood,
    });
    return await this.repo.save(entry);
  }

  /**
   * Retrieves a journal entry by its unique identifier, excluding entries marked as deleted.
   *
   * @param journal_id - The unique identifier of the journal entry to retrieve.
   * @returns A promise that resolves to the journal entry if found and not deleted, otherwise `null`.
   */
  async findById(journal_id: string) {
    return await this.repo.findOne({
      where: { journal_id, is_deleted: false },
    });
  }

  /**
   * Retrieves all journal entries for a specific user that have not been deleted.
   *
   * @param user_id - The unique identifier of the user whose journal entries are to be fetched.
   * @returns A promise that resolves to an array of journal entries, ordered by creation date in descending order.
   */
  async findByUser(user_id: string) {
    return await this.repo.find({
      where: { user_id, is_deleted: false },
      order: { created_at: "DESC" },
    });
  }

  /**
   * Updates a journal entry with new encrypted content and/or mood values.
   *
   * @param journal_id - The unique identifier of the journal entry to update.
   * @param content_encrypted - (Optional) The new encrypted content for the journal entry.
   * @param mood - (Optional) An object representing mood values to update for the journal entry.
   * @returns The updated journal entry if found, otherwise `null`.
   */
  async updateEntry(journal_id: string, content_encrypted?: string, mood?: Record<string, number>) {
    const entry = await this.findById(journal_id);
    if (!entry) return null;

    if (content_encrypted !== undefined) entry.content_encrypted = content_encrypted;
    if (mood !== undefined) entry.mood = mood;

    return await this.repo.save(entry);
  }

  /**
   * Marks a journal entry as deleted by setting its `is_deleted` flag to `true`.
   * Performs a soft delete, preserving the entry in the database.
   *
   * @param journal_id - The unique identifier of the journal entry to be soft deleted.
   * @returns The updated journal entry with `is_deleted` set to `true`, or `null` if the entry does not exist.
   */
  async softDelete(journal_id: string) {
    const entry = await this.findById(journal_id);
    if (!entry) return null;

    entry.is_deleted = true;
    return await this.repo.save(entry);
  }

  /**
   * Permanently deletes a journal entry from the repository by its ID.
   *
   * @param journal_id - The unique identifier of the journal entry to delete.
   * @returns A promise that resolves with the result of the delete operation.
   */
  async hardDelete(journal_id: string) {
    return await this.repo.delete(journal_id);
  }

  /**
   * Retrieves the latest journal entry for a specific user that has not been deleted.
   *
   * @param user_id - The unique identifier of the user whose latest journal entry is to be fetched.
   * @returns A promise that resolves to the most recent journal entry for the user, or `null` if none exists.
   */
  async findLatestByUser(user_id: string) {
    return await this.repo.findOne({
      where: { user_id, is_deleted: false },
      order: { created_at: "DESC" },
    });
  }

  /**
   * Counts the number of journal entries for a specific user that are not marked as deleted.
   *
   * @param user_id - The unique identifier of the user whose journal entries are to be counted.
   * @returns A promise that resolves to the count of non-deleted journal entries for the specified user.
   */
  async countByUser(user_id: string) {
    return await this.repo.count({
      where: { user_id, is_deleted: false },
    });
  }
}