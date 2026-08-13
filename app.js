function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function renderCard(story) {
  return `
    <article class="story-card">
      <img class="story-thumb" src="${escapeHtml(story.image)}" alt="${escapeHtml(story.title)}" />
      <div class="story-body">
        <div class="story-meta"><span>${escapeHtml(story.tag1)}</span><span>${escapeHtml(story.tag2)}</span></div>
        <h3>${escapeHtml(story.title)}</h3>
        <p>${escapeHtml(story.description)}</p>
        <div class="story-footer">
          <span class="story-time">${escapeHtml(story.readtime)}</span>
          <a class="story-button" href="${escapeHtml(story.link || "#")}">Read Story</a>
        </div>
      </div>
    </article>
  `;
}

fetch("content/stories.json")
  .then((res) => res.json())
  .then((data) => {
    const stories = data.stories || [];
    const grids = document.querySelectorAll(".story-grid[data-section]");
    grids.forEach((grid) => {
      const section = grid.getAttribute("data-section");
      const items = stories.filter((s) => s.section === section);
      grid.innerHTML = items.map(renderCard).join("");
    });
  })
  .catch((err) => {
    console.error("Could not load stories:", err);
  });
