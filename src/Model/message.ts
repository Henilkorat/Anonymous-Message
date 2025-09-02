import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  userId: string;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    userId: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const MessageModel =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default MessageModel;
