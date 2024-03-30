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

    //insitialized p2p transcation 

    let transaction: any;



    try {
        transaction = await db.p2pTransfer.create({
            data: {
                amount: Amount,
                timestamp: new Date(),
                fromUserId: Number(from),
                toUserId: toUser.id,
                status: 'Processing'
            }
        })
        await db.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;//for locking the row until the transaction is completed or failed
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
            await db.p2pTransfer.update({
                where: { id: transaction.id },
                data: { status: 'Success' }
            });
        })

    } catch (e) {
        if (transaction) {
            await db.p2pTransfer.update({
                where: { id: transaction.id },
                data: { status: 'Failed' }
            });
        }
        return { msg: e.message };
    }
}