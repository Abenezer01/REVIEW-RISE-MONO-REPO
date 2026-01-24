export interface ScriptScene {
  title: string;
  description: string;
  voiceover: string;
  timestamp: string;
}

export interface ScriptData {
  scenes: ScriptScene[];
}

export interface GenerateScriptRequest {
  videoTopic: string;
  videoGoal?: string;
  targetAudience?: string;
  tone?: string;
  platform?: string;
  duration?: number;
  includeSceneDescriptions?: boolean;
  includeVisualSuggestions?: boolean;
  includeBRollRecommendations?: boolean;
  includeCallToAction?: boolean;
}

export interface GenerateScriptResponse {
  script: ScriptData;
}
