import db from "@repo/db/client";
import { Card } from "@repo/ui/card";

async function username(userId: number) {
    const res: any = await db.user.findFirst({
        where: { id: userId }
    });
    return res.name;
}

export default function P2pTransactions({ p2pdetail }: { p2pdetail: any[] }) {
    if (!p2pdetail.length) {
        return <Card title="Recent P2p_Transactions">
            <div className="text-center pb-8 pt-8">
                No Recent transactions
            </div>
        </Card>
    }
    return <Card title="Recent Transactions">
        <div className="pt-6 ">
            {p2pdetail.map(async (t) => <div className="flex justify-between border-b-2">
                <div>
                    <div className="text-sm">
                        Send INR
                    </div>
                    <div className="text-slate-600 text-xs">
                        {t.time.toDateString()}
                    </div>
                </div>
                <div className="flex flex-col justify-center ml-10 pl-80">
                    <div className="flex flex-col justify-center text-right">
                        - Rs {t.amount / 100}
                    </div>
                    <div className="text-right">To {await username(t.userId)}</div>

                </div>

            </div>
            )}
        </div>
    </Card >


}



