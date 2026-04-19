---
layout: page
title: "Projects"
description: "Selected AI, ML, and full-stack projects by Sandeep Salwan."
page_class: "projects-page"
show_page_header: false
---

<section class="projects-layout">
  <div class="projects-layout__main">
    <div class="section-heading">
      <div>
        <span class="section-heading__eyebrow">Build Log</span>
        <h1>Projects</h1>
      </div>
    </div>
    {% include project-grid.html %}
  </div>

  <aside class="projects-layout__rail">
    {% include blog-rail.html limit=4 eyebrow="Blog" title="To the right of the projects" %}
  </aside>
</section>
