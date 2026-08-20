import { createApp } from '../../src/app';
import { createCustomerClassifier } from '../../src/modules/credit-engine/application/classify-customer';
import { loadRuleConfiguration } from '../../src/modules/credit-engine/config/load-rule-configuration';

const classifyCustomer = createCustomerClassifier(loadRuleConfiguration());

export function createTestApp() {
  return createApp({ classifyCustomer });
}
