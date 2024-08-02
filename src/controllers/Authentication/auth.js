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
} from "../../helpers/authHelper.js";
import { CONST_STRINGS, TYPES } from "../../helpers/constants.js";
import { ENV_VAR } from "../../helpers/env.js";
import { User, AuthSubUser, Organization } from "../../models/index.js";
import sendEmail from "../../middleware/sendemail.js";

//Create a middleware function that verifies the token and sends back the user information
export const validateTokenResponse = async (req, res, next) => {
  try {
    req.meta = { endpoint: "validateTokenResponse" };
    const token = req.cookies.jwt;
    const validToken = validateToken(token);
    if (validToken.success) {
      const {
        userId,
        email,
        role,
        subUserId,
        userRole,
        isAuthUser,
        organizationId,
        projectId,
      } = validToken.data;
      const responseMessage = CONST_STRINGS.USER_IDENTITY_VERIFIED;
      const responseData = {
        userId,
        email,
        role,
        userRole,
        subUserId,
        organizationId,
        projectId,
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
      userName,
      phoneNumber,
      userRole,
    } = req.body;

    console.log(req.body);

    if (!_email || !password || !userName || !phoneNumber || !userRole) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const email = validateEmail(_email);

    const user = await User.findOne({ email });
    if (user) {
      throw new Error("User Already Found in Database");
    }

    // Validate password
    // validatePassword(password, confirmPassword);

    // Generate next short code
    const users = await User.find();
    const shortCodes = users
      .map((user) => Number(user?.shortCode?.split("CRM")?.[1]))
      .filter((value) => !isNaN(value));
    const nextShortCode =
      shortCodes.length > 0 ? Math.max(...shortCodes) + 1 : 1;

    // Generate userId and shortCode
    const userId = user ? user.userId : uuidv4();
    const shortCode = `CRM${nextShortCode}`;
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

    const {
      userId,
      password: hashedPassword,
      userRole,
      organizationId,
      projectId,
      emailVerification,
      projects, // Add this line to extract the projects field
    } = user;

    req.body = { ...req.body, userId };

    if (!emailVerification.verified) {
      // TODO Redirect to Verify Code
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
      organizationId,
      userRole,
      projectId,
      isAdmin: false,
      isAuthUser: true,
    });

    res.cookie("jwt", token, getCookieOptions("login"));

    // Include projects in the responseData
    const responseMessage = CONST_STRINGS.USER_LOGGED_IN_SUCCESSFULLY;
    const responseData = {
      userId,
      email,
      userRole,
      organizationId,
      role,
      projectId,
      token,
      isAuthUser: true,
      projects, // Add projects to the response
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

    const OTP = forgotPassowrdVerification.code;
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

//Done
export const subUserLoginWithEmailPassword = async (req, res, next) => {
  try {
    req.meta = { endpoint: "subUserLoginWithEmailPassword" };
    const { emailId: email, subUsername: _subUsername, password } = req.body;
    const subUsername = _subUsername.replace(/\s/g, "");

    if (!email || !subUsername || !password) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    console.log(req.body);

    // Find the auth user by email and subUsername
    const authUser = await AuthSubUser.findOne({ emailId: email, subUsername });

    if (!authUser) {
      const error = new Error(CONST_STRINGS.USER_NOT_FOUND);
      error.meta = { email };
      throw error;
    }

    console.log(authUser);

    // Find the sub user by userId and subUsername
    const subUser = await AuthSubUser.findOne({
      userId: authUser.userId,
      subUsername: subUsername,
    });

    if (!subUser) {
      const error = new Error(CONST_STRINGS.SUB_USER_NOT_FOUND);
      error.meta = { subUsername };
      throw error;
    }

    // Validate the password
    const isPasswordValid = await comparePasswordWithHash(
      password,
      subUser.password
    );

    if (!isPasswordValid) {
      const error = new Error(CONST_STRINGS.INVALID_CREDENTIALS);
      error.meta = { subUsername };
      throw error;
    }

    const role = "subUser";
    const userId = authUser.userId;
    const token = generateJwtToken({
      userId,
      email,
      subUserId: subUser.subUserId,
      role,
      isAdmin: false,
      isAuthUser: false,
      isOrganizationOwner: false,
    });

    res.cookie("jwt", token, getCookieOptions("login"));

    const responseMessage = CONST_STRINGS.SUB_USER_LOGGED_IN_SUCCESSFULLY;
    const responseData = {
      subUserId: subUser.subUserId,
      userId,
      email,
      role,
      isAuthUser: false,
      isOrganizationOwner: false,
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
export const createSubUser = async (req, res, next) => {
  try {
    req.meta = { endpoint: "createSubUser" };
    const {
      userId,
      emailId: _subUsername,
      organizationId,
      permissions,
    } = req.body;

    console.log(req.body);

    const subUsername = req.body.emailId.trim().split("@")[0];
    const subUser = await AuthSubUser.findOne({ userId, subUsername });

    if (subUser) {
      throw new Error(CONST_STRINGS.SUB_USER_NAME_ALREADY_EXISTS);
    }

    const generatedPassword = `${subUsername}@S12345`;
    const hashedPassword = await hashPassword(generatedPassword);

    const subUserId = uuidv4();

    const newSubUser = new AuthSubUser({
      userId,
      subUserId,
      subUsername,
      organizationId,
      password: hashedPassword,
      permissions: permissions,
      userRole: "subUser",
      emailId: _subUsername,
    });

    await newSubUser.save();

    const organization = await Organization.findOne({ organizationId });
    if (!organization) {
      throw new Error(CONST_STRINGS.ORGANIZATION_NOT_FOUND);
    }

    organization.subUsers.push(subUserId);
    await organization.save();
    console.log(organization);
    const responseMessage = CONST_STRINGS.SUB_USER_CREATED_SUCCESSFULLY;
    const responseData = {
      userId,
      organizationId,
      permissions: permissions,
      subUserRole: newSubUser.userRole,
      generatedPassword, // Include generated password in the response
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
export const getSubUser = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getSubUser" };
    const { organizationId } = req.body;
    const { subUserId } = req.params;
    let responseData;
    let responseMessage;
    if (subUserId) {
      const subUser = await AuthSubUser.findOne({ organizationId, subUserId });
      responseData = {
        subUserId: subUser.subUserId,
        userName: subUser.subUsername,
        createdAt: subUser.createdAt,
        updatedAt: subUser.updatedAt,
      };
      responseMessage = CONST_STRINGS.SUB_USERS_RETRIEVED;
    } else {
      const subUsers = await AuthSubUser.find({ organizationId });
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

export const getSubUserById = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getSubUserById" };
    const { subUserId } = req.params;

    const subUser = await AuthSubUser.findOne({ subUserId });

    if (!subUser) {
      throw new Error(CONST_STRINGS.SUB_USER_NOT_FOUND);
    }

    const responseData = {
      userId: subUser.userId,
      subUserId: subUser.subUserId,
      subUsername: subUser.subUsername,
      organizationId: subUser.organizationId,
      permissions: subUser.permissions,
      userRole: subUser.userRole,
    };

    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: CONST_STRINGS.SUB_USER_FOUND_SUCCESSFULLY,
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

//Done
export const changeSubUserPassword = async (req, res, next) => {
  try {
    req.meta = { endpoint: "changeSubUserPassword" };
    const { subUserId, newPassword, confirmPassword } = req.body;

    console.log(req.body);

    validatePassword(newPassword, confirmPassword);

    const subUser = await AuthSubUser.findOne({ subUserId });

    if (!subUser) {
      throw new Error(CONST_STRINGS.SUB_USER_NOT_FOUND);
    }

    const hashedPassword = await hashPassword(newPassword);
    subUser.password = hashedPassword;

    // Save the subUser without updating the emailId
    await subUser.save({ validateBeforeSave: false });

    const responseMessage = CONST_STRINGS.PASSWORD_CHANGED_SUCCESSFULLY;
    const responseData = {
      subUser,
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

//TODO
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

//Done
export const updateSubUserPermission = async (req, res, next) => {
  try {
    req.meta = { endpoint: "updateSubUserPermission" };
    const { permissions, userId, subUserId, userRole, isOrganizationOwner } =
      req.body;

    if (userRole !== "organizationOwner" && !isOrganizationOwner) {
      throw new Error(CONST_STRINGS.UNAUTHORIZED_ACCESS);
    }

    if (!Array.isArray(permissions)) {
      throw new Error(CONST_STRINGS.INVALID_PERMISSIONS);
    }

    const subUser = await AuthSubUser.findOne({ userId, subUserId });
    console.log(subUser);
    if (!subUser) {
      throw new Error(CONST_STRINGS.SUB_USER_NOT_FOUND);
    }

    subUser.permissions.push(...permissions);

    await subUser.save();
    const responseMessage = CONST_STRINGS.PERMISSIONS_UPDATED_SUCCESSFULLY;
    const responseData = {
      permissions: subUser.permissions,
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

export const getSubUserPermission = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getSubUserPermission" };
    const { subUserId } = req.params;
    const { userId } = req.body;
    console.log(userId, subUserId);
    const subUser = await AuthSubUser.findOne({ userId, subUserId });
    console.log(subUser);
    if (!subUser) {
      throw new Error("Sub User not found");
    }
    const responseMessage = CONST_STRINGS.PERMISSIONS_RETRIEVED_SUCCESSFULLY;
    const responseData = {
      permissions: subUser.permissions,
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
