export interface DemoScenario {
  id: string;
  title: string;
  sourceType: 'SMS' | 'WhatsApp' | 'Email' | 'Social Media';
  tag: string;
  summary: string;
  message: string;
  expectedCategory: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-bank-kyc',
    title: 'Bank KYC Freeze Threat',
    sourceType: 'SMS',
    tag: 'Banking',
    summary: 'Impersonates State Bank of India claiming immediate netbanking suspension unless ₹1 verification or link is used.',
    message: 'SBI ALERT: Dear Customer, Your SBI NetBanking account will be blocked today due to pending KYC. Update immediately at http://sbi-kyc-verify.online or send ₹1 to kycverify.sbi@okaxis to activate.',
    expectedCategory: 'Bank Impersonation'
  },
  {
    id: 'demo-upi-electricity',
    title: 'Electricity Disconnection Notice',
    sourceType: 'WhatsApp',
    tag: 'Utility Fraud',
    summary: 'Urgent shutdown notification threatening disconnection at 9:30 PM tonight unless direct payment to personal UPI is made.',
    message: 'Electricity Dept Alert: Your electric power will be disconnected tonight at 9:30 PM due to unupdated bill payment. Immediately contact electricity officer Rahul Sharma at +91 98765 43210 or pay bill arrears on discom.urgent@paytm.',
    expectedCategory: 'Utility & Bill Fraud'
  },
  {
    id: 'demo-fake-delivery',
    title: 'FedEx Customs Clearance Hold',
    sourceType: 'Email',
    tag: 'Delivery Scam',
    summary: 'Fake parcel detention notice demanding customs clearance fee of ₹450 with an unverified external website.',
    message: 'FedEx Express Courier Tracking: Parcel #FX-88294 detained at Customs International Terminal due to unpaid duty taxes of ₹450. Please resolve clearance via courier-customs-pay.club or contact customs officer at +91 91234 56789.',
    expectedCategory: 'Parcel & Delivery Scam'
  },
  {
    id: 'demo-job-scam',
    title: 'Part-Time Task Scam',
    sourceType: 'Social Media',
    tag: 'Job Fraud',
    summary: 'Promises ₹3,000–₹8,000 daily for liking videos and reviewing hotels, redirecting victims to a closed Telegram task channel.',
    message: 'Part-time Online Work Opportunity! Earn ₹3,000 to ₹8,000 daily by simply rating hotels and subscribing to YouTube channels. No experience needed. Join our official Telegram channel https://t.me/GlobalMediaTasks and contact HR Priya.',
    expectedCategory: 'Part-Time Task Scam'
  },
  {
    id: 'demo-crypto-investment',
    title: 'AI Crypto High-Yield Scheme',
    sourceType: 'WhatsApp',
    tag: 'Crypto Fraud',
    summary: 'Guaranteed 300% profit per week on AI automated trading with upfront deposit required to unlock VIP wallet.',
    message: 'EXCLUSIVE AI TRADING SIGNAL: Earn guaranteed 300% weekly return with our automated algorithm! Initial deposit ₹2,000 only. Send funds to aitrader.vip@okhdfcbank or register at http://alphatrade-crypto.club immediately before slots close.',
    expectedCategory: 'Investment & Crypto Fraud'
  },
  {
    id: 'demo-lottery-prize',
    title: 'Lottery Winner Notification',
    sourceType: 'SMS',
    tag: 'Lottery / Prize',
    summary: 'Claims recipient won ₹25,00,000 in a lucky draw and must call an agent and pay processing charges.',
    message: 'CONGRATULATIONS! Your mobile number won 1st Prize of ₹25,00,000 in All India KBC Lucky Draw 2026. File Ref: KBC-9921. Call Officer Rajesh Kumar immediately at +91 99887 76655 to claim. Registration fee ₹1,500 applicable.',
    expectedCategory: 'Lottery & Prize Scam'
  }
];
