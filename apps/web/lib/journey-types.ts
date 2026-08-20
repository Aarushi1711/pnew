export interface ModuleNode {
  id: string;
  orderIndex: number;
  // Real title -- intentionally not rendered on the Journey map (concealment
  // rule); kept in the data for later use in stats/in-problem views.
  title: string;
  contentType: string;
  status: string;
  starsEarned: number;
  hasMorePractice: boolean;
}

export interface StageNode {
  id: string;
  orderIndex: number;
  // Real title -- intentionally not rendered on the Journey map (concealment
  // rule); "Mission N" (position within the track) is shown instead.
  title: string;
  locked: boolean;
  status: string;
  modules: ModuleNode[];
}

export interface TrackNode {
  id: string;
  slug: string;
  title: string;
  orderIndex: number;
  description: string | null;
  status: string;
  stages: StageNode[];
}

export interface JourneyMap {
  tracks: TrackNode[];
}
