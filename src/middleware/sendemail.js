import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "21102035.razzaqshikalgar@gmail.com",
    pass: "your bcnx ediz xuun",
  },
});

const mailGenerator = new Mailgen({
  theme: "salted",
  product: {
    name: "Heyy !! This is the OTP for Ride-Eve Assignment",
    link: "google.com",
    logo: "",
  },
});

const sendEmail = async (emailData) => {
    const emailBody = mailGenerator.generate(emailData);

  const mailOptions = {
    from: "21102035.razzaqshikalgar@gmail.com",
    to: emailData.to,
    subject: emailData.subject,
    html: emailBody,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(error);
      } else {
        console.log("Email sent:", info.response);
        resolve(info);
      }
    });
  });
};

export default sendEmail;
