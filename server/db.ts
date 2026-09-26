import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'scambait.sqlite');

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
      initTables(db);
      return db;
    } catch (err) {
      console.error('Failed to read existing DB file, creating new database', err);
    }
  }

  db = new SQL.Database();
  initTables(db);
  seedInitialData(db);
  saveDatabase();
  return db;
}

export function saveDatabase(): void {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to save SQLite database to disk:', err);
  }
}

function initTables(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'analyst',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scam_reports (
      id TEXT PRIMARY KEY,
      source_type TEXT NOT NULL,
      raw_message TEXT NOT NULL,
      risk_score INTEGER NOT NULL,
      risk_level TEXT NOT NULL,
      scam_category TEXT NOT NULL,
      confidence REAL NOT NULL,
      explanation TEXT NOT NULL,
      tactics_json TEXT NOT NULL,
      indicators_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'REPORTED',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES scam_reports(id)
    );

    CREATE TABLE IF NOT EXISTS threat_indicators (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      indicator_type TEXT NOT NULL, -- 'phone', 'upi', 'url', 'email', 'org'
      indicator_value TEXT NOT NULL,
      risk_weight INTEGER NOT NULL DEFAULT 20,
      verified INTEGER NOT NULL DEFAULT 1,
      times_seen INTEGER NOT NULL DEFAULT 1,
      last_seen TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES scam_reports(id)
    );

    CREATE TABLE IF NOT EXISTS scam_dna (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      dna_code TEXT NOT NULL,
      category TEXT NOT NULL,
      tactics_json TEXT NOT NULL,
      primary_identifier TEXT NOT NULL,
      similarity_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES scam_reports(id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      persona_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      messages_json TEXT NOT NULL,
      extracted_intel_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES scam_reports(id)
    );
  `);
}

function seedInitialData(database: Database): void {
  // Check if we already have reports
  const result = database.exec('SELECT count(*) as count FROM scam_reports');
  const count = result.length > 0 && result[0].values[0] ? Number(result[0].values[0][0]) : 0;
  if (count > 0) return;

  const now = new Date();
  const d1 = new Date(now.getTime() - 86400000 * 4).toISOString();
  const d2 = new Date(now.getTime() - 86400000 * 3).toISOString();
  const d3 = new Date(now.getTime() - 86400000 * 2).toISOString();
  const d4 = new Date(now.getTime() - 86400000 * 1).toISOString();

  // Users
  database.run(`
    INSERT INTO users (id, username, email, role, created_at)
    VALUES 
      ('usr-001', 'sec_analyst_1', 'analyst@scambait.intel', 'admin', '${d1}'),
      ('usr-002', 'triage_officer', 'triage@scambait.intel', 'analyst', '${d2}');
  `);

  // Initial Seed Reports
  const seedReports = [
    {
      id: 'SB-2026-00101',
      source_type: 'SMS',
      raw_message: 'SBI ALERT: Dear Customer, Your SBI NetBanking account will be blocked today due to pending KYC. Update immediately at http://sbi-kyc-verify.online or send ₹1 to kycverify.sbi@okaxis to activate.',
      risk_score: 92,
      risk_level: 'HIGH RISK',
      scam_category: 'Bank Impersonation',
      confidence: 0.96,
      explanation: 'High urgency threat of bank account blockage combined with deceptive phishing URL and direct UPI transfer instruction pretending to be State Bank of India KYC department.',
      tactics: JSON.stringify(['Urgency', 'Authority Impersonation', 'Phishing Link', 'Payment Request', 'Account Block Threat']),
      indicators_count: 3,
      created_at: d1,
      indicators: [
        { type: 'org', value: 'State Bank of India', weight: 15, verified: 1 },
        { type: 'url', value: 'sbi-kyc-verify.online', weight: 25, verified: 1 },
        { type: 'upi', value: 'kycverify.sbi@okaxis', weight: 30, verified: 1 }
      ],
      dna_code: 'DNA-BNK-92-9A4B',
      primary_id: 'kycverify.sbi@okaxis',
      hash: 'HASH-SBI-KYC-ONLINE'
    },
    {
      id: 'SB-2026-00102',
      source_type: 'WhatsApp',
      raw_message: 'Electricity Dept Alert: Your electric power will be disconnected tonight at 9:30 PM due to unupdated bill payment. Immediately contact electricity officer Rahul Sharma at +91 98765 43210 or pay bill arrears on discom.urgent@paytm.',
      risk_score: 88,
      risk_level: 'HIGH RISK',
      scam_category: 'Utility & Bill Fraud',
      confidence: 0.94,
      explanation: 'Coercive utility shutdown threat scheduled for same day night, social engineering victim to panic call an unverified mobile number and transfer funds to a personal/fraudulent UPI ID.',
      tactics: JSON.stringify(['Immediate Disconnection Threat', 'Government/Utility Impersonation', 'Personal Phone Call Request', 'UPI Payment']),
      indicators_count: 3,
      created_at: d2,
      indicators: [
        { type: 'org', value: 'State Electricity Department', weight: 15, verified: 1 },
        { type: 'phone', value: '+919876543210', weight: 25, verified: 1 },
        { type: 'upi', value: 'discom.urgent@paytm', weight: 30, verified: 1 }
      ],
      dna_code: 'DNA-UTL-88-8C21',
      primary_id: '+919876543210',
      hash: 'HASH-ELEC-DISCOM-PAY'
    },
    {
      id: 'SB-2026-00103',
      source_type: 'Email',
      raw_message: 'FedEx Express Courier Tracking: Parcel #FX-88294 detained at Customs International Terminal due to unpaid duty taxes of ₹450. Please resolve clearance via courier-customs-pay.club or contact customs officer at +91 91234 56789.',
      risk_score: 85,
      risk_level: 'HIGH RISK',
      scam_category: 'Parcel & Delivery Scam',
      confidence: 0.92,
      explanation: 'Fake package delivery notification demanding customs clearance fee to release fictitious package, redirecting to a suspicious non-FedEx generic top-level domain.',
      tactics: JSON.stringify(['Package Detention', 'Customs Impersonation', 'Small Verification Fee', 'Phishing Domain']),
      indicators_count: 3,
      created_at: d3,
      indicators: [
        { type: 'org', value: 'FedEx Logistics', weight: 15, verified: 1 },
        { type: 'url', value: 'courier-customs-pay.club', weight: 25, verified: 1 },
        { type: 'phone', value: '+919123456789', weight: 20, verified: 1 }
      ],
      dna_code: 'DNA-DLV-85-7F19',
      primary_id: 'courier-customs-pay.club',
      hash: 'HASH-FEDEX-CUSTOMS'
    },
    {
      id: 'SB-2026-00104',
      source_type: 'Social Media',
      raw_message: 'Part-time Online Work Opportunity! Earn ₹3,000 to ₹8,000 daily by simply rating hotels and subscribing to YouTube channels. No experience needed. Join our official Telegram channel https://t.me/GlobalMediaTasks and contact HR Priya.',
      risk_score: 79,
      risk_level: 'HIGH RISK',
      scam_category: 'Part-Time Task Scam',
      confidence: 0.90,
      explanation: 'Classic task-based pyramid fraud: promises unrealistic daily income for trivial actions like liking videos, then traps victim with upfront prepaid deposit tasks.',
      tactics: JSON.stringify(['Unrealistic Financial Return', 'Telegram Redirection', 'Task-Based Advance Fee']),
      indicators_count: 2,
      created_at: d4,
      indicators: [
        { type: 'org', value: 'Global Media Tasks', weight: 10, verified: 0 },
        { type: 'url', value: 't.me/GlobalMediaTasks', weight: 20, verified: 1 }
      ],
      dna_code: 'DNA-JOB-79-5E92',
      primary_id: 't.me/GlobalMediaTasks',
      hash: 'HASH-TELEGRAM-TASKS'
    },
    {
      id: 'SB-2026-00105',
      source_type: 'SMS',
      raw_message: 'HDFC Bank Info: Your monthly statement for credit card ending in 4102 is ready. Please view your official statement in the HDFC mobile app or visit hdfcbank.com.',
      risk_score: 12,
      risk_level: 'LOW',
      scam_category: 'Legitimate Notification',
      confidence: 0.98,
      explanation: 'Standard informational bank communication without urgency, no suspicious third-party links, no requests for credentials or unverified payment transfers.',
      tactics: JSON.stringify(['Informational Notice']),
      indicators_count: 2,
      created_at: now.toISOString(),
      indicators: [
        { type: 'org', value: 'HDFC Bank', weight: 0, verified: 1 },
        { type: 'url', value: 'hdfcbank.com', weight: 0, verified: 1 }
      ],
      dna_code: 'DNA-LEG-12-0A11',
      primary_id: 'hdfcbank.com',
      hash: 'HASH-HDFC-LEGIT-STMT'
    }
  ];

  for (const r of seedReports) {
    database.run(`
      INSERT INTO scam_reports (
        id, source_type, raw_message, risk_score, risk_level, scam_category,
        confidence, explanation, tactics_json, indicators_count, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      r.id, r.source_type, r.raw_message, r.risk_score, r.risk_level, r.scam_category,
      r.confidence, r.explanation, r.tactics, r.indicators_count, 'VERIFIED_THREAT', r.created_at
    ]);

    for (const ind of r.indicators) {
      const indId = 'ind-' + Math.random().toString(36).substring(2, 9);
      database.run(`
        INSERT INTO threat_indicators (
          id, report_id, indicator_type, indicator_value, risk_weight, verified, times_seen, last_seen
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [indId, r.id, ind.type, ind.value, ind.weight, ind.verified, 1, r.created_at]);
    }

    database.run(`
      INSERT INTO scam_dna (
        id, report_id, dna_code, category, tactics_json, primary_identifier, similarity_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'dna-' + r.id, r.id, r.dna_code, r.scam_category, r.tactics, r.primary_id, r.hash, r.created_at
    ]);
  }
}
