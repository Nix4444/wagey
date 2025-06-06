import { NextRequest,NextResponse } from "next/server";
import prisma from "@repo/db";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const events = await prisma.events.findMany({
        orderBy:{
            createdAt:"desc"
        }
    })
    if(!events.length){
        return NextResponse.json({message:"error",reason:"No events to be displayed"},{status:200})
    }
    return NextResponse.json({message:"success",events},{status:200})
}
