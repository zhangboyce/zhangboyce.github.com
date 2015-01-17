---
layout: page
title: Hi world
tagline: Supporting tagline
---

<ul class="posts">
  {% for post in site.posts %}
    <li><span></span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  	<p>{{ post.excerpt }}</p>
  {% endfor %}
</ul>



