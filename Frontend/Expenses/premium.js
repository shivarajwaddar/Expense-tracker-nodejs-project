document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  // 1. Check if user is already premium on page load to set up UI
  await checkStatus(token);

  // 2. Check for order_id in URL (If returning from Cashfree payment)
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("order_id");
  if (orderId) {
    await verifyAndEnablePremium(orderId, token);
  }

  // 3. Leaderboard Button Click Logic
  const leaderboardBtn = document.getElementById("leaderboardBtn");
  if (leaderboardBtn) {
    leaderboardBtn.onclick = async () => {
      await toggleLeaderboard(token);
    };
  }
});

// Checks backend to see if the logged-in user has isPremium = true
async function checkStatus(token) {
  try {
    const res = await axios.get("http://localhost:3000/api/users/get-user", {
      headers: { Authorization: token },
    });
    if (res.data.isPremium) {
      showPremiumUI();
    }
  } catch (err) {
    console.error("Status check failed:", err);
  }
}

// Sends the orderId to backend to verify payment and upgrade user
async function verifyAndEnablePremium(orderId, token) {
  try {
    const res = await axios.post(
      "http://localhost:3000/api/payment/verify",
      { order_id: orderId },
      { headers: { Authorization: token } },
    );

    alert(res.data.message || "Payment Successful!");

    // Clean the URL (removes ?order_id=... from browser bar)
    window.history.replaceState({}, document.title, window.location.pathname);

    showPremiumUI();
  } catch (err) {
    console.error("Verification error:", err);
    alert("Payment verification failed. Please contact support.");
  }
}

// Updates the UI to show Premium features
function showPremiumUI() {
  const premiumBtn = document.getElementById("premiumBtn");
  const leaderboardBtn = document.getElementById("leaderboardBtn");

  if (premiumBtn) {
    premiumBtn.innerHTML =
      '<i class="bi bi-patch-check-fill me-1"></i> Premium User';
    premiumBtn.disabled = true;
    premiumBtn.classList.replace("btn-warning", "btn-success");
  }

  // Reveal the hidden leaderboard button
  if (leaderboardBtn) {
    leaderboardBtn.classList.remove("d-none");
  }
}

// Fetches and displays the leaderboard data
async function toggleLeaderboard(token) {
  const boardSection = document.getElementById("leaderboardSection");
  const boardList = document.getElementById("leaderboardList");

  // If already open, just hide it (Toggle)
  if (!boardSection.classList.contains("d-none")) {
    boardSection.classList.add("d-none");
    return;
  }

  try {
    // Show loading state
    boardList.innerHTML =
      '<li class="list-group-item">Loading leaderboard...</li>';
    boardSection.classList.remove("d-none");

    const res = await axios.get(
      "http://localhost:3000/api/premium/leaderboard",
      {
        headers: { Authorization: token },
      },
    );

    boardList.innerHTML = ""; // Clear loader

    if (res.data.length === 0) {
      boardList.innerHTML =
        '<li class="list-group-item">No data available</li>';
      return;
    }

    res.data.forEach((user, index) => {
      // We check for both naming conventions just in case
      const amount =
        user.totalExpenses !== undefined
          ? user.totalExpenses
          : user.total_cost || 0;

      boardList.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                    <span class="badge bg-primary rounded-pill me-2">${index + 1}</span>
                    ${user.name}
                </span>
                <span class="fw-bold text-success">₹${amount}</span>
            </li>`;
    });
  } catch (err) {
    console.error("Leaderboard Error:", err);
    boardSection.classList.add("d-none");
    alert("Unable to fetch leaderboard. Please try again later.");
  }
}
