import { NextRequest,NextResponse } from "next/server";
import prisma from "@repo/db"
export async function GET(req:NextRequest,res:NextResponse){
    const userid = '1' //get the actual userid
    const user = await prisma.user.findUnique({
        where:{
            id:userid
        }
    })
}