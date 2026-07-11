import { z } from "zod";
import { DateTimeSchema, UUIDSchema } from "./commonSchemas.js";

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
        displayname: z.string().optional().openapi({
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
    username: true,
    email: true,
    displayname: true,
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

