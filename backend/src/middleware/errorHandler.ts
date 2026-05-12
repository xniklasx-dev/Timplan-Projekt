import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
    readonly statusCode: number;
    readonly exposed: boolean = true;

    constructor(statusCode: number, message: string, exposed: boolean = true) {
       super(message);
       this.name = this.constructor.name; 
       this.statusCode = statusCode;
       this.exposed = exposed;
    }
}

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction): void {
    if (err instanceof ZodError) {
        res.status(400).json({ 
            status: "error",
            code: "VALIDATION_ERROR",
            errors: err.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
         });
         return;
    }
    
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({ 
            status: "error",
            message: err.exposed ? err.message : "An unexpected error occurred",
         });
         return;
    }
    console.error(err);

    res.status(500).json({ 
        status: "error",
        message: "An unexpected error occurred",
     });
}