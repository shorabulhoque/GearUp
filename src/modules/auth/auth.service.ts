import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import { UserStatus } from "../../../generated/prisma/enums";

const registerUserIntoDB = async (payload: any) => {
    const { name, email, password, role } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });

    if (isUserExist) {
        throw new Error("User with this email already exists!");
    }

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

    if (user.status === UserStatus.SUSPENDED) {
        throw new Error("Your account has been suspended. Please contact support.");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new Error("Password is incorrect");
    }

    const loggedInUser = await prisma.user.findUnique({
        where: { id: user.id },
        omit: { password: true }
    });

    return { user: loggedInUser };
};

export const authService = {
    registerUserIntoDB,
    loginUser
};