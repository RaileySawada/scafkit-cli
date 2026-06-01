const supportedPackageManagers = Object.freeze(["npm", "pnpm", "yarn", "bun"]);

function normalizePackageManager(value) {
  const packageManager = String(value || "npm").toLowerCase();

  return supportedPackageManagers.includes(packageManager)
    ? packageManager
    : "npm";
}

module.exports = {
  normalizePackageManager,
  supportedPackageManagers,
};
