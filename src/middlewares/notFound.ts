import { NextFunction, Request, Response } from "express"

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: "Not Found",
        errorDetails: {
            path: req.originalUrl,
            message: `The requested URL '${req.originalUrl}' was not found on this server.`
        }
    });
};