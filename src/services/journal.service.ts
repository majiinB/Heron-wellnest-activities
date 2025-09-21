import { env } from "../config/env.config.js";
import { JournalEntry } from "../models/journalEntry.model.js";
import type { JournalEntryRepository } from "../repository/journalEntry.repository.js";
import { decrypt, encrypt } from "../utils/crypto.util.js";

export class JournalService {
  private journalRepo : JournalEntryRepository;
  private secret: string;

  constructor(journalRepo : JournalEntryRepository) {
    this.journalRepo = journalRepo;
    this.secret = env.CONTENT_ENCRYPTION_KEY;
  }

  public async createEntry(userId: string, content: string) {

    const encryptedContent = encrypt(content, this.secret);

    return this.journalRepo.createEntry(userId, encryptedContent);

    // TODO: Send event to message broker
  }

  public async getEntriesByUser(
    userId: string,
    limit: number = 10,
    lastEntryId?: string
  ) {
    const entries = await this.journalRepo.findByUserAfterId(userId, lastEntryId, limit);

    return entries.map(entry => ({
      ...entry,
      content: decrypt(entry.content_encrypted, this.secret)
    }));
  }

  public async getEntryById(journalId: string) {
    const entry = await this.journalRepo.findById(journalId);
    if (!entry) return null;

    return {
      ...entry,
      content: decrypt(entry.content_encrypted, this.secret)
    };
  }

  public async updateEntry(journalId: string, content?: string, mood?: Record<string, number>) {
    let encryptedContent;
    if (content) {
      encryptedContent = encrypt(content, this.secret);
    }
    const updatedEntry = await this.journalRepo.updateEntry(journalId, encryptedContent, mood);

    if (!updatedEntry) return null;

    return {
      ...updatedEntry,
      content: content ? content : decrypt(updatedEntry.content_encrypted, this.secret)
    };
  }

  public async softDeleteEntry(journalId: string) {
    return this.journalRepo.softDelete(journalId);
  }

  public async hardDeleteEntry(journalId: string) {
    return this.journalRepo.hardDelete(journalId);
  }
}