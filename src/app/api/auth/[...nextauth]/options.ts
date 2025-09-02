import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Model/user";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          const { identifier, password } = credentials;

          // Find user by email OR username
          const user = await UserModel.findOne({
            $or: [{ email: identifier }, { username: identifier }],
          });

          if (!user) {
            throw new Error("No user found with this email or username");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
          }

          // Check password
          const isPasswordCorrect = await bcrypt.compare(password, user.password);
          if (!isPasswordCorrect) {
            throw new Error("Invalid password");
          }

          return {
            _id: user._id,
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
            isAcceptingMessages: user.isAcceptingMessages,
          };
        } catch (err: any) {
          console.error("Authorize Error:", err.message);
          throw new Error(err.message || "Authentication failed");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Add user data into JWT token
      if (user) {
        token._id = user._id?.toString();
        token.verified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Add token data into session
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.verified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

