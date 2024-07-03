import { Group } from "../../models/index.js";
import { CONST_STRINGS } from "../../helpers/constants.js";

// Create a new group
export const createGroup = async (req, res, next) => {
  const { name, adminId, participants } = req.body;
  try {
    const newGroup = new Group({
      userId: req.body.userId,
      name,
      admin: adminId,
      participants,
    });
    await newGroup.save();
    req.data = { statuscode: 201, responseData: newGroup };
    next();
  } catch (error) {
    req.err = error;
    next(error);
  }
};

// Add a member to a group
export const addMember = async (req, res, next) => {
  const { groupId, userId } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new Error(CONST_STRINGS.GROUP_NOT_FOUND);
    }

    group.members.push(userId);
    await group.save();

    req.data = { statuscode: 200, responseData: group };
    next();
  } catch (error) {
    req.err = error;
    next(error);
  }
};

// Remove a member from a group
export const removeMember = async (req, res, next) => {
  const { groupId, userId } = req.body;
  try {
    const group = await Group.findOne({ _id: groupId });
    if (!group) {
      throw new Error(CONST_STRINGS.GROUP_NOT_FOUND);
    }

    group.members = group.members.filter((id) => id.toString() !== userId);
    await group.save();

    req.data = { statuscode: 200, responseData: group };
    next();
  } catch (error) {
    req.err = error;
    next(error);
  }
};

// Delete group by ID
export const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      throw new Error(CONST_STRINGS.GROUP_NOT_FOUND);
    }
    req.data = {
      statuscode: 200,
      responseMessage: CONST_STRINGS.GROUP_DELETED_SUCCESS,
    };
    next();
  } catch (error) {
    req.err = error;
    next(error);
  }
};
