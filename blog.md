---
layout: page
title: "Blog"
description: "Writing from Sandeep Salwan on AI engineering, systems, and product building."
---

<div class="blog-list-minimal">
  {% if site.posts and site.posts.size > 0 %}
    <ul class="blog-post-list">
      {% for post in site.posts %}
        <li>
          <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
          <p class="blog-post-list__meta">{{ post.date | date: site.date_format }}</p>
          <p>{{ post.description | default: post.excerpt | strip_html | strip_newlines | truncate: 180 }}</p>
        </li>
      {% endfor %}
    </ul>
  {% else %}
    <p>No posts yet.</p>
  {% endif %}
</div>
