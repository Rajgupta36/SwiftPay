import { getServerSession } from "next-auth";
import { SendCard } from "../../../components/card";
import db from "@repo/db/client";
import { authOptions } from "../../lib/auth";
import { BalanceCard } from "../../../components/BalanceCard";
import P2pTranscations from "../../../components/p2pTranscations";




async function getBalance() {
    const session = await getServerSession(authOptions);
    const balance = await db.balance.findFirst({
        where: {
            userId: Number(session?.user?.id)
        }
    });
    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0
    }
}

async function p2pdetails() {
    const session = await getServerSession(authOptions);
    const p2phistory = await db.p2pTransfer.findMany({
        where: { fromUserId: Number(session?.user?.id) }
    })

    return p2phistory.map(t => ({
        time: t.timestamp,
        amount: t.amount,
        status: t.status,
        toUser: t.toUserId
    }))
}

export default async function Page() {
    const balance = await getBalance();
    const p2pdetail = await p2pdetails();

    return <div className="w-full flex
     justify-center items-center">
        <SendCard />
        <div className="ml-20 flex flex-col gap-4 justify-center  md:grid-cols-2 p-4">
            <BalanceCard amount={balance.amount} locked={balance.locked} />
            <div>
                <P2pTranscations p2pdetail={p2pdetail} />
            </div>
        </div>
    </div>


}
