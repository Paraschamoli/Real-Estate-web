import { asyncHandler } from "../utils/asyncHandler.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
export const addMessage = asyncHandler(async (req, res) => {
  const tokenUserId = req.user._id;
  const chatId=req.params.chatId;
  const text=req.body.text;
  try {
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $in: [tokenUserId] }, // Ensure the user is part of the chat
    })
if(!chat){
  throw new ApiError(400,"chat not found");
}
const message= await Message.create({
  text,
  chatId,
  userId:tokenUserId
})
// Step 3: Update the chat with the latest message and mark it as seen by the sender
await Chat.findByIdAndUpdate(
  chatId,
  {
    $push: { messages: message._id }, // Add the new message to the chat's messages array
    $addToSet: { seenBy: tokenUserId }, // Mark chat as seen by this user
    lastMessage: text, // Update the last message text
  },
  { new: true } // Return the updated chat
);

res.status(200).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get message!" });
  }
});