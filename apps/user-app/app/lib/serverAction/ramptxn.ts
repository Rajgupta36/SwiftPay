"use server";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export const RampTransactions = async (provider: any, amount: number) => {
    // Ideally the token should come from the banking provider (hdfc/axis)
    const session: { user: { id: string } } | null = await getServerSession(authOptions);
    if (!session?.user || !session.user?.id) {
        return {
            message: "Unauthenticated request"
        }
    }

    const token = Math.floor(Math.random() * 1000000).toString();

    const data = await prisma.onRampTransaction.create({
        data: {
            provider,
            status: "pending",
            startTime: new Date(),
            token: token,
            userId: Number(session?.user?.id),
            amount: amount * 100
        }
    });
    return { msg: "done" }

}


