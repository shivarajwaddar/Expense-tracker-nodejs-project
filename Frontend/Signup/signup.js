const signupForm = document.querySelector("form");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;

    // Validation Check
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return; // Stop the function from proceeding to the Axios call
    }

    try {
      // Sending the POST request
      const response = await axios.post(
        "http://localhost:3000/api/users/signup/adduser",
        {
          name,
          email,
          password,
        },
      );

      // If successful (Status 201)
      alert(response.data.message);
      console.log("Success:", response.data);
      signupForm.reset();
      window.location.href = "../Signin/signin.html";
    } catch (err) {
      // If error (Status 400 or 500)
      if (err.response && err.response.status === 400) {
        // This says "Email already exists!" message coming from your backend
        alert(err.response.data.message);
      } else {
        alert("Something went wrong. Please try again later.");
      }
      console.error("Signup Error:", err);
    }
  });
}
