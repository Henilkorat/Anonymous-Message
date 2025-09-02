import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/Model/user";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { username, content } = body || {};

        if (!username || !content) {
            return Response.json(
                { success: false, message: "Username and content are required" },
                { status: 400 }
            );
        }

        const user = await UserModel.findOne({ username });

        if (!user) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        if (!user.isAcceptingMessages) {
            return Response.json(
                { success: false, message: "User is not accepting messages" },
                { status: 403 }
            );
        }

        // Add the message
        user.messages.push({ content, createdAt: new Date() } as Message);
        await user.save();

        return Response.json(
            { success: true, message: "Message sent successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error adding messages", error);
        return Response.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
