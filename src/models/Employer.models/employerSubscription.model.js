import mongoose, { Schema } from "mongoose";

const employerSubscriptionSchema = new Schema(
    {
        employee: {
            type: mongoose.Schema.ObjectId,
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

export const employerSubscription = mongoose.model(
    "EmployerSubscription",
    employerSubscriptionSchema,
);
