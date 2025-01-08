---
layout: page
title: "Projects"
---

<!-- Optional inline CSS for a grid of cards -->
<style>
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    grid-gap: 20px;
    margin-top: 2rem;
  }
  .card {
    background-color: #fff;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.15);
  }
  .card img {
    width: 100%;
    object-fit: cover;
    height: 160px; /* adjust as needed */
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
    color: #777;
  }
  .card ul {
    list-style: none;
    padding-left: 1.3rem; /* indent bullets a bit */
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
    background: #f2f2f2;
    border-radius: 20px;
    padding: 0.2rem 0.6rem;
    font-size: 0.75rem;
    margin-right: 0.4rem;
    color: #555;
  }
</style>

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
