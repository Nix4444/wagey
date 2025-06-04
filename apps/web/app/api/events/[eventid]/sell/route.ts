import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
export async function POST(req: NextRequest) {
    const userId = "38383" // TODO: get user id from session
    const eventId = req.nextUrl.pathname.split("/")[3]
    
    const { side, quantity } = await req.json()
    if (side !== "yes" && side !== "no") {
        return NextResponse.json({ message: "Invalid side" }, { status: 400 })
    }
    if (quantity < 1) {
        return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    const pool = await prisma.liquidityPool.findUnique({
        where: { eventId: eventId }
    })
    if (!pool) {
        return NextResponse.json({ message: "Event not found" }, { status: 404 })
    }
    const userPosition = await prisma.userPosition.findUnique({
        where: { userId_eventId: { userId: userId, eventId: eventId! } }
    })
    if(!userPosition){
        return NextResponse.json({ message: "User position not found" }, { status: 404 })
    }
    if(userPosition.yesTokens.lessThan(quantity) || userPosition.noTokens.lessThan(quantity)){
        return NextResponse.json({ message: "Insufficient holdings" }, { status: 400 })
    }
    
    const k = pool.yesTokens.times(pool.noTokens)
    if(side === "yes"){
        const amount = calculateYesSellAmount(pool, quantity, k)

        const tokenCostInTokens = amount.dividedBy(10)
        
        try{
        const result = await prisma.$transaction(async (tx) => {
            const currentUserPosition = await tx.userPosition.findUnique({
                where: { userId_eventId: { userId: userId, eventId: eventId! } }
            })
            if(!currentUserPosition){
                throw new Error("User position not found")
            }
            if(currentUserPosition.yesTokens.lessThan(quantity)){
                throw new Error("Insufficient holdings")
            }
            const newYesTokens = currentUserPosition.yesTokens.minus(quantity)

            const userPosition = await tx.userPosition.update({
                where: { userId_eventId: { userId: userId, eventId: eventId! } },
                data: {
                    yesTokens: newYesTokens
                }
            })
            const currentUser = await tx.user.update({
                where: { id: userId },
                data: {
                    balance: {
                        increment: amount
                    }
                }
            })
            if(!currentUser){
                throw new Error("User not found")
            }
            const currentLiquidityPool = await tx.liquidityPool.update({
                where: { eventId: eventId! },
                data: {
                    yesTokens: { increment: quantity },
                    noTokens: { decrement: tokenCostInTokens }
                }
            })
            return { success: true }
        })
        return NextResponse.json({ message: "Successfully sold", credits: amount, effectivePrice: amount.dividedBy(quantity) }, { status: 200 })

        } catch(e){
            if(e instanceof Error && e.message === "Insufficient holdings"){
                return NextResponse.json({ message: "Insufficient holdings" }, { status: 400 })
            }
            return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
        }
    }
    else if(side === "no"){
        const amount = calculateNoSellAmount(pool, quantity, k)

        const tokenCostInTokens = amount.dividedBy(10)
        
        try{
        const result = await prisma.$transaction(async (tx) => {
            const currentUserPosition = await tx.userPosition.findUnique({
                where: { userId_eventId: { userId: userId, eventId: eventId! } }
            })
            if(!currentUserPosition){
                throw new Error("User position not found")
            }
            if(currentUserPosition.noTokens.lessThan(quantity)){
                throw new Error("Insufficient holdings")
            }
            const newNoTokens = currentUserPosition.noTokens.minus(quantity)
            const userPosition = await tx.userPosition.update({
                where: { userId_eventId: { userId: userId, eventId: eventId! } },
                data: {
                    noTokens: newNoTokens
                }
            })
            const currentUser = await tx.user.update({
                where: { id: userId },
                data: {
                    balance: {
                        increment: amount
                    }
                }
            })
            const currentLiquidityPool = await tx.liquidityPool.update({
                where: { eventId: eventId! },
                data: {
                    noTokens: { increment: quantity },
                    yesTokens: { decrement: tokenCostInTokens }
                }
            })
            return { success: true }
        })
        return NextResponse.json({ message: "Successfully sold", credits: amount, effectivePrice: amount.dividedBy(quantity) }, { status: 200 })

        } catch(e){
            if(e instanceof Error && e.message === "Insufficient holdings"){
                return NextResponse.json({ message: "Insufficient holdings" }, { status: 400 })
            }
            return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
        }
    }
}

function calculateYesSellAmount(pool: any, quantity: number, k: any) {
    const steps = 100;
    const stepSize = quantity / steps;
    
    let totalAmount = new (pool.yesTokens.constructor)(0);
    let currentYesTokens = pool.yesTokens.plus(quantity);
    
    for (let i = 0; i < steps; i++) {
        currentYesTokens = currentYesTokens.minus(stepSize);
        
        const currentNoTokens = k.dividedBy(currentYesTokens);
        const currentTotalTokens = currentYesTokens.plus(currentNoTokens);
        const yesPrice = currentNoTokens.dividedBy(currentTotalTokens);
        const stepAmount = yesPrice.times(stepSize);
        totalAmount = totalAmount.plus(stepAmount);
    }
    return totalAmount.times(10);
}

function calculateNoSellAmount(pool: any, quantity: number, k: any) {
    const steps = 100;
    const stepSize = quantity / steps;
    
    let totalAmount = new (pool.noTokens.constructor)(0);
    let currentNoTokens = pool.noTokens.plus(quantity);
    
    for (let i = 0; i < steps; i++) {
        currentNoTokens = currentNoTokens.minus(stepSize);
        
        const currentYesTokens = k.dividedBy(currentNoTokens);
        const currentTotalTokens = currentYesTokens.plus(currentNoTokens);
        const noPrice = currentYesTokens.dividedBy(currentTotalTokens);
        const stepAmount = noPrice.times(stepSize);
        totalAmount = totalAmount.plus(stepAmount);
    }
    return totalAmount.times(10);
}