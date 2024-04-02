// import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";

// import { ENV_VAR } from "./env.js";

// const sesClient = new SESClient({
//   accessKeyId: ENV_VAR.AWS_ACCESS_KEY_ID,
//   secretAccessKey: ENV_VAR.AWS_SECRET_ACCESS_KEY,
//   region: ENV_VAR.AWS_REGION
// });

// export const sendEmail = async (
//   origin,
//   subject,
//   message,
//   sender,
//   recipients,
//   ccRecipients
// ) => {
//   const params = {
//     Destination: {
//       ToAddresses: recipients,
//       CcAddresses: ccRecipients
//     },
//     Message: {
//       Body: {
//         Text: {
//           Data: message
//         }
//       },
//       Subject: {
//         Data: subject
//       }
//     },
//     Source: sender
//   };

//   const sendEmailCommand = new SendEmailCommand(params);
//   let result = true;
//   if (
//     ENV_VAR.SEND_EMAIL &&
//     ENV_VAR.ALLOWED_ORIGINS_TO_SEND_EMAIL.includes(origin)
//   ) {
//     result = await sesClient.send(sendEmailCommand);
//   }
//   return result;
// };
