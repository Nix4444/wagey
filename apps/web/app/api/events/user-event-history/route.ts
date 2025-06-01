import prisma from "@repo/db";
import {NextRequest,NextResponse} from "next/server";

export async function GET(req:NextRequest):Promise<NextResponse>{
    const userId = '1' //implement user id through auth
    const events = await prisma.events.findMany({
        where:{ 
            userId:userId

        }
    })
    if(!events.length){
        return NextResponse.json({message:"No events to be displayed"},{status:200})
    }
    return NextResponse.json(events);
}
