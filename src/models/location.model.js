import mongoose, { Schema } from "mongoose";

const locationSchema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },
        employer: {
            type: Schema.Types.ObjectId,
            ref: "Employer",
        },
        state: {
            type: String,
            default: "Maharashtra",
        },
        district: {
            type: String,
        },
        subDistrict: {
            type: String,
        },
        pincode: {
            type: String,
        },
        coordinates: {
            latitude: {
                type: String,
            },
            longitude: {
                type: String,
            },
        },
    },
    { timestamps: true },
);

export const Location = mongoose.model("Location", locationSchema);
