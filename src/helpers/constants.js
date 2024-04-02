export const CONST_STRINGS = {
  COLLEGE_DATA_POSTED_SUCCESSFULLY: "college Data posted Successfully",
  COLLEGE_DATA_NOT_FOUND: "college Data Not Found",
  COLLEGE_DATA_UPDATED_SUCCESSFULLY: "College Data Updated Successfully",
  COLLEGE_DATA_RETRIEVED_SUCCESSFULLY:"",
  
  STATUS: "Status",

  SERVER_RUNNING_MESSAGE:
    "Server is running",
  MISSING_REQUIRED_INPUTS: "Request is missing required inputs",
  
};

export const TYPES = {
  EMAIL_DOES_NOT_EXISTS_OR_NOT_VERIFIED:
    "EMAIL_DOES_NOT_EXISTS_OR_NOT_VERIFIED",
  EMAIL_DOES_NOT_EXISTS: "EMAIL_DOES_NOT_EXISTS",
  EMAIL_EXISTS_AND_NOT_VERIFIED: "EMAIL_EXISTS_AND_NOT_VERIFIED",
  EMAIL_VERIFIED: "EMAIL_VERIFIED"
};

// Route URLs
export const BASE_ROUTES = {
  PING_ROUTE: "/ping",
  // AUTH_ROUTES: "/auth",
  MODULE_ROUTES: "/module",
  ADMIN_ROUTES: "/admin",
  LOG_ROUTES: "/logs",
};



export const MODULE_ROUTES = {
 GET_COLLEGE_DATA:"/get-college-data",
 POST_COLLEGE_DATA:"/post-college-data"
};

export const ADMIN_ROUTES = {
  GET_ADMIN_LOGIN_CODE: "/get-admin-login-code",
  ADMIN_LOGIN_WITH_CODE: "/admin-login-with-code",
  LOGIN_WITH_EMAIL_PASSWORD_ADMIN: "/login-with-email-password-admin",
  GET_ALL_USERS: "/get-all-users",
  GET_USER_BY_ID: "/get-user-by-id/:userId",
  SET_LICENSE_DATA_BY_ID: "/set-license-data-by-id",
  GET_ALL_USERS_LICENSE_DATA: "/get-all-users-license-data",
  GET_USER_LICENSE_DATA_BY_ID: "/get-user-license-data-by-id/:userId",
  UPDATE_USER_STATUS: "/update-user-status",
  LOGOUT_ADMIN: "/logout-admin"
};

export const LOG_ROUTES = {
  GET_ENDPOINT_STATISTICS:
  "/get-endpoint-statistics/:type?/:startDate?/:startTime?/:endDate?/:endTime?/:email?/:origin?/:requestTime?/:responseDataSize?/:endPoint?",
  GET_AUTOMATION_TEST_STATISTICS:
    "/get-automation-test-statistics/:type?/:start_date?/:end_date?/:testId?",
  LOG_AUTOMATION_TEST_RESULT: "/log-automation-test-result"
};
