export interface ThreatEntity {
  type: 'phone' | 'upi' | 'url' | 'email' | 'org';
  value: string;
  source: string;
  isKnownThreat?: boolean;
  knownReports?: string[];
}

export interface ScoreRuleBreakdown {
  rule: string;
  points: number;
  description: string;
}

export interface ScamDnaProfile {
  dnaCode: string;
  category: string;
  tactics: string[];
  primaryIdentifier: string;
  similarityScore?: number;
  similarReportId?: string;
  similarityHash?: string;
  createdAt?: string;
}

export interface AnalysisResult {
  riskScore: number;
  riskLevel: 'LOW' | 'SUSPICIOUS' | 'HIGH RISK';
  confidence: number;
  scamCategory: string;
  detectedTactics: string[];
  reasons: string[];
  scoreBreakdown: ScoreRuleBreakdown[];
  extractedEntities: ThreatEntity[];
  explanation: string;
  aiPowered: boolean;
  aiInsights?: {
    psychologicalTriggers: string[];
    victimTargeting: string;
    counterBaitStrategy: string;
  };
  scamDna: ScamDnaProfile;
}

export interface ScamReport {
  id: string;
  sourceType: string;
  rawMessage: string;
  riskScore: number;
  riskLevel: 'LOW' | 'SUSPICIOUS' | 'HIGH RISK';
  scamCategory: string;
  confidence: number;
  explanation: string;
  tactics: string[];
  indicatorsCount: number;
  status: string;
  createdAt: string;
}

export interface ThreatIndicatorItem {
  id: string;
  reportId: string;
  type: 'phone' | 'upi' | 'url' | 'email' | 'org';
  value: string;
  riskWeight: number;
  verified: boolean;
  timesSeen: number;
  lastSeen: string;
  scamCategory?: string;
  riskLevel?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  subLabel?: string;
  fullValue?: string;
  type: 'report' | 'phone' | 'upi' | 'url' | 'email' | 'org';
  riskLevel?: string;
  score?: number;
  timesSeen?: number;
  radius?: number;
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: string;
}

export interface ChatMessage {
  id: string;
  sender: 'scammer' | 'scambait_ai';
  text: string;
  timestamp: string;
}

export interface ExtractedIntel {
  phones: string[];
  upiIds: string[];
  domains: string[];
  organizations: string[];
  locations: string[];
  tacticsObserved: string[];
}

export interface PersonaConfig {
  id: string;
  name: string;
  archetype: string;
  description: string;
  tone: string;
}
