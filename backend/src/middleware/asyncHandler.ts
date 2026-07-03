////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler = (handler: AsyncRouteHandler): RequestHandler => (req, res, next) => {
    void handler(req, res, next).catch(next);
  };