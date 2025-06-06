import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";


export async function POST(req: NextRequest) {
    const userRole = "ADMIN" // TODO: get user role from session
    if (userRole !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title,yesTokens,noTokens }  = await req.json()

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
        return NextResponse.json({msg:'success',Id:result.event.id},{status:201})
    }catch(e){
        return NextResponse.json({ message: "error",reason: "Failed to create event" }, { status: 500 });
    }
    
}   