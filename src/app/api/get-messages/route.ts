import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Model/user";
import { User } from "next-auth";
import mongoose from "mongoose";


export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Unauthorized"
        }, { status: 401 });
    }
    const userID = new mongoose.Types.ObjectId(user._id);

    try {
        const currentUser = await UserModel.findById(userID).lean();

        if (!currentUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        const sortedMessages = currentUser.messages.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return Response.json({
            success: true,
            message: "Messages fetched successfully",
            messages: sortedMessages
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch messages:", error);
        return Response.json({
            success: false,
            message: "Failed to fetch messages"
        }, { status: 500 });

    }

}