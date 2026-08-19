import { access, readFile, stat } from 'node:fs/promises';

const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'docs/architecture.md',
  'docs/adr/001-stateless-no-database.md',
  'docs/adr/002-data-driven-rules.md',
  'docs/adr/003-zod-runtime-contracts.md',
  'specs/credit-engine/requirements.md',
  'specs/credit-engine/assumptions.md',
  'specs/credit-engine/acceptance.md',
  'specs/credit-engine/plan.md',
  'specs/credit-engine/tasks.md',
  'ai-journey/README.md',
  'ai-journey/prompts.md',
  'ai-journey/learnings.md',
];

const requiredScripts = [
  'format:check',
  'lint',
  'typecheck',
  'test',
  'docs:check',
  'build',
  'verify',
];

const failures = [];

for (const file of requiredFiles) {
  try {
    await access(file);
    const metadata = await stat(file);

    if (metadata.size === 0) {
      failures.push(`${file}: file is empty`);
    }
  } catch {
    failures.push(`${file}: file is missing`);
  }
}

try {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

  for (const script of requiredScripts) {
    if (typeof packageJson.scripts?.[script] !== 'string') {
      failures.push(`package.json: missing script "${script}"`);
    }
  }
} catch (error) {
  failures.push(`package.json could not be validated: ${String(error)}`);
}

if (failures.length > 0) {
  console.error('Documentation checks failed:');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exitCode = 1;
} else {
  console.log('Documentation checks passed.');
}
