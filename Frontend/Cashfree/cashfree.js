// Initialize Cashfree in Sandbox mode
const cashfree = Cashfree({
  mode: "sandbox", // Change to "production" when going live
});

document.addEventListener("DOMContentLoaded", () => {
  const premiumBtn =
    document.getElementById("premiumBtn") ||
    document.getElementById("premium-btn");

  if (premiumBtn) {
    premiumBtn.addEventListener("click", async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please login first!");
          window.location.href = "../Signin/signin.html";
          return;
        }

        // 1. Call Backend to create an order
        // FIXED: Using Axios + Bearer Token + Relative Path
        const response = await axios.post(
          "/api/payment/buy-premium",
          {
            plan: "PREMIUM",
            // Note: UserId is extracted from the Token on the backend
          },
          {
            headers: { Authorization: token },
          },
        );

        const data = response.data;

        if (!data.payment_session_id) {
          alert("Error: Could not generate payment session.");
          return;
        }

        // 2. Open Cashfree Checkout
        const checkoutOptions = {
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self", // Redirects back to your verify URL set in backend
        };

        cashfree.checkout(checkoutOptions);
      } catch (error) {
        console.error("Payment Error:", error);
        alert("TRANSACTION FAILED: Unable to reach server.");
      }
    });
  }

  // 3. Handle status messages after redirection
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  const orderId = params.get("order_id");

  if (status === "success" || orderId) {
    // You can add a verification call here if needed
    alert("Transaction successful! Checking status...");
    // Optional: window.location.href = "expense-tracker.html";
  } else if (status === "failed") {
    alert("TRANSACTION FAILED. Please try again.");
  }
});
