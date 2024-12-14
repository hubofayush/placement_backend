import mongoose, { Schema } from "mongoose";

const jobApplicationSchema = new Schema({}, { timestamps: true });

const JobApplicaiton = mongoose.model("JobApplicaiton", jobApplicationSchema);
