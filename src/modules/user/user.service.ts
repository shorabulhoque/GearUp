import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getMeFromDB = async (userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        omit: {
            password: true
        }
    });

    if (user.status === UserStatus.SUSPENDED) {
        throw new Error("Your account is suspended!");
    };

    return user;
};

export const userService = {
    getMeFromDB
};