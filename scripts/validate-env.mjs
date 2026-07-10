const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const optionalUrls = ["ECONOMIC_CALENDAR_API_URL"];
const errors = [];

for (const name of required) {
  if (!process.env[name]?.trim()) {
    errors.push(`${name} is required`);
  }
}

for (const name of ["NEXT_PUBLIC_SUPABASE_URL", ...optionalUrls]) {
  const value = process.env[name]?.trim();
  if (!value) continue;
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      errors.push(`${name} must use http or https`);
    }
  } catch {
    errors.push(`${name} must be a valid URL`);
  }
}

if (errors.length) {
  console.error("Environment validation failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Environment validation passed.");
