import express from "express";
import { z } from "zod";
import db from "@repo/db/client";
const app = express();

app.use(express.json())

app.post("/hdfcWebhook", async (req, res) => {
    //TODO: Add zod validation here?
    //TODO: HDFC bank should ideally send us a secret so we know this is sent by them


    const schema = z.object({
        token: z.string(),
        user_identifier: z.string(),
        amount: z.string()
    });
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            message: "Invalid request body"
        });
    }


    const paymentInformation: {
        token: string;
        userId: string;
        amount: string
    } = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };
    const status = await db.onRampTransaction.findFirst({ where: { token: paymentInformation.token } });
    if (status?.status == "Processing") {
        try {
            await db.$transaction([
                db.balance.updateMany({
                    where: {
                        userId: Number(paymentInformation.userId)
                    },
                    data: {
                        amount: {
                            // You can also get this from your DB
                            increment: Number(paymentInformation.amount)
                        }
                    }
                }),
                db.onRampTransaction.updateMany({
                    where: {
                        token: paymentInformation.token
                    },
                    data: {
                        status: "Success",
                    }
                })
            ]);

            res.json({
                message: "Captured"
            })
        } catch (e) {
            console.error(e);
            res.status(411).json({
                message: "Error while processing webhook"
            })
        }
    } else {
        return res.status(400).json({
            message: "Transaction not in processing state"

        })
    }


})

app.listen(3003);