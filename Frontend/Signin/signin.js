const signinForm = document.querySelector("form");

if (signinForm) {
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/signin",
        { email, password },
      );

      // 1. Success feedback
      alert(response.data.message);

      // 2. STORE DATA IN LOCALSTORAGE
      // Store the token for authorization in future API calls
      localStorage.setItem("token", response.data.token);

      // Store the name to display on the dashboard
      localStorage.setItem("userName", response.data.name);

      // 3. Redirect to the expense tracker page
      window.location.href = "../Expenses/expense-tracker.html";
    } catch (err) {
      // 4. Handle errors (401, 404, or 500)
      if (err.response) {
        // Shows "Invalid password" or "User not found" from backend
        alert(err.response.data.message);
      } else {
        alert("Something went wrong. Is the server running?");
      }
      console.error("Signin Error:", err);
    }
  });
}
