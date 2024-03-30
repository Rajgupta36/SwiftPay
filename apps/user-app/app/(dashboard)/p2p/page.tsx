import { getServerSession } from "next-auth";
import { SendCard } from "../../../components/card";
import db from "@repo/db/client";
import { authOptions } from "../../lib/auth";
import { BalanceCard } from "../../../components/BalanceCard";

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

export default async function Page() {
    const balance = await getBalance();

    return <div className="w-full flex
     justify-center items-center">
        <SendCard />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
            <BalanceCard amount={balance.amount} locked={balance.locked} />
            <div>

            </div>
        </div>
    </div>


}
