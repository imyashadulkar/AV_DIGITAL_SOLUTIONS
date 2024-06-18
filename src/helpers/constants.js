export const CONST_STRINGS = {
  INTERNAL_SERVER_ERROR: "Internal  Server Error",
  STATUS: "Status",
  SERVER_RUNNING_MESSAGE: "Server is running Last commit 12:35",
  MISSING_REQUIRED_INPUTS: "Request is missing required inputs",
  ADMIN_LOGIN_CODE_SENT: "Admin login code sent",
  //auth
  USER_REGISTER_CODE_CREATED: "User register code sent successfully",
  EMAIL_ALREADY_VERIFIED: "The email address has already been verified.",
  MAX_VERIFICATION_ATTEMPTS_REACHED:
    "You have reached the maximum number of verification attempts.",
  MAX_VERIFICATION_ATTEMPTS: "Maximum verification attempts exceeded.",
  VERIFICATION_CODE_INVALID: "The verification code provided is invalid.",
  VERIFICATION_CODE_EXPIRED: "The verification code has expired.",
  EMAIL_VERIFIED_AND_USER_REGISTERED_SUCCESSFULLY:
    "Email verified and user registered successfully.",
  EMAIL_NOT_VERIFIED: "The email address has not been verified.",
  INVALID_CREDENTIALS: "The credentials provided are invalid.",
  AUTH_USER_ROLE: "User authenticated with a role.",
  USER_LOGGED_IN_SUCCESSFULLY: "User logged in successfully.",
  NEW_PASSWORD_IS_SAME_AS_OLD_PASSWORD:
    "The new password cannot be the same as the old password.",
  PASSWORD_CHANGED_SUCCESSFULLY: "Password changed successfully.",
  FORGOT_PASSWORD_CODE_ALREADY_VERIFIED:
    "The forgot password code has already been verified.",
  NEW_PASSWORD_MATCHES_OLD_PASSWORD:
    "The new password matches the old password.",
  USER_LOGOUT_SUCCESSFULL: "User logged out successfully.",
  INVALID_PASS_KEY: "The pass key provided is invalid.",
  USER_NOT_FOUND: "User not found.",
  USER_DELETED_SUCCESSFULLY: "User deleted successfully.",
  USER_RETRIEVED_SUCCESSFULLY: "User retrieved successfully.",
  ADMIN_USER_ROLE: "admin",
  USER_UPDATED_SUCCESSFULLY: "User updated successfully.",
  USER_UPDATE_FAILED: "Failed to update user.",
  USER_DELETED_SUCCESSFULLY: "User deleted successfully.",
  USER_DELETE_FAILED: "Failed to delete user.",
  CONFIRM_PASSWORD_DOES_NOT_MATCH_WITH_PASSWORD: "password does not match",
  PASSWORD_DOES_NOT_MEET_REQUIREMENTS: "password do not match the requirement",
  INVALID_EMAIL_FORMAT: "Invalid Email Format",
};

export const TYPES = {
  EMAIL_DOES_NOT_EXISTS_OR_NOT_VERIFIED:
    "EMAIL_DOES_NOT_EXISTS_OR_NOT_VERIFIED",
  EMAIL_DOES_NOT_EXISTS: "EMAIL_DOES_NOT_EXISTS",
  EMAIL_EXISTS_AND_NOT_VERIFIED: "EMAIL_EXISTS_AND_NOT_VERIFIED",
  EMAIL_VERIFIED: "EMAIL_VERIFIED",
};

// Route URLs
export const BASE_ROUTES = {
  PING_ROUTE: "/ping",
  AUTH_ROUTES: "/auth",
  MODULE_ROUTES: "/module",
  ADMIN_ROUTES: "/admin",
  LOG_ROUTES: "/logs",
  APP_APIS: "/crm",
};

export const ADMIN_ROUTES = {
  GET_ADMIN_LOGIN_CODE: "/get-admin-login-code",
  ADMIN_LOGIN_WITH_CODE: "/admin-login-with-code",
  LOGIN_WITH_EMAIL_PASSWORD_ADMIN: "/login-with-email-password-admin",
  GET_ALL_USERS: "/get-all-users",
  GET_USER_BY_ID: "/get-user-by-id/:userId",
};

export const AUTH_ROUTES = {
  CHANGE_PASSWORD: "/change-password",
  GET_CHANGE_EMAIL_CODE: "/get-change-email-code",
  CHANGE_EMAIL_WITH_CODE: "/change-email-with-code",
  CHANGE_PASSWORD_WITH_CODE: "/change-password-with-code",
  GET_FORGOT_PASSWORD_CODE: "/get-forgot-password-code",
  GET_REGISTER_CODE: "/get-register-code",
  LOGIN_WITH_EMAIL_PASSWORD: "/login-with-email-password",
  REGISTER_WITH_CODE: "/register-with-code",
  RESEND_REGISTER_CODE: "/resend-register-code",
  VERIFY_TOKEN: "/verify-token",
  LOGOUT_USER: "/logout",
  UPDATE_USER: "/update-user-data/:userId",
  DELETE_USER: "/delete-user-data/:userId",
  AUTH_SUB_USER_GENERATION: "/create-sub-user",
  GET_SUB_USER: "/get-sub-user/:subUserId?",
  CHANGE_SUB_USER_PASSWORD: "/change-sub-user-password",
  SUB_USER_LOGIN_WITH_EMAIL_PASSWORD: "/sub-user-login-with-email-password",
};

export const EXCEL_ROUTES = {
  GET_DATA_FROM_EXCEL: "/get-data-from-excel",
};
export const LEADS_ROUTES = {
  RETRIEVE_LEAD_BY_USING_ID: "/retrieve-lead-by-id",
  RETRIEVE_ALL_LEADS: "/retrieve-all-leads",
  GET_CHARTS_FOR_LEADS: "/get-charts-for-leads",
};
