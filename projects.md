---
layout: page
title: "Projects"
---

<style>
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .projects-with-blog {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 20px;
    align-items: start;
    position: relative;
    z-index: 1;
  }

  .card {
    animation: fadeInUp 0.6s ease forwards;
    opacity: 0;
  }

  .card:nth-child(1) { animation-delay: 0.1s; }
  .card:nth-child(2) { animation-delay: 0.2s; }
  .card:nth-child(3) { animation-delay: 0.3s; }
  .card:nth-child(4) { animation-delay: 0.4s; }
  .card:nth-child(5) { animation-delay: 0.5s; }
  .card:nth-child(6) { animation-delay: 0.6s; }
  .card:nth-child(7) { animation-delay: 0.7s; }
  .card:nth-child(8) { animation-delay: 0.8s; }

  .card img {
    transition: transform 0.4s ease;
  }

  .card:hover img {
    transform: scale(1.05);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    grid-gap: 20px;
    margin-top: 2rem;
    position: relative;
    z-index: 1;
  }

  .card {
    background-color: rgba(44, 44, 44, 0.85);
    color: #fff;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    text-decoration: none;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.6s ease;
    backdrop-filter: blur(3px);
  }

  .card:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4);
  }

  .card img {
    width: 100%;
    object-fit: cover;
    height: 160px;
    background: #f0f0f0;
  }

  .card-content {
    padding: 1rem;
    flex-grow: 1;
  }

  .card-title {
    margin: 0 0 0.3rem;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .card-subtitle {
    margin: 0 0 0.8rem;
    font-size: 0.9rem;
    color: #aaa;
  }

  .card ul {
    list-style: none;
    padding-left: 1.3rem;
    line-height: 1.4;
    margin-bottom: 0.8rem;
  }

  .card ul li {
    position: relative;
    margin-bottom: 0.4rem;
  }

  .card ul li::before {
    content: "•";
    color: #0066cc;
    position: absolute;
    left: -1.3rem;
  }

  .tag-pill {
    display: inline-block;
    background: #333;
    border-radius: 20px;
    padding: 0.2rem 0.6rem;
    font-size: 0.75rem;
    margin-right: 0.4rem;
    color: #ccc;
  }

  .blog-sidebar {
    margin-top: 2rem;
    background-color: rgba(44, 44, 44, 0.85);
    color: #fff;
    border-radius: 6px;
    padding: 1rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(3px);
  }

  .blog-sidebar h2 {
    margin: 0 0 0.75rem;
    font-size: 1.15rem;
    text-align: left;
  }

  .blog-sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .blog-sidebar li + li {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .blog-sidebar time {
    display: block;
    margin-bottom: 0.35rem;
    color: #aaa;
    font-size: 0.85rem;
  }

  .blog-sidebar a {
    color: #fff;
    text-decoration: none;
  }

  .blog-sidebar a:hover {
    text-decoration: underline;
  }

  .blog-sidebar p {
    margin: 0.35rem 0 0;
    color: #ccc;
    line-height: 1.4;
  }

  .blog-sidebar__all {
    margin: 1rem 0 0;
  }

  @media (max-width: 900px) {
    .projects-with-blog {
      grid-template-columns: 1fr;
    }

    .blog-sidebar {
      margin-top: 0;
    }
  }
</style>

<div class="projects-with-blog">
  <div class="card-grid">
    {% for project in site.data.projects %}
      <a class="card" href="{{ project.link | relative_url }}">
        <img src="{{ project.image | relative_url }}" alt="{{ project.name }} cover" />
        <div class="card-content">
          <h2 class="card-title">{{ project.name }}</h2>
          {% if project.subtitle %}
            <p class="card-subtitle">{{ project.subtitle }}</p>
          {% endif %}

          <ul>
            {% for feat in project.features %}
              <li>{{ feat }}</li>
            {% endfor %}
          </ul>

          {% if project.tags %}
            {% for t in project.tags %}
              <span class="tag-pill">{{ t }}</span>
            {% endfor %}
          {% endif %}
        </div>
      </a>
    {% endfor %}
  </div>

  <aside class="blog-sidebar">
    <h2>Blog</h2>
    {% if site.posts and site.posts.size > 0 %}
      <ul>
        {% for post in site.posts limit: 3 %}
          <li>
            <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: site.date_format }}</time>
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
            <p>{{ post.description | default: post.excerpt | strip_html | strip_newlines | truncate: 100 }}</p>
          </li>
        {% endfor %}
      </ul>
      <p class="blog-sidebar__all"><a href="{{ '/blog/' | relative_url }}">View all posts</a></p>
    {% else %}
      <p>No posts yet.</p>
    {% endif %}
  </aside>
</div>
