import {NextRequest,NextResponse} from "next/server";
import prisma from "@repo/db";

export async function GET(req:NextRequest):Promise<NextResponse>{
    const userId = '38383' //TODO: implement user id through auth
    try{
        const userPosition = await prisma.userPosition.findMany({
            where:{userId:userId},
            include:{
                event: true
            }
        });
        
        return NextResponse.json({ message:"success",userPositions: userPosition },{status:200});
    } catch (error) {
        console.error('Error fetching user positions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user positions' }, 
            { status: 500 }
        );
    }
}