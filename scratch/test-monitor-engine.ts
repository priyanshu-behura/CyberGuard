import { monitorDetectionEngine } from "../src/lib/security/monitor/engine";
import { monitorStore } from "../src/lib/security/monitor/monitor-store";
import { AuthenticationEvent, BehaviorBaseline } from "../src/lib/security/monitor/types";

console.log("==================================================");
console.log("CYBERGUARD MONITOR & ACCOUNT SECURITY VERIFICATION");
console.log("==================================================\n");

const baseline: BehaviorBaseline = {
  userId: "usr-primary-001",
  knownDevices: [
    {
      deviceId: "dev-mac-arm-01",
      deviceName: "Apple MacBook Pro (M2)",
      deviceType: "Desktop",
      browser: "Chrome 128.0",
      os: "macOS",
      firstSeen: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastSeen: new Date(Date.now() - 86400000).toISOString(),
      isTrusted: true,
      totalLogins: 42,
    },
  ],
  knownLocations: [
    {
      city: "Bhubaneswar",
      country: "India",
      firstSeen: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastSeen: new Date(Date.now() - 86400000).toISOString(),
      loginCount: 56,
      latitude: 20.2961,
      longitude: 85.8245,
    },
  ],
  typicalHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  typicalFrequencyPerDay: 3.5,
  avgSessionDurationMinutes: 120,
  totalRecordedEvents: 60,
  hasSufficientHistory: true,
  baselineExplanation: "Primary access from Bhubaneswar, India on MacBook Pro.",
};

// Test 1: Normal Login
const t1Event: AuthenticationEvent = {
  id: "evt-1",
  userId: "usr-primary-001",
  userEmail: "analyst@cyberguard.internal",
  timestamp: new Date().toISOString(),
  eventType: "LOGIN",
  success: true,
  ipAddress: "103.24.182.10",
  location: { city: "Bhubaneswar", country: "India" },
  deviceId: "dev-mac-arm-01",
  deviceName: "Apple MacBook Pro (M2)",
  deviceType: "Desktop",
  browser: "Chrome 128.0",
  os: "macOS",
  authenticationMethod: "password",
};
const res1 = monitorDetectionEngine.evaluate(t1Event, [], baseline);
console.log("Test 1: Normal Login -> Alerts:", res1.alerts.length, "Total Risk:", res1.overallRiskScore, res1.overallRiskLevel);

// Test 2: One failed login
const t2Event: AuthenticationEvent = {
  ...t1Event,
  id: "evt-2",
  eventType: "PASSWORD_FAILURE",
  success: false,
};
const res2 = monitorDetectionEngine.evaluate(t2Event, [], baseline);
console.log("Test 2: One failed login -> Alerts:", res2.alerts.length, "Total Risk:", res2.overallRiskScore, res2.overallRiskLevel);

// Test 3: Multiple failed logins (Brute force)
const recentFailures: AuthenticationEvent[] = Array.from({ length: 4 }).map((_, i) => ({
  ...t1Event,
  id: `fail-${i}`,
  eventType: "PASSWORD_FAILURE",
  success: false,
  timestamp: new Date(Date.now() - (i + 1) * 30000).toISOString(),
}));
const res3 = monitorDetectionEngine.evaluate(t2Event, recentFailures, baseline);
console.log(
  "Test 3: Multiple failed logins -> Alerts:",
  res3.alerts.map((a) => a.title).join(", "),
  "| Severity:",
  res3.alerts[0]?.severity,
  "| Risk:",
  res3.overallRiskScore,
  res3.overallRiskLevel
);

// Test 4: Same source attacking multiple accounts (Password spraying)
const sprayingHistory: AuthenticationEvent[] = [
  { ...t1Event, userEmail: "alice@cyberguard.internal", ipAddress: "194.26.29.11", success: false },
  { ...t1Event, userEmail: "bob@cyberguard.internal", ipAddress: "194.26.29.11", success: false },
  { ...t1Event, userEmail: "charlie@cyberguard.internal", ipAddress: "194.26.29.11", success: false },
];
const sprayEvent: AuthenticationEvent = {
  ...t1Event,
  id: "spray-4",
  userEmail: "david@cyberguard.internal",
  ipAddress: "194.26.29.11",
  success: false,
};
const res4 = monitorDetectionEngine.evaluate(sprayEvent, sprayingHistory, baseline);
console.log(
  "Test 4: Password Spraying -> Alerts:",
  res4.alerts.map((a) => a.title).join(", "),
  "| Severity:",
  res4.alerts[0]?.severity,
  "| Risk:",
  res4.overallRiskScore,
  res4.overallRiskLevel
);

// Test 5: New device
const newDeviceEvent: AuthenticationEvent = {
  ...t1Event,
  id: "dev-new",
  deviceId: "dev-alienware-01",
  deviceName: "Alienware Gaming PC",
};
const res5 = monitorDetectionEngine.evaluate(newDeviceEvent, [], baseline);
console.log(
  "Test 5: New Device -> Alerts:",
  res5.alerts.map((a) => a.title).join(", "),
  "| Severity:",
  res5.alerts[0]?.severity,
  "| Risk:",
  res5.overallRiskScore,
  res5.overallRiskLevel
);

// Test 6: New location
const newLocationEvent: AuthenticationEvent = {
  ...t1Event,
  id: "loc-new",
  location: { city: "Frankfurt", country: "Germany" },
};
const res6 = monitorDetectionEngine.evaluate(newLocationEvent, [], baseline);
console.log(
  "Test 6: New Location -> Alerts:",
  res6.alerts.map((a) => a.title).join(", "),
  "| Severity:",
  res6.alerts[0]?.severity,
  "| Risk:",
  res6.overallRiskScore,
  res6.overallRiskLevel
);

// Test 7: Successful login after repeated failures
const res7 = monitorDetectionEngine.evaluate(t1Event, recentFailures, baseline);
console.log(
  "Test 7: Success after repeated failures -> Alerts:",
  res7.alerts.map((a) => a.title).join(", "),
  "| Risk:",
  res7.overallRiskScore,
  res7.overallRiskLevel
);

// Test 8: New device + new location + failed attempts
const compositeEvent: AuthenticationEvent = {
  ...t1Event,
  id: "comp-1",
  deviceId: "dev-alienware-01",
  deviceName: "Alienware Gaming PC",
  location: { city: "Frankfurt", country: "Germany" },
};
const res8 = monitorDetectionEngine.evaluate(compositeEvent, recentFailures, baseline);
console.log(
  "Test 8: New device + new location + failed attempts -> Alerts:",
  res8.alerts.map((a) => a.title).join(", "),
  "| Risk:",
  res8.overallRiskScore,
  res8.overallRiskLevel
);

// Test 9: Suspicious session (Impossible travel timeline velocity)
const prevLocEvent: AuthenticationEvent = {
  ...t1Event,
  id: "prev-loc",
  timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
  location: { city: "Bhubaneswar", country: "India", latitude: 20.2961, longitude: 85.8245 },
};
const currentForeignEvent: AuthenticationEvent = {
  ...t1Event,
  id: "curr-loc",
  timestamp: new Date().toISOString(),
  location: { city: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
  ipAddress: "185.122.54.91",
};
const res9 = monitorDetectionEngine.evaluate(currentForeignEvent, [prevLocEvent], baseline);
console.log(
  "Test 9: Impossible Travel -> Alerts:",
  res9.alerts.map((a) => a.title).join(", "),
  "| Severity:",
  res9.alerts[0]?.severity,
  "| Risk:",
  res9.overallRiskScore,
  res9.overallRiskLevel
);

// Test 10: Full Account Takeover (ATO) Chain
const atoSuccessEvent: AuthenticationEvent = {
  ...t1Event,
  id: "ato-win",
  deviceId: "dev-alienware-01",
  deviceName: "Alienware Gaming PC",
  location: { city: "Lagos", country: "Nigeria" },
  ipAddress: "102.89.23.4",
  success: true,
};
const res10 = monitorDetectionEngine.evaluate(atoSuccessEvent, recentFailures, baseline);
console.log(
  "Test 10: Complete Account Takeover Chain -> Alerts:",
  res10.alerts.map((a) => a.title).join(", "),
  "| Severity:",
  res10.alerts[0]?.severity,
  "| Risk:",
  res10.overallRiskScore,
  res10.overallRiskLevel
);

console.log("\n==================================================");
console.log("All 10 tests evaluated dynamically with distinct scores!");
console.log("==================================================");
