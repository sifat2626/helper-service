import z from "zod";

const createHelper = z.object({
  body: z.object({
    age: z
      .number({
        required_error: "Age is required!",
      })
      .min(18, { message: "Age must be at least 18!" }),
    nationality: z
      .string({
        required_error: "Nationality is required!",
      })
      .min(2, { message: "Nationality must be at least 2 characters long!" }),
    experience: z
      .number({
        required_error: "Experience is required!",
      })
      .min(0, { message: "Experience must be a positive number!" }),
    languages: z
      .array(
        z.string({
          required_error: "Languages must be a list of strings!",
        })
      )
      .min(1, { message: "At least one language is required!" }),
    photo: z
      .string()
      .url({ message: "Photo must be a valid URL!" })
      .optional(),
    biodataUrl: z
      .string()
      .url({ message: "Biodata URL must be a valid URL!" })
      .optional(),
    availability: z.boolean().optional(),
    rating: z
      .number()
      .min(0, { message: "Rating must be at least 0!" })
      .max(5, { message: "Rating must not exceed 5!" })
      .optional(),
  }),
});

const updateHelper = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long!" })
      .optional(),
    age: z
      .number()
      .min(18, { message: "Age must be at least 18!" })
      .optional(),
    nationality: z
      .string()
      .min(2, { message: "Nationality must be at least 2 characters long!" })
      .optional(),
    experience: z
      .number()
      .min(0, { message: "Experience must be a positive number!" })
      .optional(),
    languages: z
      .array(z.string())
      .min(1, { message: "At least one language is required!" })
      .optional(),
    photo: z
      .string()
      .url({ message: "Photo must be a valid URL!" })
      .optional(),
    biodataUrl: z
      .string()
      .url({ message: "Biodata URL must be a valid URL!" })
      .optional(),
    availability: z.boolean().optional(),
    rating: z
      .number()
      .min(0, { message: "Rating must be at least 0!" })
      .max(5, { message: "Rating must not exceed 5!" })
      .optional(),
  }),
  params: z.object({
    id: z.string({
      required_error: "Helper ID is required!",
    }),
  }),
});

const getHelperById = z.object({
  params: z.object({
    id: z.string({
      required_error: "Helper ID is required!",
    }),
  }),
});

const deleteHelper = z.object({
  params: z.object({
    id: z.string({
      required_error: "Helper ID is required!",
    }),
  }),
});

export const HelperValidation = {
  createHelper,
  updateHelper,
  getHelperById,
  deleteHelper,
};
