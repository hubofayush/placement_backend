const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
    {
        // Basic Admin Details
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },

        // Admin Role
        role: {
            type: String,
            enum: ["superadmin", "admin"], // Option for different levels of admin
            default: "admin",
        },

        // Manage Subscriptions
        EmployeeSubscriptions: [
            { type: mongoose.Schema.ObjectId, ref: "Employee" },
        ],
        EmployerSubscriptions: [
            { type: mongoose.Schema.ObjectId, ref: "Employer" },
        ],

        // Admin Access to Employees
        employees: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Employee",
            },
        ],

        // Admin Access to Employers/Companies
        employers: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Employer", // Assuming 'Employer' is another schema/model for companies
            },
        ],

        // Admin Access to Applications
        applications: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Application", // Assuming 'Application' is a schema for job applications
            },
        ],

        // Admin Logs (To keep track of actions taken by the admin)
        logs: [
            {
                action: {
                    type: String, // Action description (e.g., "Created new employee", "Deleted employer")
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true },
);

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
