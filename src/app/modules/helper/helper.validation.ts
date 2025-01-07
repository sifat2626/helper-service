import z from "zod";

const createHelper = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required!",
      })
      .min(2, { message: "Name must be at least 2 characters long!" }),
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email({ message: "Email must be a valid email address!" }),
    age: z
      .number({
        required_error: "Age is required!",
      })
      .min(18, { message: "Age must be at least 18!" }),
    experience: z
      .number({
        required_error: "Experience is required!",
      })
      .min(0, { message: "Experience must be a positive number!" }),
    serviceName: z
      .string({
        required_error: "Service name is required!",
      })
      .min(2, { message: "Service name must be at least 2 characters long!" }),
    photo: z
      .string()
      .url({ message: "Photo must be a valid URL!" })
      .optional(),
    biodataUrl: z
      .string()
      .url({ message: "Biodata URL must be a valid URL!" })
      .optional(),
    availability: z.boolean().optional(),
  }),
});

const updateHelper = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long!" })
      .optional(),
    email: z
      .string()
      .email({ message: "Email must be a valid email address!" })
      .optional(),
    age: z
      .number()
      .min(18, { message: "Age must be at least 18!" })
      .optional(),
    experience: z
      .number()
      .min(0, { message: "Experience must be a positive number!" })
      .optional(),
    serviceName: z
      .string()
      .min(2, { message: "Service name must be at least 2 characters long!" })
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
