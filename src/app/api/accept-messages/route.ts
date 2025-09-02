import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Model/user";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Unauthorized"
        }, { status: 401 });
    }
    const userID = user._id;
    const {isAcceptingMessages} = await request.json();

    try {
        
        const updatedUser = await UserModel.findByIdAndUpdate(
            userID,
            { isAcceptingMessages : isAcceptingMessages },
            { new: true }
        )
        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "User status updated successfully",updatedUser
           
        }, { status: 200 });
    } catch (error) {
        console.error("Failed to update user status to accept messages :", error);
        return Response.json({
            success: false,
            message: "Failed to update user status to accept messages"
        }, { status: 500 });
        
    }
}

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
    const userID = user._id;
    
    try {
     const foundUser = await UserModel.findById(userID);

    if (!foundUser) {
        return Response.json({
            success: false,
            message: "User not found"
        }, { status: 404 });
    }
    return Response.json({
        success: true,
        message: "User found",
        isAcceptingMessages: foundUser.isAcceptingMessages
    }, { status: 200 });

    } catch (error) {
        console.error("Error fetching user status to accept messages :", error);
        return Response.json({
            success: false,
            message: "Error fetching user status to accept messages"
        }, { status: 500 });
    }
}