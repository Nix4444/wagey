import {NextRequest,NextResponse} from "next/server"
import prisma from "@repo/db"

export async function POST(req:NextRequest){
    const userId = "1" // TODO: get user id from session
    const eventId = req.nextUrl.pathname.split("/")[3]
    const {side,amount} = await req.json()
    if(side !== "yes" && side !== "no"){
        return NextResponse.json({message:"Invalid side"},{status:400})
    }
    if(amount <= 0){
        return NextResponse.json({message:"Invalid amount"},{status:400})
    }
}