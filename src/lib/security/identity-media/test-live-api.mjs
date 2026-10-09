async function testLiveApi() {
  const payload = {
    claimedIdentity: "University Accounts Department",
    claimedOrganization: "GIFT Autonomous College",
    claimCategory: "university_teacher",
    communicationText:
      "Hello, this is the accounts department.\n\nYour university scholarship payment is currently on hold.\nPlease verify your bank account immediately using the link below:\n\nhttps://example.com/verify\n\nFailure to complete verification within 30 minutes will result in cancellation.",
    destinationUrl: "https://example.com/verify",
  };

  const res = await fetch("http://localhost:3000/api/analyze/identity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("API error:", res.status, await res.text());
    return;
  }

  const data = await res.json();
  console.log("=== LIVE SERVER RESPONSE ===");
  console.log("Threat Score:", data.riskScore, "/ 100");
  console.log("Risk Level:", data.riskLevel);
  console.log("Classification:", data.classification);
  console.log("Claimed Identity:", data.identityAssessment.claimedIdentity);
  console.log("Claimed Organization:", data.identityAssessment.claimedOrganization);
  console.log("Category:", data.identityAssessment.claimCategory);
  console.log("Consistency Verdict:", data.identityAssessment.consistencyVerdict);
  console.log("Urgency Detected:", data.identityAssessment.urgencyDetected);
  console.log("Financial Request:", data.identityAssessment.financialRequestDetected);
  console.log("Credentials Request:", data.identityAssessment.credentialRequestDetected);
  console.log("Destination URL:", data.identityAssessment.destinationUrl);
  console.log("Domain Mismatch:", data.identityAssessment.domainDiscrepancyDetected);
  console.log("Indicators Count:", data.indicators.length);
  console.log("Summary:", data.summary);
  console.log("Analysis Sources:", data.analysisSources.map((s) => `${s.name} (${s.status})`).join(", "));
}

testLiveApi().catch(console.error);
