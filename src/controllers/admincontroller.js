// Import local modules
import { getValueAndCount } from "../helpers/apiHelper.js";
import {
  comparePasswordWithHash,
  generateCode,
  generateJwtToken,
  getCookieOptions,
  validateEmail,
  validateUser
} from "../helpers/authHelper.js";
// import { sendEmail } from "../helpers/awsSESHelper.js";
import { CONST_STRINGS, TYPES } from "../helpers/constants.js";
import { ENV_VAR } from "../helpers/env.js";
import {
  AdminUser,
} from "../models/index.js";

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
      verified: false
    };

    // TODO : Format Email template
    const recipientEmail = [email];
    const origin = req.get("Origin");
    // const recipientEmail = ["info@psgbs.com"];
    const senderEmail = "do-not-reply@psgbs.com";
    const emailSubject = "One-Time Password (OTP) for Assign by Skill account";
    const emailMessage = `Dear User,
    
        Your OTP One-Time Password (OTP) : ${emailVerification.code}
        
        Please enter this OTP to login to admin portal.
        
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    adminUser.emailVerification = emailVerification;
    await adminUser.save();
    const responseMessage = CONST_STRINGS.ADMIN_LOGIN_CODE_SENT;
    const responseData = {
      ...(ENV_VAR.SEND_CODE ? { code: emailVerification.code } : {})
    };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || ""
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
      role
    };

    req.data = {
      statuscode: 200,
      responseData,
      responseMessage: CONST_STRINGS.USER_LOGGED_IN_SUCCESSFULLY
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
      email
    };

    req.data = {
      statuscode: 200,
      responseData,
      responseMessage: CONST_STRINGS.USER_LOGGED_IN_SUCCESSFULLY
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
      createdAt,
      emailVerification,
      logins,
      isBlocked
    } of users) {
      if (!emailVerification.verified) {
        unRegisteredUsers.push({ userId, email, createdAt });
        continue;
      }

      const organization = await Organization.findOne({ userId });
      const license = await License.findOne({ userId });

      const licenseData = {
        validity: license?.currentValidity,
        workstations: license?.workstations,
        shifts: license?.shifts,
        orderId: license?.orderId,
        approvedBy: license?.approvedBy,
        approverRemarks: license?.approverRemarks
      };

      const userObject = {
        userId,
        email,
        isBlocked: isBlocked || false,
        isActive: license?.isActive || false,
        allowToChangeTimeZone: license?.allowToChangeTimeZone || false,
        registeredOn: emailVerification.verifiedAt,
        lastLoginAt: logins ? logins[logins.length - 1] : null,
        organizationData: {
          organizationName: organization?.organizationName,
          organizationContact: organization?.organizationContact
        },
        licenseData
      };

      registeredUsers.push(userObject);
    }

    const responseMessage = CONST_STRINGS.GET_ALL_USERS_SUCCESS;
    const responseData = {
      registeredUsers: {
        count: registeredUsers.length,
        users: registeredUsers
      },
      unRegisteredUsers: {
        count: unRegisteredUsers.length,
        users: unRegisteredUsers
      }
    };

    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || ""
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
        isBlocked: user.isBlocked
      };
    } else {
      const skillObject = await Skill.findOne({ userId });
      const skillinfo = getValueAndCount(
        skillObject,
        "skills",
        "skill_id_auto"
      );

      const employeeObject = await Employee.findOne({ userId });
      const employeeinfo = getValueAndCount(
        employeeObject,
        "employees",
        "employee_id_auto"
      );

      const productObject = await Product.findOne({ userId });
      const productinfo = getValueAndCount(
        productObject,
        "products",
        "product_id_auto"
      );

      const organization = await Organization.findOne({ userId });
      const shiftCount = await Shift.countDocuments({ userId });
      const workstations = await Workstation.find({ userId });
      const assignment = await Assignment.find({ userId });
      const lineCount = await Line.countDocuments({ userId });
      const license = await License.findOne({ userId });

      const licenseData = {
        validity: license?.currentValidity,
        workstations: license?.workstations,
        shifts: license?.shifts,
        orderId: license?.orderId,
        approvedBy: license?.approvedBy,
        approverRemarks: license?.approverRemarks,
        validityLastUpdatedAt: license?.validityLastUpdatedAt,
        previousValidityMap: license?.previousValidityMap
      };

      userData = {
        userId: user.userId,
        email: user.email,
        isBlocked: user.isBlocked || false,
        isActive: license?.isActive || false,
        shortCode: user.shortCode || "",
        allowToChangeTimeZone: license?.allowToChangeTimeZone || false,
        registeredOn: user.emailVerification?.verifiedAt,
        licenseValidity: license?.currentValidity,
        workstations: license?.workstations,
        shifts: license?.shifts,
        ...organization.toObject(),
        licenseData,
        lastLoginAt: user.logins[user.logins.length - 1],
        logins: user.logins,
        shiftcount: shiftCount?.shifts?.size || 0,
        workstationcount: workstations.length || 0,
        skillsCount: {
          activeCount: Object.keys(skillinfo.activeObject).length,
          frozenCount: Object.keys(skillinfo.inactiveObject).length
        },
        Assignment: {
          assignmentCount: assignment.length || 0
        },
        Product: {
          activeCount: Object.keys(productinfo.activeObject).length,
          frozenCount: Object.keys(productinfo.inactiveObject).length
        },
        Employee: {
          activeCount: Object.keys(employeeinfo.activeObject).length,
          frozenCount: Object.keys(employeeinfo.inactiveObject).length
        },
        lineCount,
        shiftCount
      };
    }

    const responseMessage = CONST_STRINGS.GET_USER_DETAIL_SUCCESS;
    const responseData = { user: userData };

    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || ""
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const setLicenseDataById = async (req, res, next) => {
  try {
    req.meta = {
      endpoint: "setLicenseDataById"
    };
    const {
      endUserId,
      validity,
      workstations,
      shifts,
      approvedBy,
      approverRemarks,
      orderId
    } = req.body;

    if (
      !endUserId ||
      !validity ||
      !workstations ||
      !shifts ||
      !approvedBy ||
      !approverRemarks ||
      !orderId
    ) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    await validateUser(endUserId, "userId", null, TYPES.EMAIL_VERIFIED);

    const license = await License.findOne({ userId: endUserId });

    if (license?.currentValidity) {
      // if (license?.currentValidity !== validity) {
      const previousValidity = {
        currentValidity: license.currentValidity,
        validityLastUpdatedAt: license.validityLastUpdatedAt,
        approvedBy: license.approvedBy,
        approverRemarks: license.approverRemarks,
        orderId: license.orderId,
        workstations: license.workstations,
        shifts: license.shifts
      };
      const currentMapSize = license.previousValidityMap.size + 1;
      license.previousValidityMap.set(`LV${currentMapSize}`, previousValidity);
      // } else {
      //  throw new Error(CONST_STRINGS.VALIDITY_SAME_AS_EXISTING_VALIDITY);
      // }
    }

    license.currentValidity = validity;
    license.validityLastUpdatedAt = new Date();
    license.approvedBy = approvedBy;
    license.workstations = workstations;
    license.shifts = shifts;
    license.approverRemarks = approverRemarks;
    license.orderId = orderId;

    await license.save();
    const responseData = {
      licenseData: license
    };

    req.data = {
      statuscode: 200,
      responseData,
      responseMessage: CONST_STRINGS.SET_LICENSE_DETAILS_SUCCESS
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

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
      workstations: license.workstations,
      shifts: license.shifts
    }));

    req.data = {
      statuscode: 200,
      responseData: responseData || [],
      responseMessage: CONST_STRINGS.GET_ALL_USERS_SUCCESS
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const getUserLicenseDetailById = async (req, res, next) => {
  try {
    req.meta = {
      endpoint: "getUserLicenseDetailById"
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
      approverRemarks: license?.approverRemarks
    };

    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: CONST_STRINGS.GET_USER_DETAIL_SUCCESS
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

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
      responseMessage: CONST_STRINGS.UPDATE_USER_STATUS_SUCCESS
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
      workstations: user?.workstations,
      shifts: user?.shifts,
      approvedBy: user?.approvedBy,
      orderedId: user?.orderId,
      approverRemarks: user?.approverRemarks
    }));

    req.data = {
      statuscode: 200,
      responseData: responseData || [],
      responseMessage: CONST_STRINGS.GET_ALL_USERS_SUCCESS
    };

    next();
  } catch (err) {
    req.data = {
      statuscode: 500,
      responseData: [],
      responseMessage: CONST_STRINGS.GET_ALL_USERS_ERROR
    };
    req.err = err;
    next(err);
  }
};

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
      responseMessage: CONST_STRINGS.UPDATE_LICENSE_STATUS_SUCCESS
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const logoutAdmin = async (req, res, next) => {
  try {
    req.meta = { endpoint: "logoutAdmin" };

    const { userId } = req.body;

    // Clear the JWT cookie
    res.clearCookie("jwt", getCookieOptions("logout"));
    const responseMessage = CONST_STRINGS.USER_LOGOUT_SUCCESSFULL;
    const responseData = {
      userId
    };
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || ""
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};
