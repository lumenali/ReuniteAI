const fs = require("fs");
const path = require("path");

exports.default = async function afterPack(context) {
  const projectDir = context.projectDir || context.packager.projectDir;
  const source = path.join(projectDir, ".next", "standalone", "node_modules");
  const target = path.join(context.appOutDir, "resources", "standalone", "node_modules");
  if (!fs.existsSync(source)) {
    throw new Error("Missing .next/standalone/node_modules. Run next build before packaging.");
  }
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true });
};
