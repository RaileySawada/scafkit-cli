const templates = Object.freeze(["php", "pern", "react"]);

function getTemplates() {
  return [...templates];
}

function isTemplateName(value) {
  return templates.includes(String(value || "").toLowerCase());
}

module.exports = {
  getTemplates,
  isTemplateName,
};
