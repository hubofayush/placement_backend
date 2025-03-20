import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import logClientIP from "./middlewares/LogIP.middleware.js";
import { ipBlockerMiddleware } from "./middlewares/blockIP.middleware.js";

const app = express();

app.use(express.json({ limit: "128kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // for form data
app.use(express.static("public"));
app.use(
    cors({
        origin: `${process.env.ORIGIN}`,
        credentials: true,
    }),
);
app.use(cookieParser());
app.use(ipBlockerMiddleware);
// for loging//
// app.use(logClientIP);
// for loging//

// importing routes //

//**________SATNDARD ROUTES______________ */
import sendOtpRouter from "./routes/sendOTP.Routes.js";
//**________END OF SATNDARD ROUTES______________ */

//**________EMPLOYEE ROUTES______________ */
import employeeRouter from "./routes/EmployeeRoutes/employee.routes.js";
//**________END OF EMPLOYEE ROUTES______________ */

// **_______EMPLOYER ROUTES_____________*/
import employerRouter from "./routes/EmployerRoutes/employer.routes.js";
// **_______EMD OF EMPLOYER ROUTES_____________*/

//**_________ ADMIN ROUTES_____________ */
import adminRoute from "./routes/AdminRoutes/admin.routes.js";
//**_________ END OF ADMIN ROUTES_____________ */
// end of importing routes

// apis / routes
app.use("/api/v1/emp", sendOtpRouter);
// end of apis / routes

// employee routes //

// register route //
app.use("/api/v1/emp", employeeRouter);
// end of register route //

// end of employee routes //

// employer Routes //
app.use("/api/v1/emr", employerRouter);
// end of employer Routes //

// admin routes //
app.use("/api/v1/admin", adminRoute);
// end of admin routes //

export { app };
