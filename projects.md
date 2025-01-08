---
layout: page
title: "Projects"
---

<!-- 
  Quick inline CSS for the "FiSSH-style" card look. 
  Move this into /assets/css/custom.scss if you prefer. 
-->
<style>
  .card-grid {
    display: grid;
    grid-gap: 2rem;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    margin-top: 2rem;
  }
  .card {
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
  }
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.15);
  }
  .card-image {
    width: 100%;
    object-fit: cover;
    display: block;
    background: #f0f0f0;
    height: 180px; /* Adjust height as needed */
  }
  .card-content {
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .card-title {
    font-size: 1.4rem;
    margin: 0.4rem 0 0.2rem;
  }
  .card-subtitle {
    font-size: 0.95rem;
    color: #777;
    margin-bottom: 0.8rem;
  }
  .card-features {
    list-style: none;
    padding-left: 1.2rem;  /* indent bullets */
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  .card-features li {
    position: relative;
    margin-bottom: 0.5rem;
  }
  .card-features li::before {
    content: "•";
    color: #0066cc;
    position: absolute;
    left: -1.2rem;
  }
  .card-tags {
    margin-top: auto; /* so tags sit at the bottom if content is tall */
    padding-top: 0.75rem;
    border-top: 1px solid #eee;
  }
  .tag-pill {
    display: inline-block;
    background-color: #f3f3f3;
    color: #555;
    border-radius: 50px;
    padding: 0.3rem 0.7rem;
    margin-right: 0.4rem;
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
  }
</style>


{% comment %}
  Same custom order as before:
  1) AnimalCare
  2) HealthTech
  3) HouseFinder AI
  4) HousePrice AI
  5) Medical Scribe
  6) Class Projects (Detect Seam + Smart Flashcards)
  7) Phishkill
{% endcomment %}
{% assign custom_order = "AnimalCare|HealthTech|HouseFinder AI|HousePrice AI|Medical Scribe|Class Projects|Phishkill" | split: "|" %}

<div class="card-grid">
  {% for item in custom_order %}
    
    {% if item == "Class Projects" %}
      <!-- Combine "Detect Seam" + "Smart Flashcards" under one single card. -->
      {% assign detect_seam = site.data.projects | where: "name", "Detect Seam" | first %}
      {% assign flashcards = site.data.projects | where: "name", "Smart Flashcards" | first %}
      {% if detect_seam or flashcards %}
        <a class="card" href="#" onclick="return false;" style="cursor: default;">
          <!-- No single link, so we just disable the link or do a # link. -->
          <!-- If you want to link somewhere, you can do so here. -->

          <!-- If you want an image for Class Projects, place it here -->
          <img 
            class="card-image" 
            src="/assets/images/class-projects.jpg" 
            alt="Class Projects" 
          />
          
          <div class="card-content">
            <h2 class="card-title">Class Projects</h2>
            <p class="card-subtitle">Course-based experiments & final assignments</p>

            <ul class="card-features">
              <!-- Detect Seam features -->
              {% if detect_seam %}
                {% for feat in detect_seam.features %}
                  <li><strong>Detect Seam:</strong> {{ feat }}</li>
                {% endfor %}
              {% endif %}
              <!-- Smart Flashcards features -->
              {% if flashcards %}
                {% for feat in flashcards.features %}
                  <li><strong>Smart Flashcards:</strong> {{ feat }}</li>
                {% endfor %}
              {% endif %}
            </ul>
            
            <!-- If you want tags, you can add them manually here: -->
            <div class="card-tags">
              <span class="tag-pill">Java</span>
              <span class="tag-pill">Image Processing</span>
              <span class="tag-pill">Machine Learning</span>
            </div>
          </div>
        </a>
      {% endif %}

    {% else %}
      {% assign project = site.data.projects | where: "name", item | first %}
      {% if project %}
        <!-- Make the entire card clickable to project.link -->
        <a class="card" href="{{ project.link }}" target="_blank">
          <!-- Show project.image if it exists, else fallback -->
          <img 
            class="card-image" 
            src="{{ project.image | default: '/assets/images/placeholder.png' }}" 
            alt="{{ project.name }} cover image" 
          />
          
          <div class="card-content">
            <h2 class="card-title">{{ project.name }}</h2>

            {% if project.subtitle %}
              <p class="card-subtitle">{{ project.subtitle }}</p>
            {% endif %}

            <ul class="card-features">
              {% for feat in project.features %}
                <li>{{ feat }}</li>
              {% endfor %}
            </ul>

            {% if project.tags %}
              <div class="card-tags">
                {% for t in project.tags %}
                  <span class="tag-pill">{{ t }}</span>
                {% endfor %}
              </div>
            {% endif %}
          </div>
        </a>
      {% endif %}
    {% endif %}
    
  {% endfor %}
</div>


 <!-- -->
<!-- ---
layout: page
title: "Projects"
---

<!-- Inline CSS for quick copy-paste. 
     (Alternatively, move this into /assets/css/custom.scss) -->
<!-- <style>
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
</div> -->

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

</div> --> -->