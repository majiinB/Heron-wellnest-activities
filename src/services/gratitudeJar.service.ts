import { env } from "../config/env.config.js";
import type { GratitudeEntry } from "../models/gratitudeEntry.model.js";
import type { GratitudeEntryRepository } from "../repository/gratitudeEntry.repository.js";
import type { EncryptedField } from "../types/encryptedField.type.js";
import type { PaginatedSafeGratitudeJarEntries } from "../types/paginatedGratitudeJarEntries.type.js";
import type { SafeGratitudeJarEntry } from "../types/safeGratitudeJarEntry.type.js";
import { encrypt, decrypt } from "../utils/crypto.util.js";
import { toSafeGratitudeJarEntries, toSafeGratitudeJarEntry } from "../utils/gratitudeJar.utils.js";

/**
 * Service class for managing Gratitude Jar entries.
 *
 * @description Provides methods to create, retrieve, update, and delete gratitude jar entries.
 * Handles content encryption/decryption before interacting with the repository layer.
 *
 * @remarks
 * - Content is encrypted before being saved and decrypted when retrieved.
 * - Soft delete marks an entry as deleted without removing it from the database.
 * - Hard delete permanently removes the entry from the database.
 * - Designed for ephemeral storage: entries can be periodically cleared
 *   (e.g., after reflection day or once retrieved, depending on business logic).
 *
 * @example
 * ```typescript
 * const service = new GratitudeJarService(gratitudeRepo);
 * await service.addEntry(userId, "I’m grateful for my family today.");
 * const entries = await service.getEntriesByUser(userId);
 * ```
 *
 * @file gratitudeJar.service.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-09-22
 */
export class GratitudeJarService {
  private gratitudeRepo : GratitudeEntryRepository;
  private secret: string;
  private readonly decryptField = (field: EncryptedField) => decrypt(field, this.secret);

  /**
   * Creates an instance of the GratitudeJar service.
   * 
   * @param gratitudeRepo - The repository used to manage gratitude entries.
   */
  constructor(gratitudeRepo : GratitudeEntryRepository) {
    this.gratitudeRepo = gratitudeRepo;
    this.secret = env.CONTENT_ENCRYPTION_KEY;
  }

  /**
   * Adds a new gratitude entry for the specified user.
   *
   * Encrypts the provided content using the service's secret before storing it.
   * Returns the created `GratitudeEntry` object.
   *
   * @param userId - The unique identifier of the user adding the entry.
   * @param content - The gratitude content to be encrypted and stored.
   * @returns A promise that resolves to the newly created `GratitudeEntry`.
   */
  public async addEntry(userId: string, content: string): Promise<SafeGratitudeJarEntry> {
    const encryptedContent = encrypt(content, this.secret);

    const createdGratitudeEntry = await this.gratitudeRepo.createEntry(userId, encryptedContent);
    
    return toSafeGratitudeJarEntry(createdGratitudeEntry, this.decryptField);
  }

  /**
   * Retrieves all gratitude entries for a specific user, decrypting the content of each entry.
   * Supports pagination using cursor-based pagination with lastEntryId.
   *
   * @param userId - The unique identifier of the user whose gratitude entries are to be fetched.
   * @param limit - (Optional) The maximum number of entries to retrieve. Defaults to 10.
   * @param lastEntryId - (Optional) The ID of the last gratitude entry from the previous page, used for pagination.
   * @returns A promise that resolves to a paginated object containing decrypted gratitude entries and pagination info.
   */
  public async getEntriesByUser(
    userId: string,
    limit: number = 10,
    lastEntryId?: string
  ): Promise<PaginatedSafeGratitudeJarEntries> {
    const fetchLimit: number = limit + 1; // Fetch one extra to check if there's more

    const entries = await this.gratitudeRepo.findByUserAfterId(userId, lastEntryId, fetchLimit);

    const hasMore = entries.length > limit;

    // If more, remove the extra entry
    const slicedEntries = hasMore ? entries.slice(0, limit) : entries;

    return {
      entries: toSafeGratitudeJarEntries(slicedEntries, this.decryptField),
      hasMore,
      nextCursor: hasMore ? slicedEntries[slicedEntries.length - 1].gratitude_id : undefined,
    };
  }

  /**
   * Retrieves a gratitude entry by its unique identifier.
   *
   * If the entry exists, its encrypted content is decrypted using the service's secret
   * and returned as the `content` property. If the entry does not exist, returns `null`.
   *
   * @param gratitudeId - The unique identifier of the gratitude entry to retrieve.
   * @param userId - The unique identifier of the user who owns the entry.
   * @returns A promise that resolves to the gratitude entry with decrypted content, or `null` if not found.
   */
  public async getEntryById(gratitudeId: string, userId: string): Promise<SafeGratitudeJarEntry | null> {
    const entry = await this.gratitudeRepo.findById(gratitudeId, userId);

    if (!entry) return null;

    return toSafeGratitudeJarEntry(entry, this.decryptField);
  }

  /**
   * Updates the content of a gratitude entry by its ID.
   * The new content is encrypted before being saved.
   * Returns the updated entry with decrypted content, or `null` if the entry does not exist.
   *
   * @param gratitudeId - The unique identifier of the gratitude entry to update.
   * @param userId - The unique identifier of the user who owns the entry.
   * @param content - The new content to store in the entry.
   * @returns A promise that resolves to the updated `GratitudeEntry` with decrypted content, or `null` if not found.
   */
  public async updateEntry(gratitudeId: string, userId: string, content: string) : Promise<SafeGratitudeJarEntry> {
    
    const encryptedContent = encrypt(content, this.secret);

    const updatedEntry = await this.gratitudeRepo.updateEntry(gratitudeId, userId, encryptedContent);

    return toSafeGratitudeJarEntry(updatedEntry, this.decryptField);
  }

  /**
   * Soft deletes a gratitude entry by its ID.
   *
   * Marks the entry as deleted without permanently removing it from the database.
   *
   * @param gratitudeId - The unique identifier of the gratitude entry to be soft deleted.
   * @param userId - The unique identifier of the user who owns the entry.
   * @returns A promise that resolves when the operation is complete.
   */
  public async softDeleteEntry(gratitudeId: string, userId: string) : Promise<SafeGratitudeJarEntry | null> {
    const deleted = await this.gratitudeRepo.softDelete(gratitudeId, userId);
    if (!deleted) return null;
    return toSafeGratitudeJarEntry(deleted, this.decryptField);
  }

  /**
   * Permanently deletes a gratitude entry from the repository by its ID.
   *
   * @param gratitudeId - The unique identifier of the gratitude entry to delete.
   * @returns A promise that resolves when the entry has been deleted.
   */
  public async hardDeleteEntry(gratitudeId: string) : Promise<void> {
    await this.gratitudeRepo.hardDelete(gratitudeId);
  }
}