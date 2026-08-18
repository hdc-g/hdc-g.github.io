(() => {
  const content = document.querySelector(".content");
  const wrapper = document.querySelector(".wrapper");
  const main = document.querySelector(".main-text");
  if (!content || !wrapper || !main) return;

  const headings = [...main.querySelectorAll("h1[id], h2[id]")];
  if (!headings.length) return;

  const sidebar = document.createElement("aside");
  sidebar.className = "plastex-toc";
  sidebar.setAttribute("aria-label", "Tabla de contenidos");

  const titleBar = document.createElement("div");
  titleBar.className = "plastex-toc-titlebar";

  const title = document.createElement("div");
  title.className = "plastex-toc-title";
  title.textContent = "Contenido";

  titleBar.append(title);

  const nav = document.createElement("nav");
  const list = document.createElement("ol");
  list.className = "plastex-toc-list";

  const links = new Map();
  headings.forEach(heading => {
    const item = document.createElement("li");
    item.className = `plastex-toc-level-${heading.tagName === "H1" ? 1 : 2}`;

    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent.trim();
    link.addEventListener("click", () => closeMobileToc());

    item.append(link);
    list.append(item);
    links.set(heading, item);
  });

  nav.append(list);
  sidebar.append(titleBar, nav);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "plastex-toc-toggle";
  toggle.setAttribute("aria-label", "Ocultar tabla de contenidos");
  toggle.title = "Ocultar índice";
  toggle.setAttribute("aria-expanded", "true");
  toggle.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';

  const home = document.createElement("a");
  home.className = "plastex-home-link";
  home.href = "https://hdc-g.github.io/";
  home.setAttribute("aria-label", "Volver a la página principal");
  home.title = "Volver a la página principal";
  home.innerHTML = '<span aria-hidden="true">←</span>';

  const controls = document.createElement("div");
  controls.className = "plastex-page-controls";
  controls.append(home, toggle);

  const backdrop = document.createElement("button");
  backdrop.type = "button";
  backdrop.className = "plastex-toc-backdrop";
  backdrop.setAttribute("aria-label", "Cerrar tabla de contenidos");

  const closeMobileToc = () => {
    document.body.classList.remove("plastex-toc-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Mostrar tabla de contenidos");
    toggle.title = "Mostrar índice";
  };
  backdrop.addEventListener("click", closeMobileToc);

  const storageKey = "plastex-toc-collapsed";
  const setCollapsed = collapsed => {
    document.body.classList.toggle("plastex-toc-collapsed", collapsed);
    localStorage.setItem(storageKey, String(collapsed));
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", collapsed
      ? "Mostrar tabla de contenidos"
      : "Ocultar tabla de contenidos");
    toggle.title = collapsed ? "Mostrar índice" : "Ocultar índice";
  };

  toggle.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      const opening = !document.body.classList.contains("plastex-toc-open");
      document.body.classList.toggle("plastex-toc-open", opening);
      toggle.setAttribute("aria-expanded", String(opening));
      toggle.setAttribute("aria-label", opening
        ? "Ocultar tabla de contenidos"
        : "Mostrar tabla de contenidos");
      toggle.title = opening ? "Ocultar índice" : "Mostrar índice";
      return;
    }

    setCollapsed(!document.body.classList.contains("plastex-toc-collapsed"));
  });

  wrapper.prepend(sidebar);
  document.body.append(controls, backdrop);
  document.body.classList.add("has-plastex-toc");
  if (localStorage.getItem(storageKey) === "true") {
    setCollapsed(true);
  }

  /* En escritorio, la rueda sobre el índice continúa desplazando la lectura. */
  sidebar.addEventListener("wheel", event => {
    if (window.matchMedia("(max-width: 900px)").matches) return;

    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 18
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? content.clientHeight
        : 1;

    content.scrollBy({
      top: event.deltaY * unit,
      left: event.deltaX * unit,
      behavior: "auto"
    });
    event.preventDefault();
  }, { passive: false });

  let activeHeading = null;
  let scheduled = false;

  const updateActiveHeading = () => {
    scheduled = false;
    const contentTop = content.getBoundingClientRect().top;
    const threshold = contentTop + Math.min(150, content.clientHeight * 0.22);
    let next = headings[0];

    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= threshold) next = heading;
      else break;
    }

    if (content.scrollTop + content.clientHeight >= content.scrollHeight - 4) {
      next = headings.at(-1);
    }

    if (next === activeHeading) return;
    activeHeading = next;

    links.forEach((item, heading) => {
      const active = heading === activeHeading;
      item.classList.toggle("is-active", active);
      const link = item.querySelector("a");
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });

    links.get(activeHeading)?.scrollIntoView({ block: "nearest" });
  };

  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateActiveHeading);
  };

  content.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  scheduleUpdate();
})();
