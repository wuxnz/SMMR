import * as z from "zod"

const SmmrModelSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value.includes(":") || value.includes("/"), {
    message: "SMMR model must use provider:model or provider/model syntax",
  })

/** Layer form: omitted values inherit from the next configuration layer. */
export const SmmrSettingsLayerSchema = z.object({
  enabled: z.boolean().optional(),
  model: SmmrModelSchema.optional(),
  allow_network: z.boolean().optional(),
  allow_memory_writes: z.boolean().optional(),
  allow_research: z.boolean().optional(),
}).strict()

/** Resolved form: SMMR remains opt-in and local-first by default. */
export const SmmrSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  model: SmmrModelSchema.optional(),
  allow_network: z.boolean().default(false),
  allow_memory_writes: z.boolean().default(false),
  allow_research: z.boolean().default(false),
}).strict()

export type SmmrSettings = z.infer<typeof SmmrSettingsSchema>
