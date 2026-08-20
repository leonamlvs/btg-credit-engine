import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { RuleConfigurationSchema, type RuleConfiguration } from './rule-configuration.schema';

export const DEFAULT_RULE_CONFIGURATION_PATH = 'config/rules/credit-engine.v1.json';

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nestedValue of Object.values(value)) {
      deepFreeze(nestedValue);
    }
  }

  return value;
}

export function parseRuleConfiguration(source: unknown): RuleConfiguration {
  return deepFreeze(RuleConfigurationSchema.parse(source));
}

export function loadRuleConfiguration(
  relativePath = DEFAULT_RULE_CONFIGURATION_PATH,
): RuleConfiguration {
  const absolutePath = resolve(process.cwd(), relativePath);
  const source: unknown = JSON.parse(readFileSync(absolutePath, 'utf8'));

  return parseRuleConfiguration(source);
}
