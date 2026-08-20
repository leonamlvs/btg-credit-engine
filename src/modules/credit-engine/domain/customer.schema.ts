import { z } from '../../../shared/schema/zod';

export const RegionSchema = z.enum(['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']);

export const MarketDebtTypeSchema = z.enum([
  'credit_card',
  'personal_loan',
  'mortgage',
  'credit_default',
  'loan_default',
]);

export const CustomerLocationSchema = z
  .object({
    city: z.string(),
    state: z.string(),
    region: RegionSchema,
  })
  .loose();

export const CustomerSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    age: z.number().int(),
    score: z.number().int().min(0).max(1000),
    has_market_debt: z.boolean(),
    market_debt_types: z.array(MarketDebtTypeSchema),
    location: CustomerLocationSchema,
    job_title: z.string(),
  })
  .loose();

export type Customer = z.infer<typeof CustomerSchema>;
export type MarketDebtType = z.infer<typeof MarketDebtTypeSchema>;
export type Region = z.infer<typeof RegionSchema>;
