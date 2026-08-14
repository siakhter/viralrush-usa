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

function injectAdCode(containerId, rawCode) {
  const container = document.getElementById(containerId);
  if (!container || !rawCode || !rawCode.trim()) return;
  container.innerHTML = "";

  if (rawCode.includes("atOptions")) {
    // Banner-type Adsterra ads use document.write, so they must load inside an iframe
    const widthMatch = rawCode.match(/'width'\s*:\s*(\d+)/);
    const heightMatch = rawCode.match(/'height'\s*:\s*(\d+)/);
    const width = widthMatch ? widthMatch[1] : "300";
    const height = heightMatch ? heightMatch[1] : "250";

    const iframe = document.createElement("iframe");
    iframe.style.width = width + "px";
    iframe.style.height = height + "px";
    iframe.style.maxWidth = "100%";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.scrolling = "no";
    container.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(
      "<!DOCTYPE html><html><head><style>body{margin:0;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;}</style></head><body>" +
        rawCode +
        "</body></html>"
    );
    doc.close();
  } else {
    // Non-banner scripts (e.g. social bar) — inject normally as before
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
}

function goBack() {
  if (document.referrer && document.referrer.indexOf(window.location.host) !== -1) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
}

const params = new URLSearchParams(window.location.search);
const slug = params.get("s");

const loadingEl = document.getElementById("article-loading");
const contentEl = document.getElementById("article-content");
const notFoundEl = document.getElementById("article-not-found");

document.getElementById("back-link").addEventListener("click", goBack);
document.getElementById("back-link-bottom").addEventListener("click", goBack);

fetch("content/stories.json")
  .then((res) => res.json())
  .then((data) => {
    const stories = data.stories || [];
    const story = stories.find((s) => slugify(s.title) === slug);

    if (loadingEl) loadingEl.hidden = true;

    if (!story) {
      if (notFoundEl) notFoundEl.hidden = false;
      return;
    }

    document.title = story.title + " — ViralRush USA";
    document.getElementById("article-tag1").textContent = story.tag1 || "";
    document.getElementById("article-tag2").textContent = story.tag2 || "";
    document.getElementById("article-title").textContent = story.title || "";
    document.getElementById("article-readtime").textContent = story.readtime || "";

    const img = document.getElementById("article-image");
    img.src = story.image || "";
    img.alt = story.title || "";

    const bodyEl = document.getElementById("article-body");
    const paragraphs = (story.content || story.description || "")
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0);
    bodyEl.innerHTML = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");

    if (contentEl) contentEl.hidden = false;
  })
  .catch((err) => {
    console.error("Could not load story:", err);
    if (loadingEl) loadingEl.hidden = true;
    if (notFoundEl) notFoundEl.hidden = false;
  });

fetch("content/ads.json")
  .then((res) => res.json())
  .then((ads) => {
    injectAdCode("ad-slot-article-top", ads.ad_article_top);
    injectAdCode("ad-slot-article-bottom", ads.ad_article_bottom);
  })
  .catch((err) => {
    console.error("Could not load ads:", err);
  });
