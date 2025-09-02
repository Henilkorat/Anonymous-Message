import { Message } from "@/Model/user";

export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean;
    messages?: Message[]; }