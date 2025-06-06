import { NextRequest,NextResponse } from "next/server";
import prisma from "@repo/db"
export async function GET(req:NextRequest,res:NextResponse):Promise<NextResponse>{
    const userid = '38383' //get the actual userid
    const user = await prisma.user.findUnique({
        where:{
            id:userid
        }
    })
    if(!user){
        return NextResponse.json({message:"error",reason:"User not found"},{status:404})
    }
    return NextResponse.json({message:"success",user},{status:200})
}