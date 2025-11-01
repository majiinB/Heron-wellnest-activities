import type { allObtainableBadges, UserBadgeRepository } from "../repository/userBadge.repository.js";

/**
 * Service class for managing user badges.
 *
 * @description Provides methods to retrieve user badges and check badge ownership.
 * Acts as a business logic layer between controllers and the repository.
 *
 * @remarks
 * - Retrieves badges with selected details (badge_id, name, description, icon_url, awarded_at).
 * - Can check if a user has already earned a specific badge.
 * - Handles badge awarding logic through the repository layer.
 *
 * @example
 * ```typescript
 * const service = new UserBadgeService(userBadgeRepo);
 * const badges = await service.getUserBadges(userId);
 * const hasBadge = await service.checkUserHasBadge(userId, badgeId);
 * ```
 *
 * @file userBadge.service.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-26
 * @updated 2025-11-01
 */
export class UserBadgeService {
  private userBadgeRepo: UserBadgeRepository;

  /**
   * Creates an instance of the UserBadgeService.
   * 
   * @param userBadgeRepo - The repository used for accessing and managing user badges.
   */
  constructor(userBadgeRepo: UserBadgeRepository) {
    this.userBadgeRepo = userBadgeRepo;
  }

  /**
   * Retrieves all badges that a user has obtained.
   *
   * Returns an array of badge objects containing badge_id, name, description, 
   * icon_url, and the timestamp when the badge was awarded.
   *
   * @param userId - The unique identifier of the user whose badges are to be retrieved.
   * @returns A promise that resolves to an array of badge objects with selected details.
   */
  public async getUserBadges(userId: string): Promise<Array<{
    badge_id: string;
    name: string;
    description: string | null;
    icon_url: string | null;
    awarded_at: Date;
  }>> {
    return await this.userBadgeRepo.getUserBadgesWithDetails(userId);
  }

  /**
   * Checks if a user has already been awarded a specific badge.
   *
   * @param userId - The unique identifier of the user.
   * @param badgeId - The unique identifier of the badge to check.
   * @returns A promise that resolves to `true` if the user has the badge, otherwise `false`.
   */
  public async checkUserHasBadge(userId: string, badgeId: string): Promise<boolean> {
    return await this.userBadgeRepo.hasUserBadge(userId, badgeId);
  }

  /**
   * Gets the total count of badges a user has obtained.
   *
   * @param userId - The unique identifier of the user whose badges are to be counted.
   * @returns A promise that resolves to the total number of badges the user has earned.
   */
  public async getUserBadgeCount(userId: string): Promise<number> {
    return await this.userBadgeRepo.countByUser(userId);
  }

  /**
   * Retrieves all badges along with a flag indicating whether the user already has each badge.
   *
   * The returned array includes every obtainable badge; each item contains an `isObtained`
   * boolean set to `true` when the user already owns the badge and `false` otherwise.
   *
   * @param userId - The unique identifier of the user to evaluate.
   * @returns A Promise that resolves to an array of allObtainableBadges with `isObtained` normalized to boolean.
   * @throws {Error} If the provided userId is falsy or the repository operation fails.
   */
  public async getAllObtainableBadges(userId: string): Promise<allObtainableBadges[]> {
    return await this.userBadgeRepo.getAllObtainableBadges(userId);
  } 
}
