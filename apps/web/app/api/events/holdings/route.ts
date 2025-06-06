import prisma from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const userId = '38383' //TODO: implement user id through auth
    try {
        const userPosition = await prisma.userPosition.findMany({
            where: {
                userId: userId,
                event: {
                    settled: false
                }
            },
            include: {
                event: true
            }
        })
        if (!userPosition) {
            return NextResponse.json({ message: "error", reason: "No user positions found" }, { status: 200 })
        }
        return NextResponse.json({ message: "success", userPosition }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "error", reason: "Error fetching user positions" }, { status: 500 })
    }

}
