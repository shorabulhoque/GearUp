import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";

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

export const authService = {
    registerUserIntoDB,
};