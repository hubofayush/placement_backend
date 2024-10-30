import mongoose, { Schema } from "mongoose";

const experienceSchema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },
        yearOfExperience: {
            type: String,
            enum: {
                values: ["fresher", "less than 1", "2 to 5 years", "above 5"],
                message: "{VALUE} not supported",
            },
            default: "fresher",
            required: [true, "Experience required"],
        },
        working: {
            type: Boolean,
        },
        salary: {
            type: Number,
        },
        jobRole: {
            type: String,
        },
    },
    { timestamps: true },
);

export const Experience = mongoose.model("Experience", experienceSchema);
