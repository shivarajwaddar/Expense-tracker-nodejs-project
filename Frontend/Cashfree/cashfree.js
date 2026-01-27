// Initialize Cashfree in Sandbox mode
const cashfree = Cashfree({
  mode: "sandbox",
});

document.getElementById("premium-btn").addEventListener("click", async () => {
  try {
    // 1. Call your MVC Backend Controller to create an order
    // This ensures the order starts as PENDING in your DB
    const response = await fetch("/api/payment/buy-premium", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 1.0, // Membership Price
        userId: 1, // Current User ID
        phone: "9876543210",
      }),
    });

    const data = await response.json();

    if (!data.payment_session_id) {
      alert("Error: Could not generate payment session.");
      return;
    }

    // 2. Open Cashfree floor with the dynamic Session ID
    const checkoutOptions = {
      paymentSessionId: data.payment_session_id,
      redirectTarget: "_self", // Redirects back to your verify URL
    };

    cashfree.checkout(checkoutOptions);
  } catch (error) {
    console.error("Payment Error:", error);
    alert("TRANSACTION FAILED: Unable to reach server.");
  }
});

// 3. Handle status messages after redirection
window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("status") === "success") {
    alert("Transaction successful! You are now a premium user.");
  } else if (params.get("status") === "failed") {
    alert("TRANSACTION FAILED.");
  }
};
