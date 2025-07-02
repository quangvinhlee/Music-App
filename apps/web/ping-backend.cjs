const https = require("https");
const http = require("http");

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

console.log(
  "DEBUG: NEXT_PUBLIC_API_URL during build:",
  process.env.NEXT_PUBLIC_API_URL
);

if (!backendUrl) {
  console.error("NEXT_PUBLIC_API_URL is not set.");
  process.exit(1);
}

const lib = backendUrl.startsWith("https") ? https : http;

console.log("Pinging backend:", backendUrl);

const req = lib.get(backendUrl, (res) => {
  console.log(`Backend responded with status: ${res.statusCode}`);
  process.exit(0);
});

req.on("error", (err) => {
  console.error("Error pinging backend:", err.message);
  process.exit(1);
});
