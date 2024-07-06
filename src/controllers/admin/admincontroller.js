// Import local modules
import {
  comparePasswordWithHash,
  generateCode,
  generateJwtToken,
  getCookieOptions,
  validateEmail,
  validateUser,
} from "../../helpers/authHelper.js";
import { CONST_STRINGS, TYPES } from "../../helpers/constants.js";
import sendEmail from "../../middleware/sendemail.js";

import { AdminUser, User, License } from "../../models/index.js";

//Done
export const getAdminLoginCode = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getAdminLoginCode" };
    const { email: _email, password } = req.body;
    req.meta.email = _email;

    if (!_email || !password) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(_email);

    let adminUser = await AdminUser.findOne({ email }); // Increase the timeout to 20 seconds

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
      OTP: emailVerification.code,
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

//Done
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

//Done
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

//Done
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
//Done
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
        userName: user.userName,
        password: user.password,
        phoneNumber: user.phoneNumber,
        userRole: user.userRole,
        isBlocked: user.isBlocked,
      };
    }

    userData = {
      userId: user.userId,
      email: user.email,
      email: user.email,
      userName: user.userName,
      password: user.password,
      phoneNumber: user.phoneNumber,
      userRole: user.userRole,
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

//Done
export const setLicenseDataById = async (req, res, next) => {
  try {
    req.meta = {
      endpoint: "setLicenseDataById",
    };
    const {
      endUserId,
      validity,
      approvedBy,
      approverRemarks,
      orderId,
      subUsers,
    } = req.body;

    if (
      !endUserId ||
      !validity ||
      !approvedBy ||
      !approverRemarks ||
      !orderId
    ) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    await validateUser(endUserId, "userId", null, TYPES.EMAIL_VERIFIED);

    let license = await License.findOne({ userId: endUserId });

    if (license) {
      if (license?.currentValidity) {
        const previousValidity = {
          currentValidity: license.currentValidity,
          validityLastUpdatedAt: license.validityLastUpdatedAt,
          approvedBy: license.approvedBy,
          approverRemarks: license.approverRemarks,
          orderId: license.orderId,
          subUsers: license.subUsers,
        };
        const currentMapSize = license.previousValidityMap.size + 1;
        license.previousValidityMap.set(
          `CRM_LV${currentMapSize}`,
          previousValidity
        );
      }
      license.currentValidity = validity;
      license.validityLastUpdatedAt = new Date();
      license.approvedBy = approvedBy;
      license.approverRemarks = approverRemarks;
      license.orderId = orderId;
      license.subUsers = subUsers || [];

      await license.save();
    } else {
      license = new License({
        userId: endUserId,
        currentValidity: validity,
        validityLastUpdatedAt: new Date(),
        approvedBy: approvedBy,
        approverRemarks: approverRemarks,
        orderId: orderId,
        subUsers: subUsers,
        previousValidityMap: new Map(),
      });

      await license.save();
    }

    const responseData = {
      licenseData: license,
    };

    req.data = {
      statuscode: 200,
      responseData,
      responseMessage: CONST_STRINGS.SET_LICENSE_DETAILS_SUCCESS,
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

//Done
export const getAllUsersLicenseData = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getAllUsersLicenseData" };
    const userLicenseData = await License.find();

    const responseData = userLicenseData.map((license) => ({
      userId: license.userId,
      currentValidity: license.currentValidity,
      validityLastUpdatedAt: license.validityLastUpdatedAt,
      previousValidity: license.previousValidityMap || {},
      approvedBy: license.approvedBy,
      approverRemarks: license.approverRemarks,
      orderId: license.orderId,
    }));

    req.data = {
      statuscode: 200,
      responseData: responseData || [],
      responseMessage: CONST_STRINGS.GET_ALL_USERS_SUCCESS,
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

//Done
export const getUserLicenseDetailById = async (req, res, next) => {
  try {
    req.meta = {
      endpoint: "getUserLicenseDetailById",
    };

    const { userId: endUserId } = req.params;

    // await validateUser(endUserId, "userId", null, TYPES.EMAIL_VERIFIED);
    const license = await License.findOne({ endUserId });

    const responseData = {
      userId: endUserId,
      currentValidity: license?.currentValidity,
      validityLastUpdatedAt: license?.validityLastUpdatedAt,
      previousValidity: license?.previousValidityMap || {},
      approvedBy: license?.approvedBy,
      approverRemarks: license?.approverRemarks,
    };

    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: CONST_STRINGS.GET_USER_DETAIL_SUCCESS,
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

//Done
export const updateUserStatus = async (req, res, next) => {
  try {
    req.meta = { endpoint: "updateUserStatus" };

    const { endUserId, type, action, shortCode } = req.body;

    if (!endUserId || !type || !(typeof action === "boolean")) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    // await validateUser(endUserId, "userId", null, TYPES.EMAIL_VERIFIED);

    const users = await User.find();
    let user = await User.findOne({ userId: endUserId });
    const license = await License.findOne({ userId: endUserId });
    if (!user) throw new Error(CONST_STRINGS.USER_NOT_FOUND);

    let responseData;

    if (type === "active") {
      if (license.isActive === action) {
        throw new Error(CONST_STRINGS.USER_ALREADY_GIVEN_STATUS);
      }

      license.isActive = action;
      license.save();
      responseData = { isActive: license.isActive };
    } else if (type === "block") {
      if (user.isBlocked === action) {
        throw new Error(CONST_STRINGS.USER_ALREADY_GIVEN_STATUS);
      }
      user.isBlocked = action;
      user = await user.save();
      responseData = { isBlocked: user.isBlocked };
    } else if (type === "timezone") {
      if (license.allowToChangeTimeZone === action) {
        throw new Error(CONST_STRINGS.USER_ALREADY_GIVEN_STATUS);
      }
      license.allowToChangeTimeZone = action;
      license.save();
      responseData = { allowToChangeTimeZone: license.allowToChangeTimeZone };
    } else if (type === "shortCode") {
      if (user.shortCode === shortCode) {
        throw new Error(CONST_STRINGS.CANT_SET_SAME_SHORT_CODE);
      }
      const shortCodes = users.map((user) => user.shortCode);
      if (shortCodes.includes(shortCode)) {
        throw new Error(CONST_STRINGS.SHORT_CODE_ALREADY_IN_USER);
      }
      user.shortCode = shortCode;
      user = await user.save();
      responseData = { shortCode: user.shortCode };
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

// Get all users in LicenceModel
export const getAllUserLicence = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getAllUserLicence" };
    const users = await License.find();

    const responseData = users.map((user) => ({
      userId: user.userId,
      currentValidity: user?.currentValidity,
      validityLastUpdatedAt: user?.validityLastUpdatedAt,
      previousValidity: user?.previousValidityMap || "",
      approvedBy: user?.approvedBy,
      orderedId: user?.orderId,
      approverRemarks: user?.approverRemarks,
    }));

    req.data = {
      statuscode: 200,
      responseData: responseData || [],
      responseMessage: CONST_STRINGS.GET_ALL_USERS_SUCCESS,
    };

    next();
  } catch (err) {
    req.data = {
      statuscode: 500,
      responseData: [],
      responseMessage: CONST_STRINGS.GET_ALL_USERS_ERROR,
    };
    req.err = err;
    next(err);
  }
};

//TODO: Update the license status
export const updateLicenseStatus = async (req, res, next) => {
  try {
    req.meta = { endpoint: "updateLicenseStatus" };

    const { userId, isActive, isBlocked } = req.body;

    // Validate the required inputs
    if (!userId || (isActive === undefined && isBlocked === undefined)) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    // Validate the user
    await validateUser(userId, "userId", null, TYPES.EMAIL_VERIFIED);

    const licenceModel = await License.findOne({ userId });

    if (!licenceModel) {
      throw new Error(CONST_STRINGS.USER_NOT_FOUND);
    }

    // Update the isActive and isBlocked fields based on the provided values
    if (isActive !== undefined) {
      licenceModel.isActive = isActive;
      licenceModel.isBlocked = !isActive;
    }

    if (isBlocked !== undefined) {
      licenceModel.isBlocked = isBlocked;
      licenceModel.isActive = !isBlocked;
    }

    await licenceModel.save();

    req.data = {
      statuscode: 200,
      responseData: licenceModel,
      responseMessage: CONST_STRINGS.UPDATE_LICENSE_STATUS_SUCCESS,
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

//TODO: Update the license status
export const logoutAdmin = async (req, res, next) => {
  try {
    req.meta = { endpoint: "logoutAdmin" };

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
