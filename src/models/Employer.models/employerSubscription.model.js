import mongoose, { Schema } from "mongoose";

const employerSubscriptionSchema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Emplyee",
        },
        subscriptionType: {
            type: String,
            enum: {
                values: ["free", "1 month", "3 months", "6 months"],
                message: "{VALUE} not supported",
            },
            default: "free",
        },
    },
    { timestamps: true },
);

export const EmployerSubscription = mongoose.model(
    "EmployerSubscription",
    employerSubscriptionSchema,
);
