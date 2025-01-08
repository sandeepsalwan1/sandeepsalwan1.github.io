---
layout: page
title: "Projects"
---

<!-- Inline CSS for quick copy-paste. 
     (Alternatively, move this into /assets/css/custom.scss) -->
<style>
  .card-grid {
    display: grid;
    grid-gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    margin-top: 2rem;
  }
  .card {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 1.5rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
  }
  .card:hover {
    transform: translateY(-5px);
  }
  .card h2 {
    margin-top: 0;
    font-size: 1.4rem;
    color: #333;
  }
  .card ul {
    list-style-type: none;
    padding-left: 0;
    margin-bottom: 1rem;
  }
  .card li {
    margin-bottom: 0.4em;
    position: relative;
    padding-left: 1.2em;
  }
  .card li::before {
    content: "•";
    color: #0066cc;
    position: absolute;
    left: 0;
  }
  .card a {
    color: #0066cc;
    text-decoration: none;
    font-weight: bold;
  }
  .card a:hover {
    text-decoration: underline;
  }
</style>

{% comment %}
  This array sets the order: 
  1) AnimalCare, 2) HealthTech, 3) HouseFinder AI, 4) HousePrice AI,
  5) Medical Scribe, 6) Class Projects (combines Detect Seam + Smart Flashcards), 
  7) Phishkill
{% endcomment %}
{% assign custom_order = "AnimalCare|HealthTech|HouseFinder AI|HousePrice AI|Medical Scribe|Class Projects|Phishkill" | split: "|" %}

<div class="card-grid">
  {% for item in custom_order %}
    
    {% if item == "Class Projects" %}
      <!-- Combine "Detect Seam" + "Smart Flashcards" under one card -->
      <div class="card">
        <h2>Class Projects</h2>
        <ul>
          <!-- Detect Seam Features -->
          {% assign detect_seam = site.data.projects | where: "name", "Detect Seam" | first %}
          {% for feat in detect_seam.features %}
            <li><strong>Detect Seam:</strong> {{ feat }}</li>
          {% endfor %}

          <!-- Smart Flashcards Features -->
          {% assign flashcards = site.data.projects | where: "name", "Smart Flashcards" | first %}
          {% for feat in flashcards.features %}
            <li><strong>Smart Flashcards:</strong> {{ feat }}</li>
          {% endfor %}
        </ul>
        <!-- Could add separate GitHub links if you want: -->
        <a href="{{ detect_seam.link }}" target="_blank">Detect Seam Repo</a> |
        <a href="{{ flashcards.link }}" target="_blank">Smart Flashcards Repo</a>
      </div>
    {% else %}
      <!-- Normal single-project card -->
      {% assign project = site.data.projects | where: "name", item | first %}
      {% if project %}
        <div class="card">
          <h2>{{ project.name }}</h2>
          <ul>
            {% for feat in project.features %}
              <li>{{ feat }}</li>
            {% endfor %}
          </ul>
          <a href="{{ project.link }}" target="_blank">View on GitHub</a>
        </div>
      {% endif %}
    {% endif %}
    
  {% endfor %}
</div>

<!-- ---
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

</div> -->