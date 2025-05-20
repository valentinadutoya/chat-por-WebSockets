// server.js
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const clients = new Map(); // Map<socket, { username }>

function broadcast(message, exclude) {
    for (const [client] of clients) {
        if (client.readyState === WebSocket.OPEN && client !== exclude) {
            client.send(message);
        }
    }
}

wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "request_username" }));

    socket.on("message", (data) => {
        try {
            const msg = JSON.parse(data.toString());

            if (msg.type === "set_username") {
                clients.set(socket, { username: msg.username });
                socket.send(`[Servidor]: Conectado como "${msg.username}"`);
                broadcast(`[Servidor]: El usuario "${msg.username}" se ha unido al chat.`, socket);
                return;
            }

            if (msg.type === "message") {
                const username = clients.get(socket)?.username || "Anónimo";
                broadcast(`${username}: ${msg.message}`);
            }
        } catch (err) {
            console.error("Error al procesar mensaje:", err);
        }
    });

    socket.on("close", () => {
        const username = clients.get(socket)?.username;
        clients.delete(socket);
        if (username) {
            broadcast(`[Servidor]: El usuario "${username}" ha salido del chat.`);
        }
    });
});

console.log("✅ Servidor WebSocket escuchando en ws://localhost:8080");
