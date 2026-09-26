import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase } from './db.js';
import { analyzeMessage } from './analyzer.js';
import { 
  generateBaitReply, 
  generateSimulatedScammerTurn, 
  extractThreatIntelligenceFromConversation, 
  PRESET_PERSONAS,
  ChatMessage 
} from './simulator.js';

export const apiRouter = Router();

// In-memory active conversations store with persistence to DB
interface ActiveConversation {
  id: string;
  reportId?: string;
  category: string;
  personaId: string;
  status: 'ACTIVE' | 'CONCLUDED';
  messages: ChatMessage[];
  extractedIntel: ReturnType<typeof extractThreatIntelligenceFromConversation>;
  createdAt: string;
}

const activeConversations = new Map<string, ActiveConversation>();

// 1. Health check & Capabilities
apiRouter.get('/health', async (_req: Request, res: Response) => {
  const db = await getDatabase();
  const dbCheck = db.exec('SELECT count(*) FROM scam_reports');
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';

  res.json({
    status: 'online',
    system: 'ScamBait Defensive Intelligence System',
    geminiAiReady: hasGeminiKey,
    databaseReady: dbCheck.length > 0,
    timestamp: new Date().toISOString()
  });
});

// 2. Dashboard Aggregated Stats
apiRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const db = await getDatabase();

    // Total counts
    const totalReportsRes = db.exec('SELECT count(*) FROM scam_reports');
    const totalReports = Number(totalReportsRes[0]?.values[0]?.[0] || 0);

    const highRiskRes = db.exec("SELECT count(*) FROM scam_reports WHERE risk_level = 'HIGH RISK'");
    const highRiskCount = Number(highRiskRes[0]?.values[0]?.[0] || 0);

    const suspRes = db.exec("SELECT count(*) FROM scam_reports WHERE risk_level = 'SUSPICIOUS'");
    const suspCount = Number(suspRes[0]?.values[0]?.[0] || 0);

    const indicatorsRes = db.exec('SELECT count(*) FROM threat_indicators');
    const indicatorsCount = Number(indicatorsRes[0]?.values[0]?.[0] || 0);

    // Category distribution
    const catRes = db.exec(`
      SELECT scam_category, count(*) as count 
      FROM scam_reports 
      GROUP BY scam_category 
      ORDER BY count DESC
    `);
    const categoryCounts: { category: string; count: number }[] = [];
    if (catRes.length > 0) {
      for (const row of catRes[0].values) {
        categoryCounts.push({
          category: String(row[0]),
          count: Number(row[1])
        });
      }
    }

    // Indicator type breakdown
    const indTypeRes = db.exec(`
      SELECT indicator_type, count(*) as count 
      FROM threat_indicators 
      GROUP BY indicator_type
    `);
    const indicatorTypes: Record<string, number> = {
      phone: 0,
      upi: 0,
      url: 0,
      email: 0,
      org: 0
    };
    if (indTypeRes.length > 0) {
      for (const row of indTypeRes[0].values) {
        const type = String(row[0]);
        indicatorTypes[type] = Number(row[1]);
      }
    }

    // Recent reports
    const recentRes = db.exec(`
      SELECT id, source_type, risk_score, risk_level, scam_category, indicators_count, status, created_at, raw_message 
      FROM scam_reports 
      ORDER BY created_at DESC LIMIT 6
    `);
    const recentReports = [];
    if (recentRes.length > 0) {
      for (const row of recentRes[0].values) {
        recentReports.push({
          id: String(row[0]),
          sourceType: String(row[1]),
          riskScore: Number(row[2]),
          riskLevel: String(row[3]),
          scamCategory: String(row[4]),
          indicatorsCount: Number(row[5]),
          status: String(row[6]),
          createdAt: String(row[7]),
          rawMessage: String(row[8])
        });
      }
    }

    res.json({
      totalScamsAnalyzed: totalReports,
      highRiskScams: highRiskCount,
      suspiciousMessages: suspCount,
      threatIndicatorsCount: indicatorsCount,
      activeSimulations: activeConversations.size,
      categoryCounts,
      indicatorTypes,
      recentReports
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// 3. Analyze Message
apiRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { message, sourceType = 'SMS' } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message content is required for analysis.' });
      return;
    }

    const analysis = await analyzeMessage(message.trim(), sourceType);
    res.json(analysis);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze message' });
  }
});

// 4. Save/Submit Scam Report
apiRouter.post('/reports', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const {
      sourceType = 'SMS',
      rawMessage,
      riskScore,
      riskLevel,
      scamCategory,
      confidence = 0.9,
      explanation = '',
      tactics = [],
      entities = [],
      scamDna
    } = req.body;

    if (!rawMessage) {
      res.status(400).json({ error: 'rawMessage is required' });
      return;
    }

    const reportId = 'SB-2026-' + Math.floor(10000 + Math.random() * 90000);
    const now = new Date().toISOString();
    const tacticsJson = JSON.stringify(tactics);

    db.run(`
      INSERT INTO scam_reports (
        id, source_type, raw_message, risk_score, risk_level, scam_category,
        confidence, explanation, tactics_json, indicators_count, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reportId, sourceType, rawMessage, Number(riskScore || 0), riskLevel || 'HIGH RISK',
      scamCategory || 'General Scam', Number(confidence || 0.9), explanation,
      tacticsJson, entities.length, 'REPORTED', now
    ]);

    // Insert threat indicators
    for (const ent of entities) {
      const indId = 'ind-' + Math.random().toString(36).substring(2, 9);
      // Check if already exists to increment times_seen
      const existing = db.exec('SELECT id, times_seen FROM threat_indicators WHERE indicator_value = ?', [ent.value]);
      if (existing.length > 0 && existing[0].values.length > 0) {
        const curTimes = Number(existing[0].values[0][1]);
        db.run('UPDATE threat_indicators SET times_seen = ?, last_seen = ? WHERE indicator_value = ?', [
          curTimes + 1, now, ent.value
        ]);
      } else {
        db.run(`
          INSERT INTO threat_indicators (
            id, report_id, indicator_type, indicator_value, risk_weight, verified, times_seen, last_seen
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          indId, reportId, ent.type, ent.value, 25, 1, 1, now
        ]);
      }
    }

    // Insert Scam DNA
    const dnaCode = scamDna?.dnaCode || `DNA-GEN-${riskScore}-${Math.floor(1000 + Math.random() * 9000)}`;
    const primaryId = scamDna?.primaryIdentifier || entities[0]?.value || 'NONE';
    const hash = 'HASH-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    db.run(`
      INSERT INTO scam_dna (
        id, report_id, dna_code, category, tactics_json, primary_identifier, similarity_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'dna-' + reportId, reportId, dnaCode, scamCategory || 'General Scam', tacticsJson, primaryId, hash, now
    ]);

    saveDatabase();

    res.json({
      success: true,
      reportId,
      dnaCode,
      message: 'Scam intelligence recorded in registry'
    });
  } catch (err) {
    console.error('Error saving report:', err);
    res.status(500).json({ error: 'Failed to record report' });
  }
});

// 5. List Reports
apiRouter.get('/reports', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const { riskLevel, category, search } = req.query;

    let query = `
      SELECT id, source_type, raw_message, risk_score, risk_level, scam_category,
             confidence, explanation, tactics_json, indicators_count, status, created_at
      FROM scam_reports
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (riskLevel && typeof riskLevel === 'string' && riskLevel !== 'ALL') {
      query += ' AND risk_level = ?';
      params.push(riskLevel);
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      query += ' AND scam_category = ?';
      params.push(category);
    }

    if (search && typeof search === 'string' && search.trim()) {
      query += ' AND (id LIKE ? OR raw_message LIKE ? OR scam_category LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC';

    const result = db.exec(query, params);
    const reports = [];

    if (result.length > 0) {
      for (const row of result[0].values) {
        reports.push({
          id: String(row[0]),
          sourceType: String(row[1]),
          rawMessage: String(row[2]),
          riskScore: Number(row[3]),
          riskLevel: String(row[4]),
          scamCategory: String(row[5]),
          confidence: Number(row[6]),
          explanation: String(row[7]),
          tactics: JSON.parse(String(row[8] || '[]')),
          indicatorsCount: Number(row[9]),
          status: String(row[10]),
          createdAt: String(row[11])
        });
      }
    }

    res.json(reports);
  } catch (err) {
    console.error('Error listing reports:', err);
    res.status(500).json({ error: 'Failed to retrieve reports' });
  }
});

// 6. Get Single Report with Details, DNA, and Indicators
apiRouter.get('/reports/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const reportId = req.params.id;

    const repRes = db.exec('SELECT * FROM scam_reports WHERE id = ?', [reportId]);
    if (repRes.length === 0 || repRes[0].values.length === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const row = repRes[0].values[0];
    const report = {
      id: String(row[0]),
      sourceType: String(row[1]),
      rawMessage: String(row[2]),
      riskScore: Number(row[3]),
      riskLevel: String(row[4]),
      scamCategory: String(row[5]),
      confidence: Number(row[6]),
      explanation: String(row[7]),
      tactics: JSON.parse(String(row[8] || '[]')),
      indicatorsCount: Number(row[9]),
      status: String(row[10]),
      createdAt: String(row[11])
    };

    // Indicators
    const indRes = db.exec('SELECT id, indicator_type, indicator_value, risk_weight, verified, times_seen, last_seen FROM threat_indicators WHERE report_id = ?', [reportId]);
    const indicators = [];
    if (indRes.length > 0) {
      for (const ir of indRes[0].values) {
        indicators.push({
          id: String(ir[0]),
          type: String(ir[1]),
          value: String(ir[2]),
          weight: Number(ir[3]),
          verified: Number(ir[4]) === 1,
          timesSeen: Number(ir[5]),
          lastSeen: String(ir[6])
        });
      }
    }

    // DNA
    const dnaRes = db.exec('SELECT dna_code, category, tactics_json, primary_identifier, similarity_hash, created_at FROM scam_dna WHERE report_id = ?', [reportId]);
    let scamDna = null;
    if (dnaRes.length > 0 && dnaRes[0].values.length > 0) {
      const dr = dnaRes[0].values[0];
      scamDna = {
        dnaCode: String(dr[0]),
        category: String(dr[1]),
        tactics: JSON.parse(String(dr[2] || '[]')),
        primaryIdentifier: String(dr[3]),
        similarityHash: String(dr[4]),
        createdAt: String(dr[5])
      };
    }

    res.json({
      report,
      indicators,
      scamDna
    });
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'Failed to fetch report details' });
  }
});

// 7. Get All Threats / Search Threats
apiRouter.get('/threats', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const query = req.query.q ? String(req.query.q).trim() : '';

    let sql = `
      SELECT t.id, t.report_id, t.indicator_type, t.indicator_value, t.risk_weight, 
             t.verified, t.times_seen, t.last_seen, r.scam_category, r.risk_level
      FROM threat_indicators t
      LEFT JOIN scam_reports r ON t.report_id = r.id
    `;
    const params: string[] = [];

    if (query) {
      sql += ' WHERE t.indicator_value LIKE ? OR t.indicator_type LIKE ? OR t.report_id LIKE ?';
      const q = `%${query}%`;
      params.push(q, q, q);
    }

    sql += ' ORDER BY t.times_seen DESC, t.last_seen DESC LIMIT 100';

    const result = db.exec(sql, params);
    const threats = [];
    if (result.length > 0) {
      for (const r of result[0].values) {
        threats.push({
          id: String(r[0]),
          reportId: String(r[1]),
          type: String(r[2]),
          value: String(r[3]),
          riskWeight: Number(r[4]),
          verified: Number(r[5]) === 1,
          timesSeen: Number(r[6]),
          lastSeen: String(r[7]),
          scamCategory: String(r[8] || 'Unknown'),
          riskLevel: String(r[9] || 'HIGH RISK')
        });
      }
    }

    res.json(threats);
  } catch (err) {
    console.error('Error fetching threats:', err);
    res.status(500).json({ error: 'Failed to fetch threats' });
  }
});

// 8. Search specific indicator (Distinguishes Reported vs Verified, finds associated domains, phone numbers, reports count)
apiRouter.get('/threats/search', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const query = req.query.q ? String(req.query.q).trim() : '';

    if (!query) {
      res.json({ found: false, message: 'Please provide a search query.' });
      return;
    }

    const matchesRes = db.exec(`
      SELECT t.id, t.report_id, t.indicator_type, t.indicator_value, t.risk_weight, 
             t.verified, t.times_seen, t.last_seen, r.scam_category, r.risk_level, r.raw_message
      FROM threat_indicators t
      LEFT JOIN scam_reports r ON t.report_id = r.id
      WHERE t.indicator_value LIKE ? COLLATE NOCASE OR t.report_id = ?
    `, [`%${query}%`, query]);

    if (matchesRes.length === 0 || matchesRes[0].values.length === 0) {
      res.json({
        found: false,
        indicator: query,
        message: 'No previous malicious records found in registry for this indicator.',
        status: 'UNRECORDED'
      });
      return;
    }

    const rows = matchesRes[0].values;
    const reportIds = Array.from(new Set(rows.map(r => String(r[1]))));
    const categories = Array.from(new Set(rows.map(r => String(r[8] || 'Unknown'))));
    const isVerified = rows.some(r => Number(r[5]) === 1);
    const totalTimesSeen = rows.reduce((acc, r) => acc + Number(r[6] || 1), 0);

    // Find cross-linked associated indicators from same reports
    const placeholders = reportIds.map(() => '?').join(',');
    const linkedRes = db.exec(`
      SELECT indicator_type, indicator_value 
      FROM threat_indicators 
      WHERE report_id IN (${placeholders}) AND indicator_value NOT LIKE ?
    `, [...reportIds, `%${query}%`]);

    const associatedPhones = new Set<string>();
    const associatedDomains = new Set<string>();
    const associatedUpis = new Set<string>();

    if (linkedRes.length > 0) {
      for (const lr of linkedRes[0].values) {
        const type = String(lr[0]);
        const val = String(lr[1]);
        if (type === 'phone') associatedPhones.add(val);
        if (type === 'url') associatedDomains.add(val);
        if (type === 'upi') associatedUpis.add(val);
      }
    }

    res.json({
      found: true,
      indicator: query,
      status: isVerified ? 'VERIFIED_THREAT' : 'REPORTED_SUSPICIOUS',
      reportsCount: reportIds.length,
      reportIds,
      scamCategories: categories,
      timesSeen: totalTimesSeen,
      lastSeen: String(rows[0][7]),
      associatedPhones: Array.from(associatedPhones),
      associatedDomains: Array.from(associatedDomains),
      associatedUpis: Array.from(associatedUpis),
      recordType: isVerified ? 'Verified Malicious Indicator' : 'Community Reported Indicator',
      matchedRows: rows.map(r => ({
        indicatorValue: String(r[3]),
        type: String(r[2]),
        reportId: String(r[1]),
        category: String(r[8]),
        riskLevel: String(r[9])
      }))
    });
  } catch (err) {
    console.error('Threat search error:', err);
    res.status(500).json({ error: 'Failed to search indicator' });
  }
});

// 9. Threat Network Graph (Nodes and Edges)
apiRouter.get('/threat-network', async (_req: Request, res: Response) => {
  try {
    const db = await getDatabase();

    const reportsRes = db.exec('SELECT id, scam_category, risk_level, risk_score, created_at FROM scam_reports ORDER BY created_at DESC LIMIT 15');
    const nodes: any[] = [];
    const edges: any[] = [];
    const addedNodeIds = new Set<string>();

    if (reportsRes.length > 0) {
      for (const r of reportsRes[0].values) {
        const repId = String(r[0]);
        const cat = String(r[1]);
        const riskLevel = String(r[2]);
        const score = Number(r[3]);

        nodes.push({
          id: repId,
          label: repId,
          subLabel: cat,
          type: 'report',
          riskLevel,
          score,
          radius: 20
        });
        addedNodeIds.add(repId);
      }
    }

    // Get indicators for these reports
    const indRes = db.exec(`
      SELECT id, report_id, indicator_type, indicator_value, risk_weight, times_seen
      FROM threat_indicators
      ORDER BY times_seen DESC LIMIT 50
    `);

    if (indRes.length > 0) {
      for (const i of indRes[0].values) {
        const repId = String(i[1]);
        const type = String(i[2]);
        const val = String(i[3]);
        const timesSeen = Number(i[5]);

        const nodeId = `${type}:${val}`;
        if (!addedNodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId,
            label: val.length > 22 ? val.slice(0, 20) + '...' : val,
            fullValue: val,
            type,
            timesSeen,
            radius: type === 'org' ? 16 : 14
          });
          addedNodeIds.add(nodeId);
        }

        if (addedNodeIds.has(repId)) {
          edges.push({
            source: repId,
            target: nodeId,
            type: 'links_to'
          });
        }
      }
    }

    res.json({
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length
      }
    });
  } catch (err) {
    console.error('Error generating threat network:', err);
    res.status(500).json({ error: 'Failed to generate network data' });
  }
});

// 10. Scam DNA Profile by Report ID
apiRouter.get('/scam-dna/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const id = req.params.id;

    const dnaRes = db.exec(`
      SELECT d.dna_code, d.category, d.tactics_json, d.primary_identifier, d.similarity_hash, 
             d.created_at, r.risk_score, r.risk_level, r.raw_message, r.id
      FROM scam_dna d
      JOIN scam_reports r ON d.report_id = r.id
      WHERE r.id = ? OR d.dna_code = ?
    `, [id, id]);

    if (dnaRes.length === 0 || dnaRes[0].values.length === 0) {
      res.status(404).json({ error: 'Scam DNA not found' });
      return;
    }

    const row = dnaRes[0].values[0];
    const tactics: string[] = JSON.parse(String(row[2] || '[]'));
    const repId = String(row[9]);

    // Find similar DNA patterns
    const otherDnaRes = db.exec(`
      SELECT d.report_id, d.dna_code, d.category, d.tactics_json, d.primary_identifier, r.risk_score
      FROM scam_dna d
      JOIN scam_reports r ON d.report_id = r.id
      WHERE d.report_id != ?
      LIMIT 10
    `, [repId]);

    const similarPatterns: any[] = [];
    if (otherDnaRes.length > 0) {
      for (const od of otherDnaRes[0].values) {
        const otherTactics: string[] = JSON.parse(String(od[3] || '[]'));
        const shared = tactics.filter(t => otherTactics.includes(t));
        let sim = 20;
        if (String(od[2]) === String(row[1])) sim += 40;
        sim += Math.min(35, shared.length * 12);

        if (sim >= 50) {
          similarPatterns.push({
            reportId: String(od[0]),
            dnaCode: String(od[1]),
            category: String(od[2]),
            similarityPercentage: Math.min(95, sim),
            sharedTactics: shared
          });
        }
      }
    }

    res.json({
      reportId: repId,
      dnaCode: String(row[0]),
      category: String(row[1]),
      tactics,
      primaryIdentifier: String(row[3]),
      similarityHash: String(row[4]),
      createdAt: String(row[5]),
      riskScore: Number(row[6]),
      riskLevel: String(row[7]),
      rawMessage: String(row[8]),
      similarPatterns
    });
  } catch (err) {
    console.error('Error getting Scam DNA:', err);
    res.status(500).json({ error: 'Failed to retrieve Scam DNA' });
  }
});

// 11. Start ScamBait Conversation Simulation
apiRouter.post('/conversation', (req: Request, res: Response) => {
  const { initialMessage, category = 'General Scam', reportId, personaId = 'confused_elder' } = req.body;
  if (!initialMessage) {
    res.status(400).json({ error: 'Initial scam message is required' });
    return;
  }

  const convId = 'conv-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  const initialChatMessage: ChatMessage = {
    id: 'msg-01',
    sender: 'scammer',
    text: initialMessage,
    timestamp: now
  };

  const initialIntel = extractThreatIntelligenceFromConversation([initialChatMessage]);

  const conv: ActiveConversation = {
    id: convId,
    reportId,
    category,
    personaId,
    status: 'ACTIVE',
    messages: [initialChatMessage],
    extractedIntel: initialIntel,
    createdAt: now
  };

  activeConversations.set(convId, conv);

  res.json({
    conversationId: convId,
    persona: PRESET_PERSONAS.find(p => p.id === personaId) || PRESET_PERSONAS[0],
    availablePersonas: PRESET_PERSONAS,
    status: 'ACTIVE',
    messages: conv.messages,
    extractedIntel: conv.extractedIntel
  });
});

// 12. Advance ScamBait Conversation (AI Reply / Scammer Reply / User Input)
apiRouter.post('/conversation/reply', async (req: Request, res: Response) => {
  try {
    const { conversationId, action = 'generate_bait', userText, personaId } = req.body;
    const conv = activeConversations.get(conversationId);

    if (!conv) {
      res.status(404).json({ error: 'Conversation session not found' });
      return;
    }

    if (personaId && PRESET_PERSONAS.some(p => p.id === personaId)) {
      conv.personaId = personaId;
    }

    const now = new Date().toISOString();

    if (action === 'generate_bait') {
      // AI persona generates next safe honeypot counter-message
      const { replyText, isAiGenerated } = await generateBaitReply(conv.messages, conv.category, conv.personaId);
      const baitMsg: ChatMessage = {
        id: 'msg-' + Math.random().toString(36).substring(2, 7),
        sender: 'scambait_ai',
        text: replyText,
        timestamp: now
      };
      conv.messages.push(baitMsg);

      // Automatically generate simulated scammer reply so user experiences interactive dialogue
      const scammerReply = await generateSimulatedScammerTurn(conv.messages, conv.category);
      const scammerMsg: ChatMessage = {
        id: 'msg-' + Math.random().toString(36).substring(2, 7),
        sender: 'scammer',
        text: scammerReply,
        timestamp: new Date().toISOString()
      };
      conv.messages.push(scammerMsg);

      // Re-extract intelligence
      conv.extractedIntel = extractThreatIntelligenceFromConversation(conv.messages);

      res.json({
        conversationId,
        messages: conv.messages,
        extractedIntel: conv.extractedIntel,
        isAiGenerated
      });
      return;
    }

    if (action === 'user_input' && userText) {
      const baitMsg: ChatMessage = {
        id: 'msg-' + Math.random().toString(36).substring(2, 7),
        sender: 'scambait_ai',
        text: userText,
        timestamp: now
      };
      conv.messages.push(baitMsg);

      // Generate scammer follow-up
      const scammerReply = await generateSimulatedScammerTurn(conv.messages, conv.category);
      const scammerMsg: ChatMessage = {
        id: 'msg-' + Math.random().toString(36).substring(2, 7),
        sender: 'scammer',
        text: scammerReply,
        timestamp: new Date().toISOString()
      };
      conv.messages.push(scammerMsg);

      conv.extractedIntel = extractThreatIntelligenceFromConversation(conv.messages);

      res.json({
        conversationId,
        messages: conv.messages,
        extractedIntel: conv.extractedIntel
      });
      return;
    }

    if (action === 'end_simulation') {
      conv.status = 'CONCLUDED';
      res.json({
        conversationId,
        status: 'CONCLUDED',
        messages: conv.messages,
        extractedIntel: conv.extractedIntel
      });
      return;
    }

    res.status(400).json({ error: 'Invalid conversation action' });
  } catch (err) {
    console.error('Conversation reply error:', err);
    res.status(500).json({ error: 'Failed to process conversation reply' });
  }
});

// 13. Available Personas Endpoint
apiRouter.get('/personas', (_req: Request, res: Response) => {
  res.json(PRESET_PERSONAS);
});
