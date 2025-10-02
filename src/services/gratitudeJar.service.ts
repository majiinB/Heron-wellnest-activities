import { env } from "../config/env.config.js";
import type { GratitudeEntry } from "../models/gratitudeEntry.model.js";
import type { GratitudeEntryRepository } from "../repository/gratitudeEntry.repository.js";
import type { EncryptedField } from "../types/encryptedField.type.js";
import type { SafeGratitudeJarEntry } from "../types/safeGratitudeJarEntry.type.js";
import { encrypt, decrypt } from "../utils/crypto.util.js";
import { toSafeGratitudeJarEntry } from "../utils/gratitudeJar.utils.js";

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
   *
   * @param userId - The unique identifier of the user whose gratitude entries are to be fetched.
   * @returns A promise that resolves to an array of `GratitudeEntry` objects with decrypted content.
   */
  public async getEntriesByUser(
    userId: string,
  ) : Promise<SafeGratitudeJarEntry[]> {
    const entries = await this.gratitudeRepo.findByUserAfterId(userId);
    return entries.map(entry => ({
      ...entry,
      content: entry.content_encrypted ? decrypt(entry.content_encrypted, this.secret) : ''
    }) as GratitudeEntry & { content: string });
  }

  /**
   * Retrieves a gratitude entry by its unique identifier.
   *
   * If the entry exists, its encrypted content is decrypted using the service's secret
   * and returned as the `content` property. If the entry does not exist, returns `null`.
   *
   * @param gratitudeId - The unique identifier of the gratitude entry to retrieve.
   * @returns A promise that resolves to the gratitude entry with decrypted content, or `null` if not found.
   */
  public async getEntryById(gratitudeId: string): Promise<GratitudeEntry | null> {
    const entry = await this.gratitudeRepo.findById(gratitudeId);
    if (!entry) return null;

    return {
      ...entry,
      content: entry.content_encrypted ? decrypt(entry.content_encrypted, this.secret) : ''
    } as GratitudeEntry & { content: string };
  }

  /**
   * Updates the content of a gratitude entry by its ID.
   * The new content is encrypted before being saved.
   * Returns the updated entry with decrypted content, or `null` if the entry does not exist.
   *
   * @param gratitudeId - The unique identifier of the gratitude entry to update.
   * @param content - The new content to store in the entry.
   * @returns A promise that resolves to the updated `GratitudeEntry` with decrypted content, or `null` if not found.
   */
  public async updateEntry(gratitudeId: string, content: string) : Promise<GratitudeEntry | null> {
    
    const encryptedContent = encrypt(content, this.secret);

    const updatedEntry = await this.gratitudeRepo.updateEntry(gratitudeId, encryptedContent);

    if (!updatedEntry) return null;

    return {
      ...updatedEntry,
      content: content ? content : decrypt(updatedEntry.content_encrypted, this.secret)
    } as GratitudeEntry & { content: string };
  }

  /**
   * Soft deletes a gratitude entry by its ID.
   *
   * Marks the entry as deleted without permanently removing it from the database.
   *
   * @param gratitudeId - The unique identifier of the gratitude entry to be soft deleted.
   * @returns A promise that resolves when the operation is complete.
   */
  public async softDeleteEntry(gratitudeId: string) : Promise<void> {
    this.gratitudeRepo.softDelete(gratitudeId);
  }

  /**
   * Permanently deletes a gratitude entry from the repository by its ID.
   *
   * @param gratitudeId - The unique identifier of the gratitude entry to delete.
   * @returns A promise that resolves when the entry has been deleted.
   */
  public async hardDeleteEntry(gratitudeId: string) : Promise<void> {
    this.gratitudeRepo.hardDelete(gratitudeId);
  }
}