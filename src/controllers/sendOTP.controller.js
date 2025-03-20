// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiResponce } from "../utils/ApiResponce.js";
// import { ApiError } from "../utils/ApiError.js";
// import { sendOtp } from "../utils/sendOTP.js";

// // OTP generation //

// function generateOTP() {
//     // Generate a random number between 100000 and 999999
//     const otp = Math.floor(100000 + Math.random() * 900000);
//     return otp;
// }

// // end of OTP generation //

// // send otp

// const sendOtpEmployee = asyncHandler(async (req, res) => {
//     const { mobile } = req.body;
//     if (!mobile) {
//         throw new ApiError(400, "mobile number required");
//     }

//     const otp = generateOTP();
//     console.log(otp);
//     const body = `Dear user your OTP is ${otp}`;

//     const sendOTPMobile = await sendOtp(mobile, body); // actual code

//     if (!sendOTPMobile) {
//         throw new ApiError(404, "cant send otp");
//     }

//     return res
//         .status(200)
//         .json(
//             new ApiResponce(
//                 200,
//                 { sendOTPMobile, otp },
//                 "message sent successfully",
//             ),
//         );
//     // .json(
//     //     new ApiResponce(200, { otp, mobile }, "message sent successfully"),
//     // ); // for testing
// });
// // end of send otp

// export { sendOtpEmployee };
