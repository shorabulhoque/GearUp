import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";


const createToken = (
    payload: JwtPayload,
    secret: Secret,
    options: SignOptions
): string => {

    return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: Secret) => {
    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return {
            success: true,
            data: decoded,
            error: null,
        };
    } catch (error: any) {
        return {
            success: false,
            data: null,
            error: error.message || "Invalid or expired token",
        };
    };
};


export const jwtUtils = {
    createToken,
    verifyToken,
};