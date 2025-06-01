import { NextRequest,NextResponse } from "next/server";
import prisma from "@repo/db";
export async function GET(req:NextRequest){
    const eventId = req.nextUrl.pathname.split("/")[3]
    const liquidity = await prisma.liquidityPool.findFirst({
        where:{
            eventId:eventId
        },
        select:{
            yesTokens:true,
            noTokens:true
        }
    })
    if(!liquidity){
        return NextResponse.json({message:"Event does not exist"},{status:200})
    }
    return NextResponse.json(liquidity)

}