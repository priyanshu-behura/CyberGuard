import { unifiedMediaAnalyzer } from "./media-analyzer";
import { analyzeDigitalImpersonation } from "./impersonation-analyzer";

async function runTests() {
  console.log("==========================================================");
  console.log("CYBERGUARD IDENTITY & MEDIA INTELLIGENCE VERIFICATION TEST");
  console.log("==========================================================\n");

  // TEST A — BENIGN
  console.log("--- TEST A: BENIGN COMMUNICATION ---");
  const testA = analyzeDigitalImpersonation({
    claimedIdentity: "University Accounts Department",
    claimedOrganization: "GIFT Autonomous College",
    communicationText:
      "Your fee receipt is ready. You can review it through the official student portal whenever convenient.",
  });
  console.log(`- Claimed Identity: "${testA.assessment.claimedIdentity}"`);
  console.log(`- Claimed Organization: "${testA.assessment.claimedOrganization}"`);
  console.log(`- Persona Category: ${testA.assessment.claimCategory}`);
  console.log(`- Threat Score: ${testA.riskScore}/100`);
  console.log(`- Risk Level: ${testA.riskLevel}`);
  console.log(`- Verdict: ${testA.assessment.consistencyVerdict}`);
  console.log(`- Summary: ${testA.summary}\n`);

  // TEST B — SOCIAL ENGINEERING (Urgency, Authority, Financial/Account)
  console.log("--- TEST B: SOCIAL ENGINEERING ---");
  const testB = analyzeDigitalImpersonation({
    claimedIdentity: "University Accounts Department",
    claimedOrganization: "GIFT Autonomous College",
    communicationText:
      "Your scholarship payment is on hold. Verify your bank account within 30 minutes or your scholarship will be cancelled.",
  });
  console.log(`- Claimed Identity: "${testB.assessment.claimedIdentity}"`);
  console.log(`- Claimed Organization: "${testB.assessment.claimedOrganization}"`);
  console.log(`- Persona Category: ${testB.assessment.claimCategory}`);
  console.log(`- Urgency Detected: ${testB.assessment.urgencyDetected}`);
  console.log(`- Financial Request: ${testB.assessment.financialRequestDetected}`);
  console.log(`- Credentials/Verification: ${testB.assessment.credentialRequestDetected}`);
  console.log(`- Threat Score: ${testB.riskScore}/100`);
  console.log(`- Risk Level: ${testB.riskLevel}`);
  console.log(`- Verdict: ${testB.assessment.consistencyVerdict}`);
  console.log(`- Indicators (${testB.indicators.length}): ${testB.indicators.map((i) => i.name).join("; ")}\n`);

  // TEST C — IMPERSONATION + URL
  console.log("--- TEST C: IMPERSONATION + URL ---");
  const testC = analyzeDigitalImpersonation({
    claimedIdentity: "University Accounts Department",
    claimedOrganization: "GIFT Autonomous College",
    communicationText:
      "Your scholarship payment is on hold. Verify your account immediately.",
    destinationUrl: "https://example.com/verify",
  });
  console.log(`- Claimed Identity: "${testC.assessment.claimedIdentity}"`);
  console.log(`- Claimed Organization: "${testC.assessment.claimedOrganization}"`);
  console.log(`- Destination URL: "${testC.assessment.destinationUrl}"`);
  console.log(`- Domain Discrepancy: ${testC.assessment.domainDiscrepancyDetected}`);
  console.log(`- Threat Score: ${testC.riskScore}/100`);
  console.log(`- Risk Level: ${testC.riskLevel}`);
  console.log(`- Verdict: ${testC.assessment.consistencyVerdict}`);
  console.log(`- Indicators (${testC.indicators.length}): ${testC.indicators.map((i) => i.name).join("; ")}\n`);

  // TEST D — COMPLETELY DIFFERENT WORDING (Hostel deposit threat)
  console.log("--- TEST D: UNSEEN WORDING ---");
  const testD = analyzeDigitalImpersonation({
    claimedIdentity: "Dean of Student Affairs",
    claimedOrganization: "National Engineering Institute",
    communicationText:
      "Action required: Your hostel allocation security deposit has been flagged for discrepancies. Please re-authenticate your banking card details at https://secure-hostel-portal.xyz/login before 6:00 PM today to avoid forfeiture of your allotted accommodation.",
  });
  console.log(`- Claimed Identity: "${testD.assessment.claimedIdentity}"`);
  console.log(`- Claimed Organization: "${testD.assessment.claimedOrganization}"`);
  console.log(`- Auto-extracted URL: "${testD.assessment.destinationUrl}"`);
  console.log(`- Domain Discrepancy: ${testD.assessment.domainDiscrepancyDetected}`);
  console.log(`- Threat Score: ${testD.riskScore}/100`);
  console.log(`- Risk Level: ${testD.riskLevel}`);
  console.log(`- Verdict: ${testD.assessment.consistencyVerdict}`);
  console.log(`- Summary: ${testD.summary}\n`);

  // TEST E — USER'S EXACT PROMPT CASE
  console.log("--- TEST E: USER PROMPT EXACT CASE ---");
  const testE = analyzeDigitalImpersonation({
    claimedIdentity: "University Accounts Department",
    claimedOrganization: "GIFT Autonomous College",
    communicationText:
      "Hello, this is the accounts department.\n\nYour university scholarship payment is currently on hold.\nPlease verify your bank account immediately using the link below:\n\nhttps://example.com/verify\n\nFailure to complete verification within 30 minutes will result in cancellation.",
    destinationUrl: "https://example.com/verify",
  });
  console.log(`- Claimed Identity: "${testE.assessment.claimedIdentity}"`);
  console.log(`- Claimed Organization: "${testE.assessment.claimedOrganization}"`);
  console.log(`- Persona Category: ${testE.assessment.claimCategory}`);
  console.log(`- Urgency Detected: ${testE.assessment.urgencyDetected}`);
  console.log(`- Financial Request: ${testE.assessment.financialRequestDetected}`);
  console.log(`- Credentials/Verification: ${testE.assessment.credentialRequestDetected}`);
  console.log(`- Destination URL: "${testE.assessment.destinationUrl}"`);
  console.log(`- Domain Mismatch: ${testE.assessment.domainDiscrepancyDetected}`);
  console.log(`- Threat Score: ${testE.riskScore}/100`);
  console.log(`- Risk Level: ${testE.riskLevel}`);
  console.log(`- Verdict: ${testE.assessment.consistencyVerdict}`);
  console.log(`- Indicators Flagged (${testE.indicators.length}):`);
  testE.indicators.forEach((ind) => {
    console.log(`   * [${ind.severity.toUpperCase()}] ${ind.name} (+${ind.scoreImpact} pts)`);
  });
  console.log(`- Evidence Count: ${testE.evidence.length}`);
  console.log(`- Summary: ${testE.summary}\n`);

  console.log("==========================================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY");
  console.log("==========================================================");
}

runTests().catch(console.error);
