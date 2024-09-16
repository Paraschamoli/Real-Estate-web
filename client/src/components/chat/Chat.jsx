import { useContext, useState,useEffect, useRef } from "react";
import "./chat.scss";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";
function Chat({ chats }) {
  // console.log("chat", chats);

  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [chat, setChat] = useState(null);

  const messageEndRef = useRef();

  const decrease = useNotificationStore((state) => state.decrease);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);
  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest("/chats/" + id);
      if (!res.data.seenBy.includes(currentUser._id)) {
        decrease();
      }
      setChat({ ...res.data, receiver });
      console.log("chat  u", receiver, res);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const text = formData.get("text");

    if (!text) return;
    try {
      const res = await apiRequest.post("/messages/" + chat._id, { text });
      setChat((prev) => ({ ...prev, messages: [...prev.messages, res.data] }));
      e.target.reset();
      socket.emit("sendMessage", {
        receiverId: chat.receiver._id,
        data: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const read = async () => {
      try {
        await apiRequest.put("/chats/read/" + chat._id);
      } catch (err) {
        console.log(err);
      }
    };

    if (chat && socket) {
      socket.on("getMessage", (data) => {
        if (chat._id === data.chatId) {
          setChat((prev) => ({ ...prev, messages: [...prev.messages, data] }));
          read();
        }
      });
    }
    return () => {
      socket.off("getMessage");
    };
  }, [socket, chat]);
  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>

        {chats?.map((c) => (
          <div
            className="message"
            key={c._id}
            style={{
              backgroundColor:
                c.seenBy.includes(currentUser.id) || chat?.id === c.id
                  ? "white"
                  : "#fecd514e",
            }}
            onClick={() => handleOpenChat(c._id, c.receiver)}
          >
            <img
              src={c.receiver?.avatar || "/noavatar.jpg"}
              alt={c.receiver?.username || "No Avatar"}
            />
            <span>{c.receiver?.username || "Unknown User"}</span>
            <p>{c.lastMessage || "No messages yet"}</p>
          </div>
        ))}
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img src={chat?.receiver.avatar || "noavatar.jpg"} alt="" />
              {chat?.receiver.username}
            </div>
            <span className="close" onClick={() => setChat(null)}>
              X
            </span>
          </div>
          <div className="center">
            {chat.messages.map((message) => (
              <div
                className="chatMessage"
                key={message._id}
                style={{
                  alignSelf:
                    message.userId === currentUser._id
                      ? "flex-end"
                      : "flex-start",
                  textAlign:
                    message.userId === currentUser._id ? "right" : "left",
                }}
              >
                <p>{message.text}</p>
                <span>{format(message.createdAt)}</span>
              </div>
            ))}
              <div ref={messageEndRef}></div>
          </div>

          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text"></textarea>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
