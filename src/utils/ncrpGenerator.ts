import { NCRPComplaintDraft } from '../types';

export function generateNCRPComplaint(report: any): NCRPComplaintDraft {
  return {
    reportId: report.id || `REP-${Date.now()}`,
    generatedAt: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    incidentType: report.scamCategory || 'Digital Arrest',
    suspectPhoneNumbers: report.extractedEntities?.phones || ['+91 98765 43210'],
    suspectUpiIds: report.extractedEntities?.upis || ['verify-cybercell@okaxis'],
    suspectUrls: report.extractedEntities?.urls || [],
    chronologicalSummary: report.summary || 'Received unsolicited scam communication demanding immediate money transfer or sensitive information under threat.',
    evidenceSnippets: report.rawMessages || [report.input || 'Sample transcript snippet'],
    disclaimer: 'OFFICIAL NOTICE: This document is an automatically generated incident draft. Review all details before manually submitting on https://cybercrime.gov.in or calling helpline 1930.'
  };
}

export function exportNCRPComplaintAsPDF(report: any) {
  const draft = generateNCRPComplaint(report);

  // HTML Template for printable PDF
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>NCRP_1930_Complaint_Draft_${draft.reportId}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #1e293b;
          line-height: 1.5;
        }
        .header {
          border-bottom: 2px solid #0284c7;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .header h1 {
          font-size: 20px;
          margin: 0;
          color: #0f172a;
          text-transform: uppercase;
        }
        .header p {
          font-size: 12px;
          color: #64748b;
          margin: 4px 0 0 0;
        }
        .badge {
          display: inline-block;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fca5a5;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 13px;
          font-weight: bold;
          color: #0369a1;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
          margin-bottom: 8px;
        }
        .field-group {
          display: flex;
          margin-bottom: 6px;
          font-size: 12px;
        }
        .field-label {
          font-weight: bold;
          width: 180px;
          color: #475569;
        }
        .field-value {
          color: #0f172a;
          flex: 1;
        }
        .box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 10px;
          border-radius: 6px;
          font-size: 12px;
          font-family: monospace;
          white-space: pre-wrap;
        }
        .disclaimer-box {
          background: #fffbeb;
          border: 1px solid #fcd34d;
          padding: 10px;
          border-radius: 6px;
          font-size: 11px;
          color: #92400e;
          margin-top: 30px;
        }
        @media print {
          body { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>National Cyber Crime Reporting Portal (NCRP) - Incident Draft</h1>
        <p>Helpline: 1930 | Portal: https://cybercrime.gov.in</p>
      </div>

      <div class="badge">INCIDENT REPORT DRAFT</div>

      <div class="section">
        <div class="section-title">1. Report Meta Data</div>
        <div class="field-group">
          <div class="field-label">Report Reference ID:</div>
          <div class="field-value">${draft.reportId}</div>
        </div>
        <div class="field-group">
          <div class="field-label">Date & Time Generated:</div>
          <div class="field-value">${draft.generatedAt}</div>
        </div>
        <div class="field-group">
          <div class="field-label">Incident Classification:</div>
          <div class="field-value">${draft.incidentType}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">2. Extracted Suspect Indicators</div>
        <div class="field-group">
          <div class="field-label">Suspect Phone Number(s):</div>
          <div class="field-value">${draft.suspectPhoneNumbers.join(', ') || 'N/A'}</div>
        </div>
        <div class="field-group">
          <div class="field-label">Suspect UPI ID(s):</div>
          <div class="field-value">${draft.suspectUpiIds.join(', ') || 'N/A'}</div>
        </div>
        <div class="field-group">
          <div class="field-label">Phishing URL(s):</div>
          <div class="field-value">${draft.suspectUrls.join(', ') || 'N/A'}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">3. Incident Chronological Summary</div>
        <div class="box">${draft.chronologicalSummary}</div>
      </div>

      <div class="section">
        <div class="section-title">4. Evidence Transcript Snippets</div>
        ${draft.evidenceSnippets.map(snippet => `<div class="box" style="margin-bottom: 6px;">${snippet}</div>`).join('')}
      </div>

      <div class="disclaimer-box">
        <strong>IMPORTANT NOTICE:</strong> ${draft.disclaimer}
      </div>

      <script>
 // Look for this inside src/utils/ncrpGenerator.ts:
<script>
  window.onload = function() {
    setTimeout(function() {
      window.focus();
      window.print();
    }, 500);
  };
</script>
</script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
