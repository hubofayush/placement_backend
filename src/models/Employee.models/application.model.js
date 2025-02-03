import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const applicationSchema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },
        bid: {
            type: String,
            required: true,
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

applicationSchema.plugin(mongooseAggregatePaginate);

export const Application = mongoose.model("Application", applicationSchema);
