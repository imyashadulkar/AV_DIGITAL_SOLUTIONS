import { Organization } from "../../models/index.js";
import { CONST_STRINGS } from "../../helpers/constants.js";
import { v4 as uuidv4 } from "uuid";

export const createProject = async (req, res, next) => {
  try {
    req.data = { endpoint: "createProject" };

    const { organizationId, projectName } = req.body;

    const organization = await Organization.findOne({ organizationId });
    if (!organization) {
      throw new Error(CONST_STRINGS.ORGANIZATION_NOT_FOUND);
    }

    const projectId = uuidv4();

    const newProject = {
      projectId,
      projectName,
      subUsers: [],
    };

    organization.projects.push(newProject);
    const updatedOrganization = await organization.save();

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

    const organization = await Organization.findOne({ organizationId: organizationId });
    if (!organization) {
      throw new Error(CONST_STRINGS.ORGANIZATION_NOT_FOUND);
    }

    const project = organization.projects.find(
      (project) => project.projectId === projectId
    );
    console.log(project);
    if (!project) {
      throw new Error(CONST_STRINGS.PROJECT_NOT_FOUND);
    }

    project.subUsers.push({ subuserId, role });
    const updatedOrganization = await organization.save();

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