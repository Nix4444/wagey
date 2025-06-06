import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";

export async function POST(req: NextRequest) {
    const userRole = "ADMIN" // TODO: get user role from session
    if (userRole !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { eventId, side } = await req.json();
    try {
        const tx = await prisma.$transaction(async (tx) => {
            const holdings = await tx.userPosition.findMany({
                where: {
                    eventId: eventId,
                    event: {
                        settled: false
                    }
                },
                include: {
                    event: true,
                    user: true
                }
            })
            if(holdings.length === 0){
                throw new Error("Invalid Event")
            }
            const event = await tx.events.update({
                where: { id: eventId },
                data: {
                    settled: true
                }
            })

            const yesHoldings = holdings.filter((holding) => holding.yesTokens.greaterThan(0))
            const noHoldings = holdings.filter((holding) => holding.noTokens.greaterThan(0))
            let totalAmount = 0;
            if(side === "yes"){
                for (const holding of yesHoldings) {
                    const creditAmount = holding.yesTokens.toNumber() * 10;
                    totalAmount += creditAmount;
                    await tx.user.update({
                        where: { id: holding.userId },
                        data: {
                            balance: {
                                increment: creditAmount
                            }
                        }
                    });
                }
            } else if(side === "no"){
                for (const holding of noHoldings) {
                    const creditAmount = holding.noTokens.toNumber() * 10;
                    totalAmount += creditAmount;
                    await tx.user.update({
                        where: { id: holding.userId },
                        data: {
                            balance: {
                                increment: creditAmount
                            }
                        }
                    });
                }
            }

            return {event,totalAmount};
        })

        return NextResponse.json({ 
            message: "Event settled successfully", 
            event: tx.event,
            totalAmount: tx.totalAmount
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ 
            message: "Failed to settle event", 
            error: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}