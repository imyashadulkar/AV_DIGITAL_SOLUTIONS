import mongoose from "mongoose";
import request from "supertest";
import { CONST_STRINGS } from "../helpers/constants.js";
import { ENV_VAR } from "../helpers/env.js";
import app from "../index.js"; // Assuming `app` is your Express application
import { User } from "../models/index.js"; // Assuming `User` model from mongoose
import { hashPassword, generateCode } from "../helpers/authHelper.js"; // Assuming `hashPassword` function from your helpers

// Mock data for testing
const mockUserData = {
  email: "test@example.com",
  password: "Test@12345",
  confirmPassword: "Test@12345",
  userName: "testuser",
  phoneNumber: "9167310023",
  userRole: "user",
};

// Connect to MongoDB before running tests
beforeAll(async () => {
  await mongoose.connect(ENV_VAR.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Clear any existing users from the database before running tests
  await User.deleteMany({});
});

// Close MongoDB connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});

// Test suite for getRegisterCode controller function
describe("Testing getRegisterCode controller function", () => {
  beforeEach(async () => {
    // Clear user collection before each test
    await User.deleteMany({});
  });

  it("creates a new user registration code successfully", async () => {
    const res = await request(app)
      .post(`/${ENV_VAR.BASE_URL}/v1/auth/get-register-code`)
      .send(mockUserData)
      .set("Accept", "application/json");

    // Expecting status code 200 and checking response from req.data
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(CONST_STRINGS.USER_REGISTER_CODE_CREATED);
    expect(res.body.data.userId).toBeDefined();
    expect(res.body.data.email).toBe(mockUserData.email);
    expect(res.body.data.code).toBeDefined();

    // Verify user is created in the database
    const user = await User.findOne({ email: mockUserData.email });
    expect(user).toBeTruthy();
    expect(user.userId).toBe(res.body.data.userId);
    expect(user.email).toBe(mockUserData.email);
    expect(user.userName).toBe(mockUserData.userName);
    expect(user.phoneNumber).toBe(mockUserData.phoneNumber);
    expect(user.userRole).toBe(mockUserData.userRole);

    // Verify hashed password and emailVerification
    expect(user.password).not.toBe(mockUserData.password); // Password should be hashed
    expect(user.emailVerification.code).toBe(res.body.data.code);
    expect(user.emailVerification.verified).toBe(false);
  });

  it("returns an error when required inputs are missing", async () => {
    const invalidUserData = { ...mockUserData };
    delete invalidUserData.email; // Remove required field

    const res = await request(app)
      .post(`/${ENV_VAR.BASE_URL}/v1/auth/get-register-code`)
      .send(invalidUserData)
      .set("Accept", "application/json");

    // Expecting status code 400 and checking error message from req.data
    expect(res.status).toBe(400); // Assuming error handling returns 400
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(CONST_STRINGS.MISSING_REQUIRED_INPUTS);

    // Verify no user is created in the database
    const user = await User.findOne({ email: mockUserData.email });
    expect(user).toBeFalsy(); // No user should be found
  });

  it("returns an error when password and confirmPassword do not match", async () => {
    const invalidUserData = { ...mockUserData, confirmPassword: "MismatchedPassword" };

    const res = await request(app)
      .post(`/${ENV_VAR.BASE_URL}/v1/auth/get-register-code`)
      .send(invalidUserData)
      .set("Accept", "application/json");

    // Expecting status code 400 and checking error message from req.data
    expect(res.status).toBe(400); // Assuming error handling returns 400
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(CONST_STRINGS.CONFIRM_PASSWORD_DOES_NOT_MATCH_WITH_PASSWORD);

    // Verify no user is created in the database
    const user = await User.findOne({ email: mockUserData.email });
    expect(user).toBeFalsy(); // No user should be found
  });

  it("returns an error when email format is invalid", async () => {
    const invalidEmailUserData = { ...mockUserData, email: "invalid-email" };

    const res = await request(app)
      .post(`/${ENV_VAR.BASE_URL}/v1/auth/get-register-code`)
      .send(invalidEmailUserData)
      .set("Accept", "application/json");

    // Expecting status code 400 and checking error message from req.data
    expect(res.status).toBe(400); // Assuming error handling returns 400
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(CONST_STRINGS.INVALID_EMAIL_FORMAT);

    // Verify no user is created in the database
    const user = await User.findOne({ email: invalidEmailUserData.email });
    expect(user).toBeFalsy(); // No user should be found
  });

  it("returns an error when password does not meet complexity requirements", async () => {
    const invalidPasswordUserData = { ...mockUserData, password: "weakpassword" };

    const res = await request(app)
      .post(`/${ENV_VAR.BASE_URL}/v1/auth/get-register-code`)
      .send(invalidPasswordUserData)
      .set("Accept", "application/json");

    // Expecting status code 400 and checking error message from req.data
    expect(res.status).toBe(400); 
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(CONST_STRINGS.PASSWORD_DOES_NOT_MEET_REQUIREMENTS);

    // Verify no user is created in the database
    const user = await User.findOne({ email: invalidPasswordUserData.email });
    expect(user).toBeFalsy(); // No user should be found
  });

  // Add more test cases as needed for different scenarios
});

