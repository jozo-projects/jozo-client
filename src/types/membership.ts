import type { ObjectId } from "mongodb";

export interface IStreakReward {
  count: number;
  bonusPoints: number;
  itemCount?: number;
  giftId?: ObjectId | string;
}

export interface IStreakConfig {
  /** Số ngày không đi thì streak reset về 0. Độc lập với mốc rewards. */
  resetAfterDays: number;
  rewards: IStreakReward[];
}

export interface IGroupSizeBonus {
  sizeGte: number;
  points: number;
}

export interface IBonusRules {
  bookingEarlyBonus?: number;
  offPeakBonus?: number;
  groupSizeBonus?: IGroupSizeBonus;
  birthdayMultiplier?: number;
  [key: string]: unknown;
}

export interface IMembershipConfig {
  _id?: ObjectId | string;
  currencyUnit: number;
  pointPerCurrency: number;
  tierThresholds: Record<string, number>;
  tierBenefits?: Record<string, unknown>;
  bonusRules?: IBonusRules;
  streak?: IStreakConfig;
  dailySelfClaimLimitPerPhone?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IMemberLoyalty {
  points?: number;
  totalPoints?: number;
  balance?: number;
  tier?: string;
  tierName?: string;
  streakCount?: number;
  lastClaimedAt?: string | Date;
  [key: string]: unknown;
}

export interface IMemberProfile {
  _id?: string | ObjectId;
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  date_of_birth?: string | Date | null;
  fullName?: string;
  full_name?: string;
  name?: string;
  role?: string;
  tier?: string;
  tierName?: string;
  loyalty?: IMemberLoyalty;
  loyaltyPoints?: number;
  points?: number;
  membership?: {
    tier?: string;
    tierName?: string;
    points?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

