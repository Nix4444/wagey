import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const userId = '38383' //TODO: implement user id through auth
    try {
        const orderHistory = await prisma.orderHistory.findMany({
            where: { userId: userId },
            include: {
                event: true
            },
            orderBy: {
                timestamp: "desc"
            }
        })
        if (!orderHistory) {
            return NextResponse.json({ message: "error", reason: "No order history found" }, { status: 200 })
        }
        return NextResponse.json({ message: "success", orderHistory }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "error", reason: "Error fetching user positions" }, { status: 500 })
    }
}