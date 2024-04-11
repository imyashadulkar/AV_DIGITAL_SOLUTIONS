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
    name: "Sati world",
    link: "satiworld.com",
    logo: "https://imgs.search.brave.com/rn6icFOaf48ER4REUa353o6CJguP8wfNZynsT6TZwOI/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTUz/NTI5NjE4L3Bob3Rv/L2F0LXNpZ24taW4t/YS1jaXR5LmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1kNGRf/T1N1aUczZmhkczVo/aWlZVmVyZ1E1LU43/aW5JcnFQM3NzZ0FM/VXd3PQ",
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
