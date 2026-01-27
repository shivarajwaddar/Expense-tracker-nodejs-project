document.addEventListener("DOMContentLoaded", async () => {
  const cashfree = Cashfree({ mode: "sandbox" });

  const premiumBtn = document.getElementById("premiumBtn");
  const premiumText = document.getElementById("premiumText");
  const premiumLoader = document.getElementById("premiumLoader");

  if (!premiumBtn) return;

  // --- NEW: CHECK IF USER JUST RETURNED FROM PAYMENT ---
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("order_id");

  if (orderId) {
    try {
      const token = localStorage.getItem("token");
      // Call backend to verify if payment was successful
      const response = await axios.post(
        "http://localhost:3000/api/payment/verify-status",
        { orderId: orderId },
        { headers: { Authorization: token } },
      );

      if (response.data.success) {
        alert("Congratulations! You are now a Premium User.");
        // Refresh to show Leaderboard button immediately
        window.location.href = "expense-tracker.html";
      }
    } catch (err) {
      console.error("Verification failed", err);
    }
  }

  // --- EXISTING: START PAYMENT FLOW ---
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
        { headers: { Authorization: token } },
      );

      const { payment_session_id } = res.data;

      await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self", // Redirects user to Cashfree site
      });
    } catch (err) {
      alert("Payment failed to start. Check console.");
      console.error(err);
    } finally {
      premiumText.classList.remove("d-none");
      premiumLoader.classList.add("d-none");
    }
  });
});
