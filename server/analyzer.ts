import { GoogleGenAI, Type } from '@google/genai';
import { getDatabase } from './db.js';

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
  scamDna: {
    dnaCode: string;
    category: string;
    tactics: string[];
    primaryIdentifier: string;
    similarityScore?: number;
    similarReportId?: string;
  };
}

export async function analyzeMessage(rawMessage: string, sourceType = 'SMS'): Promise<AnalysisResult> {
  const text = (rawMessage || '').trim();
  const lowerText = text.toLowerCase();
  const db = await getDatabase();

  const detectedTactics: string[] = [];
  const reasons: string[] = [];
  const scoreBreakdown: ScoreRuleBreakdown[] = [];
  let score = 0;

  // 1. Urgency Detection
  const urgencyKeywords = [
    'urgent', 'immediately', 'within 24 hours', 'within 2 hours', 'blocked today', 
    'tonight at', 'expir', 'hurry', 'act now', 'last chance', 'instant', 'promptly', 
    'time sensitive', 'without delay', 'asap'
  ];
  const foundUrgency = urgencyKeywords.filter(k => lowerText.includes(k));
  if (foundUrgency.length > 0) {
    detectedTactics.push('Urgency Pressure');
    reasons.push('High artificial urgency inducing impulsive compliance');
    scoreBreakdown.push({
      rule: 'Urgency Detected',
      points: 15,
      description: `Detected high-urgency keywords: ${foundUrgency.slice(0, 3).join(', ')}`
    });
    score += 15;
  }

  // 2. Coercive Threats & Account Block Warnings
  const threatKeywords = [
    'blocked', 'suspended', 'deactivated', 'freeze', 'frozen', 'legal action', 
    'arrest warrant', 'police complaint', 'disconnected', 'power cut', 'fine', 
    'penalty', 'fir', 'court notice', 'seized', 'detained'
  ];
  const foundThreats = threatKeywords.filter(k => lowerText.includes(k));
  if (foundThreats.length > 0) {
    detectedTactics.push('Coercive Threat & Intimidation');
    reasons.push('Threat of service disconnection, legal action, or account freeze');
    scoreBreakdown.push({
      rule: 'Coercive Threats',
      points: 20,
      description: `Threats detected: ${foundThreats.slice(0, 3).join(', ')}`
    });
    score += 20;
  }

  // 3. Payment Request & Advance Fee
  const paymentKeywords = [
    'send ₹', 'pay ₹', 'transfer ₹', 'deposit', 'rs.', 'inr', 'pay fee', 
    'processing charge', 'clearance fee', 'duty tax', 'send money', 'recharge', 
    'send 1 rupee', 'send rs 1', 'send ₹1'
  ];
  const foundPayments = paymentKeywords.filter(k => lowerText.includes(k));
  if (foundPayments.length > 0) {
    detectedTactics.push('Direct Payment Request');
    reasons.push('Explicit monetary request or advance verification fee');
    scoreBreakdown.push({
      rule: 'Payment Request',
      points: 25,
      description: `Monetary demand detected (${foundPayments.slice(0, 2).join(', ')})`
    });
    score += 25;
  }

  // 4. OTP / PIN / Password / Credential Harvesting
  const credentialKeywords = [
    'otp', 'one time password', 'pin', 'share 6 digit', 'password', 'cvv', 
    'secret code', 'atm pin', 'credentials', 'card number', 'security code'
  ];
  const foundCredentials = credentialKeywords.filter(k => lowerText.includes(k));
  if (foundCredentials.length > 0) {
    detectedTactics.push('Credential Harvesting');
    reasons.push('High-risk solicitation of sensitive security tokens (OTP/PIN/Password)');
    scoreBreakdown.push({
      rule: 'OTP/PIN/Password Request',
      points: 30,
      description: `Sensitive credential requests detected: ${foundCredentials.join(', ')}`
    });
    score += 30;
  }

  // 5. Bank Impersonation
  const bankKeywords = [
    'sbi', 'state bank', 'hdfc', 'icici', 'axis bank', 'punjab national', 'pnb', 
    'bank of baroda', 'canara', 'rbi', 'reserve bank', 'netbanking', 'yono', 
    'chase', 'wells fargo', 'bank alert', 'kyc update', 'kyc expired'
  ];
  const foundBanks = bankKeywords.filter(k => lowerText.includes(k));
  if (foundBanks.length > 0) {
    detectedTactics.push('Bank Impersonation');
    reasons.push('Impersonation of recognized commercial banking institutions or central bank');
    scoreBreakdown.push({
      rule: 'Banking Impersonation',
      points: 15,
      description: `Bank identity references: ${foundBanks.slice(0, 3).join(', ')}`
    });
    score += 15;
  }

  // 6. Authority / Government / Law Enforcement Impersonation
  const authorityKeywords = [
    'customs', 'income tax', 'cbi', 'ed', 'enforcement directorate', 'police', 
    'cyber crime', 'india post', 'postal service', 'discom', 'electricity board', 
    'telecom regulatory', 'trai', 'courier customs'
  ];
  const foundAuthority = authorityKeywords.filter(k => lowerText.includes(k));
  if (foundAuthority.length > 0) {
    detectedTactics.push('Government & Authority Impersonation');
    reasons.push('Impersonation of state authority, law enforcement, or public utilities');
    scoreBreakdown.push({
      rule: 'Government/Police Impersonation',
      points: 20,
      description: `Authority claims: ${foundAuthority.slice(0, 3).join(', ')}`
    });
    score += 20;
  }

  // 7. Prize / Lottery / Unrealistic Gain / Job Scams
  const prizeJobKeywords = [
    'lottery', 'won ₹', 'won rs', 'winner', 'lucky draw', 'reward points', 
    'earn ₹', 'earn 3000', 'part-time', 'like youtube', 'telegram task', 
    'guaranteed return', '300% profit', 'vip crypto'
  ];
  const foundPrizeJob = prizeJobKeywords.filter(k => lowerText.includes(k));
  if (foundPrizeJob.length > 0) {
    detectedTactics.push('Unrealistic Financial Reward / Job Fraud');
    reasons.push('Unrealistic financial enticement (lottery, high-yield tasks, or part-time lure)');
    scoreBreakdown.push({
      rule: 'Unrealistic Reward/Task Scam',
      points: 20,
      description: `Lure keywords: ${foundPrizeJob.slice(0, 3).join(', ')}`
    });
    score += 20;
  }

  // Entity Extraction: Phone Numbers
  const extractedEntities: ThreatEntity[] = [];
  const phoneRegex = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g;
  const phonesMatched = text.match(phoneRegex) || [];
  for (const p of Array.from(new Set(phonesMatched))) {
    const cleanPhone = p.replace(/[\s-]/g, '');
    if (cleanPhone.length >= 10) {
      extractedEntities.push({
        type: 'phone',
        value: cleanPhone,
        source: 'Regex extraction'
      });
    }
  }

  // Entity Extraction: UPI IDs
  const upiRegex = /[a-zA-Z0-9.\-_]{2,64}@(okaxis|oksbi|okhdfcbank|okicici|paytm|ybl|ibl|apl|axl|upi|sbi|postbank|federal|barodampay)/gi;
  const upiMatched = text.match(upiRegex) || [];
  for (const u of Array.from(new Set(upiMatched))) {
    extractedEntities.push({
      type: 'upi',
      value: u.toLowerCase(),
      source: 'UPI handle pattern match'
    });
  }

  // Entity Extraction: URLs & Domains
  const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*|[a-zA-Z0-9.-]+\.(?:online|vip|top|club|xyz|site|cc|live|apk|work|buzz|info|app)/gi;
  const urlsMatched = text.match(urlRegex) || [];
  for (const u of Array.from(new Set(urlsMatched))) {
    let cleanUrl = u.trim().replace(/[.,;)]+$/, '');
    extractedEntities.push({
      type: 'url',
      value: cleanUrl,
      source: 'URL/Domain pattern'
    });
  }

  // Entity Extraction: Emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailsMatched = text.match(emailRegex) || [];
  for (const e of Array.from(new Set(emailsMatched))) {
    if (!e.includes('@ok') && !e.includes('@ybl') && !e.includes('@paytm')) {
      extractedEntities.push({
        type: 'email',
        value: e.toLowerCase(),
        source: 'Email pattern'
      });
    }
  }

  // Entity Extraction: Organizations mentioned
  const orgCandidates = [
    'State Bank of India', 'SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 
    'FedEx', 'India Post', 'Electricity Department', 'Telegram', 'WhatsApp', 
    'Amazon', 'Flipkart', 'Reserve Bank of India', 'Income Tax Dept'
  ];
  for (const org of orgCandidates) {
    if (new RegExp(`\\b${org}\\b`, 'i').test(text)) {
      extractedEntities.push({
        type: 'org',
        value: org,
        source: 'Keyword taxonomy'
      });
    }
  }

  // Evaluate Suspicious URLs
  const hasSuspiciousUrl = extractedEntities.some(e => {
    if (e.type !== 'url') return false;
    const val = e.value.toLowerCase();
    return val.includes('.online') || val.includes('.club') || val.includes('.vip') || 
           val.includes('.top') || val.includes('.xyz') || val.includes('.apk') || 
           val.includes('bit.ly') || val.includes('tinyurl') || val.includes('-kyc') || 
           val.includes('-verify') || val.includes('-pay');
  });

  if (hasSuspiciousUrl) {
    detectedTactics.push('Suspicious / Phishing URL');
    reasons.push('Contains suspicious top-level domain or deceptive verification link');
    scoreBreakdown.push({
      rule: 'Suspicious Domain / Phishing Link',
      points: 20,
      description: 'URL uses high-risk TLD or deceptive naming convention'
    });
    score += 20;
  }

  // Cross-reference entities with database
  let knownIndicatorHits = 0;
  for (const entity of extractedEntities) {
    try {
      const res = db.exec(`
        SELECT report_id, times_seen, risk_weight, verified 
        FROM threat_indicators 
        WHERE indicator_value = ? COLLATE NOCASE
      `, [entity.value]);

      if (res.length > 0 && res[0].values.length > 0) {
        entity.isKnownThreat = true;
        entity.knownReports = res[0].values.map(v => String(v[0]));
        knownIndicatorHits++;
      }
    } catch {
      // Ignore DB cross-check error
    }
  }

  if (knownIndicatorHits > 0) {
    detectedTactics.push('Known Database Threat Match');
    reasons.push(`Matched ${knownIndicatorHits} previously reported threat indicator(s) in intelligence registry`);
    scoreBreakdown.push({
      rule: 'Known Indicator in Threat Registry',
      points: 30,
      description: `Cross-referenced ${knownIndicatorHits} known malicious identifier(s) from past reports`
    });
    score += 30;
  }

  // Source Type Context
  if (sourceType.toUpperCase() === 'SMS' && (extractedEntities.some(e => e.type === 'phone' || e.type === 'upi'))) {
    scoreBreakdown.push({
      rule: 'Personal Contact in Institutional Message',
      points: 10,
      description: 'Institutional notice routes communication to unverified personal channel'
    });
    score += 10;
  }

  // Normalize final score to 0–100
  score = Math.min(100, Math.max(0, score));

  // Determine Risk Level
  let riskLevel: 'LOW' | 'SUSPICIOUS' | 'HIGH RISK' = 'LOW';
  if (score >= 60) {
    riskLevel = 'HIGH RISK';
  } else if (score >= 30) {
    riskLevel = 'SUSPICIOUS';
  } else {
    riskLevel = 'LOW';
    if (reasons.length === 0) {
      reasons.push('No recognized malicious patterns or high-risk identifiers detected');
    }
  }

  // Determine Primary Scam Category
  let scamCategory = 'Uncategorized';
  if (foundBanks.length > 0 || lowerText.includes('kyc')) {
    scamCategory = 'Bank Impersonation';
  } else if (foundAuthority.length > 0 && (lowerText.includes('electricity') || lowerText.includes('bill'))) {
    scamCategory = 'Utility & Bill Fraud';
  } else if (lowerText.includes('customs') || lowerText.includes('fedex') || lowerText.includes('parcel') || lowerText.includes('courier')) {
    scamCategory = 'Parcel & Delivery Scam';
  } else if (lowerText.includes('job') || lowerText.includes('part-time') || lowerText.includes('task') || lowerText.includes('youtube')) {
    scamCategory = 'Part-Time Task Scam';
  } else if (foundPrizeJob.length > 0 || lowerText.includes('lottery') || lowerText.includes('won')) {
    scamCategory = 'Lottery & Prize Scam';
  } else if (lowerText.includes('crypto') || lowerText.includes('investment') || lowerText.includes('profit')) {
    scamCategory = 'Investment & Crypto Fraud';
  } else if (foundCredentials.length > 0) {
    scamCategory = 'Credential Harvesting';
  } else if (score >= 30) {
    scamCategory = 'Social Engineering Fraud';
  } else {
    scamCategory = 'Legitimate or Low Risk';
  }

  // Generate Scam DNA Code
  const primaryId = extractedEntities[0]?.value || 'NONE';
  const prefix = scamCategory.split(' ')[0].toUpperCase().slice(0, 3) || 'GEN';
  const hashSeed = Math.abs(hashString(text + primaryId)).toString(16).toUpperCase().padStart(4, '0').slice(0, 4);
  const dnaCode = `DNA-${prefix}-${score}-${hashSeed}`;

  // Find most similar existing report in database
  let similarityScore: number | undefined;
  let similarReportId: string | undefined;

  try {
    const existingDna = db.exec(`
      SELECT report_id, category, tactics_json, primary_identifier 
      FROM scam_dna 
      ORDER BY created_at DESC LIMIT 10
    `);

    if (existingDna.length > 0 && existingDna[0].values.length > 0) {
      let maxSim = 0;
      let bestMatchId = '';

      for (const row of existingDna[0].values) {
        const repId = String(row[0]);
        const cat = String(row[1]);
        const rowTactics: string[] = JSON.parse(String(row[2]) || '[]');
        const rowPrimary = String(row[3]);

        let sim = 0;
        if (cat === scamCategory) sim += 40;
        const sharedTactics = detectedTactics.filter(t => rowTactics.includes(t));
        sim += Math.min(40, sharedTactics.length * 15);
        if (rowPrimary === primaryId && primaryId !== 'NONE') sim += 20;

        if (sim > maxSim) {
          maxSim = sim;
          bestMatchId = repId;
        }
      }

      if (maxSim > 35) {
        similarityScore = Math.min(96, maxSim);
        similarReportId = bestMatchId;
      }
    }
  } catch {
    // Ignore similarity check error
  }

  // Confidence calculation
  const confidence = score >= 60 ? 0.94 : score >= 30 ? 0.85 : 0.92;

  // Synthesis explanation
  let explanation = `ScamBait multi-signal engine flagged this message with a risk score of ${score}/100 (${riskLevel}). `;
  if (reasons.length > 0) {
    explanation += reasons.join('. ') + '.';
  }

  // Check Gemini AI Availability
  let aiPowered = false;
  let aiInsights: AnalysisResult['aiInsights'] | undefined;

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `You are a senior defensive cybersecurity threat analyst analyzing a suspicious incoming message.
Analyze this message for social engineering markers, manipulation psychology, and safe honeypot counter-bait strategies.

MESSAGE:
"""${text}"""

BASELINE HEURISTIC FINDINGS:
- Score: ${score}/100 (${riskLevel})
- Category: ${scamCategory}
- Tactics: ${detectedTactics.join(', ')}

Return a strict JSON object with:
- "refinedExplanation": A concise 2-sentence expert threat assessment.
- "psychologicalTriggers": List of 2-4 emotional triggers exploited (e.g., Fear of loss, Obedience to authority, FOMO).
- "victimTargeting": 1 sentence describing the likely demographic or profile targeted.
- "counterBaitStrategy": 1 sentence describing how an educational AI simulator should safely engage the scammer to reveal their payment handles or domains without risking harm.
`;

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              refinedExplanation: { type: Type.STRING },
              psychologicalTriggers: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              victimTargeting: { type: Type.STRING },
              counterBaitStrategy: { type: Type.STRING }
            },
            required: ['refinedExplanation', 'psychologicalTriggers', 'victimTargeting', 'counterBaitStrategy']
          }
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 6500)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.refinedExplanation) {
          explanation = parsed.refinedExplanation;
        }
        aiInsights = {
          psychologicalTriggers: parsed.psychologicalTriggers || [],
          victimTargeting: parsed.victimTargeting || '',
          counterBaitStrategy: parsed.counterBaitStrategy || ''
        };
        aiPowered = true;
      }
    } catch (aiErr) {
      console.warn('Gemini AI analysis fallback triggered:', aiErr);
      aiPowered = false;
    }
  }

  return {
    riskScore: score,
    riskLevel,
    confidence,
    scamCategory,
    detectedTactics,
    reasons,
    scoreBreakdown,
    extractedEntities,
    explanation,
    aiPowered,
    aiInsights,
    scamDna: {
      dnaCode,
      category: scamCategory,
      tactics: detectedTactics,
      primaryIdentifier: primaryId,
      similarityScore,
      similarReportId
    }
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
