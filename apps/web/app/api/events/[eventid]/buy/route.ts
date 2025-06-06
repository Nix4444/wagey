import { NextRequest, NextResponse } from "next/server"
import prisma from "@repo/db"

export async function POST(req: NextRequest) {
    const userId = "38383" // TODO: get user id from session
    const eventId = req.nextUrl.pathname.split("/")[3]

    const { side, quantity } = await req.json()
    if (side !== "yes" && side !== "no") {
        return NextResponse.json({ message: "error", reason: "Invalid side" }, { status: 400 })
    }
    if (quantity < 1) {
        return NextResponse.json({ message: "error", reason: "Invalid amount" }, { status: 400 })
    }

    const pool = await prisma.liquidityPool.findUnique({
        where: {
            eventId: eventId
        },
        include:{
            event:true
        }
    })
    if (!pool) {
        return NextResponse.json({ message: "error", reason: "Event not found" }, { status: 404 })
    }
    if(pool.event.settled){ 
        return NextResponse.json({ message: "error", reason: "Event already settled" }, { status: 400 })
    }
    if (pool.yesTokens.lessThan(quantity) || pool.noTokens.lessThan(quantity)) {
        return NextResponse.json({ message: "error", reason: "Insufficient tokens available" }, { status: 400 })
    }

    const k = pool.yesTokens.times(pool.noTokens);

    if (side === "yes") {
        const { totalCostInINR, totalCostInTokens } = calculateYesIntegralCost(pool, quantity, k)
        try {
            const result = await prisma.$transaction(async (tx) => {
                const currentUser = await tx.user.findUnique({
                    where: { id: userId },
                    select: { balance: true }
                })

                if (!currentUser) {
                    throw new Error("User not found")
                }

                if (currentUser.balance.lessThan(totalCostInINR)) {
                    throw new Error("Insufficient balance")
                }

                const newBalance = currentUser.balance.minus(totalCostInINR)

                await tx.user.update({
                    where: { id: userId },
                    data: { balance: newBalance }
                })

                await tx.liquidityPool.update({
                    where: { eventId: eventId },
                    data: {
                        yesTokens: { decrement: quantity },
                        noTokens: { increment: totalCostInTokens }
                    }
                })

                await tx.userPosition.upsert({
                    where: {
                        userId_eventId: {
                            userId: userId,
                            eventId: eventId!
                        }
                    },
                    update: {
                        yesTokens: { increment: quantity }
                    },
                    create: {
                        userId: userId,
                        eventId: eventId!,
                        yesTokens: quantity,
                        noTokens: 0
                    }
                })
                const order = await tx.orderHistory.create({
                    data: {
                        userId: userId,
                        eventId: eventId!,
                        yesTokens: quantity,
                        amount: totalCostInINR.toString(),
                        type: "BUY"
                    }
                })
                return { success: true, orderId: order.id }
            })

            return NextResponse.json({
                orderId: result.orderId,
                message: "success",
                totalCostInINR: totalCostInINR.toString(),
                effectivePrice: totalCostInINR.dividedBy(quantity).toString()
            }, { status: 200 })

        } catch (e) {
            if (e instanceof Error && e.message === "Insufficient balance") {
                return NextResponse.json({ message: "error", reason: "Insufficient balance" }, { status: 400 })
            }
            if (e instanceof Error && e.message === "User not found") {
                return NextResponse.json({ message: "error", reason: "User not found" }, { status: 404 })
            }
            return NextResponse.json({ message: "error", reason: "Internal Server Error" }, { status: 500 })
        }
    } else if (side === "no") {
        const { totalCostInINR, totalCostInTokens } = calculateNoIntegralCost(pool, quantity, k)
        try {
            const result = await prisma.$transaction(async (tx) => {
                const currentUser = await tx.user.findUnique({
                    where: { id: userId },
                    select: { balance: true }
                })

                if (!currentUser) {
                    throw new Error("User not found")
                }

                if (currentUser.balance.lessThan(totalCostInINR)) {
                    throw new Error("Insufficient balance")
                }

                const newBalance = currentUser.balance.minus(totalCostInINR)

                await tx.user.update({
                    where: { id: userId },
                    data: { balance: newBalance }
                })

                await tx.liquidityPool.update({
                    where: { eventId: eventId },
                    data: {
                        noTokens: { decrement: quantity },
                        yesTokens: { increment: totalCostInTokens }
                    }
                })
                await tx.userPosition.upsert({
                    where: {
                        userId_eventId: {
                            userId: userId,
                            eventId: eventId!
                        }
                    },
                    update: {
                        noTokens: { increment: quantity }
                    },
                    create: {
                        userId: userId,
                        eventId: eventId!,
                        noTokens: quantity,
                        yesTokens: 0
                    }
                })
                const order = await tx.orderHistory.create({
                    data: {
                        userId: userId,
                        eventId: eventId!,
                        noTokens: quantity,
                        amount: totalCostInINR.toString(),
                        type: "BUY"
                    }
                })
                return { success: true,orderId:order.id }
            })
            return NextResponse.json({
                orderId: result.orderId,
                message: "Success",
                totalCostInINR: totalCostInINR.toString(),
                effectivePrice: totalCostInINR.dividedBy(quantity).toString()
            }, { status: 200 })
        } catch (e) {
            if (e instanceof Error && e.message === "Insufficient balance") {
                return NextResponse.json({ message: "error", reason: "Insufficient balance" }, { status: 400 })
            }
            if (e instanceof Error && e.message === "User not found") {
                return NextResponse.json({ message: "error", reason: "User not found" }, { status: 404 })
            }
            return NextResponse.json({ message: "error", reason: "Internal Server Error" }, { status: 500 })
        }
    }
}


function calculateYesIntegralCost(pool: any, quantity: number, k: any) {
    const steps = 100; // Number of integration steps for accuracy
    const stepSize = quantity / steps;

    let totalCostInTokens = new (pool.yesTokens.constructor)(0);
    let currentYesTokens = pool.yesTokens;
    for (let i = 0; i < steps; i++) {
        const currentNoTokens = k.dividedBy(currentYesTokens);
        const currentTotalTokens = currentYesTokens.plus(currentNoTokens);
        const yesPrice = currentNoTokens.dividedBy(currentTotalTokens); // Price in tokens

        const stepCost = yesPrice.times(stepSize);
        totalCostInTokens = totalCostInTokens.plus(stepCost);

        currentYesTokens = currentYesTokens.minus(stepSize);
    }

    const totalCostInINR = totalCostInTokens.times(10);

    return { totalCostInINR, totalCostInTokens };
}


function calculateNoIntegralCost(pool: any, quantity: number, k: any) {
    const steps = 100; // Number of integration steps for accuracy
    const stepSize = quantity / steps;

    let totalCostInTokens = new (pool.noTokens.constructor)(0);
    let currentNoTokens = pool.noTokens;

    for (let i = 0; i < steps; i++) {

        const currentYesTokens = k.dividedBy(currentNoTokens);
        const currentTotalTokens = currentYesTokens.plus(currentNoTokens);


        const noPrice = currentYesTokens.dividedBy(currentTotalTokens); // Price in tokens


        const stepCost = noPrice.times(stepSize);
        totalCostInTokens = totalCostInTokens.plus(stepCost);

        currentNoTokens = currentNoTokens.minus(stepSize);
    }

    const totalCostInINR = totalCostInTokens.times(10);

    return { totalCostInINR, totalCostInTokens };
}