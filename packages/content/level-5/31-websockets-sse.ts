import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s31",
  level: 5,
  order: 31,
  title: "WebSockets and SSE",
  runner: "server",

  look: `Two ways a server can push data to a client WITHOUT the client having to keep asking.

SSE (Server-Sent Events) is ONE-WAY, server to client, and needs no extra library at all: it is just a normal HTTP response that stays open and streams text formatted as data: ...\\n\\n. Good for things like live scores or notifications, where the client never needs to send anything back over that same connection.

WebSockets are TWO-WAY: after an initial HTTP "upgrade" handshake, both sides can send messages to each other, at any time, over one persistent connection. This strike practices a real WebSocket server (using the ws package), since the two-way, persistent-connection part is the genuinely new idea worth building by hand.

  wss.on("connection", (socket) => {
    socket.on("message", (data) => {
      socket.send("echo: " + data.toString());   // data always arrives as a raw Buffer
    });
  });

Notice buildApp() returns a real http.Server this time, not an Express app: a WebSocket server needs an actual server to attach its "upgrade" handling to.`,

  type: `Finish the connection handler inside buildApp():
1. Listen for incoming messages: socket.on("message", (data) => { ... }).
2. Convert data to text with data.toString().
3. Send it back with the prefix added: socket.send("echo: " + text).`,

  break: `Break it on purpose: send the raw data straight back with socket.send(data), skipping .toString() and the "echo: " prefix entirely. It might look like it still "echoes" the message, but real WebSocket messages arrive as raw binary Buffers, and bouncing one back unprocessed proves nothing about whether your server actually understood it. Convert to text and add the prefix, so the reply is clearly yours.`,

  say: `In one sentence: what makes a WebSocket connection genuinely different from an ordinary HTTP request?`,

  starterCode: `import http from "node:http";
import { WebSocketServer } from "ws";

export function buildApp() {
  const server = http.createServer();
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    // your code here
  });

  return server;
}
`,

  tests: `import { WebSocket } from "ws";

// Starts the server on a free port, sends ONE message over a real socket, and resolves with
// whatever comes back — the real thing an EventSource/WebSocket client would experience.
function connectAndExchange(server, message) {
  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const port = server.address().port;
      const client = new WebSocket("ws://localhost:" + port);
      client.on("open", () => client.send(message));
      client.on("message", (data) => {
        const text = data.toString();
        client.close();
        server.close();
        resolve(text);
      });
      client.on("error", reject);
    });
  });
}

test("echoes a message back, in real time, over a real socket", async () => {
  const received = await connectAndExchange(buildApp(), "hello");
  expect(received).toBe("echo: hello");
});

test("a different message gets echoed back correctly too", async () => {
  const received = await connectAndExchange(buildApp(), "world");
  expect(received).toBe("echo: world");
});
`,

  hints: [
    'socket.on("message", (data) => { ... });',
    "const text = data.toString();",
    'socket.send("echo: " + text);',
  ],

  solution: `=== CODE ===
import http from "node:http";
import { WebSocketServer } from "ws";

export function buildApp() {
  const server = http.createServer();
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    socket.on("message", (data) => {
      socket.send("echo: " + data.toString());
    });
  });

  return server;
}
=== LINE BY LINE ===
new WebSocketServer({ server }) attaches itself to the real http.Server, listening specifically for the "upgrade" handshake a WebSocket client sends — a normal HTTP route handler never sees this at all.
wss.on("connection", ...) fires once PER CLIENT that successfully connects, handing you a socket that stays open until either side closes it — completely unlike a normal request/response, which ends the moment you call res.json(...).
data.toString() matters because WebSocket messages arrive as raw Buffers by default, not strings: skipping this step and echoing raw bytes would still "work" by accident for plain text, but silently break for anything sent as real binary data.`,
};
