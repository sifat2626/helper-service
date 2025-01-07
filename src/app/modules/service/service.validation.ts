import z from 'zod'

const createServiceValidation = z.object({
  body: z.object({
    name: z.string()
  })
})

export const ServiceValidation = {createServiceValidation}