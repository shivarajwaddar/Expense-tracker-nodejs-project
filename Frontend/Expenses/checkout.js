document.addEventListener("DOMContentLoaded", async () => {
  // Note: Change "sandbox" to "production" when you go live with real money
  const cashfree = Cashfree({ mode: "sandbox" });

  const premiumBtn = document.getElementById("premiumBtn");
  const premiumText = document.getElementById("premiumText");
  const premiumLoader = document.getElementById("premiumLoader");

  if (!premiumBtn) return;

  // --- 1. CHECK IF USER JUST RETURNED FROM PAYMENT ---
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("order_id");

  if (orderId) {
    try {
      const token = localStorage.getItem("token");

      // FIXED: Using relative path for AWS deployment
      const response = await axios.post(
        "/api/payment/verify-status",
        { orderId: orderId },
        { headers: { Authorization: token } },
      );

      if (response.data.success) {
        alert("Congratulations! You are now a Premium User.");
        // Redirect to clean the URL and refresh UI
        window.location.href = "expense-tracker.html";
      }
    } catch (err) {
      console.error("Payment verification failed", err);
    }
  }

  // --- 2. START PAYMENT FLOW ---
  premiumBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // UI Feedback
    if (premiumText) premiumText.classList.add("d-none");
    if (premiumLoader) premiumLoader.classList.remove("d-none");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        window.location.href = "../Signin/signin.html";
        return;
      }

      // FIXED: Using relative path for AWS deployment
      const res = await axios.post(
        "/api/payment/buy-premium",
        { plan: "PREMIUM" },
        { headers: { Authorization: token } },
      );

      const { payment_session_id } = res.data;

      // Cashfree Checkout
      await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      });
    } catch (err) {
      alert("Payment failed to start. Check console for details.");
      console.error("Payment Error:", err);
    } finally {
      if (premiumText) premiumText.classList.remove("d-none");
      if (premiumLoader) premiumLoader.classList.add("d-none");
    }
  });
});
