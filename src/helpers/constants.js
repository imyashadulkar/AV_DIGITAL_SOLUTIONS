export const CONST_STRINGS = {
  COLLEGE_DATA_POSTED_SUCCESSFULLY: "college Data posted Successfully",
  COLLEGE_DATA_NOT_FOUND: "college Data Not Found",
  COLLEGE_DATA_UPDATED_SUCCESSFULLY: "College Data Updated Successfully",
  COLLEGE_DATA_RETRIEVED_SUCCESSFULLY: "Colleg Data Retrieved Successfully",
  BLOG_ADDED_SUCCESSFULLY: "Blog Added Successfully",
  NO_BLOG_POSTS_FOUND: "No Blog Post Found",
  BLOG_POSTS_RETRIEVED_SUCCESSFULLY: "Blogs Retrieved Successfully",
  BLOG_POST_NOT_FOUND: "No Blog Post Found",
  BLOG_POST_DELETED_SUCCESSFULLY: "Blog post deleted Successfully",
  INTERNAL_SERVER_ERROR: "Internal  Server Error",
  STATUS: "Status",
  SERVER_RUNNING_MESSAGE: "Server is running Last commit 12:35",
  MISSING_REQUIRED_INPUTS: "Request is missing required inputs",
  ADMIN_LOGIN_CODE_SENT: "Admin login code sent",
  TESTIMONIAL_ADDED_SUCCESSFULLY: "",
  TESTIMONIAL_RETRIEVED_SUCCESSFULLY: "",
  TESTIMONIALS_RETRIEVED_SUCCESSFULLY: "",
  NO_TESTIMONIALS_FOUND: "",
  //auth
  USER_REGISTER_CODE_CREATED: "",

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
};



export const MODULE_ROUTES = {
  GET_COLLEGE_DATA: "/get-college-data/:sortBy?/:sortOrder?/:limit?/:filterBy?",
  POST_COLLEGE_DATA: "/post-college-data",
  DELETE_COLLEGE_DATA: "/delete-college-data/:collegeId?",
  ADD_BLOG_DATA: "/add-blog-data",
  DELETE_BLOG: "/delete-blog",
  GET_BLOG: "/get-blog-post",
  ADD_TESTIMONIAL_DATA: "/add-testimonial-data"
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
  LOGOUT_ADMIN: "/logout-admin",
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
  DELETE_USER_AND_DATA: "/delete-user-and-data/:email/:key",
  GET_USER_DATA: "/get-user-data/:type/:email/:key",
  UPDATE_USER_STATUS_WITH_KEY: "/update-user-status-with-key",
  AUTH_SUB_USER_GENERATION: "/create-sub-user",
  GET_SUB_USER: "/get-sub-user/:subUserId?",
  CHANGE_SUB_USER_PASSWORD: "/change-sub-user-password",
  SUB_USER_LOGIN_WITH_EMAIL_PASSWORD: "/sub-user-login-with-email-password",
  GET_TERMS_AND_CONDITIONS: "/get-terms-and-conditions",
};

export const LOG_ROUTES = {
  GET_ENDPOINT_STATISTICS:
    "/get-endpoint-statistics/:type?/:startDate?/:startTime?/:endDate?/:endTime?/:email?/:origin?/:requestTime?/:responseDataSize?/:endPoint?",
  GET_AUTOMATION_TEST_STATISTICS:
    "/get-automation-test-statistics/:type?/:start_date?/:end_date?/:testId?",
  LOG_AUTOMATION_TEST_RESULT: "/log-automation-test-result",
};
