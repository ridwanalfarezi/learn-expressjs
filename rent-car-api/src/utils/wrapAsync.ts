import { NextFunction, Request, Response } from "express";

const wrapAsync = (fn: Function) => {
  return function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default wrapAsync;
