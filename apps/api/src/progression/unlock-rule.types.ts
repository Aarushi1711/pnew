export interface StageUnlockRequirement {
  stageId: string;
  minStars: number;
}

export interface StageUnlockRule {
  requiresStages: StageUnlockRequirement[];
}

export interface TrackUnlockRequirement {
  trackId: string;
  minPercent: number;
}

export interface TrackUnlockRule {
  requiresTracks: TrackUnlockRequirement[];
}
