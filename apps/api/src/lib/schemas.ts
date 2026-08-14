import { z } from "zod"

export const ErrorSchema = z.object({ message: z.string() })

export type ErrorResponse = z.infer<typeof ErrorSchema>
