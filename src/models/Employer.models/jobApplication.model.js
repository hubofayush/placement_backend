import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// getting date //
const a = new Date();
// const date = `${a.getFullYear()}-${a.getMonth()}-${a.getDate()}`;
// end of getting date //

const jobApplicationSchema = new Schema(
    {
        companyName: {
            type: String,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "Employer",
        },
        status: {
            type: String,
            default: "Active",
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        openings: {
            type: Number,
        },
        location: {
            type: String,
            required: true,
        },
        salaryRange: {
            type: String,
        },
        jobType: {
            type: String,
            enum: {
                values: ["Part Time", "Full Time"],
                message: "{VALUE} not supported",
            },
        },
        qualification: {
            type: String,
            required: true,
        },
        jobHours: {
            type: Number,
        },
        instructions: {
            type: String,
        },
        contactInfo: {
            type: String,
        },
        reviewDate: {
            type: Date,
            min: a,
        },
        closeDate: {
            type: Date,
            required: true,
            min: a,
        },
        applications: [
            {
                type: Schema.Types.ObjectId,
                ref: "Application",
            },
        ],
    },
    { timestamps: true },
);

jobApplicationSchema.plugin(mongooseAggregatePaginate);

export const JobApplication = mongoose.model(
    "JobApplication",
    jobApplicationSchema,
);
