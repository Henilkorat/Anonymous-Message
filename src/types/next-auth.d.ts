import "next-auth";
import { de } from "zod/locales";

declare module "next-auth" {
    interface User {
        _id?: string;
        username?: string;
        isAcceptingMessages?: string;
        isVerified?: boolean;
    }
    interface Session {
        user: {
            _id?: string;
            username?: string;
            isAcceptingMessages?: string;
            isVerified?: boolean;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        _id?: string;
        username?: string;
        isAcceptingMessages?: string;
        isVerified?: boolean;
    }
}