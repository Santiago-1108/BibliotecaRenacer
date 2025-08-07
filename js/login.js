document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const loginMessage = document.getElementById("loginMessage")

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const userType = document.getElementById("userType").value

    // Simulating login request to server
    fetch("php/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&userType=${encodeURIComponent(userType)}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loginMessage.className = "message success"
          loginMessage.textContent = "Inicio de sesión exitoso. Redirigiendo..."

          // Store user info in session storage
          sessionStorage.setItem("user", JSON.stringify(data.user))

          // Redirect based on user type
          setTimeout(() => {
            if (userType === "admin") {
              window.location.href = "admin/index.html"
            } else {
              window.location.href = "student/index.html"
            }
          }, 1000)
        } else {
          loginMessage.className = "message error"
          loginMessage.textContent = data.message || "Usuario o contraseña incorrectos"
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        loginMessage.className = "message error"
        loginMessage.textContent = "Error al conectar con el servidor"
      })
  })
})
