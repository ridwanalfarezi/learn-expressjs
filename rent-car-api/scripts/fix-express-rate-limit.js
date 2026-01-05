const fs = require("fs");
const path = require("path");

const targetDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "express-rate-limit",
  "source"
);
const targetFile = path.join(targetDir, "index.ts");

(async () => {
  try {
    await fs.promises.mkdir(targetDir, { recursive: true });
    const content =
      "// Auto-generated to satisfy express-rate-limit tsconfig\nexport {};\n";
    await fs.promises.writeFile(targetFile, content, "utf8");
    console.log("Patched express-rate-limit tsconfig inputs");
  } catch (err) {
    console.error("Failed to patch express-rate-limit tsconfig inputs", err);
    process.exitCode = 1;
  }
})();
