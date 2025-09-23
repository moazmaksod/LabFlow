
import { z } from 'zod';

const SpecimenRequirementsSchema = z.object({
  tubeType: z.string().describe('e.g., "Lavender Top"'),
  minVolume: z.number(),
  units: z.string().describe('e.g., "mL"'),
  specialHandling: z.string().optional().describe('e.g., "Protect from light"'),
});

const TurnaroundTimeDetailSchema = z.object({
  value: z.number(),
  units: z.enum(['hours', 'days', 'minutes']),
});

const TurnaroundTimeSchema = z.object({
  routine: TurnaroundTimeDetailSchema,
  stat: TurnaroundTimeDetailSchema,
});

const ReferenceRangeSchema = z.object({
    ageMin: z.number(),
    ageMax: z.number(),
    gender: z.string(),
    rangeLow: z.number(),
    rangeHigh: z.number(),
    units: z.string(),
    interpretiveText: z.string().optional(),
});

const ReflexRuleConditionSchema = z.object({
    testCode: z.string(),
    operator: z.enum(['gt', 'lt', 'eq']),
    value: z.number(),
});

const ReflexRuleActionSchema = z.object({
    addTestCode: z.string(),
});

const ReflexRuleSchema = z.object({
    condition: ReflexRuleConditionSchema,
    action: ReflexRuleActionSchema,
});

export const TestCatalogSchema = z.object({
  _id: z.string(), // ObjectId will be a string
  testCode: z.string().describe("The laboratory's unique internal code for the test."),
  name: z.string().describe('The common name of the test (e.g., "Complete Blood Count").'),
  description: z.string().optional(),
  specimenRequirements: SpecimenRequirementsSchema,
  turnaroundTime: TurnaroundTimeSchema,
  price: z.number().describe('The billing price for the test.'),
  isPanel: z.boolean().default(false),
  panelComponents: z.array(z.string()).optional().describe('If isPanel is true, this array contains the testCodes of the individual tests.'),
  referenceRanges: z.array(ReferenceRangeSchema).optional(),
  reflexRules: z.array(ReflexRuleSchema).optional(),
  isActive: z.boolean().default(true),
});

export type TestCatalog = z.infer<typeof TestCatalogSchema>;
