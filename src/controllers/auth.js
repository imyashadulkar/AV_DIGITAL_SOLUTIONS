import { v4 as uuidv4 } from "uuid";

import {
  comparePasswordWithHash,
  deleteUser,
  generateCode,
  generateJwtToken,
  getCookieOptions,
  getTNC,
  hashPassword,
  validateChangeEmail,
  validateEmail,
  validatePassword,
  validateToken,
  validateUser,
} from "../helpers/authHelper.js";
// import { sendEmail } from "../helpers/awsSESHelper.js";
import { CONST_STRINGS, TYPES } from "../helpers/constants.js";
import { ENV_VAR } from "../helpers/env.js";
import { AdminUser, User } from "../models/index.js";
import sendEmail from "../middleware/sendemail.js";

// Create a middleware function that verifies the token and sends back the user information
export const validateTokenResponse = async (req, res, next) => {
  try {
    req.meta = { endpoint: "validateTokenResponse" };
    const token = req.cookies.jwt;
    const validToken = validateToken(token);
    if (validToken.success) {
      const { userId, email, role, subUserId, isAuthUser } = validToken.data;
      const responseMessage = CONST_STRINGS.USER_IDENTITY_VERIFIED;
      const responseData = {
        userId,
        email,
        role,
        subUserId,
        isAuthUser,
      };
      req.data = {
        statuscode: 200,
        responseData: responseData || {},
        responseMessage: responseMessage || "",
        meta: validToken.data || {},
      };

      next();
    } else {
      res.status(200).json({
        success: false,
        error: validToken.error,
      });
    }
  } catch (err) {
    req.err = err;
    next(err);
  }
};

// export const getRegisterCode = async (req, res, next) => {
//   try {
//     req.meta = { endpoint: "getRegisterCode" };
//     const { email: _email, password, confirmPassword } = req.body;
//     req.meta.email = _email;

//     if (!_email || !password || !confirmPassword) {
//       throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
//     }

//     const email = validateEmail(_email);
//     const user = await validateUser(
//       email,
//       "email",
//       { email },
//       TYPES.EMAIL_DOES_NOT_EXISTS_OR_NOT_VERIFIED
//     );

//     validatePassword(password, confirmPassword);

//     const users = await User.find();
//     const shortCodes = users
//       .map((user) => Number(user?.shortCode?.split("ABSL")?.[1]))
//       .filter((value) => !isNaN(value));
//     const nextShortCode = Math.max(...shortCodes) + 1;
//     const userId = user ? user.userId : uuidv4();
//     const shortCode = `ABSL${nextShortCode}`;
//     const hashedPassword = await hashPassword(password);

//     const emailVerification = {
//       code: generateCode(),
//       createdAt: new Date(),
//       attempts: 0,
//       verified: false
//     };

//     // TODO : format Email template
//     const recipientEmail = [email];
//     const origin = req.get("Origin");
//     // const recipientEmail = ["info@psgbs.com"];
//     const senderEmail = "do-not-reply@psgbs.com";
//     const emailSubject =
//       "One-Time Password (OTP) for Registering with Assign by Skill";
//     const emailMessage = `Dear User,

//     We're excited to welcome you to Assign by Skill! Thank you for your interest in registering with us. To complete your registration, please use the following One-Time Password (OTP) : ${emailVerification.code}

//     Please enter this OTP on our registration page to verify your email address and complete the registration process.

//     If you didn't request this OTP, please ignore this email. Your account's security is important to us, and we take any unauthorized access seriously.

//     If you have any questions or need assistance, please feel free to contact us at info@psgbs.com.

//     We're thrilled to have you as a part of our community and look forward to serving you.

//     Best regards,
//     Assign by Skill
//     www.psgbs.com/abs`;

//     try {
//       await sendEmail(
//         origin,
//         emailSubject,
//         emailMessage,
//         senderEmail,
//         recipientEmail,
//         []
//       );
//     } catch {}

//     await User.findOneAndUpdate(
//       { email, userId },
//       {
//         $set: {
//           password: hashedPassword,
//           emailVerification,
//           shortCode
//         }
//       },
//       { upsert: true, new: true }
//     );

//     const responseMessage = CONST_STRINGS.USER_REGISTER_CODE_SENT;
//     const responseData = {
//       ...(ENV_VAR.SEND_CODE ? { code: emailVerification.code } : {})
//     };
//     req.data = {
//       statuscode: 200,
//       responseData: responseData || {},
//       responseMessage: responseMessage || ""
//     };
//     next();
//   } catch (err) {
//     req.err = err;
//     next(err);
//   }
// };

export const getRegisterCode = async (req, res, next) => {
  try {
    const { email: _email, password, confirmPassword } = req.body;

    if (!_email || !password || !confirmPassword) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(_email);
    const user = await validateUser(
      email,
      "email",
      { email },
      TYPES.EMAIL_DOES_NOT_EXISTS_OR_NOT_VERIFIED
    );

    validatePassword(password, confirmPassword);
    const users = await User.find();

    const shortCodes = users
      .map((user) => Number(user?.shortCode?.split("ABSL")?.[1]))
      .filter((value) => !isNaN(value));

    let nextShortCode;

    if (shortCodes.length > 0) {
      nextShortCode = Math.max(...shortCodes) + 1;
    } else {
      nextShortCode = 1;
    }

    const userId = user ? user.userId : uuidv4();
    const shortCode = `ABSL${nextShortCode}`;
    const hashedPassword = await hashPassword(password);
  
    const emailVerification = {
      code: generateCode(),
      createdAt: new Date(),
      attempts: 0,
      verified: false,
    };

    const OTP = emailVerification.code;
    const emailData = {
      to: email,
      subject: "OTP Verification",
      body: {
        name: "Razzaq Shikalgar",
        intro: "Welcome to Your Product! Here is your OTP: " + OTP,
        outro:
          "This OTP code is valid for 5 minutes. If you didn't request this OTP, please ignore this email.",
      },
    };

    sendEmail(emailData);

    
    await User.findOneAndUpdate(
      { email, userId },
      {
        $set: {
          password: hashedPassword,
          emailVerification,
          shortCode,
        },
      },
      { upsert: true, new: true }
    );

    const responseMessage = CONST_STRINGS.USER_REGISTER_CODE_CREATED;
    const responseData = {
      userId,
      email,
      code: emailVerification.code,
    };
    const meta = { userId, email };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
      meta: meta || {},
    };
    next();
  } catch (err) {
    next(err);
  }
};

export const resendRegisterCode = async (req, res, next) => {
  try {
    const { email: _email } = req.body;

    if (!_email) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(_email);

    const user = await validateUser(
      email,
      "email",
      { email },
      TYPES.EMAIL_EXISTS_AND_NOT_VERIFIED
    );

    const { userId, emailVerification } = user;

    emailVerification.code = generateCode();
    emailVerification.createdAt = new Date();
    emailVerification.attempts = 0;
    emailVerification.verified = false;

    await user.save();

    const responseMessage = CONST_STRINGS.VERIFICATION_CODE_RESENT_SUCCESSFULLY;
    const responseData = { userId, email, code: emailVerification.code };
    const meta = { email };

    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
      meta: meta || {},
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const registerWithCode = async (req, res, next) => {
  try {
    const { email: _email, code } = req.body;

    if (!_email || !code) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(_email);

    // Find the user in the database and upate the verification attempt
    const user = await User.findOneAndUpdate(
      { email },
      { $inc: { "emailVerification.attempts": 1 } },
      { new: true }
    );

    await validateUser(
      email,
      "email",
      { email },
      TYPES.EMAIL_EXISTS_AND_NOT_VERIFIED
    );

    const { userId, emailVerification } = user;

    if (emailVerification.attempts > ENV_VAR.MAX_VERIFICATION_ATTEMPTS) {
      const error = new Error(CONST_STRINGS.MAX_VERIFICATION_ATTEMPTS_REACHED);
      error.meta = { email };
      throw error;
    }

    if (emailVerification.verified) {
      const error = new Error(CONST_STRINGS.EMAIL_ALREADY_VERIFIED);
      error.meta = { email };
      throw error;
    }

    if (emailVerification.code !== code) {
      const error = new Error(CONST_STRINGS.VERIFICATION_CODE_INVALID);
      error.meta = { email };
      throw error;
    }

    // Check if the verification code is expired
    const verificationCodeExpired =
      (new Date() - emailVerification.createdAt) / (1000 * 60) > 3000;

    if (verificationCodeExpired) {
      const error = new Error(CONST_STRINGS.VERIFICATION_CODE_EXPIRED);
      error.meta = { email };
      throw error;
    }

    emailVerification.verified = true;
    emailVerification.verifiedAt = new Date();
    emailVerification.code = "";
    user.logins.push(new Date());
    await user.save();

    // Call the generateToken function to generate the token
    const token = generateJwtToken({ userId, email });

    res.cookie("jwt", token, getCookieOptions("login"));

    const responseMessage =
      CONST_STRINGS.EMAIL_VERIFIED_AND_USER_REGISTERED_SUCCESSFULLY;
    const responseData = {
      userId,
      email,
    };
    const meta = { userId, email };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
      meta: meta || {},
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const loginWithEmailPassword = async (req, res, next) => {
  try {
    req.meta = { endpoint: "loginWithEmailPassword" };

    const { email: _email, password } = req.body;

    if (!_email || !password) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }
    req.meta.email = _email;
    const email = validateEmail(_email);
    const user = await validateUser(
      email,
      "email",
      { email },
      TYPES.EMAIL_VERIFIED
    );

    const { userId, password: hashedPassword, emailVerification } = user;
    req.body = { ...req.body, userId };

    if (!emailVerification.verified) {
      // TODO Redirect to Verifiy Code
      const error = new Error(CONST_STRINGS.EMAIL_NOT_VERIFIED);
      error.meta = { email };
      throw error;
    }

    const isPasswordValid = await comparePasswordWithHash(
      password,
      hashedPassword
    );

    if (!isPasswordValid) {
      const error = new Error(CONST_STRINGS.INVALID_CREDENTIALS);
      error.meta = { email };
      throw error;
    }

    user.logins.push(new Date());
    await user.save();

    const role = CONST_STRINGS.AUTH_USER_ROLE;

    const token = generateJwtToken({
      userId,
      email,
      role,
      isAdmin: false,
      isAuthUser: true,
    });

    res.cookie("jwt", token, getCookieOptions("login"));
    const responseMessage = CONST_STRINGS.USER_LOGGED_IN_SUCCESSFULLY;
    const responseData = {
      userId,
      email,
      role,
      isAuthUser: true,
    };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const getChangeEmailCode = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getChangeEmailCode" };

    const { userId, newEmail, confirmEmail } = req.body;

    if (!userId || !newEmail || !confirmEmail) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(newEmail);

    const user = await validateUser(
      userId,
      "userId",
      { userId },
      TYPES.EMAIL_VERIFIED
    );

    await validateChangeEmail(email, confirmEmail, user, userId);

    // eslint-disable-next-line no-unused-vars
    const { changeEmailVerification, email: currentEmail } = user;

    changeEmailVerification.newEmail = email;
    changeEmailVerification.code = generateCode();
    changeEmailVerification.currentEmailCode = generateCode();
    changeEmailVerification.createdAt = new Date();
    changeEmailVerification.attempts = 0;
    changeEmailVerification.verified = false;
    await user.save();

    // TODO : format Email template
    // let recipientEmail = "info@psgbs.com";
    let recipientEmail = changeEmailVerification.newEmail;
    const origin = req.get("Origin");
    let senderEmail = "info@psgbs.com";
    let emailSubject = "One-Time Password (OTP) for Assign by Skill account";
    let emailMessage = `Dear User,
    
        Your OTP One-Time Password (OTP) : ${changeEmailVerification.code}
        
        Please enter this OTP to verify your email address and complete the change email process.
        
        If you didn't request this OTP, please ignore this email. Your account's security is important to us, and we take any unauthorized access seriously.
        
        If you have any questions or need assistance, please feel free to contact us at info@psgbs.com.
                
        Best regards,
        Assign by Skill
        www.psgbs.com/abs`;

    try {
      await sendEmail(
        origin,
        emailSubject,
        emailMessage,
        senderEmail,
        recipientEmail,
        []
      );
    } catch {}

    // recipientEmail = currentEmail;
    recipientEmail = "info@psgbs.com";
    senderEmail = "info@psgbs.com";
    emailSubject = "One-Time Password (OTP) for Assign by Skill account";
    emailMessage = `Dear User,
    
        Your OTP One-Time Password (OTP) : ${changeEmailVerification.currentEmailCode}
        
        Please enter this OTP to verify your email address and complete the change email process.
        
        If you didn't request this OTP, please ignore this email. Your account's security is important to us, and we take any unauthorized access seriously.
        
        If you have any questions or need assistance, please feel free to contact us at info@psgbs.com.
                
        Best regards,
        Assign by Skill
        www.psgbs.com/abs`;

    try {
      await sendEmail(
        origin,
        emailSubject,
        emailMessage,
        senderEmail,
        recipientEmail,
        []
      );
    } catch {}

    const responseMessage = CONST_STRINGS.CHANGE_EMAIL_CODE_SENT_SUCCESSFULLY;
    const responseData = {
      ...(ENV_VAR.SEND_CODE
        ? {
            code: changeEmailVerification.code,
            currentEmailCode: changeEmailVerification.currentEmailCode,
          }
        : {}),
    };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const changeEmailWithCode = async (req, res, next) => {
  try {
    req.meta = { endpoint: "changeEmailWithCode" };

    const { userId, password, code, currentEmailCode } = req.body;
    if (!userId || !password || !code || !currentEmailCode) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const user = await validateUser(
      userId,
      "userId",
      { userId },
      TYPES.EMAIL_VERIFIED
    );

    const { changeEmailVerification, password: hashedPassword } = user;

    changeEmailVerification.attempts = changeEmailVerification.attempts + 1;
    await user.save();

    if (changeEmailVerification.attempts > ENV_VAR.MAX_VERIFICATION_ATTEMPTS) {
      const error = new Error(CONST_STRINGS.MAX_VERIFICATION_ATTEMPTS_REACHED);
      throw error;
    }

    if (changeEmailVerification.verified) {
      const error = new Error(CONST_STRINGS.CHANGE_EMAIL_CODE_ALREADY_VERIFIED);
      error.meta = { userId };
      throw error;
    }

    // Check if the verification code is expired
    const verificationCodeExpired =
      (new Date() - changeEmailVerification.createdAt) / (1000 * 60) >
      ENV_VAR.VERIFICATION_CODE_EXPIRE_IN_MINS;

    if (verificationCodeExpired) {
      const error = new Error(CONST_STRINGS.VERIFICATION_CODE_EXPIRED);
      error.meta = { userId };
      throw error;
    }

    if (
      changeEmailVerification.code !== code ||
      changeEmailVerification.currentEmailCode !== currentEmailCode
    ) {
      const error = new Error(CONST_STRINGS.VERIFICATION_CODE_INVALID);
      error.meta = { userId };
      throw error;
    }

    const isPasswordValid = await comparePasswordWithHash(
      password,
      hashedPassword
    );

    if (!isPasswordValid) {
      const error = new Error(CONST_STRINGS.INVALID_CREDENTIALS);
      error.meta = { userId };
      throw error;
    }

    user.previousEmails.push({ email: user.email, changed: new Date() });
    user.email = changeEmailVerification.newEmail;
    changeEmailVerification.verified = true;
    changeEmailVerification.verifiedAt = new Date();
    changeEmailVerification.code = "";
    changeEmailVerification.currentEmailCode = "";
    changeEmailVerification.newEmail = "";

    await user.save();

    const responseMessage = CONST_STRINGS.EMAIL_CHANGED_SUCCESSFULLY;
    const responseData = {
      userId,
      email: user.email,
    };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    req.meta = { endpoint: "changePassword" };

    const { userId, password, newPassword, confirmPassword } = req.body;
    if (!userId || !password || !newPassword || !confirmPassword) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const user = await validateUser(
      userId,
      "userId",
      { userId },
      TYPES.EMAIL_VERIFIED
    );

    const { password: hashedPassword } = user;

    const isPasswordValid = await comparePasswordWithHash(
      password,
      hashedPassword
    );

    if (!isPasswordValid) {
      const error = new Error(CONST_STRINGS.INVALID_CREDENTIALS);
      error.meta = { userId };
      throw error;
    }

    if (password === newPassword) {
      const error = new Error(
        CONST_STRINGS.NEW_PASSWORD_IS_SAME_AS_OLD_PASSWORD
      );
      error.meta = { userId };
      throw error;
    }

    validatePassword(newPassword, confirmPassword, userId);

    const newHashedPassword = await hashPassword(newPassword);

    user.password = newHashedPassword;
    await user.save();

    const responseMessage = CONST_STRINGS.PASSWORD_CHANGED_SUCCESSFULLY;
    const responseData = {
      userId,
    };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const getForgotPasswordCode = async (req, res, next) => {
  try {
    const { email: _email } = req.body;

    if (!_email) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(_email);

    const user = await validateUser(
      email,
      "email",
      { email },
      TYPES.EMAIL_VERIFIED
    );

    const { userId, forgotPassowrdVerification } = user;

    forgotPassowrdVerification.code = generateCode();
    forgotPassowrdVerification.createdAt = new Date();
    forgotPassowrdVerification.attempts = 0;
    forgotPassowrdVerification.verified = false;
    await user.save();

    // Send the verification code to the user's email (implementation not provided)

    const responseMessage =
      CONST_STRINGS.FORGOT_PASSWORD_CODE_SENT_SUCCESSFULLY;
    const responseData = {
      userId,
      email,
      code: forgotPassowrdVerification.code,
    };
    const meta = { userId, email };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
      meta: meta || {},
    };
    next();
  } catch (err) {
    next(err);
  }
};

export const changePasswordWithCode = async (req, res, next) => {
  try {
    const { email: _email, code, newPassword, confirmPassword } = req.body;

    if (!_email || !code || !newPassword || !confirmPassword) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(_email);
    validatePassword(newPassword, confirmPassword);

    // Find the user in the database and upate the verification attempt
    const user = await User.findOneAndUpdate(
      { email },
      { $inc: { "forgotPassowrdVerification.attempts": 1 } },
      { new: true }
    );
    await validateUser(email, "email", { email }, TYPES.EMAIL_VERIFIED);

    const { userId, forgotPassowrdVerification, password: oldPassword } = user;

    if (
      forgotPassowrdVerification.attempts > ENV_VAR.MAX_VERIFICATION_ATTEMPTS
    ) {
      const error = new Error(CONST_STRINGS.MAX_VERIFICATION_ATTEMPTS_REACHED);
      throw error;
    }

    if (forgotPassowrdVerification.verified) {
      const error = new Error(
        CONST_STRINGS.FORGOT_PASSWORD_CODE_ALREADY_VERIFIED
      );
      error.meta = { email };
      throw error;
    }

    // Check if the verification code is expired
    const verificationCodeExpired =
      (new Date() - forgotPassowrdVerification.createdAt) / (1000 * 60) >
      ENV_VAR.VERIFICATION_CODE_EXPIRE_IN_MINS;

    if (verificationCodeExpired) {
      const error = new Error(CONST_STRINGS.VERIFICATION_CODE_EXPIRED);
      error.meta = { email };
      throw error;
    }

    if (forgotPassowrdVerification.code !== code) {
      const error = new Error(CONST_STRINGS.VERIFICATION_CODE_INVALID);
      error.meta = { email };
      throw error;
    }

    const isMatch = await comparePasswordWithHash(newPassword, oldPassword);

    if (isMatch) {
      const error = new Error(CONST_STRINGS.NEW_PASSWORD_MATCHES_OLD_PASSWORD);
      error.meta = { email };
      throw error;
    }

    forgotPassowrdVerification.verified = true;
    forgotPassowrdVerification.verifiedAt = new Date();
    forgotPassowrdVerification.code = "";

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;

    await user.save();

    const responseMessage = CONST_STRINGS.PASSWORD_CHANGED_SUCCESSFULLY;
    const responseData = {
      userId,
      email,
    };
    const meta = { userId, email };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
      meta: meta || {},
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const getTermsAndConditions = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getTermsAndConditions" };
    const termsAndConditions = await getTNC();
    const responseData = {
      termsAndConditions,
    };
    const responseMessage = CONST_STRINGS.TERMS_AND_CONDITIONS_RETRIVED;
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    req.meta = { endpoint: "logoutUser" };

    const { userId } = req.body;

    // Clear the JWT cookie
    res.clearCookie("jwt", getCookieOptions("logout"));
    const responseMessage = CONST_STRINGS.USER_LOGOUT_SUCCESSFULL;
    const responseData = {
      userId,
    };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const deleteUserAndData = async (req, res, next) => {
  try {
    req.meta = { endpoint: "deleteUserAndData" };

    const { email: _email, key } = req.params;

    if (!_email || !key) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    req.meta.email = _email;

    if (key !== CONST_STRINGS.PASS_KEY) {
      throw new Error(CONST_STRINGS.INVALD_PASS_KEY);
    }

    const email = validateEmail(_email);

    await deleteUser(email, "email", false);

    const responseMessage = CONST_STRINGS.USER_DELETED_SUCCESSFULLY;
    const responseData = {
      email,
    };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const getUserData = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getUserData" };

    const { email: _email, type, key } = req.params;
    if (!_email || !key) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    req.meta.email = _email;

    const email = validateEmail(_email);

    if (
      key !== CONST_STRINGS.PASS_KEY ||
      ![
        CONST_STRINGS.TEST_USER_EMAIL,
        CONST_STRINGS.TEST_SUB_USER_EMAIL,
        CONST_STRINGS.TEST_ADMIN_EMAIL,
      ].includes(email)
    ) {
      throw new Error(CONST_STRINGS.INVALD_PASS_KEY);
    }

    let collection;
    if (type === "user") {
      collection = User;
    } else if (type === "sub-user") {
      collection = AuthSubUser;
    } else if (type === "admin") {
      collection = AdminUser;
    }
    const user = await collection.findOne({ email });

    if (!user) {
      const error = new Error(CONST_STRINGS.USER_NOT_FOUND);
      error.meta = { key };
      throw error;
    }

    const responseMessage = CONST_STRINGS.USER_RETRIEVED_SUCCESSFULLY;
    const responseData = {
      user,
    };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const updateUserStatusWithKey = async (req, res, next) => {
  try {
    req.meta = { endpoint: "updateUserStatusWithKey" };

    const { email, type, action, key } = req.body;

    if ((!type || !(typeof action === "boolean"), !key)) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    req.meta.email = email;

    if (
      key !== CONST_STRINGS.PASS_KEY ||
      email !== CONST_STRINGS.TEST_USER_EMAIL
    ) {
      throw new Error(CONST_STRINGS.INVALD_PASS_KEY);
    }

    const user = await User.findOne({ email });
    if (!user) throw new Error(CONST_STRINGS.USER_NOT_FOUND);

    const { userId } = user;

    let responseData;

    if (type === "active") {
      let license = await License.findOne({ userId });

      license.isActive = action;
      license = await license.save();
      responseData = { isActive: license.isActive };
    } else if (type === "block") {
      user.isBlocked = action;
      await user.save();
      responseData = { isBlocked: user.isBlocked };
    } else {
      throw new Error(CONST_STRINGS.INVALID_ACTION_TYPE);
    }

    req.data = {
      statuscode: 200,
      responseData,
      responseMessage: CONST_STRINGS.UPDATE_USER_STATUS_SUCCESS,
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};
