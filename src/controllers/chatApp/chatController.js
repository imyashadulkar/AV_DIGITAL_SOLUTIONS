import { Chat, User } from "../../models/index.js";
import { CONST_STRINGS } from "../../helpers/constants.js";
import { v4 as uuidv4 } from "uuid";
//TODO
// Get chat by chat ID
export const getChatById = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    // Retrieve chat using chatId and populate participants' names
    const chat = await Chat.findOne({ chatId })
      .populate({
        path: "participants",
        select: "name userId", // Select fields from User model
        model: User,
      })
      .populate({
        path: "messages.sender",
        select: "name userId", // Select fields from User model for sender
        model: User,
      });

    if (!chat) {
      throw new Error(CONST_STRINGS.CHAT_NOT_FOUND);
    }

    // Construct response data
    const responseData = {
      userId: chat.userId,
      chatId: chat.chatId,
      participants: chat.participants.map((participant) => ({
        userId: participant.userId,
        name: participant.name,
      })),
      messages: chat.messages.map((message) => ({
        sender: {
          userId: message.sender.userId,
          name: message.sender.name,
        },
        content: message.content,
        timestamp: message.timestamp,
      })),
    };

    req.data = { statuscode: 200, responseData };
    next();
  } catch (error) {
    req.err = error;
    next(error);
  }
};
// Create a new chat
export const createChat = async (req, res, next) => {
  const { participants, userId } = req.body;
  try {
    const chatId = uuidv4();
    const newChat = new Chat({ chatId, participants, userId });
    await newChat.save();
    req.data = { statuscode: 201, responseData: newChat };
    next();
  } catch (error) {
    req.err = error;
    next(error);
  }
};

// Delete chat by ID
export const deleteChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ userId: req.query.userId });
    await chat.delete();
    if (!chat) {
      throw new Error(CONST_STRINGS.CHAT_NOT_FOUND);
    }
    req.data = {
      statuscode: 200,
      responseMessage: CONST_STRINGS.CHAT_DELETED_SUCCESS,
    };
    next();
  } catch (error) {
    req.err = error;
    next(error);
  }
};

// Send a message
export const sendMessage = async (req, res, next) => {
  const { chatId, senderId, content } = req.body;
  try {
    const chat = await Chat.findOne({ chatId });
    if (!chat) {
      throw new Error(CONST_STRINGS.CHAT_NOT_FOUND);
    }
    const message = {
      sender: senderId,
      content,
      timestamp: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    req.data = { statuscode: 200, responseData: message };
    next();
  } catch (error) {
    req.err = error;
    next(error);
  }
};
