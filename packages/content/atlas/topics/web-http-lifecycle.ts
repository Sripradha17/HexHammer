// Topic: The HTTP request/response lifecycle. A COMPLETE topic.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const webHttpLifecycle: Topic = {
  id: "web-http-lifecycle",
  domainId: "",
  moduleId: "",
  title: "What happens when you press Enter: the HTTP lifecycle",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Describe, in order, the steps from typing a URL to the browser receiving a response (DNS, TCP, TLS, request, server work, response).",
    "Read a raw HTTP request and response and name the method, path, headers, status code and body.",
    "Choose the right HTTP method and status code for a situation, including which methods are safe and idempotent.",
    "Explain where request latency comes from and how keep-alive and caching reduce it.",
  ],
  prerequisites: ["web-internet-dns"],
  subtopics: ["URL anatomy", "DNS lookup", "TCP and TLS handshakes", "Request line and headers", "Status code families", "Safe and idempotent methods", "Keep-alive and connection reuse"],
  strikeIds: ["l5-s01", "l4-s10"],

  story:
    "A user says 'the site is slow'. Your server logs say every request finishes in 40 ms. Both are telling the truth: the user is waiting for DNS, two handshakes, a redirect and a cold cache before your 40 ms even starts. You cannot fix what you cannot see, and the HTTP lifecycle is the map of everything that happens outside your code.",
  mentalModel: {
    plain:
      "HTTP is a conversation made of text messages. The browser finds the server's address (DNS), opens a reliable line to it (TCP), makes the line private (TLS), sends one request message, and waits for one response message. Your backend code only runs in the middle of that.",
    analogy:
      "Ordering by post: look up the shop's address in a directory (DNS), agree with the postal service on a tracked route (TCP), seal your envelope so no one can read it (TLS), send an order form with a clear request at the top (method + path) and notes on the back (headers), then receive a reply with a result code (status) and the goods (body).",
    analogyLimit:
      "Post is one letter per trip. Real HTTP connections are reused for many requests (keep-alive), and HTTP/2 and HTTP/3 send many requests at once over one connection, so the 'one trip per order' picture overstates the cost of later requests.",
  },
  lessonSections: [
    {
      heading: "1. The URL is an address with parts",
      body:
        "`https://shop.example.com:443/orders?page=2#top`\n\nScheme (`https`) says the protocol. Host (`shop.example.com`) is the server name. Port (`443`, the default for https) is the door. Path (`/orders`) and query (`?page=2`) say what you want. The fragment (`#top`) never leaves the browser.",
    },
    {
      heading: "2. DNS: from a name to an IP address",
      body:
        "Computers connect to IP addresses, not names. The browser asks DNS 'what is the IP for shop.example.com?'. Answers are cached by the browser, the OS and resolvers for a time-to-live (TTL), which is why a fresh lookup is slower than a repeat one.",
    },
    {
      heading: "3. TCP and TLS: a reliable, private line",
      body:
        "TCP opens a connection with a three-way handshake (SYN, SYN-ACK, ACK) so bytes arrive complete and in order. Then TLS agrees on encryption keys and checks the server's certificate, so nobody in between can read or change the messages.\n\nEach handshake costs network round trips. That is why reusing a connection (keep-alive) makes the second request much faster than the first.",
    },
    {
      heading: "4. The request message",
      body:
        "A request is a start line, headers, a blank line, then an optional body:\n\n`POST /orders HTTP/1.1`\n`Host: shop.example.com`\n`Content-Type: application/json`\n\n`{\"sku\":\"A1\",\"qty\":2}`\n\nThe method says the intent: GET reads, POST creates or triggers, PUT replaces, PATCH changes part, DELETE removes.",
    },
    {
      heading: "5. Safe and idempotent",
      body:
        "Safe methods (GET, HEAD, OPTIONS) must not change data. Idempotent methods (GET, PUT, DELETE and the safe ones) give the same end state if sent once or five times. POST is neither, which is why a double-clicked 'Pay' button can charge twice unless the server adds an idempotency key.",
    },
    {
      heading: "6. The server's turn, then the response",
      body:
        "The server routes the request, runs middleware (logging, auth, validation), talks to databases or other services, and writes a response: status line, headers, body.\n\nStatus families: 2xx success (200 OK, 201 Created, 204 No Content), 3xx redirect (301, 304 Not Modified), 4xx the client's problem (400, 401, 403, 404, 409, 429), 5xx the server's problem (500, 502, 503).",
    },
    {
      heading: "7. Where the time goes",
      body:
        "Total time = DNS + TCP + TLS + time to first byte (your server work) + download. In browser DevTools, the Network tab's Timing view shows each part separately. Caching headers (`Cache-Control`, `ETag`) can remove whole round trips: a 304 Not Modified sends no body at all.",
    },
  ],
  visualizationType: "http-journey",
  codeExamples: [
    {
      title: "A tiny server and a real request against it (Node 18+)",
      language: "js",
      code: `import http from "node:http";

const server = http.createServer((req, res) => {
  console.log(req.method, req.url, req.headers["accept"]);
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ id: 42 }));
});

server.listen(3000, async () => {
  const r = await fetch("http://localhost:3000/orders", {
    method: "POST",
    headers: { accept: "application/json" },
  });
  console.log(r.status, r.headers.get("content-type"), await r.json());
  server.close();
});`,
      expectedOutput: `POST /orders application/json
201 application/json { id: 42 }`,
      steps: [
        "createServer registers a function that runs once per incoming request.",
        "listen opens port 3000; when ready, the callback sends a request with fetch.",
        "Because the host is localhost, DNS is skipped and plain http means no TLS: only TCP is set up.",
        "The server logs the method, the path and the Accept header it received.",
        "It replies with status 201 Created, a Content-Type header and a JSON body.",
        "fetch resolves with the status and headers first; r.json() reads and parses the body.",
      ],
    },
    {
      title: "The same exchange as raw text on the wire (HTTP/1.1)",
      language: "http",
      code: `POST /orders HTTP/1.1
Host: localhost:3000
Accept: application/json
Content-Length: 0

HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 9

{"id":42}`,
      expectedOutput: "Request: start line + headers + empty body. Response: status 201, two headers, a 9-byte JSON body.",
      steps: [
        "The first line is the request line: method, path, protocol version.",
        "Headers are 'Name: value' lines; Host is required in HTTP/1.1.",
        "A blank line ends the headers. Content-Length says how many body bytes follow.",
        "The response starts with a status line: version, code, reason phrase.",
      ],
    },
  ],
  practicalApplication:
    "When a page feels slow, open DevTools → Network, click the slow request and read its Timing breakdown. Long DNS/connect times point to connection setup (use keep-alive, preconnect, fewer origins). A long 'waiting for server response' (TTFB) points to your backend. A long download points to payload size (compress, paginate).",
  commonMistakes: [
    { mistake: "Returning 200 with `{ error: ... }` for failures.", symptom: "Clients, caches and monitoring treat failures as successes.", fix: "Use real 4xx/5xx status codes and put details in the body." },
    { mistake: "Changing data in a GET handler.", symptom: "Prefetchers, crawlers or retries trigger deletions or duplicate actions.", fix: "Keep GET safe. Use POST/PUT/PATCH/DELETE for changes." },
    { mistake: "Confusing 401 and 403.", symptom: "Clients prompt for login when the user is logged in but lacks permission.", fix: "401 = not authenticated (who are you?). 403 = authenticated but not allowed." },
  ],
  misconceptions: [
    { myth: "HTTPS makes the server 'secure'.", truth: "HTTPS protects the data in transit. It does nothing about bugs, injection or weak auth on the server." },
    { myth: "The fragment (#section) is sent to the server.", truth: "Browsers never send the fragment; it is handled entirely client-side." },
    { myth: "Every request opens a new connection.", truth: "Connections are reused (keep-alive in HTTP/1.1, multiplexing in HTTP/2 and HTTP/3)." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l5-s01", why: "Build real Express routes that return the right methods, status codes and headers, checked by real HTTP requests." },
    { kind: "strike", strikeId: "l4-s10", why: "Call fetch from a real page and handle status codes on the client side." },
    { kind: "lab", lab: "http-journey", task: "Send requests through the journey lab and toggle the cache and keep-alive switches.", goal: "Get a repeat request's simulated total time below 50 ms and explain which steps disappeared." },
    {
      kind: "predict",
      question: {
        id: "web-http-lifecycle-p1",
        prompt: "A client sends `DELETE /carts/7` three times because of retries. With a correctly designed API, what is the end state?",
        choices: ["Three carts deleted", "Cart 7 deleted; later calls return 404 or 204, with no other effect", "An error, because DELETE cannot be retried", "Cart 7 restored"],
        answerIndex: 1,
        explanation: "DELETE is idempotent: the END STATE is the same after one or many calls (cart 7 is gone). The status code of repeats may differ (404 or 204), and that is fine: idempotency is about state, not identical responses.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    { id: "web-http-lifecycle-k1", prompt: "Which happens FIRST when you visit a new https site?", choices: ["TLS handshake", "DNS lookup", "HTTP GET request", "TCP handshake"], answerIndex: 1, explanation: "You need the IP address (DNS) before you can open a TCP connection, then TLS runs on top of TCP, then the HTTP request is sent.", objective: 0 },
    { id: "web-http-lifecycle-k2", prompt: "Which status code means 'you are logged in, but not allowed to do this'?", choices: ["400", "401", "403", "404"], answerIndex: 2, explanation: "403 Forbidden. 401 means the request is not authenticated.", objective: 2 },
  ],
  project: {
    title: "Request Inspector",
    summary: "A small local web tool that sends a request you design (method, URL, headers, body) to a local echo server and displays the full request and response, including timing for each phase you can measure.",
    type: "implementation",
    objectivesCovered: [1, 2, 3],
    requirements: [
      "A local echo server (Node) that returns the method, path, headers and body it received as JSON.",
      "A page with a form to choose method, path, headers and a JSON body.",
      "Display the response status, headers and body, colour-coded by status family.",
      "Show timing using the browser's PerformanceResourceTiming entries where available.",
      "Explain in the UI whether the chosen method is safe and/or idempotent.",
    ],
    acceptanceCriteria: [
      "An integration test (supertest) proves the echo server returns exactly the headers it was sent.",
      "Sending POST without a body to a route that needs one returns 400 with a helpful message.",
      "Status codes 2xx, 3xx, 4xx, 5xx are visually distinct AND labelled in text (not colour alone).",
      "The method help text matches the HTTP semantics spec (RFC 9110) for GET, POST, PUT, PATCH, DELETE.",
    ],
    technologies: ["Node.js", "Express", "fetch", "Performance API", "Vitest + supertest"],
    milestones: [
      { title: "Echo server", done_when: "GET/POST/PUT/DELETE all echo correctly in tests." },
      { title: "Request builder UI", done_when: "You can send any method with headers and a body." },
      { title: "Response view", done_when: "Status, headers and body are shown with text labels." },
      { title: "Timing", done_when: "DNS/connect/TTFB/download are displayed when the browser exposes them." },
    ],
    testIdeas: ["Echo of custom headers", "Large bodies", "Invalid JSON returns 400", "HEAD returns no body"],
    stretchGoals: ["Add an ETag to the echo server and show a 304 on repeat requests."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "web-http-lifecycle-a1", prompt: "Put these in order for a first visit to an https URL.", choices: ["TCP → DNS → TLS → HTTP", "DNS → TCP → TLS → HTTP", "DNS → TLS → TCP → HTTP", "HTTP → DNS → TCP → TLS"], answerIndex: 1, explanation: "Name to IP (DNS), then a TCP connection, then TLS on top of it, then the HTTP request inside the encrypted channel.", objective: 0 },
      { id: "web-http-lifecycle-a2", prompt: "In `GET /users?id=3 HTTP/1.1`, what is `/users?id=3`?", choices: ["The host", "The request target (path and query)", "A header", "The body"], answerIndex: 1, explanation: "The request line is method, request target (path + query), protocol version.", objective: 1 },
      { id: "web-http-lifecycle-a3", prompt: "Which header tells the server what format the request body is in?", choices: ["Accept", "Content-Type", "Host", "Cache-Control"], answerIndex: 1, explanation: "Content-Type describes the body being sent. Accept says what formats the client wants back.", objective: 1 },
      { id: "web-http-lifecycle-a4", prompt: "Creating a new order succeeded. Which status is most appropriate?", choices: ["200 OK", "201 Created", "204 No Content", "302 Found"], answerIndex: 1, explanation: "201 Created signals a new resource, usually with a Location header pointing to it.", objective: 2 },
      { id: "web-http-lifecycle-a5", prompt: "Which method is NOT idempotent?", choices: ["GET", "PUT", "DELETE", "POST"], answerIndex: 3, explanation: "Repeating a POST can create a second resource or a second charge. PUT replaces with the same content, DELETE leaves it deleted.", objective: 2 },
      { id: "web-http-lifecycle-a6", prompt: "The second request to the same server is much faster than the first, with identical server work. Most likely why?", choices: ["The server warmed up its CPU", "The connection was reused, so DNS, TCP and TLS setup were skipped", "HTTP/1.1 is faster for second requests by design", "The browser compressed the request"], answerIndex: 1, explanation: "Cached DNS and a reused (keep-alive) connection remove several network round trips.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "web-http-lifecycle-q01", tags: ["http", "networking"], difficulty: "core", kind: "concept", prompt: "Walk me through what happens when you type a URL into the browser and press Enter.", expectedElements: ["URL parsing", "DNS resolution and caching", "TCP handshake", "TLS handshake and certificate check", "HTTP request", "server processing", "response", "rendering"], modelAnswer: "The browser parses the URL, then resolves the host to an IP with DNS, checking its caches first. It opens a TCP connection and, for https, performs a TLS handshake that verifies the server certificate and agrees on keys. It sends an HTTP request with method, path and headers. The server routes it, runs middleware and business logic, maybe queries a database, and returns a status, headers and body. The browser then parses the HTML, requests sub-resources over the same or new connections, builds the DOM and CSSOM, lays out and paints.", explanation: "Depth matters: mention caching and connection reuse to stand out.", commonWrongAnswers: ["The browser downloads the website."], followUps: ["Where can a CDN cut this short?", "What changes with HTTP/2?"] },
    { id: "web-http-lifecycle-q02", tags: ["http", "methods"], difficulty: "foundation", kind: "concept", prompt: "What is the difference between safe and idempotent methods? Give examples.", expectedElements: ["safe = no state change", "idempotent = same end state on repeat", "GET safe+idempotent", "PUT/DELETE idempotent not safe", "POST neither"], modelAnswer: "A safe method must not change server state: GET, HEAD, OPTIONS. An idempotent method can be repeated with the same end state as doing it once: all safe methods plus PUT and DELETE. POST is neither, which is why retrying a POST needs an idempotency key.", explanation: "Idempotency is about state, not about getting identical responses.", commonWrongAnswers: ["Idempotent means the response is always the same."] },
    { id: "web-http-lifecycle-q03", tags: ["http", "status-codes"], difficulty: "foundation", kind: "concept", prompt: "When do you return 400, 401, 403, 404, 409 and 429?", expectedElements: ["400 malformed/invalid input", "401 unauthenticated", "403 forbidden", "404 not found", "409 conflict with current state", "429 rate limited"], modelAnswer: "400 when the request is malformed or fails validation; 401 when it is not authenticated; 403 when the caller is authenticated but not permitted; 404 when the resource does not exist (or is hidden from this caller); 409 when it conflicts with current state, such as a duplicate username or a stale version; 429 when the client is sending too many requests, ideally with Retry-After.", explanation: "Using 404 instead of 403 to avoid revealing a resource exists is a valid security choice; say so.", commonWrongAnswers: ["401 and 403 are interchangeable."] },
    { id: "web-http-lifecycle-q04", tags: ["http", "performance"], difficulty: "core", kind: "scenario", prompt: "Server logs show 40 ms per request but users report 1.5 s page loads. Where do you look?", expectedElements: ["DevTools timing breakdown", "DNS/connect/TLS", "redirect chains", "many sequential requests/waterfall", "payload size", "client rendering"], modelAnswer: "I would compare the server's view with the user's. In the browser's Network timing I would check DNS, connect and TLS time, redirects, time to first byte, and download time, and look at the waterfall for long chains of sequential requests. Then I would check payload sizes and compression, and client-side rendering cost. Server time is only one slice of the total.", explanation: "Shows you understand the full lifecycle, not just your code.", commonWrongAnswers: ["Scale up the servers."] },
    { id: "web-http-lifecycle-q05", tags: ["http", "headers"], difficulty: "foundation", kind: "concept", prompt: "What is the difference between Content-Type and Accept?", expectedElements: ["Content-Type describes the body sent", "Accept is what the client wants back", "content negotiation"], modelAnswer: "Content-Type describes the format of the body in the message it is on, request or response. Accept is a request header listing the formats the client would like in the response. The server uses Accept for content negotiation and labels its reply with its own Content-Type.", explanation: "A classic bug: sending JSON without Content-Type: application/json, so the server's JSON parser ignores it.", commonWrongAnswers: ["They are the same header for different directions."] },
    { id: "web-http-lifecycle-q06", tags: ["http", "debugging"], difficulty: "core", kind: "debugging", prompt: "Your Express route receives `req.body` as undefined for a JSON POST from the frontend. Name two likely causes.", expectedElements: ["missing express.json() middleware", "missing/wrong Content-Type header", "middleware order"], modelAnswer: "First, the JSON body-parsing middleware (`express.json()`) may not be registered, or it is registered after the route. Second, the client may not be sending `Content-Type: application/json`, so the parser skips the body. Checking the request headers in DevTools tells you which.", explanation: "Ties HTTP headers to middleware order.", commonWrongAnswers: ["fetch cannot send bodies with POST."] },
    { id: "web-http-lifecycle-q07", tags: ["http", "versions"], difficulty: "advanced", kind: "concept", prompt: "What problem does HTTP/2 multiplexing solve, and what does HTTP/3 change underneath?", expectedElements: ["HTTP/1.1 one request at a time per connection", "head-of-line blocking", "HTTP/2 many streams on one TCP connection", "TCP-level HOL blocking remains", "HTTP/3 over QUIC/UDP"], modelAnswer: "With HTTP/1.1 a connection handles one request at a time, so browsers opened several connections and requests still queued behind each other. HTTP/2 multiplexes many streams over a single TCP connection. But a lost TCP packet still stalls every stream, which is TCP head-of-line blocking. HTTP/3 runs over QUIC on UDP, so loss on one stream does not block the others, and it combines the transport and TLS handshakes.", explanation: "This is version-specific knowledge; the radar tracks changes here.", commonWrongAnswers: ["HTTP/2 is just compressed HTTP/1.1."] },
    { id: "web-http-lifecycle-q08", tags: ["http", "caching"], difficulty: "core", kind: "concept", prompt: "How does a 304 Not Modified response save time?", expectedElements: ["conditional request If-None-Match/If-Modified-Since", "ETag/Last-Modified", "no body sent", "still a round trip"], modelAnswer: "The browser keeps the old copy plus its ETag or Last-Modified value. On the next request it sends If-None-Match or If-Modified-Since. If nothing changed, the server replies 304 with no body, so the download is skipped, although the round trip still happens. Cache-Control max-age can skip even that round trip while the copy is fresh.", explanation: "Distinguish revalidation (304) from freshness (no request at all).", commonWrongAnswers: ["304 means the server is down."] },
    { id: "web-http-lifecycle-q09", tags: ["http", "design"], difficulty: "core", kind: "design", prompt: "A 'Pay' button sometimes charges customers twice. Using what you know about HTTP, how would you fix it?", expectedElements: ["POST not idempotent", "idempotency key header", "server stores key → result", "disable button is not enough"], modelAnswer: "POST is not idempotent, so retries and double clicks create duplicate charges. The client generates a unique idempotency key per payment attempt and sends it in a header. The server stores the key with the result in the same transaction as the charge, and if the key is seen again it returns the stored result instead of charging again. Disabling the button helps the UX, but it does not stop network retries.", explanation: "This bridges HTTP semantics and distributed systems.", commonWrongAnswers: ["Change POST to GET."] },
    { id: "web-http-lifecycle-q10", tags: ["http", "behavioral"], difficulty: "foundation", kind: "behavioral", prompt: "Tell me about a time you diagnosed a slow or failing request. How did you narrow it down?", expectedElements: ["situation", "evidence gathered (logs, DevTools, timings)", "hypothesis and test", "result", "what you changed afterwards"], modelAnswer: "Use STAR. Situation: what was failing and for whom. Task: your responsibility. Action: the evidence you collected (browser timing, server logs with correlation IDs, reproduction steps), the hypotheses you ruled out and how. Result: the measured improvement. End with what you changed to catch it earlier next time, such as an alert or a test.", explanation: "Interviewers look for evidence-driven debugging, not guessing.", commonWrongAnswers: ["I restarted the server and it worked."] },
  ],
  references: [
    { title: "RFC 9110: HTTP Semantics", url: "https://www.rfc-editor.org/rfc/rfc9110", kind: "spec" },
    { title: "MDN: An overview of HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", kind: "official-docs" },
    { title: "MDN: HTTP response status codes", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Request/response, methods, status code families, idempotency and the DNS → connect → request order."],
  versionSpecific: ["HTTP/2 and HTTP/3 transport details", "Browser DevTools panel names and timing labels"],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
