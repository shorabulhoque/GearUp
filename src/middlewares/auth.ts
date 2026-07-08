import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../config";
import { jwtUtils } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

export const auth = (...requiredRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies?.accessToken;

            if (!token) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    success: false,
                    statusCode: httpStatus.UNAUTHORIZED,
                    message: "You are not authorized to access this resource!"
                });
            };

            const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret as string);

            if (!verifiedToken.success) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    success: false,
                    statusCode: httpStatus.UNAUTHORIZED,
                    message: verifiedToken.error || "Token has expired or is invalid!"
                });
            };

            const { id, name, email, role } = verifiedToken.data as JwtPayload;

            if (requiredRoles.length && !requiredRoles.includes(role)) {
                return res.status(httpStatus.FORBIDDEN).json({
                    success: false,
                    statusCode: httpStatus.FORBIDDEN,
                    message: "Forbidden! You don't have permission to access this resource."
                });
            };

            req.user = { id, name, email, role };

            next();
        } catch (error) {
            next(error);
        };
    };
};