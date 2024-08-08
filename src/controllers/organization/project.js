import { AuthSubUser, Organization, User } from "../../models/index.js";
import { CONST_STRINGS } from "../../helpers/constants.js";
import { v4 as uuidv4 } from "uuid";

export const createProject = async (req, res, next) => {
  try {
    req.data = { endpoint: "createProject" };

    const { organizationId, projectName, userId } = req.body;

    console.log("organizationId", req.body);
    

    const organization = await Organization.findOne({ organizationId });
    console.log(organization);
    if (!organization) {
      throw new Error(CONST_STRINGS.ORGANIZATION_NOT_FOUND);
    }

    const user = await User.findOne({ userId });
    if (!user) {
      throw new Error(CONST_STRINGS.USER_NOT_FOUND);
    }

    //TODO: Check if the user has the required permissions to create a project
    // if (!user.license.isActive) {
    //   throw new Error(CONST_STRINGS.LICENSE_NOT_ACTIVE);
    // }

    const projectId = uuidv4();

    const newProject = {
      projectId,
      projectName,
      subUsers: [],
    };

    organization.projects.push(newProject);
    const updatedOrganization = await organization.save();

    user.projects.push({ projectId, role: "admin" });
    const updatedUser = await user.save();

    const project = user.projects.find(
      (project) => project.projectId === projectId
    );
    if (!project) {
      throw new Error(CONST_STRINGS.PROJECT_NOT_FOUND);
    }

    req.data = {
      statuscode: 201,
      responseData: updatedOrganization,
      responseMessage: CONST_STRINGS.DATA_SAVE_SUCCESS,
    };

    next();
  } catch (err) {
    console.error("Error in createProject:", err);
    req.err = err;
    next(err);
  }
};

export const addUserToProject = async (req, res, next) => {
  try {
    req.data = { endpoint: "addUserToProject" };

    const { organizationId, projectId, subuserId, userRole: role } = req.query;
    const { userId } = req.body;

    const organization = await Organization.findOne({
      organizationId: organizationId,
    });
    if (!organization) {
      throw new Error(CONST_STRINGS.ORGANIZATION_NOT_FOUND);
    }

    const project = organization.projects.find(
      (project) => project.projectId === projectId
    );
    if (!project) {
      throw new Error(CONST_STRINGS.PROJECT_NOT_FOUND);
    }

    project.subUsers.push({ subuserId, role });
    const updatedOrganization = await organization.save();

    // Fetch the existing AuthSubUser document to preserve shortCode
    const existingAuthSubUser = await User.findOne({
      userId,
    });
    const shortCode = existingAuthSubUser
      ? existingAuthSubUser.shortCode
      : null;

    console.log("shortCode", shortCode);

    await Promise.all([
      AuthSubUser.findOneAndUpdate(
        { subUserId: subuserId },
        {
          userId: subuserId, // or other unique user identifier
          $addToSet: {
            projects: { projectId, role }, // Ensure projects are updated without duplicates
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ),
      User.findOneAndUpdate(
        { userId },
        {
          $addToSet: {
            projects: { projectId, role }, // Ensure projects are updated without duplicates
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ),
    ]);

    req.data = {
      statuscode: 200,
      responseData: updatedOrganization,
      responseMessage: CONST_STRINGS.DATA_SAVE_SUCCESS,
    };

    next();
  } catch (err) {
    console.error("Error in addUserToProject:", err);
    req.err = err;
    next(err);
  }
};

export const changeUserRoleInProject = async (req, res, next) => {
  try {
    req.data = { endpoint: "changeUserRoleInProject" };

    const { organizationId, projectId, userId, role } = req.body;

    const organization = await Organization.findOne({ organizationId });
    if (!organization) {
      throw new Error(CONST_STRINGS.ORGANIZATION_NOT_FOUND);
    }

    const project = organization.projects.id(projectId);
    if (!project) {
      throw new Error(CONST_STRINGS.PROJECT_NOT_FOUND);
    }

    const user = project.subUsers.find((user) => user.userId === userId);
    if (!user) {
      throw new Error(CONST_STRINGS.USER_NOT_FOUND_IN_PROJECT);
    }

    user.role = role;
    const updatedOrganization = await organization.save();

    req.data = {
      statuscode: 200,
      responseData: updatedOrganization,
      responseMessage: CONST_STRINGS.DATA_SAVE_SUCCESS,
    };

    next();
  } catch (err) {
    console.error("Error in changeUserRoleInProject:", err);
    req.err = err;
    next(err);
  }
};

export const changeProjectAndRole = async (req, res, next) => {
  try {
    req.data = { endpoint: "changeProjectAndRole" };

    const { organizationId, projectId, userId } = req.body;

    const organization = await Organization.findOne({ organizationId });
    if (!organization) {
      throw new Error(CONST_STRINGS.ORGANIZATION_NOT_FOUND);
    }

    const project = organization.projects.id(projectId);
    if (!project) {
      throw new Error(CONST_STRINGS.PROJECT_NOT_FOUND);
    }

    const user = project.subUsers.find((user) => user.userId === userId);
    if (!user) {
      throw new Error(CONST_STRINGS.USER_NOT_FOUND_IN_PROJECT);
    }

    req.data = {
      statuscode: 200,
      responseData: { currentProject: project, userRole: user.role },
      responseMessage: CONST_STRINGS.DATA_FETCH_SUCCESS,
    };

    next();
  } catch (err) {
    console.error("Error in changeProjectAndRole:", err);
    req.err = err;
    next(err);
  }
};

export const getAllUserInProject = async (req, res, next) => {
  try {
    req.data = { endpoint: "getAllUserInProject" };

    const { organizationId, projectId } = req.query;

    const organization = await Organization.findOne({ organizationId });
    if (!organization) {
      throw new Error(CONST_STRINGS.ORGANIZATION_NOT_FOUND);
    }

    console.log(organization.projects);

    const project = organization.projects.find(
      (project) => project.projectId === projectId
    );
    if (!project) {
      throw new Error(CONST_STRINGS.PROJECT_NOT_FOUND);
    }

    const users = project.subUsers;

    req.data = {
      statuscode: 200,
      responseData: users,
      responseMessage: CONST_STRINGS.DATA_FETCH_SUCCESS,
    };

    next();
  } catch (err) {
    console.error("Error in getAllUserInProject:", err);
    req.err = err;
    next(err);
  }
};
