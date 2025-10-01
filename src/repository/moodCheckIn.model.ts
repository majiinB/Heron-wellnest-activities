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
    const timeZone = "Asia/Manila";

    const startOfDayPH = new Date();
    startOfDayPH.setHours(0, 0, 0, 0);

    const endOfDayPH = new Date();
    endOfDayPH.setHours(23, 59, 59, 999);

    const startUTC = fromZonedTime(startOfDayPH, timeZone);
    const endUTC = fromZonedTime(endOfDayPH, timeZone);

    return this.repo.findOne({
      where: {
        user_id,  
        checked_in_at: Between(startUTC, endUTC),
      },
    });
  }
}