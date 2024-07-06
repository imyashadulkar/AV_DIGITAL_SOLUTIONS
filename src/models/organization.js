import mongoose from "mongoose";

const userRoleSchema = new mongoose.Schema(
  {
    subuserId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["read", "write", "admin"],
      required: true,
    },
  },
  {
    _id: false,
  }
);

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    subUsers: [userRoleSchema],
  },
  {
    _id: false,
  }
);

const organizationContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const organizationAddressSchema = new mongoose.Schema(
  {
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const organizationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    organizationId: {
      type: String,
      required: true,
      unique: true,
    },
    subUsers: {
      type: [String],
      default: [],
    },
    organizationName: {
      type: String,
      required: true,
    },
    departmentName: {
      type: String,
      required: true,
    },
    organizationContact: organizationContactSchema,
    organizationAddress: organizationAddressSchema,
    projects: [projectSchema],
  },
  {
    timestamps: true,
  }
);

export const Organization = mongoose.model("Organization", organizationSchema);
