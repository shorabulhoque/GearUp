import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";


const createToken = (
    payload: JwtPayload,
    secret: Secret,
    options: SignOptions
): string => {

    return jwt.sign(payload, secret, options);
};


export const jwtUtils = {
    createToken,
};