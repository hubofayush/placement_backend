import mongoose, { Schema } from "mongoose";

const shortlistedApplicationSchema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
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
