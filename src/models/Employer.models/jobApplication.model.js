import mongoose, { Schema } from "mongoose";

const jobApplicationSchema = new Schema({}, { timestamps: true });

const jobApplication = mongoose.model("JobApplicaiton", jobApplicationSchema);
