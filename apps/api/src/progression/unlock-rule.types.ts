export interface StageUnlockRequirement {
  stageId: string;
  minStars: number;
}

export interface StageUnlockRule {
  requiresStages: StageUnlockRequirement[];
}
