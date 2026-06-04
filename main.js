async function run() {
  try {
    // dotenv is loaded in dist/server.js (from src/server.ts)
    require("./dist/server.js");
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

void run();
