import { validateUser } from "../helpers/authHelper.js";
import { CONST_STRINGS, TYPES } from "../helpers/constants.js";
import { License, Organization, User } from "../models/index.js";

//Done
export const setOrganization = async (req, res, next) => {
  try {
    req.meta = { endpoint: "setOrganization" };

    const {
      userId,
      organizationName,
      departmentName,
      organizationContact,
      organizationAddress,
    } = req.body;

    if (
      !userId ||
      !organizationName ||
      !departmentName ||
      !organizationContact ||
      !organizationAddress
    ) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const user = await validateUser(
      userId,
      "userId",
      null,
      TYPES.EMAIL_VERIFIED
    );
    const license = await License.findOne({ userId });
    let organization = await Organization.findOne({ userId });

    if (organization) {
      organization.organizationName = organizationName;
      organization.departmentName = departmentName;
      organization.organizationContact = organizationContact;
      organization.organizationAddress = organizationAddress;
    } else {
      organization = new Organization({
        userId,
        organizationId: userId.split("-")[4],
        organizationName,
        departmentName,
        organizationContact,
        organizationAddress,
      });
    }

    const authUser = await User.findOne({ userId });
    authUser.userRole = "organizationAdmin";
    authUser.save();

    organization = await organization.save();

    const responseMessage = CONST_STRINGS.ORGANIZATION_UPDATED;
    const responseData = {
      registeredOn: user.emailVerification.verifiedAt,
      licenseValidity: license?.currentValidity || null,
      //TODO check Logic
      subUsers: [],
      accountStatus: license?.isActive || false,
      allowToChangeTimeZone: license?.allowToChangeTimeZone || false,
      ...organization.toObject(),
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
export const getOrganization = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getOrganization" };

    const { userId } = req.body;

    const user = await validateUser(
      userId,
      "userId",
      null,
      TYPES.EMAIL_VERIFIED
    );

    let organization = await Organization.findOne({ userId });
    const license = await License.findOne({ userId });

    if (!organization) {
      const newOrganization = new Organization({
        userId,
        organizationId: userId.split("-")[4],
        organizationName: "null",
        departmentName: "null",
        timezone: "null",
        organizationContact: {
          name: "null",
          mobile: "null",
          email: "null",
        },
        organizationAddress: {
          addressLine1: "null",
          addressLine2: "null",
          city: "null",
          state: "null",
          country: "null",
          pincode: "null",
        },
      });
      organization = await newOrganization.save();
    }

    const licenseData = {
      validity: license?.currentValidity,
      subUsers: license?.subUsers,
      orderId: license?.orderId,
      approvedBy: license?.approvedBy,
      approverRemarks: license?.approverRemarks,
      previousValidityMap: license?.previousValidityMap,
    };

    const responseData = {
      registeredOn: user.emailVerification.verifiedAt,
      licenseValidity: license?.currentValidity || null,
      subUsers: license?.subUsers || [],
      accountStatus: license?.isActive || false,
      allowToChangeTimeZone: license?.allowToChangeTimeZone || false,
      ...organization.toObject(),
      licenseData,
      lastLoginAt: user.logins[user.logins.length - 1],
      logins: user.logins,
      shortCode: user.shortCode,
    };
    const responseMessage = CONST_STRINGS.GET_ORGANIZATION_DETAILS_SUCCESS;
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || "",
    };
    next();
  } catch (err) {
    next(err);
  }
};
