#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const indexPath = path.join(root, ".agents", "skills", "_index.json");
const selectionPath = path.join(
  root,
  ".agents",
  "skills",
  "auto-selection.json",
);

function fileExists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return null;
  }
}

const pkg = readJSON(path.join(root, "package.json")) || {};
const deps = Object.assign(
  {},
  pkg.dependencies || {},
  pkg.devDependencies || {},
);
const depSet = new Set(Object.keys(deps).map((d) => d.toLowerCase()));

const detected = new Set();
if ([...depSet].some((d) => d === "react" || d === "react-dom"))
  detected.add("react");
if (
  fileExists("vite.config.ts") ||
  fileExists("vite.config.js") ||
  depSet.has("vite")
)
  detected.add("vite");
if (fileExists("tsconfig.json") || depSet.has("typescript"))
  detected.add("typescript");
if (fileExists("tailwind.config.js") || depSet.has("tailwindcss"))
  detected.add("tailwindcss");
if (depSet.has("next") || fileExists("next.config.js")) detected.add("next");
if (depSet.has("express") || depSet.has("fastify") || fileExists("server.js"))
  detected.add("nodejs");
if (fileExists("Dockerfile")) detected.add("docker");
if (
  fs.existsSync(path.join(root, "src", "pwa")) ||
  depSet.has("workbox") ||
  depSet.has("vite-plugin-pwa")
)
  detected.add("pwa");

const mapping = {
  react: ["vercel-react-best-practices", "vercel-composition-patterns"],
  vite: ["vite"],
  typescript: ["typescript-advanced-types"],
  tailwindcss: ["tailwind-css-patterns", "libs.tailwindcss"],
  nodejs: ["nodejs-backend-patterns", "nodejs-best-practices"],
  next: ["vercel-react-best-practices"],
  pwa: ["vite", "frontend-design"],
  docker: ["core.security-dependencies"],
};

const index = readJSON(indexPath);
const available = new Set(
  index && Array.isArray(index.skills) ? index.skills.map((s) => s.id) : [],
);

const recommended = [];
for (const t of detected) {
  const candidates = mapping[t] || [];
  for (const c of candidates) {
    if (available.has(c) && !recommended.find((r) => r.id === c)) {
      recommended.push({ id: c, reason: `Detected ${t}` });
    }
  }
}

if (recommended.length === 0) {
  // fallback
  [
    "core.project-conventions",
    "core.skill-authoring-rules",
    "core.skill-update-protocol",
  ].forEach((c) => {
    if (available.has(c) && !recommended.find((r) => r.id === c))
      recommended.push({ id: c, reason: "Fallback: no direct match" });
  });
}

function printResult() {
  console.log("Detected technologies:");
  console.log("  -", [...detected].join(", ") || "none");
  console.log("\nRecommended agent skills:");
  if (recommended.length === 0)
    console.log("  (no matching skills found in .agents/skills/_index.json)");
  recommended.forEach((r) => console.log(`  - ${r.id}  — ${r.reason}`));
}

function writeSelection() {
  const out = {
    timestamp: new Date().toISOString(),
    cwd: root,
    detected: [...detected],
    recommended,
  };
  fs.writeFileSync(selectionPath, JSON.stringify(out, null, 2), "utf8");
  console.log("\nWrote selection to .agents/skills/auto-selection.json");
}

function ensureAutodetectSkill() {
  const skillDir = path.join(root, ".agents", "skills", "core", "autodetect");
  const skillFile = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(skillFile)) {
    fs.mkdirSync(skillDir, { recursive: true });
    const content = [
      "# Autodetect Skill",
      "",
      "When to use: Run this script to auto-detect tech and recommend existing agent skills.",
      "",
      "Steps:",
      "1. Run with --dry-run to preview recommendations.",
      "2. Run with --yes to write auto-selection.json.",
      "",
      "Update notes: This is a generated helper skill created by the installer.",
    ].join("\n");
    fs.writeFileSync(skillFile, content, "utf8");
    console.log("Created skill file:", path.relative(root, skillFile));
  }
}

function usage() {
  console.log("Usage:");
  console.log("  npx ./scripts/autodetect-skills.cjs [--dry-run] [--yes]");
  console.log("\nOptions:");
  console.log(
    "  --dry-run, -d   Show detected tech and recommended skills (no changes)",
  );
  console.log(
    "  --yes, -y       Apply changes (write auto-selection.json and create helper skill)",
  );
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}
const dry = args.includes("--dry-run") || args.includes("-d");
const yes = args.includes("--yes") || args.includes("-y");

printResult();

if (dry) process.exit(0);

if (!yes) {
  console.log(
    "\nRun with `--yes` to write the selection and create the helper skill.",
  );
  process.exit(0);
}

ensureAutodetectSkill();
writeSelection();
console.log("Done.");
