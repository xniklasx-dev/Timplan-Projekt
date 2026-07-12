////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodIssue } from "zod";

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

type ValidationErrorDetail = {
    path: string;
    location: "body" | "params" | "headers" | "request";
    field?: string;
    code: ZodIssue["code"];
    message: string;
    expected?: unknown;
    receivedType?: string;
};

function formatPath(path: PropertyKey[]): string {
    return path.map(String).join(".");
}

function describeValueType(value: unknown): string {
    if (Array.isArray(value)) {
        return "array";
    }

    if (value === null) {
        return "null";
    }

    return typeof value;
}

function findFieldByValue(source: unknown, value: unknown, prefix: string): string | undefined {
    if (!source || typeof source !== "object") {
        return undefined;
    }

    for (const [key, candidate] of Object.entries(source)) {
        const path = `${prefix}.${key}`;

        if (Object.is(candidate, value)) {
            return path;
        }

        if (candidate && typeof candidate === "object") {
            const nestedPath = findFieldByValue(candidate, value, path);
            if (nestedPath) {
                return nestedPath;
            }
        }
    }

    return undefined;
}

function inferEmptyIssuePath(req: Request, issue: ZodIssue): string {
    const input = issue.input;

    return findFieldByValue(req.params, input, "params")
        ?? findFieldByValue(req.headers, input, "headers")
        ?? findFieldByValue(req.body, input, "body")
        ?? "request";
}

function getExpected(issue: ZodIssue): unknown {
    if ("format" in issue) {
        return issue.format;
    }

    if ("expected" in issue) {
        return issue.expected;
    }

    if ("values" in issue) {
        return issue.values;
    }

    if ("minimum" in issue) {
        return `minimum ${issue.minimum}`;
    }

    if ("maximum" in issue) {
        return `maximum ${issue.maximum}`;
    }

    return undefined;
}

function getValidationLocation(path: string): ValidationErrorDetail["location"] {
    if (path.startsWith("params.")) return "params";
    if (path.startsWith("headers.")) return "headers";
    if (path.startsWith("body.")) return "body";
    return "request";
}

function formatZodIssue(req: Request, issue: ZodIssue): ValidationErrorDetail {
    const path = issue.path.length > 0
        ? `body.${formatPath(issue.path)}`
        : inferEmptyIssuePath(req, issue);
    const location = getValidationLocation(path);

    return {
        path,
        location,
        field: path.includes(".") ? path.split(".").slice(1).join(".") : undefined,
        code: issue.code,
        message: issue.message,
        expected: getExpected(issue),
        receivedType: describeValueType(issue.input),
    };
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
    console.error(err);

    if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => formatZodIssue(req, issue));

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
