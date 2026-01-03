export interface UrlAccessibilityValidation {
  isPubliclyAccessible: boolean;
  noLoginWall: boolean;
  noIpRestriction: boolean;
  noAggressiveBotBlocking: boolean;
  message?: string;
}

export interface RobotsTxtValidation {
  allowsAIBots: boolean;
  message?: string;
}

export interface SeoPracticesValidation {
  properHtml: boolean;
  semanticTags: boolean;
  sitemapXml: boolean;
  cleanUrls: boolean;
  message?: string;
}

export interface AiVisibilityValidationResults {
  urlAccessibility: UrlAccessibilityValidation;
  robotsTxt: RobotsTxtValidation;
  seoPractices: SeoPracticesValidation;
}