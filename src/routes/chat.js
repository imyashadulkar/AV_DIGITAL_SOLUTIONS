import express from "express";
import {
  createGroup,
  addMember,
  removeMember,
  deleteGroup,
} from "../controllers/chatApp/groupChatController.js";
import {
  getChatById,
  createChat,
  deleteChatById,
  sendMessage,
  getChatByUserId,
} from "../controllers/chatApp/chatController.js";
import { CHAT_APP } from "../helpers/constants.js";
import { verifyToken } from "../middleware/auth.js";
import { successResponse } from "../middleware/successResponse.js";

const router = express.Router();

/**
 * @swagger
 * /chat/get-chat-by-chat-id/{chatId}:
 *   get:
 *     summary: Get chat by userId
 *     description: Retrieve a chat by its unique identifier.
 *     tags:
 *       - Chats
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: chatId of the chat to retrieve.
 *     responses:
 *       200:
 *         description: Retrieved chat successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "60d5f7f8f6e8b40f9c9e75c1"
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *       404:
 *         description: Chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Chat not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.get(CHAT_APP.GET_CHAT_BY_ID, verifyToken, getChatById, successResponse);

/**
 * @swagger
 * /chat/get-chat-by-user-id/{userId}:
 *   get:
 *     summary: Get chat by userId
 *     description: Retrieve a chat by its unique identifier.
 *     tags:
 *       - Chats
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: userId of the chat to retrieve.
 *     responses:
 *       200:
 *         description: Retrieved chat successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "60d5f7f8f6e8b40f9c9e75c1"
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *       404:
 *         description: Chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Chat not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */

router.get(
  CHAT_APP.GET_CHAT_BY_USER_ID,
  verifyToken,
  getChatByUserId,
  successResponse
);

/**
 * @swagger
 * /chat/create-chat:
 *   post:
 *     summary: Create a new chat
 *     description: Create a new chat with specified participants.
 *     tags:
 *       - Chats
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d5f7f8f6e8b40f9c9e75c1", "60d5f7f8f6e8b40f9c9e75c2"]
 *     responses:
 *       201:
 *         description: Chat created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60d5f7f8f6e8b40f9c9e75c3"
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *       400:
 *         description: Bad request. Missing required inputs or invalid data format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required inputs."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.post(CHAT_APP.CREATE_CHAT, verifyToken, createChat, successResponse);

/**
 * @swagger
 * /chat/delete-chat-by-chat-id/{chatId}:
 *   delete:
 *     summary: Delete chat by chatId
 *     description: Delete a chat by its unique identifier.
 *     tags:
 *       - Chats
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: chatId of the chat to delete.
 *     responses:
 *       200:
 *         description: Chat deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Chat deleted successfully."
 *       404:
 *         description: Chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Chat not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.delete(
  CHAT_APP.DELETE_CHAT_BY_ID,
  verifyToken,
  deleteChatById,
  successResponse
);

/**
 * @swagger
 * /chat/send-message:
 *   post:
 *     summary: Send a message
 *     description: Send a message to a chat.
 *     tags:
 *       - Chats
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: ID of the chat to send the message to.
 *                 example: "60d5f7f8f6e8b40f9c9e75c1"
 *               senderId:
 *                 type: string
 *                 description: ID of the message sender.
 *                 example: "60d5f7f8f6e8b40f9c9e75c2"
 *               content:
 *                 type: string
 *                 description: Content of the message.
 *                 example: "Hello, how are you?"
 *     responses:
 *       200:
 *         description: Message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sender:
 *                   type: string
 *                   example: "60d5f7f8f6e8b40f9c9e75c2"
 *                 content:
 *                   type: string
 *                   example: "Hello, how are you?"
 *                 timestamp:
 *                   type: string
 *                   example: "2023-07-04T10:15:30Z"
 *       400:
 *         description: Bad request. Missing required inputs or invalid data format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required inputs."
 *       404:
 *         description: Chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Chat not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.post(CHAT_APP.SEND_MESSAGE, verifyToken, sendMessage, successResponse);

//Group Chat API

/**
 * @swagger
 * /groups/create-group:
 *   post:
 *     summary: Create a new group
 *     description: Create a new group with specified members.
 *     tags:
 *       - Groups
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d5f7f8f6e8b40f9c9e75c1", "60d5f7f8f6e8b40f9c9e75c2"]
 *     responses:
 *       201:
 *         description: Group created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60d5f7f8f6e8b40f9c9e75c3"
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *       400:
 *         description: Bad request. Missing required inputs or invalid data format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required inputs."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.post(CHAT_APP.CREATE_GROUP, verifyToken, createGroup, successResponse);

/**
 * @swagger
 * /groups/add-member:
 *   post:
 *     summary: Add member to group
 *     description: Add a member to an existing group.
 *     tags:
 *       - Groups
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: ID of the group to add the member to.
 *                 example: "60d5f7f8f6e8b40f9c9e75c1"
 *               memberId:
 *                 type: string
 *                 description: ID of the member to add to the group.
 *                 example: "60d5f7f8f6e8b40f9c9e75c2"
 *     responses:
 *       200:
 *         description: Member added to group successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Member added to group successfully."
 *       400:
 *         description: Bad request. Missing required inputs or invalid data format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required inputs."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.post(CHAT_APP.ADD_MEMBER, verifyToken, addMember, successResponse);

/**
 * @swagger
 * /groups/remove-member:
 *   post:
 *     summary: Remove member from group
 *     description: Remove a member from an existing group.
 *     tags:
 *       - Groups
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: ID of the group to remove the member from.
 *                 example: "60d5f7f8f6e8b40f9c9e75c1"
 *               memberId:
 *                 type: string
 *                 description: ID of the member to remove from the group.
 *                 example: "60d5f7f8f6e8b40f9c9e75c2"
 *     responses:
 *       200:
 *         description: Member removed from group successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Member removed from group successfully."
 *       400:
 *         description: Bad request. Missing required inputs or invalid data format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required inputs."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.post(CHAT_APP.REMOVE_MEMBER, verifyToken, removeMember, successResponse);

/**
 * @swagger
 * /groups/delete-group/{id}:
 *   delete:
 *     summary: Delete group by ID
 *     description: Delete a group by its unique identifier.
 *     tags:
 *       - Groups
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to delete.
 *     responses:
 *       200:
 *         description: Group deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Group deleted successfully."
 *       404:
 *         description: Group not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Group not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.delete(CHAT_APP.DELETE_GROUP, verifyToken, deleteGroup, successResponse);

export default router;
