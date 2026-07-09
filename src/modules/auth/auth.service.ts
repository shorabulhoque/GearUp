import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import { UserStatus } from "../../../generated/prisma/enums";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const registerUserIntoDB = async (payload: any) => {
    const { name, email, password, role } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });

    if (isUserExist) {
        throw new AppError(httpStatus.CONFLICT, "User with this email already exists!");
    };

    const hashedPassword = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds || 12)
    );

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role
        }
    });

    const user = await prisma.user.findUnique({
        where: { id: createdUser.id },
        omit: {
            password: true
        }
    });

    return user;
};

const loginUser = async (payload: any) => {
    const { email, password } = payload;

    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    });

    if (user.status === "SUSPENDED") {
        throw new AppError(httpStatus.FORBIDDEN, "Your account has been suspended. Please contact support.");
    };

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect");
    };

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        { expiresIn: config.jwt_access_expires_in } as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        { expiresIn: config.jwt_refresh_expires_in } as SignOptions
    );

    return { accessToken, refreshToken };
};

const refreshToken = async (token: string) => {
    if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required!");
    };

    const verifiedRefreshToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret as string);
    if (!verifiedRefreshToken.success) {
        throw new AppError(httpStatus.FORBIDDEN, verifiedRefreshToken.error);
    };

    const { id } = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where: { id }
    });

    if (user.status === UserStatus.SUSPENDED) {
        throw new AppError(httpStatus.FORBIDDEN, "Your account has been suspended. Please contact support.");
    };

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        { expiresIn: config.jwt_access_expires_in } as SignOptions
    );

    return { accessToken };
};

export const authService = {
    registerUserIntoDB,
    loginUser,
    refreshToken
};