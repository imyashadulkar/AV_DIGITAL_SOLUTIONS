// Import local modules
import {
  comparePasswordWithHash,
  generateCode,
  generateJwtToken,
  getCookieOptions,
  validateEmail,
} from "../helpers/authHelper.js";
import { CONST_STRINGS } from "../helpers/constants.js";
import sendEmail from "../middleware/sendemail.js";

import { AdminUser, User } from "../models/index.js";

export const getAdminLoginCode = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getAdminLoginCode" };
    const { email: _email, password } = req.body;
    req.meta.email = _email;

    if (!_email || !password) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(_email);

    const adminUser = await AdminUser.findOne({ email });

    if (!adminUser) {
      const error = new Error(CONST_STRINGS.USER_NOT_FOUND);
      error.meta = { email };
      throw error;
    }

    const { password: hashedPassword } = adminUser;

    const isPasswordValid = await comparePasswordWithHash(
      password,
      hashedPassword
    );

    if (!isPasswordValid) {
      const error = new Error(CONST_STRINGS.INVALID_CREDENTIALS);
      error.meta = { email };
      throw error;
    }

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
        intro: "This is your Admin Login Code: " + OTP,
        outro:
          "This OTP code is valid for 5 minutes. If you didn't request this OTP, please ignore this email.",
      },
    };

    sendEmail(emailData);

    adminUser.emailVerification = emailVerification;
    await adminUser.save();
    const responseMessage = CONST_STRINGS.ADMIN_LOGIN_CODE_SENT;
    const responseData = {
      OTP: emailVerification.code
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

export const adminLoginWithCode = async (req, res, next) => {
  try {
    req.meta = { endpoint: "adminLoginWithCode" };

    const { email: _email, password, code } = req.body;
    req.meta.email = _email;

    if (!_email || !password || !code) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(_email);
    const adminUser = await AdminUser.findOne({ email });

    if (!adminUser) {
      const error = new Error(CONST_STRINGS.USER_NOT_FOUND);
      error.meta = { email };
      throw error;
    }

    const { userId, password: hashedPassword, emailVerification } = adminUser;

    const isPasswordValid = await comparePasswordWithHash(
      password,
      hashedPassword
    );

    if (!isPasswordValid) {
      const error = new Error(CONST_STRINGS.INVALID_CREDENTIALS);
      error.meta = { email };
      throw error;
    }

    if (emailVerification.code !== code) {
      const error = new Error(CONST_STRINGS.VERIFICATION_CODE_INVALID);
      error.meta = { email };
      throw error;
    }

    emailVerification.verified = true;
    emailVerification.verifiedAt = new Date();
    emailVerification.code = "";
    adminUser.logins.push(new Date());
    await adminUser.save();
    const role = CONST_STRINGS.ADMIN_USER_ROLE;

    const token = generateJwtToken({ userId, email, role, isAdmin: true });
    res.cookie("jwt", token, getCookieOptions("login"));

    const responseData = {
      userId,
      email,
      role,
    };

    req.data = {
      statuscode: 200,
      responseData,
      responseMessage: CONST_STRINGS.USER_LOGGED_IN_SUCCESSFULLY,
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const loginWithEmailPasswordAdmin = async (req, res, next) => {
  try {
    req.meta = { endpoint: "loginWithEmailPasswordAdmin" };

    const { email: _email, password } = req.body;

    if (!_email || !password) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }
    req.meta.email = _email;

    const email = validateEmail(_email);
    const adminUser = await AdminUser.findOne({ email });

    if (!adminUser) {
      const error = new Error(CONST_STRINGS.USER_NOT_FOUND);
      error.meta = { email };
      throw error;
    }

    const { userId, password: hashedPassword } = adminUser;

    const isPasswordValid = await comparePasswordWithHash(
      password,
      hashedPassword
    );

    if (!isPasswordValid) {
      const error = new Error(CONST_STRINGS.INVALID_CREDENTIALS);
      error.meta = { email };
      throw error;
    }

    const token = generateJwtToken({ userId, email, isAdmin: true });
    res.cookie("jwt", token, getCookieOptions("login"));

    const responseData = {
      userId,
      email,
    };

    req.data = {
      statuscode: 200,
      responseData,
      responseMessage: CONST_STRINGS.USER_LOGGED_IN_SUCCESSFULLY,
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getAllUsers" };
    const users = await User.find();
    const registeredUsers = [];
    const unRegisteredUsers = [];

    for (const {
      userId,
      email,
      userName,
      password,
      phoneNumber,
      userRole,
      createdAt,
      emailVerification,
      logins,
      isBlocked,
    } of users) {
      if (!emailVerification.verified) {
        unRegisteredUsers.push({ userId, email, createdAt });
        continue;
      }


      const userObject = {
        userId,
        email,
        userName,
        password,
        phoneNumber,
        userRole,
        isBlocked: isBlocked || false,
        registeredOn: emailVerification.verifiedAt,
        lastLoginAt: logins ? logins[logins.length - 1] : null,
      };

      registeredUsers.push(userObject);
    }

    const responseMessage = CONST_STRINGS.GET_ALL_USERS_SUCCESS;
    const responseData = {
      registeredUsers: {
        count: registeredUsers.length,
        users: registeredUsers,
      },
      unRegisteredUsers: {
        count: unRegisteredUsers.length,
        users: unRegisteredUsers,
      },
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

export const getUserById = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getUserById" };
    const { userId } = req.params;

    if (!userId) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }
    // await validateUser(userId, "userId", null, TYPES.EMAIL_VERIFIED);

    const user = await User.findOne({ userId });
    if (!user) {
      throw new Error(CONST_STRINGS.USER_NOT_FOUND);
    }

    let userData;
    if (!user.emailVerification?.verified) {
      userData = {
        userId: user.userId,
        email: user.email,
        userName:user.userName,
        password:user.password,
        phoneNumber:user.phoneNumber,
        userRole:user.userRole,
        isBlocked: user.isBlocked,
      };
    }

      userData = {
        userId: user.userId,
        email: user.email,
        email: user.email,
        userName:user.userName,
        password:user.password,
        phoneNumber:user.phoneNumber,
        userRole:user.userRole,
        isBlocked: user.isBlocked || false,
        registeredOn: user.emailVerification?.verifiedAt,
        lastLoginAt: user.logins[user.logins.length - 1],
        logins: user.logins,
      };

    const responseMessage = CONST_STRINGS.GET_USER_DETAIL_SUCCESS;
    const responseData = { user: userData };

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
