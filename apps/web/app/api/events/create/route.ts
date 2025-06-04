import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";

// Minimum initial liquidity for new pools
const MIN_INITIAL_LIQUIDITY = 100.0; // Each side should start with at least 100 tokens for reasonable depth

export async function POST(req: NextRequest) {
    const userRole = "ADMIN" // TODO: get user role from session
    if (userRole !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title,yesTokens,noTokens }  = await req.json()

    // Validate minimum initial liquidity
    if (yesTokens < MIN_INITIAL_LIQUIDITY || noTokens < MIN_INITIAL_LIQUIDITY) {
        return NextResponse.json({ 
            message: `Minimum initial liquidity is ${MIN_INITIAL_LIQUIDITY} tokens per side` 
        }, { status: 400 })
    }

    try{
        const result = await prisma.$transaction(async (tx)=>{
            const event = await tx.events.create({
                data:{
                    title:title
                }
            })
            const pool = await tx.liquidityPool.create({
                data:{
                    eventId:event.id,
                    yesTokens:yesTokens,
                    noTokens:noTokens

                }
            })
            return { event, pool}
        })
        return NextResponse.json({msg:'Event Created Successfully',Id:result.event.id},{status:201})
    }catch(e){
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
    
}   