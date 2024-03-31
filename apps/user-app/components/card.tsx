"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/center";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { p2p_transcations } from "../app/lib/serverAction/p2p";
export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState(0);

    return <div className="h-[90vh]">
        <Center>
            <Card title="Send">
                <div className="min-w-72 pt-2  m-8">
                    <TextInput placeholder={"Number"} label="Number" onChange={(value) => {
                        setNumber(value)
                    }} />
                    <TextInput placeholder={"Amount"} label="Amount" onChange={(e) => {
                        setAmount(Number(e))
                    }} />
                    <div className="pt-4 flex justify-center">
                        <Button onClick={async () => {
                            await p2p_transcations(number, amount * 100);
                        }}>Send</Button>
                    </div>
                </div>
            </Card>
        </Center>
    </div>
}