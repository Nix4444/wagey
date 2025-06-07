import {NextRequest,NextResponse} from "next/server";
import prisma from "@repo/db";
import bcrypt from "bcrypt";
export async function POST(req:NextRequest){
    try{
        const data = await req.json()
    if(data.username === "" || data.password === ""){
        return NextResponse.json({error:"Username and password are required"},{status:400})
    }
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
        data: {
            username: data.username,
            password: hashedPassword,
        },
    })
    return NextResponse.json({msg:"success",id:user.id},{status:200})
    }catch(e: any){
        if (e.code === 'P2002') {
            return NextResponse.json({msg:"error",reason:"Username already exists"},{status:409})
        }
        return NextResponse.json({msg:"error",reason:"Error signing up"},{status:500})
    }
}