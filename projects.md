---
layout: page
title: "Projects"
---

<div class="projects">
{% for project in site.data.projects %}
<div class="project">
  <h2><a href="{{ project.link }}">{{ project.name }}</a></h2>
  <ul>
    {% for feature in project.features %}
    <li>{{ feature }}</li>
    {% endfor %}
  </ul>
</div>
{% endfor %}

</div>