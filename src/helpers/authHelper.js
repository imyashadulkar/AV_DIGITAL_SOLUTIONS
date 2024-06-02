import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/AuthUser.js";
import { CONST_STRINGS, TYPES } from "./constants.js";
import { ENV_VAR } from "./env.js";

export const validateToken = (token) => {
  try {
    if (!token) {
      const error = new Error("Access Denied. No JWT found in cookie");
      throw error;
    }
    try {
      const verified = jwt.verify(token, ENV_VAR.JWT_SECRET, {
        algorithms: ["HS256"]
      });
      if (verified) {
        return { success: true, data: jwt.decode(token, ENV_VAR.JWT_SECRET) };
      } else {
        const error = new Error("Access Denied. Reason: JWT not valid");
        throw error;
      }
    } catch (err) {
      const error = new Error(`Access Denied. Reason: ${err.message}`);
      throw error;
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const validateEmail = (_email) => {
  const email = _email.toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmail = emailRegex.test(email);
  if (validEmail) {
    return email;
  } else {
    const error = new Error(CONST_STRINGS.INVALID_EMAIL_FORMAT);
    error.meta = { email };
    throw error;
  }
};

export const validatePassword = (password, confirmPassword, email) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
  const validPassword = passwordRegex.test(password);
  if (!validPassword) {
    const error = new Error(CONST_STRINGS.PASSWORD_DOES_NOT_MEET_REQUIREMENTS);
    throw error;
  }
  if (password !== confirmPassword) {
    const error = new Error(
      CONST_STRINGS.CONFIRM_PASSWORD_DOES_NOT_MATCH_WITH_PASSWORD
    );
    error.meta = { email };
    throw error;
  }
};

export const validateUser = async (key, by, email, type) => {
  let user;
  if (by === "email") {
    user = await User.findOne({ email: key });
  } else if (by === "userId") {
    user = await User.findOne({ userId: key });
  }

  if (user?.isBlocked === true) {
    const error = new Error(CONST_STRINGS.USER_BLOCKED_BY_ADMIN);
    error.meta = { email };
    throw error;
  }

  if (type === TYPES.EMAIL_VERIFIED) {
    if (!user) {
      const error = new Error(CONST_STRINGS.USER_NOT_FOUND);
      error.meta = { email };
      throw error;
    } else if (!user?.emailVerification?.verified) {
      const error = new Error(CONST_STRINGS.USER_NOT_REGISTERED);
      error.meta = { email };
      throw error;
    }
  } else if (type === TYPES.EMAIL_EXISTS_AND_NOT_VERIFIED) {
    if (!user) {
      const error = new Error(CONST_STRINGS.USER_NOT_FOUND);
      error.meta = { email };
      throw error;
    } else if (user?.emailVerification?.verified) {
      const error = new Error(CONST_STRINGS.USER_ALREADY_REGISTERED);
      error.meta = { email };
      throw error;
    }
  } else if (type === TYPES.EMAIL_DOES_NOT_EXISTS_OR_NOT_VERIFIED) {
    if (user?.emailVerification?.verified) {
      const error = new Error(CONST_STRINGS.USER_ALREADY_REGISTERED);
      error.meta = { email };
      throw error;
    }
  } else if (type === TYPES.EMAIL_DOES_NOT_EXISTS) {
    if (user) {
      const error = new Error(CONST_STRINGS.EMAIL_ALREADY_EXISITS);
      error.meta = { email };
      throw error;
    }
  }
  return user;
};

export const generateCode = () => {
  // Generate a 6-digit verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  return verificationCode;
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

export const comparePasswordWithHash = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateJwtToken = (dataObject) => {
  const token = jwt.sign(
    {
      ...dataObject
    },
    ENV_VAR.JWT_SECRET,
    { expiresIn: ENV_VAR.JWT_EXPIRATION_IN_MINS * 60 }
  );

  return token;
};

export const getCookieOptions = (type) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: type === "login" ? ENV_VAR.JWT_EXPIRATION_IN_MINS * 60 * 1000 : 0,
    domain: ENV_VAR.ENV !== "local" ? ENV_VAR.COOKIE_DOMAIN : ""
  };
  return cookieOptions;
};

export const validateChangeEmail = async (
  email,
  confirmEmail,
  user,
  userId
) => {
  if (email === user.email) {
    const error = new Error(CONST_STRINGS.NEW_EMAIL_IS_SAME_AS_EXISTING_EMAIL);
    error.meta = { userId };
    throw error;
  }

  await validateUser(email, "email", { email }, TYPES.EMAIL_DOES_NOT_EXISTS);

  if (email !== confirmEmail) {
    const error = new Error(
      CONST_STRINGS.CONFIRM_EMAIL_DOES_NOT_MATCH_WITH_EMAIL
    );
    error.meta = { userId };
    throw error;
  }
};
