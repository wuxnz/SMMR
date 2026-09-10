import * as z from "zod"

/** Layer form: omitted values inherit from the next configuration layer. */
export const SmmrSettingsLayerSchema = z.object({
  enabled: z.boolean().optional(),
  model: z.string().trim().min(1).optional(),
  allow_network: z.boolean().optional(),
  allow_memory_writes: z.boolean().optional(),
  allow_research: z.boolean().optional(),
}).strict()

/** Resolved form: SMMR remains opt-in and local-first by default. */
export const SmmrSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  model: z.string().trim().min(1).optional(),
  allow_network: z.boolean().default(false),
  allow_memory_writes: z.boolean().default(false),
  allow_research: z.boolean().default(false),
}).strict()

export type SmmrSettings = z.infer<typeof SmmrSettingsSchema>
