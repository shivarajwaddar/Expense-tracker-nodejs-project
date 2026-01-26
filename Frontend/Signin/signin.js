const signinForm = document.querySelector("form");

if (signinForm) {
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      // Sending the POST request to your signin endpoint
      const response = await axios.post(
        "http://localhost:3000/api/users/signin",
        {
          email,
          password,
        },
      );

      // If successful (Status 200)
      alert(response.data.message);
      console.log("Login Success:", response.data.user);

      // Store user info if needed (e.g., in localStorage)
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to the expense manager dashboard
      alert("login successfull");

      window.location.href = "../Expenses/expense-tracker.html";
    } catch (err) {
      // Handle errors (401, 404, or 500)
      if (err.response) {
        // This captures "Invalid password" or "User not found" from your backend
        alert(err.response.data.message);
      } else {
        alert("Server is not responding. Please try again later.");
      }
      console.error("Signin Error:", err);
    }
  });
}
