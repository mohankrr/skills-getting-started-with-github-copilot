document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

          let participantsList = '';
          if (details.participants.length) {
            participantsList = `<div class=\"participants-list\">` +
              details.participants.map((p) =>
                `<div class=\"participant-row\">\n                <span class=\"participant-email\">${p}</span>\n                <button class=\"delete-participant\" title=\"Remove participant\" data-activity=\"${encodeURIComponent(name)}\" data-email=\"${encodeURIComponent(p)}\">\n                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#c62828' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='3 6 5 6 21 6'></polyline><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2'></path><line x1='10' y1='11' x2='10' y2='17'></line><line x1='14' y1='11' x2='14' y2='17'></line></svg>\n                </button>\n              </div>`
              ).join("") + `</div>`;
          } else {
            participantsList = `<p class=\"no-participants\">No participants yet</p>`;
          }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <strong>Participants:</strong>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
        // ...existing code...
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list so UI updates immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
  // Handle participant delete
  activitiesList.addEventListener("click", async (event) => {
    const btn = event.target.closest(".delete-participant");
    if (btn) {
      const activity = decodeURIComponent(btn.getAttribute("data-activity"));
      const email = decodeURIComponent(btn.getAttribute("data-email"));
      if (confirm(`Remove ${email} from ${activity}?`)) {
        try {
          const response = await fetch(`/activities/${encodeURIComponent(activity)}/participant?email=${encodeURIComponent(email)}`, {
            method: "DELETE",
          });
          const result = await response.json();
          if (response.ok) {
            fetchActivities();
          } else {
            alert(result.detail || "Failed to remove participant.");
          }
        } catch (error) {
          alert("Failed to remove participant. Please try again.");
        }
      }
    }
  });

  // Initialize app
  fetchActivities();
});
