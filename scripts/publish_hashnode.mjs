import { loadAutomationConfig } from "./lib/config.mjs";
import { appendStepSummary, getCandidatePostFiles, readPostFile, slugify } from "./lib/posts.mjs";

const HASHNODE_API_URL = "https://gql.hashnode.com";
const dryRun = process.env.DRY_RUN === "1";

async function hashnodeRequest(query, variables, token) {
  const response = await fetch(HASHNODE_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    const detail = payload.errors?.map((error) => error.message).join("; ") || JSON.stringify(payload);
    throw new Error(`Hashnode request failed: ${detail}`);
  }

  return payload.data;
}

function buildTagInputs(tags) {
  return tags.slice(0, 5).map((tag) => ({
    name: tag,
    slug: slugify(tag),
  }));
}

const FIND_EXISTING_QUERY = `
  query FindExistingPost($publicationId: ObjectId!, $slug: String!) {
    publication(id: $publicationId) {
      post(slug: $slug) {
        id
        url
        canonicalUrl
      }
    }
  }
`;

const PUBLISH_MUTATION = `
  mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post {
        id
        url
        canonicalUrl
      }
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      post {
        id
        url
        canonicalUrl
      }
    }
  }
`;

const PUBLICATION_QUERY = `
  query Publication($publicationId: ObjectId!) {
    publication(id: $publicationId) {
      id
      title
      url
    }
  }
`;

const config = await loadAutomationConfig();
const enabled = config.platforms.hashnode?.enabled !== false;
const token = process.env.HASHNODE_TOKEN;
const defaultPublicationId = process.env.HASHNODE_PUBLICATION_ID;

if (!enabled) {
  console.log("Hashnode publishing disabled in config.yml.");
  process.exit(0);
}

if (!token) {
  console.log("HASHNODE_TOKEN not set. Skipping Hashnode publish.");
  process.exit(0);
}

const files = await getCandidatePostFiles({
  addedOnly: false,
  fallbackToLatest: process.env.POST_PATH ? false : dryRun,
});
const posts = [];

for (const file of files) {
  const post = await readPostFile(file);
  if (post.data.publish_hashnode !== false) {
    posts.push(post);
  }
}

if (posts.length === 0) {
  console.log("No posts eligible for Hashnode publishing.");
  process.exit(0);
}

const summaryLines = [dryRun ? "### Hashnode Dry Run" : "### Hashnode Publish"];
const publicationCache = new Map();

for (const post of posts) {
  const publicationId =
    post.data.hashnode_publication_id &&
    post.data.hashnode_publication_id !== "USE_DEFAULT"
      ? post.data.hashnode_publication_id
      : defaultPublicationId;

  if (!publicationId) {
    throw new Error(`Missing HASHNODE_PUBLICATION_ID for ${post.relativePath}`);
  }

  if (!publicationCache.has(publicationId)) {
    const publicationData = await hashnodeRequest(
      PUBLICATION_QUERY,
      { publicationId },
      token,
    );

    if (!publicationData.publication) {
      throw new Error(`Hashnode publication ${publicationId} was not found.`);
    }

    publicationCache.set(publicationId, publicationData.publication);
  }

  const existing = await hashnodeRequest(
    FIND_EXISTING_QUERY,
    {
      publicationId,
      slug: post.slug,
    },
    token,
  );

  const input = {
    title: post.title,
    subtitle: post.description,
    publicationId,
    contentMarkdown: post.content,
    publishedAt: post.publishedAt,
    slug: post.slug,
    originalArticleURL: post.canonicalUrl,
    tags: buildTagInputs(post.tags),
  };

  if (post.coverUrl) {
    input.coverImageOptions = {
      coverImageURL: post.coverUrl,
    };
  }

  if (dryRun) {
    const action = existing.publication?.post ? "update" : "create";
    const publication = publicationCache.get(publicationId);
    console.log(`Would ${action} Hashnode post for ${post.relativePath} on ${publication.title}`);
    summaryLines.push(`- ${post.title}: would ${action} Hashnode on ${publication.url}`);
    continue;
  }

  const existingPost = existing.publication?.post;
  const result = existingPost
    ? await hashnodeRequest(
        UPDATE_MUTATION,
        {
          input: {
            ...input,
            id: existingPost.id,
          },
        },
        token,
      )
    : await hashnodeRequest(
        PUBLISH_MUTATION,
        {
          input,
        },
        token,
      );

  const publishedPost = result.updatePost?.post || result.publishPost?.post;
  console.log(`${existingPost ? "Updated" : "Created"} Hashnode post: ${publishedPost.url}`);
  summaryLines.push(`- ${post.title}: ${publishedPost.url}`);
}

await appendStepSummary(summaryLines.join("\n"));
