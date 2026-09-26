# ScamBait — AI Scam Detection, Safe Scam-Baiting & Threat Intelligence

ScamBait is an open, modern defensive cybersecurity platform designed for real-time scam triage, explainable risk scoring, safe honeypot scam-baiting simulations, and threat-intelligence network correlation.

---

## Features

1. **Multi-Signal Scam Detector**
   - Ingests SMS, WhatsApp messages, emails, and social media text.
   - Dual-engine detection: deterministic heuristic taxonomy + Google Gemini 3.8 Flash AI reasoning.
   - Explainable Risk Score (0–100) with a detailed point-by-point breakdown (urgency, coercive threats, fake payments, credential requests, known malicious registry hits).
   - Generates unique **Scam DNA** fingerprint profiles and calculates similarity metrics against prior threat campaigns.

2. **Safe AI ScamBait Honeypot Simulator**
   - Launches an isolated, controlled conversational simulation when high-risk threats are identified.
   - Personas:
     - *Mrs. Margaret / Sharmaji*: Tech-challenged elder feigning phone issues.
     - *Devraj*: Anxious customer panicking about an account freeze.
     - *Sneha*: Enthusiastic novice applying for online tasks.
     - *Arvind*: Methodical citizen requesting tax invoices.
   - Coaxes scammers into revealing secondary phone numbers, fake UPI handles, phishing URLs, and fake credentials.
   - Defensive Safety: Never transmits real OTPs, PINs, passwords, or payments.

3. **Threat Intelligence Registry & Search**
   - Search across phone numbers, UPI handles, phishing domains, emails, and scam report IDs.
   - Distinguishes between community-reported and verified threat indicators.
   - Displays correlation stats: associated phone numbers, connected phishing domains, and prior incident reports.

4. **Interactive Scam Network Graph**
   - Topological relationship mapping linking scam reports, phone numbers, UPI handles, domains, and impersonated institutions.
   - Supports panning, zooming, node filtering, and deep inspector drawers.

5. **Demo Mode**
   - 6 pre-loaded real-world scenarios:
     1. Bank KYC Freeze Threat (State Bank of India)
     2. Electricity Disconnection Notice (Discom)
     3. FedEx Customs Clearance Hold
     4. Part-Time YouTube Task Scam (Telegram)
     5. AI Crypto High-Yield Scheme
     6. Lottery / Lucky Draw Winner

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, tsx
- **Database**: SQLite (via `sql.js` WebAssembly engine, auto-saved to disk at `data/scambait.sqlite`)
- **AI Engine**: Google Gemini API (`@google/genai` TypeScript SDK, model `gemini-3.8-flash`) with fallback to local rule-based analysis.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
# GEMINI_API_KEY: Optional. If present, activates Gemini 3.8 Flash qualitative threat analysis and dynamic bait replies.
# If omitted, ScamBait automatically runs using its comprehensive local rule-based engine.
GEMINI_API_KEY="your-gemini-api-key"

# Port defaults to 3000
PORT=3000
```

---

## Quickstart & Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the full-stack application (runs both backend API and Vite frontend on port 3000)
npm run dev

# 3. Production build and run
npm run build
npm run start
```

Open `http://localhost:3000` in your web browser.

---

## How to Run Demo Mode

1. Click the **[Try Demo]** button in the top navigation bar or **[Launch Demo Scenarios]** on the Dashboard.
2. Select any of the 6 realistic scenarios (e.g. *Bank KYC Freeze Threat*).
3. The message is populated in the **Scam Detector**. Click **[Analyze Message]**.
4. Inspect the **Explainable Risk Score**, **Scam DNA Fingerprint**, and **Extracted Threat Artifacts**.
5. Click **[START SCAMBAIT SIMULATION]** to launch the interactive honeypot chat.
6. Click **[Generate AI Reply]** to observe the AI persona safely engage the threat actor while extracting intelligence into the side panel.
7. Switch to **Scam Network** or **Threat Intelligence** to view the live relationship graph and search registry.

---

## Defensive Safety & Ethical Disclaimer

ScamBait is an educational cybersecurity tool designed strictly for defensive analysis and scam awareness. It does not send messages to real external parties, does not accept or make real financial transactions, and will never solicit real passwords, OTPs, or confidential banking credentials.
