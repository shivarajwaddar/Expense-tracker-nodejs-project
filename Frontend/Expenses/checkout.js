document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Cashfree SDK
  const cashfree = Cashfree({
    mode: "sandbox",
  });

  // 2. CHECK FOR REDIRECT: Look for order_id in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderIdFromUrl = urlParams.get("order_id");

  if (orderIdFromUrl) {
    await verifyPayment(orderIdFromUrl);
  }

  // 3. PERSISTENT UI CHECK: Check if the user is already premium
  await checkPremiumStatus();

  // --- VERIFY PAYMENT FUNCTION ---
  async function verifyPayment(orderId) {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:3000/api/payment/verify",
        { order_id: orderId },
        {
          headers: {
            // Send token exactly as middleware expects
            Authorization: token,
          },
        },
      );

      alert(res.data.message);

      // Clean the URL to prevent double verification
      window.history.replaceState({}, document.title, window.location.pathname);

      // Trigger UI update
      showPremiumFeatures();
    } catch (err) {
      console.error("Verification failed:", err.response?.data || err.message);
      alert("Payment verification failed.");
    }
  }

  // --- CHECK STATUS ON LOAD ---
  async function checkPremiumStatus() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // This hits a backend route that returns user details
      const res = await axios.get("http://localhost:3000/api/users/get-user", {
        headers: { Authorization: token },
      });

      console.log("User status:", res.data);

      if (res.data.isPremium) {
        showPremiumFeatures();
      }
    } catch (err) {
      console.error("Could not fetch user status:", err);
    }
  }

  // 4. BUY PREMIUM BUTTON LOGIC
  const premiumBtn = document.getElementById("premiumBtn");
  const premiumText = document.getElementById("premiumText");
  const premiumLoader = document.getElementById("premiumLoader");

  if (premiumBtn) {
    premiumBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      premiumText.classList.add("d-none");
      premiumLoader.classList.remove("d-none");

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please login first");

        const res = await axios.post(
          "http://localhost:3000/api/payment/buy-premium",
          { plan: "PREMIUM" },
          { headers: { Authorization: token } }, // Synced with middleware
        );

        const { payment_session_id } = res.data;
        if (!payment_session_id) throw new Error("Session ID missing");

        // Use _self to avoid permission/iframe errors
        await cashfree.checkout({
          paymentSessionId: payment_session_id,
          redirectTarget: "_self",
        });
      } catch (err) {
        console.error("Checkout error:", err.response?.data || err.message);
        alert(err.message || "Unable to start payment");
      } finally {
        premiumText.classList.remove("d-none");
        premiumLoader.classList.add("d-none");
      }
    });
  }
});

// 5. UI UPDATE FUNCTION
function showPremiumFeatures() {
  const premiumBtn = document.getElementById("premiumBtn");
  const leaderboardBtn = document.getElementById("leaderboardBtn");

  if (premiumBtn) {
    premiumBtn.innerHTML = "Premium User ⭐";
    premiumBtn.disabled = true;
    premiumBtn.classList.replace("btn-warning", "btn-success");
  }

  if (leaderboardBtn) {
    leaderboardBtn.classList.remove("d-none");
  }
}
