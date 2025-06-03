import { NextRequest,NextResponse } from "next/server";
import prisma from "@repo/db";

export async function GET(req:NextRequest):Promise<NextResponse>{
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
        return NextResponse.json({message:"Event does not exist"},{status:404})
    }
    
    const totalTokens = liquidity.yesTokens.plus(liquidity.noTokens)
    const yesPrice = liquidity.noTokens.dividedBy(totalTokens).times(10)
    const noPrice = liquidity.yesTokens.dividedBy(totalTokens).times(10)
    return NextResponse.json({
        yesPrice: yesPrice.toString(),
        noPrice: noPrice.toString(),
        liquidity
    },{status:200})
}