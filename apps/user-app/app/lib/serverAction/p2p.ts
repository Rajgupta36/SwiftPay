'use server';
import db from '@repo/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

export const p2p_transcations = async (Person_Number: string, Amount: number) => {
    const session: { user: { id: string } } | null = await getServerSession(authOptions);
    const from = session?.user?.id;
    if (!from) {
        return {
            message: "Error while sending"
        }
    }
    const toUser = await db.user.findFirst({ where: { number: Person_Number } });
    if (!toUser) {
        return { msg: 'User not found' }
    }


    try {
        await db.$transaction(async (tx: any) => {
            const fromBalance = await tx.balance.findUnique({
                where: { userId: Number(from) },
            });

            if (!fromBalance || fromBalance.amount < Amount) {
                throw new Error('Insufficient balance')
            }
            await tx.balance.update({
                where: { userId: Number(from) },
                data: { amount: { decrement: Amount } }
            })
            await tx.balance.update({ where: { userId: toUser.id }, data: { amount: { increment: Amount } } });
        })
        return { msg: 'Transcation successfull' }
    } catch (e) {
        return { msg: e.message };
    }
}