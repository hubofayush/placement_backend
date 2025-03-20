// import twilio from "twilio";
// import dotenv from "dotenv";
// dotenv.config({
//     path: "./.env",
// });

// const sid = process.env.TWILIO_SID;
// const token = process.env.TWILIO_TOKEN;
// const num = process.env.TWILIO_NUM;
// // const fastApi = process.env.FAST2SMS_API;
// // console.log(sid, token, num);

// const client = new twilio(sid, token);

// const sendOtp = async (number, body) => {
//     console.log(number);
//     console.log(body);
//     // let tonumber = parseInt(number);
//     try {
//         const message = await client.messages.create({
//             from: num,
//             to: number,
//             body: body,
//         });
//         console.log(`message sent : ${message.sid}`);
//         return message;
//     } catch (error) {
//         console.log(error);
//     }
// };

// export { sendOtp };
