import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const UUIDSchema = z.uuid();
export const DateTimeSchema = z.iso.datetime();

const TagsSchema = z.array(z.string().min(1)).default([]);

export const CardSchema = z
  .object({
    id: UUIDSchema.openapi({
      example: "5980c97c-e245-400a-b4c1-52b07feac04f",
    }),

    deckId: UUIDSchema.openapi({
      example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f",
    }),

    front: z.string().min(1).openapi({
      example: "What is TypeScript?",
    }),

    back: z.string().min(1).openapi({
      example: "A typed superset of JavaScript.",
    }),

    hint: z.string().optional().openapi({
      example: "Think about types",
    }),

    tags: TagsSchema.openapi({
      example: ["typescript", "basics"],
    }),

    state: z
      .enum(["new", "learning", "review", "suspended"])
      .default("new")
      .openapi({
        example: "new",
      }),

    due: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),

    rating: z
      .enum(["again", "hard", "good", "easy"])
      .openapi({
        example: "good",
      }),

    totalReviews: z.number().int().nonnegative().default(0).openapi({
      example: 10,
    }),

    createdAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),

    updatedAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),
  })
  .openapi("Card");

export const CreateCardSchema = CardSchema.pick({
  deckId: true,
  front: true,
  back: true,
  hint: true,
  tags: true,
})
  .strict()
  .openapi("CreateCard");

export const CardUpdateSchema = CardSchema.pick({
  front: true,
  back: true,
  hint: true,
  tags: true,
})
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .openapi("CardUpdate");

export const UpsertCardSchema = CreateCardSchema.omit({
  deckId: true,
})
  .extend({
    id: UUIDSchema.optional().openapi({
      example: "5980c97c-e245-400a-b4c1-52b07feac04f",
    }),
  })
  .strict()
  .openapi("UpsertCard");

export const BatchUpsertCardsSchema = z
  .object({
    deckId: z.uuid().openapi({
      example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f",
    }),

    cards: z.array(UpsertCardSchema).min(1).openapi({
      example: [
        {
          id: "5980c97c-e245-400a-b4c1-52b07feac04f",
          front: "What is TypeScript?",
          back: "A typed superset of JavaScript.",
          hint: "Think about types",
          tags: ["typescript", "basics"],
        },
        {
          front: "What is Express?",
          back: "A Node.js web framework.",
          tags: ["backend"],
        },
      ],
    }),
  })
  .strict()
  .openapi("BatchUpsertCards");

export const DeckSchema = z
  .object({
    id: UUIDSchema.openapi({
      example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f",
    }),

    userId: UUIDSchema.openapi({
      example: "5980c97c-e245-400a-b4c1-52b07feac04f",
    }),

    name: z.string().min(1).openapi({
      example: "TypeScript Basics",
    }),

    description: z.string().optional().openapi({
      example: "Learn TypeScript fundamentals",
    }),

    tags: TagsSchema.openapi({
      example: ["typescript"],
    }),

    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional()
      .openapi({
        example: "#420420",
      }),

    icon: z.string().optional().openapi({
      example: "code",
    }),

    parentDeckId: UUIDSchema.optional().openapi({
      example: "1fd82b13-9e3e-4b5e-a29f-d7cc772e66e1",
    }),

    createdAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),

    updatedAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),
  })
  .openapi("Deck");

export const DateDataSchema = z
  .object({
    id: UUIDSchema.openapi({
      example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f",
    }),

    userId: UUIDSchema.openapi({
      example: "5980c97c-e245-400a-b4c1-52b07feac04f",
    }),

    date: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),

    easy: z.number().int().nonnegative().openapi({
      example: 5,
    }),

    medium: z.number().int().nonnegative().openapi({
      example: 3,
    }),

    hard: z.number().int().nonnegative().openapi({
      example: 2,
    }),
  })
  .openapi("DateData");

  export type CardData = z.output<typeof CardSchema>;
  export type CreateCardData = z.input<typeof CreateCardSchema>;
  export type CardUpdateData = z.input<typeof CardUpdateSchema>;
  export type UpsertCardData = z.input<typeof UpsertCardSchema>;
  export type BatchUpsertCardsData = z.input<typeof BatchUpsertCardsSchema>;

  export const UserSchema = z
    .object({
        id: UUIDSchema.openapi({
            example: "5980c97c-e245-400a-b4c1-52b07feac04f",
        }),

        username: z.string().min(1).openapi({
            example: "testuser",
        }),

        email: z.string().email().openapi({
            example: "testuser@example.com",
        }),

      /*  passwordHash: z.string().min(12).openapi({
            example: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3mS0i8",
        }),
      */
        displayName: z.string().optional().openapi({
            example: "Test User",
        }),

        avatarUrl: z.string().url().optional().nullable().openapi({
            example: "https://example.com/avatar.jpg",
        }),

        createdAt: DateTimeSchema.openapi({
            example: "2026-05-06T18:53:54.378Z",
        }),

        updatedAt: DateTimeSchema.openapi({
            example: "2026-05-06T18:53:54.378Z",
        })

    })
    .openapi("User");

    export const RegisterSchema = z
    .object({
        username: z.string().min(2).max(10).openapi({
            example: "testuser",
        }),

        email: z.string().email().openapi({
            example: "testuser@example.com",
        }),
        
        password: z.string().min(8).openapi({
            example: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3mS0i8"
        })
    })
    .strict()
    .openapi("CreateUser");

    export const LoginSchema = z
    .object({
        emailOrUsername: z.string().min(1).openapi({
            example: "testuser or testuser@example.com",
        }),
        
        password: z.string().min(8).openapi({
            example: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3mS0i8"
        })
    })
    .strict()
    .openapi("LoginUser");

    export const ForgotPasswordSchema = z
    .object({
        email: z.string().email().openapi({
            example: "testuser@example.com",
        })
    })
    .strict()
    .openapi("ForgotUserPassword");

    export const ResetPasswordSchema = z
    .object({
        token: z.string().min(1).openapi({
            example: "reset-token-123",
        }),

        newPassword: z.string().min(12).openapi({
            example: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3mS0i8"
        })
    })
    .strict()
    .openapi("ResetUserPassword");

    export const UpdateProfileSchema = UserSchema.pick({
        displayName: true,
        avatarUrl: true,
    })
    .partial()
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    })
    .openapi("UpdateUser");

    export const ChangePasswordSchema = z.object({
        currentPassword: z.string().min(8),
        newPassword: z.string().min(8)
    }).strict();

    export type UserData = z.output<typeof UserSchema>;
    export type RegisterData = z.input<typeof RegisterSchema>;
    export type LoginData = z.input<typeof LoginSchema>;
    export type ForgotPasswordData = z.input<typeof ForgotPasswordSchema>;
    export type ResetPasswordData = z.input<typeof ResetPasswordSchema>;
    export type UpdateProfileData = z.input<typeof UpdateProfileSchema>;
    export type ChangePasswordData = z.input<typeof ChangePasswordSchema>;

    