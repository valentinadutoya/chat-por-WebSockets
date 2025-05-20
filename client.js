// client.js
import WebSocket from "ws";
import readline from "readline";
import chalk from "chalk";

const ws = new WebSocket("ws://localhost:8080");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let username = "";

function promptInput() {
    rl.question("", (input) => {
        if (input.trim().toLowerCase() === "/salir") {
            console.log(chalk.yellow("[Cliente]: Cerrando conexión..."));
            ws.close();
            rl.close();
            return;
        }

        ws.send(JSON.stringify({ type: "message", message: input }));
        promptInput();
    });
}

ws.on("open", () => {
    // conexión establecida
});

ws.on("message", (data) => {
    try {
        const msg = JSON.parse(data.toString());

        if (msg.type === "request_username") {
            rl.question("Bienvenido al chat. Ingresa tu nombre de usuario: ", (name) => {
                username = name.trim();
                ws.send(JSON.stringify({ type: "set_username", username }));
            });
            return;
        }

        console.log(chalk.cyan(msg));
        if (username) promptInput();
    } catch {
        console.log(chalk.cyan(data.toString()));
        if (username) promptInput();
    }
});

ws.on("close", () => {
    console.log(chalk.red("\n[Cliente]: Desconectado del servidor."));
    rl.close();
});
