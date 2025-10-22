import { Between, type Repository } from "typeorm";
import { fromZonedTime } from "date-fns-tz";
import { AppDataSource } from "../config/datasource.config.js";
import { MoodCheckIn } from "../models/moodCheckIn.model.js";

export class MoodCheckInRepository {
  private repo: Repository<MoodCheckIn>;

  constructor() {
    this.repo = AppDataSource.getRepository(MoodCheckIn);
  }

  public async createCheckIn(
    user_id: string, 
    mood_1: string, 
    mood_2: string | null = null, 
    mood_3: string | null = null,
  ): Promise<MoodCheckIn> {
    const checkIn = this.repo.create({
      user_id,
      mood_1,
      mood_2,
      mood_3,
    });
    return this.repo.save(checkIn);
  }

    public async getCheckInForToday(user_id: string): Promise<MoodCheckIn | null> {
    const now = new Date();
    
    const startOfDayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
  
    const endOfDayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));
  
    return this.repo.findOne({
      where: {
        user_id,
        checked_in_at: Between(startOfDayUTC, endOfDayUTC),
      },
    });
  }
}