import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Employee } from "../models/employee.model.js";
import {
    uploadOnCloudinary,
    deleteImageOnCloudinary,
} from "../utils/cloudinary.js";

// register employee //
const Register = asyncHandler(async (req, res) => {
    const {
        fName,
        lName,
        age,
        gender,
        phone,
        password,
        dateOfBirth,
        experience,
        position,
        salary,
        employed,
        education,
        district,
        division,
        pincode,
    } = req.body;

    console.log(fName, lName, password, employed, dateOfBirth);
    if (!fName || !lName || !password || !employed || !dateOfBirth) {
        throw new ApiError(404, "Required feilds not filled");
    } else {
    }

    // checking user already exsist
    const existEmployee = await Employee.findOne({
        $or: [{ phone }],
    });

    if (existEmployee) {
        throw new ApiError(400, "user already exist");
    }
    // end of checking user already exsist

    // checking image //
    // console.log(req.files);
    const avatarImage = req.file?.path;

    const avatarLocalPath = avatarImage; // same name as in multer
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    // checking image //

    // uploading avatar  on cloudinary //
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }
    // end of uploading avatar on cloudinary //

    // creating employee
    const employee = await Employee.create({
        fName: fName,
        lName: lName,
        phone: phone,
        password: password,
        age: age,
        gender: gender,
        dateOfBirth: dateOfBirth,
        avatar: avatar.url,
        workExperience: {
            experience: experience,
            position: position,
            salary: salary,
            employed: employed,
        },
        education: education,
        lcoation: {
            district: district,
            division: division,
            pincode: pincode,
        },
    });

    // const registerEmployee = await Employee.findById(employee._id);

    if (!employee) {
        throw new ApiError(404, "Employee not Registred ");
    }

    return res
        .status(201)
        .json(new ApiResponce(200, employee, "user registered successfully"));
    // end of creating employee
});
// end of register employee //

// login employee //
const loginEmployee = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        throw new ApiError(401, "phone or password required");
    }

    const findEmployee = await Employee.findOne({
        phone,
    });

    if (!findEmployee) {
        throw new ApiError(404, "user not found");
    }
    console.log(findEmployee);

    const employeeReturn = await Employee.findById(findEmployee._id).select(
        "-password",
    );

    return res
        .status(200)
        .json(new ApiResponce(200, employeeReturn, "employee found"));
});
// end of login employee //

export { Register, loginEmployee };
