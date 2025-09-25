/**
 * Encrypted Field Type
 * 
 * @description Defines the structure for Journal entries' encrypted fields.
 * 
 * @file encryptedField.type.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-25
 * @updated 2025-09-25
 */
export type EncryptedField = {
  iv: string;       // Initialization Vector
  content: string;  // Encrypted content (ciphertext)
  tag: string;      // Authentication tag for integrity verification
}