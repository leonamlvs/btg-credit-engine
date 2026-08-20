import { z } from '../../../shared/schema/zod';

import type { CoreClassification } from '../application/classify-customer';
import { CustomerSchema, type Customer } from '../domain/customer.schema';

export const ClassificationResponseSchema = CustomerSchema.extend({
  cluster_id: z.string(),
  cluster_name: z.string(),
  job_category: z.string(),
  monthly_income: z.number(),
  approved: z.boolean(),
  approved_limit: z.number(),
});

export const ErrorDetailSchema = z.object({
  path: z.string(),
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.enum(['VALIDATION_ERROR', 'MALFORMED_JSON']),
    message: z.string(),
    details: z.array(ErrorDetailSchema),
  }),
});

export type ClassificationResponse = z.infer<typeof ClassificationResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export function mapClassificationResponse(
  customer: Customer,
  classification: CoreClassification,
): ClassificationResponse {
  return ClassificationResponseSchema.parse({
    ...customer,
    cluster_id: classification.clusterCode,
    cluster_name: classification.clusterName,
    job_category: classification.jobCategoryCode,
    monthly_income: classification.monthlyIncome,
    approved: classification.approved,
    approved_limit: classification.approvedLimit,
  });
}

export function mapValidationError(error: z.ZodError): ErrorResponse {
  return {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.issues.map((issue) => ({
        path: issue.path.map(String).join('.'),
        message: issue.message,
      })),
    },
  };
}

export function mapMalformedJsonError(): ErrorResponse {
  return {
    error: {
      code: 'MALFORMED_JSON',
      message: 'Request body contains invalid JSON',
      details: [],
    },
  };
}
