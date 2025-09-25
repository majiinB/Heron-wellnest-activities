import type { JournalEntry } from "../models/journalEntry.model.js";
import { AppError } from "../types/appError.type.js";
import type { SafeJournalEntry } from "../types/safeJournalEntry.type.js";

/**
 * Converts an encrypted journal entry into a safe, decrypted format.
 *
 * Decrypts the `title_encrypted` and `content_encrypted` fields of the provided
 * `JournalEntry` using the given `decrypt` function, and returns a `SafeJournalEntry`
 * with the decrypted `title` and `content` fields. If decryption fails, throws an
 * `AppError` with a 500 status code.
 *
 * @param entry - The encrypted journal entry to be converted.
 * @param decrypt - A function that decrypts a field containing `iv`, `content`, and `tag`.
 * @returns A `SafeJournalEntry` with decrypted `title` and `content`.
 * @throws {AppError} If decryption fails.
 */
export function toSafeJournalEntry(
  entry: JournalEntry, 
  decrypt: (field: {
    iv: string;
    content: string;
    tag: string;
  }) => string): SafeJournalEntry {
  try {
    const { title_encrypted, content_encrypted, mood, ...rest } = entry;
    return {
      ...rest,
      title: decrypt(title_encrypted),
      content: decrypt(content_encrypted),
    };
  } catch (error) {
    throw new AppError(
      500,
      'DECRYPTION_ERROR',
      'Failed to decrypt journal entry',
      true
    );
  }
}

/**
 * Converts an array of `JournalEntry` objects into an array of `SafeJournalEntry` objects,
 * ensuring that sensitive information is handled according to the provided key.
 *
 * @param entries - The array of journal entries to be sanitized.
 * @param decrypt - A function that decrypts a field containing `iv`, `content`, and `tag`.
 * @returns An array of sanitized journal entries.
 */
export function toSafeJournalEntries(
  entries: JournalEntry[],
  decrypt: (field: {
    iv: string;
    content: string;
    tag: string;
  }) => string): SafeJournalEntry[] {
  return entries.map(e => toSafeJournalEntry(e, decrypt));
}