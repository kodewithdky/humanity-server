import nodemailer from "nodemailer";

//send verify email
const sendVerificationMail = (name, email, userId) => {
   try {
      //creating transporter
      const transporter = nodemailer.createTransport({
         host: "smtp.gmail.com",
         port: 587,
         secure: false,
         requireTLS: true,
         auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
         },
      });
      //creating mail options
      const message = {
         from: process.env.SMTP_MAIL,
         to: email,
         subject: "For Verification Email",
         html:
            "<p>HI! " +
            name +
            ', Please click here to <a href="https://namaskarhumanity.org//auth/verify?id=' +
            userId +
            '" target="_blank">Verify </a> your email. </p>',
      };
      //send email
      transporter.sendMail(message, function (error, info) {
         if (error) {
            console.log(error);
         } else {
            console.log("email has been send:", info.response);
         }
      });
   } catch (error) {
      console.log(error);
   }
};

const sendOtpOnMail = (email, otp) => {
   try {
      //creating transporter
      const transporter = nodemailer.createTransport({
         host: "smtp.gmail.com",
         port: 587,
         secure: false,
         requireTLS: true,
         auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
         },
      });
      //creating mail options
      const message = {
         from: process.env.SMTP_MAIL,
         to: email,
         subject: "For Forgot Password OTP",
         html: "<p>Your OTP: " + otp + "</p>",
      };
      //send email
      transporter.sendMail(message, function (error, info) {
         if (error) {
            console.log(error);
         } else {
            console.log("email has been send:", info.response);
         }
      });
   } catch (error) {
      console.log(error);
   }
};

export { sendVerificationMail, sendOtpOnMail };
