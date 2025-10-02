import { LessThan, type Repository } from "typeorm";
import { AppDataSource } from "../config/datasource.config.js";
import { GratitudeEntry } from "../models/gratitudeEntry.model.js";
import type { EncryptedField } from "../types/encryptedField.type.js";

/**
 * Repository class for managing GratitudeEntry entities.
 *
 * @description Provides methods to create, retrieve, update, soft delete, hard delete, and count gratitude jar entries.
 * All retrieval methods exclude entries marked as deleted unless explicitly deleted.
 *
 * @remarks
 * - Uses TypeORM's Repository for database operations.
 * - Soft delete sets the `is_deleted` flag to `true` without removing the entry from the database.
 * - Hard delete permanently removes the entry from the database.
 *
 * @example
 * ```typescript
 * const repo = new GratitudeEntryRepository();
 * await repo.createEntry(userId, encryptedContent);
 * const entries = await repo.findByUser(userId);
 * ```
 * 
 * @file gratitudeEntry.repository.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-09-22
 */
export class GratitudeEntryRepository {
  private repo: Repository<GratitudeEntry>;

  constructor() {
    this.repo = AppDataSource.getRepository(GratitudeEntry);
  }

  /**
   * Creates a new Gratitude entry for a user.
   *
   * @param user_id - The unique identifier of the user creating the entry.
   * @param content_encrypted - The encrypted content of the gratitude jar entry.
   * @returns A promise that resolves to the saved Gratitude jar entry entity.
   */
  async createEntry(
    user_id: string, 
    content_encrypted: EncryptedField
  ) {
    const entry = this.repo.create({
      user_id,
      content_encrypted,
    });
    return await this.repo.save(entry);
  }

  /**
   * Retrieves a Gratitude jar entry by its unique identifier, excluding entries marked as deleted.
   *
   * @param gratitude_id - The unique identifier of the Gratitude jar entry to retrieve.
   * @returns A promise that resolves to the Gratitude jar entry if found and not deleted, otherwise `null`.
   */
  async findById(gratitude_id: string) {
    return await this.repo.findOne({
      where: { gratitude_id, is_deleted: false },
    });
  }

  /**
 * Retrieves all gratitude jar entries for a specific user that have not been deleted.
 *
 * @param user_id - The unique identifier of the user whose gratitude jar entries are to be fetched.
 * @param lastEntryId - (Optional) The ID of the last gratitude entry from the previous page, used for pagination.
 * @param limit - (Optional) The maximum number of entries to retrieve. Defaults to 10.
 * @returns A promise that resolves to an array of gratitude jar entries, ordered by creation date in descending order.
 */
  async findByUserAfterId(user_id: string, lastEntryId?: string, limit: number = 10): Promise<GratitudeEntry[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let where: any = { user_id, is_deleted: false };

    if (lastEntryId) {
      const lastEntry = await this.repo.findOne({ where: { gratitude_id: lastEntryId } });
      if (lastEntry) {
        where = [
          { user_id, is_deleted: false, created_at: LessThan(lastEntry.created_at) },
          { user_id, is_deleted: false, created_at: lastEntry.created_at, gratitude_id: LessThan(lastEntry.gratitude_id) }
        ];
      }
    }

    return this.repo.find({
      where,
      order: { created_at: "DESC", gratitude_id: "DESC" },
      take: limit,
    });
  }

  /**
   * Updates a gratitude jar entry with new encrypted content.
   *
   * @param gratitude_id - The unique identifier of the gratitude jar entry to update.
   * @param content_encrypted - (Optional) The new encrypted content for the gratitude jar entry.
   * @returns The updated gratitude jar entry if found, otherwise `null`.
   */
  async updateEntry(
    gratitude_id: string, 
    content_encrypted: {
      iv: string;
      content: string;
      tag: string;
    }
  ) {
    const entry = await this.findById(gratitude_id);
    if (!entry) return null;

    if (content_encrypted !== undefined) entry.content_encrypted = content_encrypted;

    return await this.repo.save(entry);
  }

  /**
   * Marks a Gratitude jar entry as deleted by setting its `is_deleted` flag to `true`.
   * Performs a soft delete, preserving the entry in the database.
   *
   * @param gratitude_id - The unique identifier of the gratitude jar entry to be soft deleted.
   * @returns The updated gartitude jar entry with `is_deleted` set to `true`, or `null` if the entry does not exist.
   */
  async softDelete(gratitude_id: string) {
    const entry = await this.findById(gratitude_id);
    if (!entry) return null;

    entry.is_deleted = true;
    return await this.repo.save(entry);
  }

  /**
   * Permanently deletes a gratitude jar entry from the repository by its ID.
   *
   * @param gratitude_id - The unique identifier of the gratitude jar entry to delete.
   * @returns A promise that resolves with the result of the delete operation.
   */
  async hardDelete(gratitude_id: string) {
    return await this.repo.delete(gratitude_id);
  }

  /**
   * Retrieves the latest gratitude jar entry for a specific user that has not been deleted.
   *
   * @param user_id - The unique identifier of the user whose latest gratitude jar entry is to be fetched.
   * @returns A promise that resolves to the most recent gratitude jar entry for the user, or `null` if none exists.
   */
  async findLatestByUser(user_id: string) {
    return await this.repo.findOne({
      where: { user_id, is_deleted: false },
      order: { created_at: "DESC" },
    });
  }

  /**
   * Counts the number of gratitude jar entries for a specific user that are not marked as deleted.
   *
   * @param user_id - The unique identifier of the user whose gratitude jar entries are to be counted.
   * @returns A promise that resolves to the count of non-deleted gratitude jar entries for the specified user.
   */
  async countByUser(user_id: string) {
    return await this.repo.count({
      where: { user_id, is_deleted: false },
    });
  }
}