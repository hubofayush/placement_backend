import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
    {
        employee: {
            type: mongoose.Schema.ObjectId,
            ref: "Employee",
        },
        bid: {
            type: String,
        },
        resume: {
            type: String,
        },
        jobApplication: {
            type: mongoose.Schema.ObjectId,
            ref: "JobApplication",
        },
    },
    { timestamps: true },
);

export const application = mongoose.model("Application", applicationSchema);
