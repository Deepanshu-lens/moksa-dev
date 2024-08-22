const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:8080/ws");

ws.on("open", function open() {
  console.log("Connected to WebSocket server");
});

ws.on("message", function incoming(message) {
  console.log("Received message:", message);
});

ws.on("error", function error(err) {
  console.error("Error:", err);
});
