import { z } from "zod";
import { DateTimeSchema, UUIDSchema } from "./commonSchemas.js";

export const UserSchema = z
  .object({
    id: UUIDSchema.openapi({
      example: "5980c97c-e245-400a-b4c1-52b07feac04f",
    }),

    email: z.email().openapi({
      example: "max@example.com",
    }),

    username: z.string().min(1).openapi({
      example: "max",
    }),

    passwordHash: z.string().min(1).openapi({
      example: "$argon2id$v=19$m=65536,t=3,p=4$...",
    }),

    createdAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),

    updatedAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),
  })
  .openapi("User");

export const CreateUserSchema = UserSchema.pick({
  email: true,
  username: true,
  passwordHash: true,
})
  .strict()
  .openapi("CreateUser");

export const UserUpdateSchema = UserSchema.pick({
  email: true,
  username: true,
  passwordHash: true,
})
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .openapi("UserUpdate");

export type UserData = z.output<typeof UserSchema>;
export type CreateUserData = z.input<typeof CreateUserSchema>;
export type UserUpdateData = z.input<typeof UserUpdateSchema>;

