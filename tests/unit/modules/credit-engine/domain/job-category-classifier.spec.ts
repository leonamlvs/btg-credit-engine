import { describe, expect, it } from '@jest/globals';

import { loadRuleConfiguration } from '../../../../../src/modules/credit-engine/config/load-rule-configuration';
import type { RuleConfiguration } from '../../../../../src/modules/credit-engine/config/rule-configuration.schema';
import type { Customer } from '../../../../../src/modules/credit-engine/domain/customer.schema';
import { classifyJobCategory } from '../../../../../src/modules/credit-engine/domain/job-category-classifier';

const configuration = loadRuleConfiguration();
const baseCustomer: Customer = {
  id: 'customer-1',
  name: 'Ana Silva',
  age: 35,
  score: 700,
  has_market_debt: false,
  market_debt_types: [],
  location: { city: 'São Paulo', state: 'SP', region: 'Sudeste' },
  job_title: 'Engineer',
};

function classify(jobTitle: string, rules: RuleConfiguration = configuration) {
  return classifyJobCategory({ ...baseCustomer, job_title: jobTitle }, rules);
}

describe('classifyJobCategory', () => {
  it.each([
    'CEO',
    'CFO',
    'CTO',
    'COO',
    'CIO',
    'CMO',
    'Chief',
    'President',
    'Vice President',
    'VP',
    'Director',
  ])('matches executive keyword %s', (keyword) => {
    expect(classify(`Regional ${keyword}`).code).toBe('EXECUTIVE');
  });

  it.each(['COO', 'COO Brazil', 'coo', '(COO)', 'ex-COO', 'COO/CTO', 'COO_Brazil'])(
    'matches standalone executive acronym in %s',
    (title) => {
      expect(classify(title).code).toBe('EXECUTIVE');
    },
  );

  it.each(['Coordinator', 'Senior Coordinator'])('keeps %s in SENIOR_PROFESSIONAL', (title) => {
    expect(classify(title)).toEqual(
      expect.objectContaining({ code: 'SENIOR_PROFESSIONAL', multiplier: 1.5 }),
    );
  });

  it.each(['Senior', 'Lead', 'Manager', 'Coordinator', 'Supervisor', 'Principal'])(
    'matches senior keyword %s case-insensitively',
    (keyword) => {
      expect(classify(keyword.toLocaleLowerCase()).code).toBe('SENIOR_PROFESSIONAL');
    },
  );

  it.each([
    'Engineer',
    'Analyst',
    'Developer',
    'Specialist',
    'Designer',
    'Accountant',
    'Consultant',
    'Architect',
  ])('matches mid-professional keyword %s', (keyword) => {
    expect(classify(`Product ${keyword}`).code).toBe('MID_PROFESSIONAL');
  });

  it.each(['Junior', 'Trainee', 'Intern', 'Apprentice', 'Assistant', 'Associate'])(
    'matches junior-professional keyword %s',
    (keyword) => {
      expect(classify(`${keyword} Operations`).code).toBe('JUNIOR_PROFESSIONAL');
    },
  );

  it('uses OTHER as the fallback', () => {
    expect(classify('Teacher')).toEqual(
      expect.objectContaining({ code: 'OTHER', multiplier: 0.8 }),
    );
  });

  it('selects the highest-priority match and does not mutate rule order', () => {
    const prioritiesBefore = configuration.jobCategories.map(({ priority }) => priority);

    expect(classify('Assistant Manager to the Director').code).toBe('EXECUTIVE');
    expect(configuration.jobCategories.map(({ priority }) => priority)).toEqual(prioritiesBefore);
  });
});
