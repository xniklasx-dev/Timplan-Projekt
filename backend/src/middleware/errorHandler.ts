////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
    readonly statusCode: number;
    readonly exposed: boolean = true;
    readonly status: string = "error";

    constructor(statusCode: number, message: string, exposed: boolean = true, status: string = "error") {
       super(message);
       this.name = this.constructor.name; 
       this.statusCode = statusCode;
       this.exposed = exposed;
       this.status = status;
    }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
    console.error(err);

    if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => ({
            field: issue.path.length > 0 ? issue.path.map(String).join(".") : undefined,
            code: issue.code,
            message: issue.message,
        }));

        res.status(400).json({ 
            status: "error",
            code: "VALIDATION_ERROR",
            message: `Validation failed for ${errors.length} ${errors.length === 1 ? "field" : "fields"}`,
            errors,
        });
        return;
    }
    
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({ 
            status: err.status,
            message: err.exposed ? err.message : "An unexpected error occurred",
        });
        return;
    }

    res.status(500).json({ 
        status: "error",
        message: "An unexpected error occurred",
    });
}
