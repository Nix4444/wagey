import { NextRequest, NextResponse } from "next/server"
import prisma from "@repo/db"

export async function POST(req: NextRequest) {
    const userId = "38383" // TODO: get user id from session
    const eventId = req.nextUrl.pathname.split("/")[3]
    
    const { side, quantity } = await req.json()
    if (side !== "yes" && side !== "no") {
        return NextResponse.json({ message: "Invalid side" }, { status: 400 })
    }
    if (quantity <= 0) {
        return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }
    const pool = await prisma.liquidityPool.findUnique({
        where: {
            eventId: eventId
        }
    })
    if (!pool) {
        return NextResponse.json({ message: "Event not found" }, { status: 404 })
    }
    if(pool.yesTokens.lessThan(quantity) || pool.noTokens.lessThan(quantity)){
        return NextResponse.json({ message: "Quantity is unavailable" }, { status: 400 })
    }
    const k = pool.yesTokens.times(pool.noTokens);
    const totalTokens = pool.yesTokens.plus(pool.noTokens)
    if (side === "yes") {
        const {totalCostInINR, totalCostInTokens} = computeYesPrice(totalTokens, k, pool, quantity)
        console.log(totalCostInINR,totalCostInTokens)
        try{
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
                
                return { success: true }
            })
            
            return NextResponse.json({ 
                message: "Success", 
                totalCostInINR: totalCostInINR.toString() 
            }, { status: 200 })

        } catch(e) {
            if (e instanceof Error && e.message === "Insufficient balance") {
                return NextResponse.json({ message: "Insufficient balance" }, { status: 400 })
            }
            if (e instanceof Error && e.message === "User not found") {
                return NextResponse.json({ message: "User not found" }, { status: 404 })
            }
            return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
        }
    } else if(side === "no") {
        const {totalCostInINR, totalCostInTokens} = computeNoPrice(totalTokens, k, pool, quantity)
        try{
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
                
                return { success: true }
            })
            return NextResponse.json({ message: "Success", totalCostInINR: totalCostInINR.toString() }, { status: 200 })
        } catch(e) {
            if (e instanceof Error && e.message === "Insufficient balance") {
                return NextResponse.json({ message: "Insufficient balance" }, { status: 400 })
            }
            if (e instanceof Error && e.message === "User not found") {
                return NextResponse.json({ message: "User not found" }, { status: 404 })
            }
            return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
        }
    }
}

function computeYesPrice(totalTokens: any, k: any, pool: any, quantity: number){
    const newYesTokens = pool.yesTokens.minus(quantity);
    const newNoTokens = k.dividedBy(newYesTokens);
    const totalCostInTokens = newNoTokens.minus(pool.noTokens);
    const currentNoPrice = pool.yesTokens.dividedBy(totalTokens).times(10);
    const totalCostInINR = currentNoPrice.times(totalCostInTokens);
    return {totalCostInINR, totalCostInTokens}
}

function computeNoPrice(totalTokens: any, k: any, pool: any, quantity: number){
    const newNoTokens = pool.noTokens.minus(quantity);
    const newYesTokens = k.dividedBy(newNoTokens);
    const totalCostInTokens = newYesTokens.minus(pool.yesTokens);
    const currentYesPrice = pool.noTokens.dividedBy(totalTokens).times(10);
    const totalCostInINR = currentYesPrice.times(totalCostInTokens);
    return {totalCostInINR, totalCostInTokens}
}