import type { Repository } from "typeorm";
import { AppDataSource } from "../../config/datasource.config.js";
import { UserBadge } from "../../models/activities/userBadge.model.js";
import { Badge } from "../../models/activities/badge.model.js";

export type allObtainableBadges = {
  badge: UserBadgeWithDetails;
  is_obtained: boolean;
}

export type UserBadgeWithDetails = {
  badge_id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  awarded_at: Date;
}

/**
 * Repository class for managing user badge entities in the database.
 *
 * @description Provides methods for awarding badges to users, retrieving user badges with full badge details,
 * and checking if a user has already been awarded a specific badge.
 * All operations are performed using TypeORM's Repository API.
 *
 * @remarks
 * - When retrieving user badges, the repository joins with the Badge entity to include full badge details
 *   such as name, description, icon_url, event_trigger, threshold, condition_type, and level.
 * - The `getUserBadgesWithDetails` method returns badges ordered by awarded_at in descending order (most recent first).
 *
 * @example
 * ```typescript
 * const repo = new UserBadgeRepository();
 * const userBadges = await repo.getUserBadgesWithDetails(userId);
 * const hasFirstJournal = await repo.hasUserBadge(userId, badgeId);
 * ```
 * 
 * @file userBadge.repository.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-26
 * @updated 2025-11-01
 */
export class UserBadgeRepository {
  private repo: Repository<UserBadge>;
  private badgeRepo: Repository<Badge>;

  constructor() {
    this.repo = AppDataSource.getRepository(UserBadge);
    this.badgeRepo = AppDataSource.getRepository(Badge);
  }

  /**
   * Retrieves all badges that a user has obtained, with selected badge details.
   *
   * @param user_id - The unique identifier of the user whose badges are to be fetched.
   * @returns A promise that resolves to an array of objects containing badge information.
   * 
   * @remarks
   * Each returned object includes:
   * - badge_id: The badge's unique identifier
   * - name: The badge name
   * - description: The badge description (can be null)
   * - icon_url: URL to the badge icon (can be null)
   * - awarded_at: The timestamp when the badge was awarded to the user
   */
  async getUserBadgesWithDetails(user_id: string): Promise<UserBadgeWithDetails[]> {
    const userBadges = await this.repo
      .createQueryBuilder("userBadge")
      .leftJoinAndSelect("userBadge.badge", "badge")
      .where("userBadge.user_id = :user_id", { user_id })
      .orderBy("userBadge.awarded_at", "DESC")
      .getMany();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return userBadges.map((userBadge: any) => ({
      badge_id: userBadge.badge.badge_id,
      name: userBadge.badge.name,
      description: userBadge.badge.description,
      icon_url: userBadge.badge.icon_url,
      awarded_at: userBadge.awarded_at
    }));
  }

  /**
   * Retrieves all badges from the repository and indicates whether a specific user has obtained each one.
   *
   * This method performs a left join between badges and the user's badge records (filtered by the provided userId)
   * to produce an array of objects describing each badge and a boolean flag `is_obtained`. If the user has obtained
   * the badge, the badge object's `awarded_at` is populated from the corresponding userBadge entry; otherwise
   * `awarded_at` is set to the Unix epoch (new Date(0)).
   *
   * Notes:
   * - The method does not modify any database records; it only reads badge and userBadge data.
   * - The shape of each returned item conforms to `allObtainableBadges[]`, where each item contains:
   *   - `badge`: badge metadata plus an `awarded_at` Date
   *   - `is_obtained`: boolean indicating whether the user has the badge
   *
   * @param userId - The identifier of the user for whom badge ownership should be determined. Expected to be a non-empty string.
   * @returns A Promise that resolves to an array of `allObtainableBadges` entries representing every badge and whether the user has obtained it.
   * @throws Will propagate repository/query errors (e.g., database connectivity or query failures) originating from the underlying ORM.
   *
   * @example
   * // const result = await repo.getAllObtainableBadges("user-uuid");
   */
  public async getAllObtainableBadges(userId: string): Promise<allObtainableBadges[]> {
    const badgesWithStatus = await this.badgeRepo
      .createQueryBuilder("badge")
      .leftJoinAndSelect("badge.userBadges", "userBadge", "userBadge.user_id = :userId", { userId })
      .getMany();
  
    return badgesWithStatus.map(badge => ({
      badge: {
        badge_id: badge.badge_id,
        name: badge.name,
        description: badge.description,
        icon_url: badge.icon_url,
        awarded_at: badge.userBadges && badge.userBadges.length > 0 ? badge.userBadges[0].awarded_at : new Date(0)
      },
      is_obtained: badge.userBadges && badge.userBadges.length > 0
    }));
  }

  /**
   * Checks if a user has already been awarded a specific badge.
   *
   * @param user_id - The unique identifier of the user.
   * @param badge_id - The unique identifier of the badge to check.
   * @returns A promise that resolves to `true` if the user has the badge, otherwise `false`.
   */
  async hasUserBadge(user_id: string, badge_id: string): Promise<boolean> {
    const count = await this.repo
      .createQueryBuilder("userBadge")
      .where("userBadge.user_id = :user_id", { user_id })
      .andWhere("userBadge.badge_id = :badge_id", { badge_id })
      .getCount();
    return count > 0;
  }

  /**
   * Retrieves a specific user badge by its unique identifier.
   *
   * @param user_badge_id - The unique identifier of the user badge.
   * @param user_id - The unique identifier of the user who owns the badge.
   * @returns A promise that resolves to the user badge if found, otherwise `null`.
   */
  async findById(user_badge_id: string, user_id: string): Promise<UserBadge | null> {
    return await this.repo.findOne({
      where: { user_badge_id, user_id }
    });
  }

  /**
   * Counts the total number of badges a user has obtained.
   *
   * @param user_id - The unique identifier of the user whose badges are to be counted.
   * @returns A promise that resolves to the count of badges the user has obtained.
   */
  async countByUser(user_id: string): Promise<number> {
    return await this.repo.count({
      where: { user_id }
    });
  }
}
