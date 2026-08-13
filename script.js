document.documentElement.classList.add("js");

const navigation = document.getElementById("myTopnav");
const navigationToggle = document.getElementById("nav-toggle");
const activities = document.getElementById("research-activities");
const activitiesToggle = document.getElementById("activities-toggle");
const emailCopyButton = document.getElementById("email-copy-button");
const emailCopyStatus = document.getElementById("email-copy-status");

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

async function copyEmailAddress() {
  const emailAddress = emailCopyButton.dataset.email;

  try {
    await navigator.clipboard.writeText(emailAddress);
    emailCopyStatus.textContent = "Email copied to clipboard";
  } catch {
    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = emailAddress;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.appendChild(temporaryInput);
    temporaryInput.select();

    const wasCopied = document.execCommand("copy");
    temporaryInput.remove();
    emailCopyStatus.textContent = wasCopied
      ? "Email copied to clipboard"
      : `Email: ${emailAddress}`;
  }

  window.setTimeout(() => {
    emailCopyStatus.textContent = "";
  }, 3000);
}

emailCopyButton.addEventListener("click", copyEmailAddress);

window.addEventListener("scroll", updateNavigationBackground, { passive: true });
updateNavigationBackground();
