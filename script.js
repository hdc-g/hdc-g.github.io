document.documentElement.classList.add("js");

const navigation = document.getElementById("myTopnav");
const navigationToggle = document.getElementById("nav-toggle");
const activities = document.getElementById("research-activities");
const activitiesToggle = document.getElementById("activities-toggle");

function updateNavigationBackground() {
  const hasScrolled = window.scrollY > 20;
  navigation.style.backgroundColor = hasScrolled ? "#333" : "#3330";
}

navigationToggle.addEventListener("click", (event) => {
  event.preventDefault();
  navigation.classList.toggle("responsive");
});

activitiesToggle.addEventListener("click", () => {
  const isExpanded = activities.classList.toggle("is-expanded");
  activitiesToggle.setAttribute("aria-expanded", String(isExpanded));
  activitiesToggle.textContent = isExpanded ? "Show less" : "Show more";
});

window.addEventListener("scroll", updateNavigationBackground, { passive: true });
updateNavigationBackground();
