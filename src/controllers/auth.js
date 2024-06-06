import { v4 as uuidv4 } from "uuid";

import {
  comparePasswordWithHash,
  generateCode,
  generateJwtToken,
  getCookieOptions,
  hashPassword,
  validateEmail,
  validatePassword,
  validateToken,
  validateUser,
} from "../helpers/authHelper.js";
import { CONST_STRINGS, TYPES } from "../helpers/constants.js";
import { ENV_VAR } from "../helpers/env.js";
import { User } from "../models/index.js";
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

export const getRegisterCode = async (req, res, next) => {
  try {
    const {
      email: _email,
      password,
      confirmPassword,
      userName,
      phoneNumber,
      userRole,
    } = req.body;

    // Check for missing required inputs
    if (
      !_email ||
      !password ||
      !confirmPassword ||
      !userName ||
      !phoneNumber ||
      !userRole
    ) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(_email);

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("User Already Found in Database");
    }

    // Validate password
    validatePassword(password, confirmPassword);

    // Generate next short code
    const users = await User.find();
    const shortCodes = users
      .map((user) => Number(user?.shortCode?.split("ABSL")?.[1]))
      .filter((value) => !isNaN(value));
    const nextShortCode =
      shortCodes.length > 0 ? Math.max(...shortCodes) + 1 : 1;

    // Generate userId and shortCode
    const userId = user ? user.userId : uuidv4();
    const shortCode = `ABSL${nextShortCode}`;
    const hashedPassword = await hashPassword(password);

    // Generate email verification code and send email
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
        intro: `Welcome to Your Product! Here is your OTP: ${OTP}`,
        outro:
          "This OTP code is valid for 5 minutes. If you didn't request this OTP, please ignore this email.",
      },
    };

    sendEmail(emailData);

    // Save user data
    await User.findOneAndUpdate(
      { email, userId, userName, phoneNumber, userRole },
      {
        $set: {
          password: hashedPassword,
          emailVerification,
          shortCode,
        },
      },
      { upsert: true, new: true }
    );

    // Set response data
    const responseData = {
      userId,
      email,
      code: emailVerification.code,
    };

    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: CONST_STRINGS.USER_REGISTER_CODE_CREATED,
      meta: { userId, email },
    };
    next();
  } catch (err) {
    req.err = err;
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

export const updateUser = async (req, res, next) => {
  try {
    req.meta = { endpoint: "updateUser" };

    const { email: _email, userName, phoneNumber } = req.body;
    const { userId } = req.params;

    if (!userId || !_email) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(_email);
    const user = await User.findOne({ userId });

    if (!user) {
      throw new Error(CONST_STRINGS.USER_NOT_FOUND);
    }

    if (userName) {
      user.userName = userName;
    } else {
      user.phoneNumber = phoneNumber;
    }
    await user.save();

    const responseMessage = CONST_STRINGS.USER_UPDATED_SUCCESSFULLY;
    const responseData = {
      userId,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber,
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

export const deleteUser = async (req, res, next) => {
  try {
    req.meta = { endpoint: "deleteUser" };

    const { userId } = req.params;

    if (!userId) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const user = await User.findOneAndDelete({ userId: userId });

    if (!user) {
      throw new Error(CONST_STRINGS.USER_NOT_FOUND);
    }

    const responseMessage = CONST_STRINGS.USER_DELETED_SUCCESSFULLY;
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

export const subUserLoginWithEmailPassword = async (req, res, next) => {
  try {
    req.meta = { endpoint: "subUserLoginWithEmailPassword" };
    const { email, subUsername: _subUsername, password } = req.body;
    const subUsername = _subUsername.replace(/\s/g, "");

    if (!email || !subUsername || !password) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const authUser = await User.findOne({ email });

    if (!authUser) {
      const error = new Error(CONST_STRINGS.USER_NOT_FOUND);
      error.meta = { email };
      throw error;
    }

    const subUser = await AuthSubUser.findOne({
      userId: authUser.userId,
      subUsername,
    });

    if (!subUser) {
      const error = new Error(CONST_STRINGS.SUB_USER_NOT_FOUND);
      error.meta = { subUsername };
      throw error;
    }

    const isPasswordValid = await comparePasswordWithHash(
      password,
      subUser.password
    );

    if (!isPasswordValid) {
      const error = new Error(CONST_STRINGS.INVALID_CREDENTIALS);
      error.meta = { subUsername };
      throw error;
    }

    const role = CONST_STRINGS.AUTH_USER_ROLE;
    const userId = authUser.userId;
    const token = generateJwtToken({
      userId,
      email,
      subUserId: subUser.subUserId,
      role,
      isAdmin: false,
      isAuthUser: false,
    });

    res.cookie("jwt", token, getCookieOptions("login"));

    const responseMessage = CONST_STRINGS.SUB_USER_LOGGED_IN_SUCCESSFULLY;
    const responseData = {
      subUserId: subUser.subUserId,
      userId,
      email,
      role: CONST_STRINGS.AUTH_USER_ROLE,
      isAuthUser: false,
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

export const createSubUser = async (req, res, next) => {
  try {
    req.meta = { endpoint: "createSubUser" };
    const {
      userId,
      subUsername: _subUsername,
      password,
      confirmPassword,
    } = req.body;
    const subUsername = _subUsername.replace(/\s/g, "");
    const subUser = await AuthSubUser.findOne({ userId, subUsername });
    if (subUser) {
      throw new Error(CONST_STRINGS.SUB_USER_NAME_ALREADY_EXISTS);
    }
    validatePassword(password, confirmPassword);
    const subUserId = uuidv4();
    const hashedPassword = await hashPassword(password);
    const newSubUser = new AuthSubUser({
      userId,
      subUserId,
      subUsername,
      password: hashedPassword,
    });
    await newSubUser.save();
    const responseMessage = CONST_STRINGS.SUB_USER_CREATED_SUCCESSFULLY;
    const responseData = {
      subUserId,
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

export const getSubUser = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getSubUser" };
    const { userId } = req.body;
    const { subUserId } = req.params;
    let responseData;
    let responseMessage;
    if (subUserId) {
      const subUser = await AuthSubUser.findOne({ userId, subUserId });
      responseData = {
        subUserId: subUser.subUserId,
        userName: subUser.subUsername,
        createdAt: subUser.createdAt,
        updatedAt: subUser.updatedAt,
      };
      responseMessage = CONST_STRINGS.SUB_USER_RETRIEVED;
    } else {
      const subUsers = await AuthSubUser.find({ userId });
      responseData = subUsers.map((subUser) => ({
        subUserId: subUser.subUserId,
        userName: subUser.subUsername,
        createdAt: subUser.createdAt,
        updatedAt: subUser.updatedAt,
      }));
      responseMessage = CONST_STRINGS.SUB_USERS_RETRIEVED;
    }
    req.data = {
      statuscode: 200,
      responseData: responseData || [],
      responseMessage: responseMessage || "",
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const changeSubUserPassword = async (req, res, next) => {
  try {
    req.meta = { endpoint: "changeSubUserPassword" };
    const { userId, subUserId, newPassword, confirmPassword } = req.body;
    validatePassword(newPassword, confirmPassword);
    const subUser = await AuthSubUser.findOne({ userId, subUserId });
    if (!subUser) {
      throw new Error(CONST_STRINGS.SUB_USER_NOT_FOUND);
    }
    const hashedPassword = await hashPassword(newPassword);
    subUser.password = hashedPassword;
    await subUser.save();
    const responseMessage = CONST_STRINGS.PASSWORD_CHANGED_SUCCESSFULLY;
    const responseData = {};
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
