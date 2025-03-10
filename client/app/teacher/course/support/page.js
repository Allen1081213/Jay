"use client";

import { useState, useEffect } from "react";
import styles from "./support-chat.module.scss";
import { io } from "socket.io-client";

export default function SupportChat() {
  const [userRole, setUserRole] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("loginWithToken");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded?.id) {
        setUserId(decoded.id);
        console.log("✅ 取得使用者 ID:", decoded.id);
      }
    }
  }, []);


  console.log("📌 `page.js` 內的 userRole:", userRole);

  // ✅ 從 localStorage 讀取 userRole
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    console.log("🔍 localStorage 取得 userRole:", storedRole || "未找到");

    if (storedRole) {
      setUserRole(storedRole);
    } else {
      console.warn("⚠️ userRole 未存入 localStorage，請檢查登入邏輯");
    }
  }, []);

  // ✅ 建立 WebSocket 連線（確保只建立一次）
  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);
    return () => newSocket.disconnect(); // 清除 WebSocket 連線，避免重複連線
  }, []);

  // ✅ 監聽 WebSocket 訊息
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket]);

  // ✅ 根據 userRole 初始化對話
  useEffect(() => {
    if (userRole === null) return; 
    console.log("🔍 userRole:", userRole);

    if (userRole === "teacher") {
      setSelectedChat({ name: "管理員" });
      console.log("✅ 老師登入，等待創建對話...");
    } else if (userRole === "admin") {
      console.log("🔄 管理員嘗試載入對話列表...");
      fetchConversations();
    } else {
      console.warn("⚠️ 未知角色:", userRole);
    }
  }, [userRole]);

  useEffect(() => {
    console.log("🎯 `selectedChat` 變更:", selectedChat);
  }, [selectedChat]);

  // ✅ 取得對話列表（只有管理員能讀取）
  const fetchConversations = async () => {
    if (userRole !== "admin") return;

    try {
      const res = await fetch("http://localhost:8000/api/support/conversations");
      if (!res.ok) throw new Error("無法載入對話列表");
      const data = await res.json();
      setConversations(data);
      if (data.length > 0) setSelectedChat(data[0]); // 預設選擇第一個對話
    } catch (error) {
      console.error("❌ 無法取得對話列表:", error);
    }
  };

  // ✅ 取得歷史訊息（只有管理員能讀取）
  useEffect(() => {
    if (!selectedChat || userRole !== "admin") return;
    fetchMessages();
  }, [selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat?.id) return; // 避免 `null.id` 錯誤

    try {
      const res = await fetch(`http://localhost:8000/api/support/messages/${selectedChat.id}`);
      if (!res.ok) throw new Error("無法取得歷史訊息");
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("❌ 無法取得歷史訊息:", error);
    }
  };

  // ✅ 發送訊息
  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1]; // 取得 payload 部分
      if (!base64Url) throw new Error("Token 無效");

      // Base64Url 轉 Base64
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

      // 解析 JSON
      return JSON.parse(decodeURIComponent(escape(atob(base64))));
    } catch (error) {
      console.error("❌ JWT 解析錯誤:", error);
      return null;
    }
  };

  const sendMessage = async () => {
    console.log("📢 按鈕被點擊了！");

    const token = localStorage.getItem("loginWithToken");
    if (!token) {
      console.warn("❌ 沒有 Token，請先登入");
      return;
    }

    if (!selectedChat || !newMessage.trim()) {
      console.warn("❌ 選擇對話或輸入訊息不可為空");
      return;
    }

    const messageData = {
      chatId: selectedChat.id || null, // ✅ 讓後端決定 `chatId`
      text: newMessage,
      senderId: userId, // ✅ 確保 `senderId` 包含在訊息內
    };

    console.log("📩 準備發送訊息:", messageData);

    try {
      const res = await fetch("http://localhost:8000/api/support/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(`API 回應錯誤: ${data.error}`);

      console.log("✅ 訊息成功送出:", data);

      // ✅ **確保 `chatId` 正確更新**
      if (!selectedChat.id && data.chatId) {
        setSelectedChat((prevChat) => ({ ...prevChat, id: data.chatId }));
      }

      // ✅ **確保訊息包含 `senderId`**
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...messageData, chatId: data.chatId, senderId: userId },
      ]);

    } catch (error) {
      console.error("❌ 訊息發送錯誤:", error);
    }

    setNewMessage(""); // ✅ 清空輸入框
  };



  return (
    <div className="container">
      <h1 className={styles.supportTitle}>客服中心</h1>
      <div className="row">
        {/* 左側：管理員才能看到對話列表 */}
        {userRole === "admin" && (
          <div className="col-md-4">
            <div className={styles.chatList}>
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  className={`${styles.chatItem} ${selectedChat?.id === chat.id ? styles.active : ""}`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <h4>{chat.name}</h4>
                  <p>{chat.lastMessage}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 右側：對話視窗 */}
        <div className={userRole === "admin" ? "col-md-8" : "col-12"}>
          <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
              {/* ✅ 老師端直接顯示「管理員」，管理員端如果沒有選擇聊天室才顯示「請選擇聊天室」 */}
              <h4>
                {selectedChat
                  ? selectedChat.name
                  : userRole === "admin"
                    ? "請選擇聊天室"
                    : ""}
              </h4>
            </div>

            <div className={styles.chatBody}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${msg.senderId === userId ? styles.teacher : styles.admin}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>


            {/* 訊息輸入框 */}
            <div className={styles.chatFooter}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="輸入訊息..."
                className={styles.inputField}
              />
              <button onClick={sendMessage} className={styles.sendButton}>
                發送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
