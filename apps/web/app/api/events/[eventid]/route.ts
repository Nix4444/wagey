import { NextRequest,NextResponse } from "next/server";
import prisma from "@repo/db";
export async function GET(req:NextRequest,res:NextResponse): Promise<NextResponse>{
    const eventid = req.nextUrl.pathname.split("/").pop()
    const event = await prisma.events.findUnique({
        where:{
            id:eventid
        }
    })
    if(!event){
        return NextResponse.json({message:"error",reason:"Event not found"},{status:404})
    }       
    return NextResponse.json({message:"success",event},{status:200})

}