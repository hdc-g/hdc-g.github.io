(() => {
  /* Algunos \cite están envueltos además en un \href externo. El navegador
     separa esos enlaces anidados, así que detectamos las referencias por su
     destino bibliográfico y no por la estructura del span.cite. */
  const citations = [...document.querySelectorAll('a[href*="#"]')];
  if (!citations.length) return;

  const tooltip = document.createElement("aside");
  tooltip.className = "plastex-reference-preview";
  tooltip.setAttribute("role", "tooltip");
  tooltip.setAttribute("aria-hidden", "true");
  tooltip.id = "plastex-reference-preview";

  const label = document.createElement("div");
  label.className = "plastex-reference-preview-label";

  const body = document.createElement("div");
  body.className = "plastex-reference-preview-body";
  tooltip.append(label, body);
  document.body.append(tooltip);

  let activeLink = null;
  let showTimer = null;
  let hideTimer = null;

  const findEntry = link => {
    let url;
    try {
      url = new URL(link.href, document.baseURI);
    } catch {
      return null;
    }

    const normalizePath = path => path.replace(/index\.html$/, "").replace(/\/$/, "");
    const sameDocument = url.origin === location.origin
      && normalizePath(url.pathname) === normalizePath(location.pathname);
    if (!url.hash || !sameDocument) return null;
    const key = decodeURIComponent(url.hash.slice(1));
    const anchor = [...document.querySelectorAll("dl.bibliography dt a[name]")]
      .find(item => item.getAttribute("name") === key);
    const term = anchor?.closest("dt");
    const description = term?.nextElementSibling;
    if (!term || !description?.matches("dd")) return null;

    return {
      number: anchor.textContent.trim(),
      html: description.innerHTML
    };
  };

  const position = link => {
    const anchorBox = link.getBoundingClientRect();
    const tooltipBox = tooltip.getBoundingClientRect();
    const gutter = 12;
    const left = Math.min(
      window.innerWidth - tooltipBox.width - gutter,
      Math.max(gutter, anchorBox.left + anchorBox.width / 2 - tooltipBox.width / 2)
    );
    const fitsAbove = anchorBox.top >= tooltipBox.height + gutter;
    const top = fitsAbove
      ? anchorBox.top - tooltipBox.height - 9
      : anchorBox.bottom + 9;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.max(gutter, top)}px`;
    tooltip.classList.toggle("is-below", !fitsAbove);
  };

  const show = link => {
    const entry = findEntry(link);
    if (!entry) return;

    activeLink?.removeAttribute("aria-describedby");
    activeLink = link;
    label.textContent = `Referencia [${entry.number}]`;
    body.innerHTML = entry.html;
    tooltip.setAttribute("aria-hidden", "false");
    tooltip.classList.add("is-visible");
    link.setAttribute("aria-describedby", tooltip.id);
    position(link);
  };

  const hide = () => {
    activeLink?.removeAttribute("aria-describedby");
    activeLink = null;
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  };

  const scheduleShow = link => {
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    showTimer = setTimeout(() => show(link), 150);
  };

  const scheduleHide = () => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 80);
  };

  citations.forEach(link => {
    if (!findEntry(link)) return;
    link.classList.add("has-reference-preview");
    link.addEventListener("mouseenter", () => scheduleShow(link));
    link.addEventListener("mouseleave", scheduleHide);
    link.addEventListener("focus", () => scheduleShow(link));
    link.addEventListener("blur", scheduleHide);
  });

  window.addEventListener("resize", () => activeLink && position(activeLink));
  document.querySelector(".content")?.addEventListener(
    "scroll",
    () => activeLink && position(activeLink),
    { passive: true }
  );
})();
