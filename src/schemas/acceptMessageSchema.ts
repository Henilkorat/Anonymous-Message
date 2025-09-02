import {z} from "zod";

export const acceptMessageScema = z.object({
    acceptMessages: z.boolean()
})