const signupForm = document.querySelector("form");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;

    try {
      // Sending the POST request
      const response = await axios.post(
        "http://localhost:3000/api/signup/adduser",
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
    } catch (err) {
      // If error (Status 400 or 500)
      if (err.response && err.response.status === 400) {
        // This captures the "Email already exists!" message from your backend
        alert(err.response.data.message);
      } else {
        alert("Something went wrong. Please try again later.");
      }
      console.error("Signup Error:", err);
    }
  });
}
