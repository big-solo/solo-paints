const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
       if (response.ok) {

    localStorage.setItem("adminLoggedIn", "true");
    localStorage.setItem("adminToken", data.token);

    window.location.href = "dashboard.html";
}
        } else {
            loginMessage.textContent = data.message || "Invalid login details.";
            loginMessage.style.color = "red";
        }

    } catch (error) {
        console.error("Login error:", error);

        loginMessage.textContent =
            "Unable to connect to the server.";

        loginMessage.style.color = "red";
    }
});