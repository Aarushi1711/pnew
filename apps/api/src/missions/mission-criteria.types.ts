export interface StageStarsCriteria {
  type: 'stage_stars';
  stageId: string;
  minStars: number;
}

export interface SolveCountCriteria {
  type: 'solve_count';
  count: number;
}

export type MissionCriteria = StageStarsCriteria | SolveCountCriteria;

export interface MissionEvaluationResult {
  satisfied: boolean;
  current: number;
  target: number;
}
