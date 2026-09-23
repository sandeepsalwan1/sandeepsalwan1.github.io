export function stripDraftWorkpad(content) {
  return content
    .replace(/<!--\s*DRAFT WORKPAD[\s\S]*?END DRAFT WORKPAD\s*-->\s*/gi, "")
    .trim();
}
