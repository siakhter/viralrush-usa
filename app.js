function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderCard(story) {
  const storyUrl = "story.html?s=" + encodeURIComponent(slugify(story.title));
  return `
    <article class="story-card">
      <img class="story-thumb" src="${escapeHtml(story.image)}" alt="${escapeHtml(story.title)}" />
      <div class="story-body">
        <div class="story-meta"><span>${escapeHtml(story.tag1)}</span><span>${escapeHtml(story.tag2)}</span></div>
        <h3>${escapeHtml(story.title)}</h3>
        <p>${escapeHtml(story.description)}</p>
        <div class="story-footer">
          <span class="story-time">${escapeHtml(story.readtime)}</span>
          <a class="story-button" href="${storyUrl}">Read Story</a>
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

fetch("content/settings.json")
  .then((res) => res.json())
  .then((settings) => {
    setText("contact-heading", settings.contact_heading);
    setText("contact-subtext", settings.contact_subtext);
    setText("contact-description", settings.contact_description);
    setText("contact-email", settings.contact_email);
    if (settings.contact_focus) {
      setText("contact-focus-item", "Focus: " + settings.contact_focus);
    }
    if (settings.contact_audience) {
      setText("contact-audience-item", "Audience: " + settings.contact_audience);
    }
  })
  .catch((err) => {
    console.error("Could not load settings:", err);
  });

function setText(id, value) {
  if (!value) return;
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

const modalOverlay = document.getElementById("contact-modal-overlay");
const openBtn = document.getElementById("contact-open-form");
const closeBtn = document.getElementById("contact-modal-close");
const contactForm = document.getElementById("contact-form");
const successMsg = document.getElementById("contact-form-success");
const errorMsg = document.getElementById("contact-form-error");

function openModal() {
  if (modalOverlay) modalOverlay.hidden = false;
}
function closeModal() {
  if (modalOverlay) modalOverlay.hidden = true;
}

if (openBtn) openBtn.addEventListener("click", openModal);
if (closeBtn) closeBtn.addEventListener("click", closeModal);
if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (successMsg) successMsg.hidden = true;
    if (errorMsg) errorMsg.hidden = true;

    const formData = new FormData(contactForm);
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(() => {
        if (successMsg) successMsg.hidden = false;
        contactForm.reset();
      })
      .catch(() => {
        if (errorMsg) errorMsg.hidden = false;
      });
  });
}

function injectAdCode(containerId, rawCode) {
  const container = document.getElementById(containerId);
  if (!container || !rawCode || !rawCode.trim()) return;

  container.innerHTML = "";
  const temp = document.createElement("div");
  temp.innerHTML = rawCode;

  Array.from(temp.childNodes).forEach((node) => {
    if (node.tagName === "SCRIPT") {
      const script = document.createElement("script");
      Array.from(node.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
      script.text = node.textContent;
      container.appendChild(script);
    } else {
      container.appendChild(node.cloneNode(true));
    }
  });
}

fetch("content/ads.json")
  .then((res) => res.json())
  .then((ads) => {
    injectAdCode("ad-slot-trending", ads.ad_trending);
    injectAdCode("ad-slot-stories", ads.ad_stories);
    injectAdCode("ad-slot-mystery", ads.ad_mystery);
    injectAdCode("ad-slot-entertainment", ads.ad_entertainment);
  })
  .catch((err) => {
    console.error("Could not load ads:", err);
  });
