import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const EmployeeSchema = new Schema(
    {
        fName: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        lName: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        phone: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
        },
        email: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
        },
        leades: {
            type: Number,
            default: 1,
        },
        workExperience: {
            type: [
                {
                    experience: {
                        type: String,
                        required: true,
                    },
                    position: {
                        type: String,
                    },
                    salary: {
                        type: Number,
                    },
                    employed: {
                        type: Boolean,
                    },
                },
            ],
        },
        education: {
            type: String,
            required: true,
        },
        applications: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Application",
            },
        ],
        lcoation: {
            district: {
                type: String,
                default: "Ratnagiri",
            },
            division: {
                type: String,
            },
            pincode: {
                type: Number,
            },
        },
        subscription: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "subscription",
            },
        ],
    },
    { timestamps: true },
);

EmployeeSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // checking the password is changed or not
    this.password = await bcrypt.hash(this.password, 10); // to hash password

    next();
});

// to check password is correct
EmployeeSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
// end of check password is correct

export const Employee = mongoose.model("Employee", EmployeeSchema);
