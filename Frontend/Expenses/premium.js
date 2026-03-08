document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  // 1. Check if user is already premium on page load
  await checkStatus(token);

  // 2. Check for order_id in URL (Returning from Cashfree)
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("order_id");
  if (orderId) {
    await verifyAndEnablePremium(orderId, token);
  }

  // 3. Leaderboard Button Logic
  const leaderboardBtn = document.getElementById("leaderboardBtn");
  if (leaderboardBtn) {
    leaderboardBtn.onclick = async () => {
      const boardSection = document.getElementById("leaderboardSection");

      if (boardSection.classList.contains("d-none")) {
        boardSection.classList.remove("d-none");
        await fetchLeaderboard(token, 1);
      } else {
        boardSection.classList.add("d-none");
      }
    };
  }
});

// Checks backend status - Path updated to plural /api/users
async function checkStatus(token) {
  try {
    const res = await axios.get("/api/users/get-user", {
      headers: { Authorization: token },
    });
    if (res.data.isPremium) {
      showPremiumUI();
    }
  } catch (err) {
    console.error("Status check failed:", err);
  }
}

// Payment verification - Relative path
async function verifyAndEnablePremium(orderId, token) {
  try {
    const res = await axios.post(
      "/api/payment/verify",
      { order_id: orderId },
      { headers: { Authorization: token } },
    );

    alert(res.data.message || "Payment Successful!");

    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);

    showPremiumUI();
  } catch (err) {
    console.error("Verification error:", err);
    alert("Payment verification failed. Please contact support.");
  }
}

// Updates UI for Premium
function showPremiumUI() {
  const premiumBtn = document.getElementById("premiumBtn");
  const leaderboardBtn = document.getElementById("leaderboardBtn");
  const showReportBtn = document.getElementById("reportsBtn");

  if (showReportBtn) {
    showReportBtn.classList.remove("d-none");
  }

  if (premiumBtn) {
    premiumBtn.innerHTML =
      '<i class="bi bi-patch-check-fill me-1"></i> Premium User';
    premiumBtn.disabled = true;
    premiumBtn.classList.replace("btn-warning", "btn-success");
  }

  if (leaderboardBtn) {
    leaderboardBtn.classList.remove("d-none");
  }
}

// Fetch Leaderboard - Relative path with pagination
async function fetchLeaderboard(token, page = 1) {
  const boardList = document.getElementById("leaderboardList");

  try {
    boardList.innerHTML =
      '<li class="list-group-item text-center">Loading...</li>';

    const res = await axios.get(`/api/premium/leaderboard?page=${page}`, {
      headers: { Authorization: token },
    });

    boardList.innerHTML = "";

    const { leaderboard, totalPages, currentPage } = res.data;

    if (!leaderboard || leaderboard.length === 0) {
      boardList.innerHTML =
        '<li class="list-group-item">No data available</li>';
      return;
    }

    leaderboard.forEach((user, index) => {
      const rank = (currentPage - 1) * 5 + (index + 1);
      const amount = user.totalExpenses ?? user.total_cost ?? 0;

      boardList.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                    <span class="badge bg-primary rounded-pill me-2">${rank}</span>
                    ${user.name}
                </span>
                <span class="fw-bold text-success">₹${amount}</span>
            </li>`;
    });

    renderLeaderboardPagination(token, totalPages, currentPage);
  } catch (err) {
    console.error("Leaderboard Error:", err);
    alert("Unable to fetch leaderboard.");
  }
}

function renderLeaderboardPagination(token, totalPages, activePage) {
  const paginationContainer = document.getElementById("leaderboardPagination");
  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === activePage ? "active" : ""}`;

    const btn = document.createElement("button");
    btn.className = "page-link";
    btn.innerText = i;
    btn.onclick = () => fetchLeaderboard(token, i);

    li.appendChild(btn);
    paginationContainer.appendChild(li);
  }
}
