import type { JournalEntry } from "../models/journalEntry.model.js";

export type SafeJournalEntry = Omit<JournalEntry, "title_encrypted" | "content_encrypted"> & {
  title: string;
  content: string;
};