import { asyncHandler } from "../utils/asyncHandler.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
export const getChats = asyncHandler(async (req, res) => {
  const tokenUserId = req.user._id;
  try {
    // Step 1: Find all chats where the authenticated user is a participant
    const chats = await Chat.find({
      users: { $in: [tokenUserId] },
    }).populate("messages");

    // Step 2: Extract receiver info for all chats concurrently
    const chatsWithReceiver = await Promise.all(
      chats.map(async (chat) => {
        const receiverId = chat.users.find(
          (id) => id.toString() !== tokenUserId.toString()
        );
        
        const receiver = await User.findById(receiverId).select(
          "id username avatar"
        );
        
        const chatObject = chat.toObject(); // Convert chat to plain object
        chatObject.receiver = receiver; // Add receiver to the chat object

        return chatObject; // Return the modified chat object
      })
    );

    res.status(200).json(chatsWithReceiver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
});


export const getChat = asyncHandler(async (req, res) => {
  const tokenUserId = req.user._id; // Assume JWT authentication sets the user object in req

  try {
    // Step 1: Find the chat where the user is part of the chat and with the specified chat ID
    const chat = await Chat.findOne({
      _id: req.params.id,
      users: { $in: [tokenUserId] }, // Ensure the user is part of the chat
    }).populate({
      path: "messages", // Populate the messages associated with the chat
      options: { sort: { createdAt: 1 } }, // Order messages by createdAt in ascending order
    });

    // If chat is not found, return an error response
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Step 2: Update the `seenBy` field to mark the chat as seen by the current user
    if (!chat.seenBy.includes(tokenUserId)) {
      chat.seenBy.push(tokenUserId);
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
});

export const addChat = asyncHandler(async (req, res) => {
  const tokenUserId = req.user._id;
  try {
    const newChat = await Chat.create({
      users: [tokenUserId, req.body.receiverId],
    });
    res.status(200).json(newChat);
  } catch (error) {}
});

export const readChat = asyncHandler(async (req, res) => {
  const tokenUserId = req.user._id; // Assume JWT authentication sets the user object in req

  try {
    // Step 1: Find the chat where the user is part of the chat and update the `seenBy` array
    const chat = await Chat.findOneAndUpdate(
      {
        _id: req.params.id,
        users: { $in: [tokenUserId] }, // Ensure the user is part of the chat
      },
      {
        $addToSet: { seenBy: tokenUserId }, // Add the userId to the seenBy array if it's not already there
      },
      { new: true } // Return the updated document
    );

    // If chat is not found, return an error response
    if (!chat) {
      return res
        .status(404)
        .json({ message: "Chat not found or unauthorized access" });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to read chat!" });
  }
});
