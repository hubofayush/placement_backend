import mongoose, { Schema } from "mongoose";

const shortlistedApplicationSchema = new Schema(
    {
        application: {
            type: Schema.Types.ObjectId,
            ref: "Application",
        },
        jobApplication: {
            type: Schema.Types.ObjectId,
            ref: "JobApplication",
        },
    },
    { timestamps: true },
);

export const ShortlistedApplication = mongoose.model(
    "ShortlistedApplication",
    shortlistedApplicationSchema,
);
