import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },
        bid: {
            type: String,
        },
        resume: {
            type: String,
        },
        jobApplication: {
            type: Schema.Types.ObjectId,
            ref: "JobApplication",
        },
    },
    { timestamps: true },
);

export const Application = mongoose.model("Application", applicationSchema);
