const baseUrl = (process.env.STAGING_BASE_URL || process.argv[2] || "").replace(/\/$/, "");

if (!baseUrl) {
  console.error("Set STAGING_BASE_URL or pass the base URL as the first argument.");
  process.exit(1);
}

try {
  new URL(baseUrl);
} catch {
  console.error("STAGING_BASE_URL must be a valid absolute URL.");
  process.exit(1);
}

const checks = [
  {
    name: "Health endpoint",
    path: "/api/health",
    validate: async (response) => {
      const body = await response.json();
      return response.status === 200 && body.status === "ok";
    },
  },
  {
    name: "Login page",
    path: "/login",
    validate: async (response) => response.status === 200,
  },
  {
    name: "Protected dashboard redirect",
    path: "/dashboard",
    redirect: "manual",
    validate: async (response) =>
      [301, 302, 303, 307, 308].includes(response.status) &&
      Boolean(response.headers.get("location")?.includes("/login")),
  },
];

let failed = 0;
for (const check of checks) {
  try {
    const response = await fetch(`${baseUrl}${check.path}`, {
      redirect: check.redirect || "follow",
      headers: { "user-agent": "farmer-circle-staging-smoke/1.0" },
    });
    const passed = await check.validate(response);
    console.log(`${passed ? "PASS" : "FAIL"}  ${check.name} (${response.status})`);
    if (!passed) failed += 1;
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${check.name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed) {
  console.error(`\nSmoke test failed: ${failed} check(s) failed.`);
  process.exit(1);
}

console.log("\nSmoke test passed.");
