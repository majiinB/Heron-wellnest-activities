import type { MoodCheckIn } from "../models/moodCheckIn.model.js";
import type { MoodCheckInRepository } from "../repository/moodCheckIn.repository.js";
import { AppError } from "../types/appError.type.js";

export class MoodCheckInService {
  private moodCheckInRepo : MoodCheckInRepository;

  constructor(moodCheckInRepo : MoodCheckInRepository) {
    this.moodCheckInRepo = moodCheckInRepo;
  }

  public async createCheckIn(
    user_id: string, 
    mood_1: string,
    mood_2: string | null = null,
    mood_3: string | null = null,
  ): Promise<MoodCheckIn> {
    if(await this.getCheckInForToday(user_id)) {
      throw new AppError(400, "CHECKIN_EXISTS", "You have already checked in today.", true);
    }
    
    return await this.moodCheckInRepo.createCheckIn(user_id, mood_1, mood_2, mood_3);
  }

  public async getCheckInForToday(user_id: string):Promise<boolean> {
    const moodCheckIn = await this.moodCheckInRepo.getCheckInForToday(user_id);

    if (!moodCheckIn) {
      return false;
    }

    return true;
  }
}
  