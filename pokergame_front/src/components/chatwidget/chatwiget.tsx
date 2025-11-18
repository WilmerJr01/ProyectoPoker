// src/components/chatwidget/chatwiget.tsx
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { ChatMessage } from "../../types";
import "./chatwidget.css";

type ChatWidgetProps = {
    socket: Socket;
    tableId: string;
    userId: string;
    nickname: string;
};

export default function ChatWidget({
    socket,
    tableId,
    userId,
    nickname,
}: ChatWidgetProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [open, setOpen] = useState(false); // false = previsualización
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Escuchar mensajes del servidor
    useEffect(() => {
        const handleIncoming = (message: ChatMessage) => {
            if (message.tableId !== tableId) return;
            setMessages((prev) => [...prev, message]);
        };

        socket.on("chat:message", handleIncoming);

        return () => {
            socket.off("chat:message", handleIncoming);
        };
    }, [socket, tableId]);

    // Autoscroll cuando está abierto
    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [open, messages.length]);

    const handleSend = (e: FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;

        socket.emit("chat:send", { tableId, text, nickname });
        setInput("");
    };

    const lastMsg = messages[messages.length - 1];

    return (
        <div className={`chat-container ${open ? "open" : "closed"}`}>
            {open ? (
                // ================= CHAT COMPLETO =================
                <div className="chat-box">
                    <div className="chat-header" onClick={() => setOpen(false)}>
                        <p>Chat</p>
                    </div>

                    <div className="chat-messages">
                        {messages.map((m) => {
                            const isMe = m.userId === userId;
                            return (
                                <div
                                    key={m._id}
                                    className={`chat-message ${isMe ? "me" : ""} ${m.isSystem ? "system" : ""
                                        }`}
                                >
                                    <div className="meta">
                                        <span className="nick">
                                            {m.isSystem ? m.nickname : isMe ? "Tú" : m.nickname}
                                        </span>
                                        <span className="time">
                                            {new Date(m.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <div className="text">{m.text}</div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    <form className="chat-input-row" onSubmit={handleSend}>
                        <input
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Write..."
                            maxLength={150}
                        />
                        <button className="chat-send" type="submit">
                            Send
                        </button>
                    </form>
                </div>
            ) : (
                // ================= PREVISUALIZACIÓN =================
                <div className="chat-preview-box">
                    <div className="chat-header" onClick={() => setOpen(true)}>
                        <p>Chat preview</p>
                        <p className="chat-header-toggle">Click to show</p>
                    </div>

                    <div
                        className="chat-preview-message"
                        onClick={() => setOpen(true)}
                    >
                        {lastMsg ? (
                            <>
                                <strong>
                                    {lastMsg.isSystem
                                        ? lastMsg.nickname
                                        : lastMsg.nickname === nickname
                                            ? "Tú"
                                            : lastMsg.nickname}
                                    :
                                </strong>{" "}
                                {lastMsg.text.length > 40
                                    ? lastMsg.text.slice(0, 40) + "…"
                                    : lastMsg.text}
                            </>
                        ) : (
                            <span className="no-messages">Waiting new messages</span>
                        )}
                    </div>

                    <form className="chat-input-row chat-input-row--compact" onSubmit={handleSend}>
                        <input
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Write..."
                            maxLength={300}
                        />
                        <button className="chat-send" type="submit">
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
