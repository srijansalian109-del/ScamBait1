import { NCRPComplaintDraft } from '../types';

export function generateNCRPComplaint(report: any): NCRPComplaintDraft {
  return {
    reportId: report.id || `REP-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    incidentType: report.scamCategory || 'Digital Arrest',
    suspectPhoneNumbers: report.extractedEntities?.phones || ['+91 98765 43210'],
    suspectUpiIds: report.extractedEntities?.upis || ['fraud@upi'],
    suspectUrls: report.extractedEntities?.urls || [],
    chronologicalSummary: report.summary || 'Unsolicited communication attempting coercion or financial fraud.',
    evidenceSnippets: report.rawMessages || [report.input || 'Sample message transcript'],
    disclaimer: 'OFFICIAL NOTICE: This is an automatically generated incident draft. Review all details before manually submitting to https://cybercrime.gov.in or calling helpline 1930.'
  };
}
