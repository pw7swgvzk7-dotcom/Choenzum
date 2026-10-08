// Choenzum server: serves /public and lets the admin save text to public/content.json.
// No dependencies. Run: ADMIN_PASSWORD="your-password" node server.js
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const PORT = process.env.PORT || 3000;
const PASS = process.env.ADMIN_PASSWORD || "choenzum-admin"; // change this before going live
const PUB = path.join(__dirname, "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".js": "text/javascript",
  ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".mp4": "video/mp4", ".ico": "image/x-icon" };

function authed(req) {
  const a = Buffer.from(String(req.headers["x-admin-password"] || ""));
  const b = Buffer.from(PASS);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function send(res, code, body, type) { res.writeHead(code, { "Content-Type": type || "text/plain; charset=utf-8" }); res.end(body); }

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "POST" && url.pathname === "/api/login")
    return authed(req) ? send(res, 200, "ok") : send(res, 401, "unauthorized");
  if (req.method === "POST" && url.pathname === "/api/content") {
    if (!authed(req)) return send(res, 401, "unauthorized");
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 100000) req.destroy(); });
    req.on("end", () => {
      try {
        const obj = JSON.parse(body), clean = {};
        for (const k of Object.keys(obj)) if (typeof obj[k] === "string") clean[k] = obj[k].slice(0, 2000);
        const tmp = path.join(PUB, "content.json.tmp");
        fs.writeFileSync(tmp, JSON.stringify(clean, null, 2));
        fs.renameSync(tmp, path.join(PUB, "content.json"));
        send(res, 200, "saved");
      } catch (e) { send(res, 400, "bad request"); }
    });
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "method not allowed");
  let p = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[\/\\])+/, "");
  if (p === "/" || p === "\\") p = "/index.html";
  const file = path.join(PUB, p);
  if (!file.startsWith(PUB)) return send(res, 403, "forbidden");
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, "not found");
    send(res, 200, data, TYPES[path.extname(file)] || "application/octet-stream");
  });
}).listen(PORT, () => console.log("Choenzum running at http://localhost:" + PORT));
