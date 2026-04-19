import { parse, stringify } from "yaml";

const FRONTMATTER_KEYS = [
  "title",
  "description",
  "slug",
  "date",
  "canonical_url",
  "tags",
  "cover_url",
  "layout",
  "publish_devto",
  "publish_medium",
  "publish_hashnode",
  "hashnode_publication_id",
];

function orderKeys(data) {
  const ordered = {};

  for (const key of FRONTMATTER_KEYS) {
    if (data[key] !== undefined) {
      ordered[key] = data[key];
    }
  }

  for (const key of Object.keys(data)) {
    if (!(key in ordered) && data[key] !== undefined) {
      ordered[key] = data[key];
    }
  }

  return ordered;
}

export function parseFrontmatter(source) {
  if (!source.startsWith("---\n")) {
    return {
      data: {},
      content: source.trim(),
    };
  }

  const closingIndex = source.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    throw new Error("Invalid frontmatter: closing delimiter not found.");
  }

  const yamlSource = source.slice(4, closingIndex);
  const content = source.slice(closingIndex + 5).trim();
  return {
    data: parse(yamlSource) ?? {},
    content,
  };
}

export function serializeFrontmatter(data, content) {
  const ordered = orderKeys(data);
  const yaml = stringify(ordered, {
    lineWidth: 0,
  }).trimEnd();

  if (!content) {
    return `---\n${yaml}\n---\n`;
  }

  return `---\n${yaml}\n---\n\n${content.trim()}\n`;
}
