import { Chat, Group } from "../../models/index.js";

export const setupWebSocket = (wss) => {
  wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", async (message) => {
      const parsedMessage = JSON.parse(message);

      switch (parsedMessage.type) {
        case "sendMessage":
          await handleSendMessage(ws, parsedMessage);
          break;
        case "createGroup":
          await handleCreateGroup(ws, parsedMessage);
          break;
        case "addGroupMember":
          await handleAddGroupMember(ws, parsedMessage);
          break;
        case "removeGroupMember":
          await handleRemoveGroupMember(ws, parsedMessage);
          break;
        case "exitGroup":
          await handleExitGroup(ws, parsedMessage);
          break;
        default:
          ws.send(JSON.stringify({ error: "Unknown message type" }));
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
};

const handleSendMessage = async (ws, { chatId, senderId, content }) => {
  try {
    const chat = await Chat.findOne(chatId);
    if (!chat) {
      ws.send(JSON.stringify({ error: "Chat not found" }));
      return;
    }

    const message = {
      sender: senderId,
      content,
      timestamp: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    // Broadcast the message to all participants
    chat.participants.forEach((participant) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "newMessage",
              chatId,
              message,
            })
          );
        }
      });
    });
  } catch (error) {
    ws.send(JSON.stringify({ error: error.message }));
  }
};

const handleCreateGroup = async (ws, { name, members, admin }) => {
  try {
    const newGroup = new Group({ name, members, admin });
    await newGroup.save();

    // Notify all members about the new group
    members.forEach((member) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "newGroup",
              group: newGroup,
            })
          );
        }
      });
    });

    ws.send(JSON.stringify({ type: "groupCreated", group: newGroup }));
  } catch (error) {
    ws.send(JSON.stringify({ error: error.message }));
  }
};

const handleAddGroupMember = async (ws, { groupId, userId }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      ws.send(JSON.stringify({ error: "Group not found" }));
      return;
    }

    group.members.push(userId);
    await group.save();

    // Notify all members about the new member
    group.members.forEach((member) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "memberAdded",
              groupId,
              userId,
            })
          );
        }
      });
    });

    ws.send(JSON.stringify({ type: "memberAdded", groupId, userId }));
  } catch (error) {
    ws.send(JSON.stringify({ error: error.message }));
  }
};

const handleRemoveGroupMember = async (ws, { groupId, userId }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      ws.send(JSON.stringify({ error: "Group not found" }));
      return;
    }

    group.members = group.members.filter(
      (member) => member.toString() !== userId
    );
    await group.save();

    // Notify all members about the removed member
    group.members.forEach((member) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "memberRemoved",
              groupId,
              userId,
            })
          );
        }
      });
    });

    ws.send(JSON.stringify({ type: "memberRemoved", groupId, userId }));
  } catch (error) {
    ws.send(JSON.stringify({ error: error.message }));
  }
};

const handleExitGroup = async (ws, { groupId, userId }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      ws.send(JSON.stringify({ error: "Group not found" }));
      return;
    }

    if (group.admin.toString() === userId) {
      ws.send(JSON.stringify({ error: "Admin cannot leave the group" }));
      return;
    }

    group.members = group.members.filter(
      (member) => member.toString() !== userId
    );
    await group.save();

    // Notify all members about the user exit
    group.members.forEach((member) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "memberExited",
              groupId,
              userId,
            })
          );
        }
      });
    });

    ws.send(JSON.stringify({ type: "memberExited", groupId, userId }));
  } catch (error) {
    ws.send(JSON.stringify({ error: error.message }));
  }
};
