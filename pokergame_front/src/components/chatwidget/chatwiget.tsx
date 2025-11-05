import { useEffect, useRef, useState } from "react";
import { createSocket } from "../../socket";
import "./chat-widget.css";

type ChatMsg = { id: string; userId: string; text: string; ts: number };

export default function ChatWidget({ tableId, userId }: { tableId: string; userId: string }) {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [text, setText] = useState("");
    const [expanded, setExpanded] = useState(false);
    const listRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const socket = createSocket();
        socket.on("chat:message", (msg: ChatMsg) => {
            setMessages((prev) => [...prev.slice(-99), msg]);
        });
        return () => {
            socket.off("chat:message");
        };
    }, [tableId]);

    useEffect(() => {
        if (expanded && listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [expanded, messages.length]);

    const last = messages[messages.length - 1];

    const send = () => {
        const t = text.trim();
        if (!t) return;
        const socket = createSocket();
        socket.emit("chat:send", { tableId, userId, text: t });
        setText("");
    };

    return (
        <div className={`chatWidget ${expanded ? "expanded" : "collapsed"}`}>
            {expanded && (
                <div className="chatList" ref={listRef}>
                    {messages.map((m) => (
                        <div className={`chatItem ${m.userId === userId ? "mine" : "theirs"}`} key={m.id}>
                            <span className="txt">{m.text}</span>
                        </div>
                    ))}
                </div>
            )}

            {!expanded && (
                <div className="lastMsg" title={last?.text || "Sin mensajes"}>
                    {last?.text ?? "Sin mensajes"}
                </div>
            )}

            <div className="composer">
                <input
                    className="chatInput"
                    placeholder="Escribe..."
                    value={text}
                    onFocus={() => setExpanded(true)}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                />
                <button className="sendBtn" onClick={send}>Enviar</button>
                {expanded && (
                    <button className="closeBtn" onClick={() => setExpanded(false)}>×</button>
                )}
            </div>
        </div>
    );
}
