import { GoogleGenAI } from '@google/genai';

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

export const PRESET_PERSONAS: PersonaConfig[] = [
  {
    id: 'confused_elder',
    name: 'Mrs. Margaret / Sharmaji',
    archetype: 'Tech-Challenged Elder',
    description: 'Polite, slightly confused, slow with technology. Asks step-by-step questions, feigns trouble reading links, lures scammer into giving alternate UPI/phone contacts.',
    tone: 'Innocent, apologetic, trusting'
  },
  {
    id: 'anxious_customer',
    name: 'Devraj (Worried Account Holder)',
    archetype: 'Panicked Consumer',
    description: 'Extremely worried about account block or electricity cutoff. Asks for officer employee badge, alternate bank accounts, or supervisor contact to avert crisis.',
    tone: 'Agitated, eager to fix issue, questioning'
  },
  {
    id: 'eager_freelancer',
    name: 'Sneha (Student & Job Seeker)',
    archetype: 'Enthusiastic Novice',
    description: 'Eager to earn money or claim prizes. Asks where to deposit registration fee, which app to install, and requests company registration certificate.',
    tone: 'Excited, eager, curious'
  },
  {
    id: 'cautious_citizen',
    name: 'Mr. Arvind',
    archetype: 'Methodical Citizen',
    description: 'Methodically asks for receipt verification, official tax ID, and alternate UPI handles before transferring.',
    tone: 'Calm, procedural, inquisitive'
  }
];

export async function generateBaitReply(
  history: ChatMessage[],
  scamCategory: string,
  personaId = 'confused_elder'
): Promise<{ replyText: string; isAiGenerated: boolean }> {
  const persona = PRESET_PERSONAS.find(p => p.id === personaId) || PRESET_PERSONAS[0];
  const lastScammerMsg = [...history].reverse().find(m => m.sender === 'scammer')?.text || '';

  // Use Gemini if available
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

      const conversationHistoryPrompt = history.map(m => 
        `${m.sender === 'scammer' ? 'SCAMMER' : 'YOU (SCAMBAIT PERSONA)'}: ${m.text}`
      ).join('\n');

      const systemInstruction = `You are playing the role of a safe, educational ScamBait persona in a controlled cybersecurity simulation.
YOUR MISSION: Keep the scammer engaged, waste their operational time, and innocently coax them into revealing more threat intelligence (e.g. secondary UPI IDs, phone numbers, employee names, payment apps, or website links).

PERSONA: "${persona.name}" - ${persona.archetype}. Tone: ${persona.tone}.
Persona Description: ${persona.description}
Scam Category: ${scamCategory}

CRITICAL DEFENSIVE SAFETY DIRECTIVES:
1. NEVER share real or realistic personal passwords, OTPs, PIN numbers, or credit card numbers. If asked for OTP, pretend the phone screen is cracked, say an error code appeared, or ask if they have a different UPI ID.
2. NEVER send real money or agree to harmful real-world actions.
3. Keep the reply short (1 to 3 sentences maximum), natural, and realistic for the persona.
4. Do not break character. Do not reveal you are an AI or an analyst.`;

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `CONVERSATION SO FAR:\n${conversationHistoryPrompt}\n\nSCAMMER'S LAST MESSAGE:\n"${lastScammerMsg}"\n\nGenerate the next safe ScamBait reply:`,
        config: {
          systemInstruction,
          temperature: 0.8,
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Simulator timeout')), 5000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);

      if (response.text && response.text.trim()) {
        return {
          replyText: response.text.trim().replace(/^["']|["']$/g, ''),
          isAiGenerated: true
        };
      }
    } catch (err) {
      console.warn('Gemini ScamBait persona generation fallback:', err);
    }
  }

  // Local fallback persona script state machine
  const turnCount = history.filter(m => m.sender === 'scambait_ai').length;
  let replyText = '';

  if (persona.id === 'confused_elder') {
    const responses = [
      'Oh dear, I had no idea my account was having problems! My grandson usually helps me with this phone. Could you tell me where I should send the verification?',
      'I tried clicking that link but my screen went blurry and said page not found. Do you have an officer phone number or a direct UPI ID I can show the bank branch?',
      'My phone is asking for an app update before it opens. Can you tell me your official officer ID and which department I am speaking with?',
      'I am at the ATM right now with my passbook. Which UPI ID or account number should I enter for the ₹1 test payment?',
      'The machine printed a slip saying transaction pending. Can you give me your supervisor contact number so I can confirm it cleared?'
    ];
    replyText = responses[turnCount % responses.length];
  } else if (persona.id === 'anxious_customer') {
    const responses = [
      'Please do not disconnect or block it! I have hospital bills due today. Tell me exactly what steps I need to take right this second.',
      'I am trying to pay right now, but Google Pay is asking for a verified merchant UPI ID. What is your department direct payment address?',
      'Is there an official branch manager or emergency helpline number I can call to confirm the block is lifted immediately?',
      'I sent ₹1 from my other mobile, did you receive it? If not, send me an alternate UPI ID or QR code link so I can retry.'
    ];
    replyText = responses[turnCount % responses.length];
  } else {
    const responses = [
      'This sounds great! I am ready to start immediately. What is the official website or payment link to register my task ID?',
      'I completed the first YouTube task! Who should I message on Telegram or WhatsApp to claim the ₹500 payout?',
      'My payment app needs your company registration name and UPI handle before transferring the deposit. What is your exact ID?',
      'Can you share your official manager WhatsApp number so I can send the payment screenshot?'
    ];
    replyText = responses[turnCount % responses.length];
  }

  return { replyText, isAiGenerated: false };
}

export async function generateSimulatedScammerTurn(
  history: ChatMessage[],
  scamCategory: string
): Promise<string> {
  const lastUserMsg = [...history].reverse().find(m => m.sender === 'scambait_ai')?.text || '';

  // Use Gemini to generate realistic simulated scammer escalation if available
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

      const conversationHistoryPrompt = history.map(m => 
        `${m.sender === 'scammer' ? 'SCAMMER' : 'VICTIM'}: ${m.text}`
      ).join('\n');

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are simulating the SCAMMER in an educational cybersecurity sandbox.
SCAM CONTEXT: ${scamCategory}.
CONVERSATION SO FAR:
${conversationHistoryPrompt}

VICTIM JUST REPLIED:
"${lastUserMsg}"

INSTRUCTIONS:
- Reply in 1-2 realistic, pushy sentences as the scammer.
- Escalate urgency or provide a secondary fake UPI ID (e.g. sbi.helpdesk@okaxis, discom.support@paytm), phone number (+91 98XXX), or fake website link to entice payment.
- NEVER request real personal data; simulate fictitious dummy handles for demonstration.`,
        config: {
          temperature: 0.9,
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Scammer turn timeout')), 5000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);

      if (response.text && response.text.trim()) {
        return response.text.trim().replace(/^["']|["']$/g, '');
      }
    } catch {
      // Fallback
    }
  }

  // Fallback realistic responses by turn
  const turn = history.filter(m => m.sender === 'scammer').length;
  if (scamCategory.includes('Bank') || scamCategory.includes('KYC')) {
    const scripts = [
      'Do not delay! Send ₹1 immediately to our nodal desk UPI: verify.nodal.sbi@okaxis or your debit card will be permanently frozen by 6 PM.',
      'Officer Sharma here. If link is not opening, call our technical helpdesk directly at +91 98234 56711 and download QuickSupport APK.',
      'We have not received verification. Forward the 6-digit reference SMS you just received or send ₹10 to sbi.clearance@ybl right now.'
    ];
    return scripts[turn % scripts.length];
  } else if (scamCategory.includes('Utility') || scamCategory.includes('Bill')) {
    const scripts = [
      'Line disconnection order is already in system. Transfer bill balance immediately to discom.officer@paytm to stop technician.',
      'Call senior engineer R.K. Verma immediately at +91 97123 44556. Power will be disconnected in exactly 30 minutes.'
    ];
    return scripts[turn % scripts.length];
  } else {
    const scripts = [
      'To unlock your VIP commission of ₹4,500, deposit ₹500 refundable security fee to task.vip@okhdfcbank and send screenshot.',
      'Join our verification group at https://t.me/InstantPayouts2026 or contact finance manager @PriyaFinance on Telegram.'
    ];
    return scripts[turn % scripts.length];
  }
}

export function extractThreatIntelligenceFromConversation(history: ChatMessage[]): ExtractedIntel {
  const combinedText = history.map(m => m.text).join(' \n ');
  
  const phones: string[] = [];
  const phoneRegex = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g;
  const pMatch = combinedText.match(phoneRegex) || [];
  for (const p of pMatch) {
    const clean = p.replace(/[\s-]/g, '');
    if (clean.length >= 10 && !phones.includes(clean)) {
      phones.push(clean);
    }
  }

  const upiIds: string[] = [];
  const upiRegex = /[a-zA-Z0-9.\-_]{2,64}@(okaxis|oksbi|okhdfcbank|okicici|paytm|ybl|ibl|apl|axl|upi|sbi|postbank|federal|barodampay)/gi;
  const uMatch = combinedText.match(upiRegex) || [];
  for (const u of uMatch) {
    const clean = u.toLowerCase();
    if (!upiIds.includes(clean)) {
      upiIds.push(clean);
    }
  }

  const domains: string[] = [];
  const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*|[a-zA-Z0-9.-]+\.(?:online|vip|top|club|xyz|site|cc|live|apk|work|buzz|info|app)/gi;
  const dMatch = combinedText.match(urlRegex) || [];
  for (const d of dMatch) {
    const clean = d.trim().replace(/[.,;)]+$/, '');
    if (!domains.includes(clean)) {
      domains.push(clean);
    }
  }

  const organizations: string[] = [];
  const orgTaxonomy = [
    'State Bank of India', 'SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 
    'FedEx', 'India Post', 'Electricity Department', 'Telegram', 'WhatsApp', 
    'Reserve Bank of India', 'Income Tax Department', 'Cyber Cell'
  ];
  for (const org of orgTaxonomy) {
    if (new RegExp(`\\b${org}\\b`, 'i').test(combinedText) && !organizations.includes(org)) {
      organizations.push(org);
    }
  }

  const locations: string[] = [];
  const locCandidates = ['Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Hyderabad', 'Customs Terminal', 'Regional Branch', 'Head Office'];
  for (const loc of locCandidates) {
    if (new RegExp(`\\b${loc}\\b`, 'i').test(combinedText) && !locations.includes(loc)) {
      locations.push(loc);
    }
  }

  const tacticsObserved: string[] = [];
  const lower = combinedText.toLowerCase();
  if (lower.includes('urgent') || lower.includes('immediately') || lower.includes('minute')) {
    tacticsObserved.push('Urgency Escalation');
  }
  if (lower.includes('blocked') || lower.includes('frozen') || lower.includes('disconnected') || lower.includes('legal')) {
    tacticsObserved.push('Threat of Action');
  }
  if (lower.includes('upi') || lower.includes('send') || lower.includes('pay') || lower.includes('deposit')) {
    tacticsObserved.push('Payment Redirection');
  }
  if (lower.includes('quicksupport') || lower.includes('apk') || lower.includes('link') || lower.includes('download')) {
    tacticsObserved.push('Malicious Tool Solicitation');
  }
  if (lower.includes('officer') || lower.includes('manager') || lower.includes('engineer')) {
    tacticsObserved.push('Authority Impersonation');
  }

  return {
    phones,
    upiIds,
    domains,
    organizations,
    locations,
    tacticsObserved
  };
}
