import mongoose, { Schema } from "mongoose";

const employeeNotificationSchema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },
        employer: {
            type: Schema.Types.ObjectId,
            ref: "Employer",
        },

        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

export const EmployeeNotification = mongoose.model(
    "EmployeeNotification",
    employeeNotificationSchema,
);
