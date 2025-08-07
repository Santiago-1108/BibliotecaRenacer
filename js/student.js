document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const user = JSON.parse(sessionStorage.getItem("user"))
  if (!user || user.type !== "student") {
    window.location.href = "../index.html"
    return
  }

  //Establecer información del estudiante
  document.getElementById("studentName").textContent = user.name
  document.getElementById("studentGrade").textContent = `${user.grade}° Grado`

  //navegacion
  const navItems = document.querySelectorAll(".sidebar-nav li[data-page]")
  const pages = document.querySelectorAll(".page")

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const pageId = this.getAttribute("data-page")

      // Actualizar el elemento de navegación activo
      navItems.forEach((nav) => nav.classList.remove("active"))
      this.classList.add("active")

      // Mostrar la página seleccionada, ocultar las demás
      pages.forEach((page) => {
        if (page.id === pageId) {
          page.style.display = "block"
        } else {
          page.style.display = "none"
        }
      })

      // Cargar datos específicos de la página
      if (pageId === "catalog") {
        loadCatalog()
      } else if (pageId === "myLoans") {
        loadMyLoans()
      } else if (pageId === "account") {
        loadAccountInfo()
      }
    })
  })

  //cerrar sesion
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("user")
    window.location.href = "../index.html"
  })

  // Funcionalidad de búsqueda y filtrado
  document.getElementById("catalogSearch").addEventListener("input", () => {
    filterCatalog()
  })

  document.getElementById("catalogCategoryFilter").addEventListener("change", () => {
    filterCatalog()
  })

  // funcionalidad modal
  const bookDetailModal = document.getElementById("bookDetailModal")
  const closeBtns = document.querySelectorAll(".close, .close-modal")

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      bookDetailModal.style.display = "none"
    })
  })

  // cargar datos iniciales
  loadCatalog()
})

function loadCatalog() {
  fetch("../php/catalog.php")
    .then((response) => response.json())
    .then((data) => {
      const booksGrid = document.getElementById("booksGrid")
      booksGrid.innerHTML = ""
      const searchTerm = document.getElementById("catalogSearch").value.toLowerCase()

      data.forEach((book) => {
        const bookCard = document.createElement("div")
        bookCard.className = "book-card"

        // Usar imagen almacenada en la base de datos
        const thumbnail = book.book_image || "https://via.placeholder.com/200x300?text=Sin+Imagen"

        bookCard.innerHTML = `
          <div class="book-cover">
            <img src="${thumbnail}" alt="Portada de ${book.title}" />
          </div>
          <div class="book-info">
            <h3>${book.title}</h3>
            <p><strong>Autor:</strong> ${book.author}</p>
            <p><strong>Categoría:</strong> ${book.category}</p>
            <p class="availability ${book.available_quantity > 0 ? "available" : "unavailable"}">
              ${book.available_quantity > 0 ? `Disponibles: ${book.available_quantity}` : "No disponible"}
            </p>
          </div>
        `

        bookCard.addEventListener("click", () => {
          showBookDetail(book, thumbnail)
        })

        booksGrid.appendChild(bookCard)
      })
    })
    .catch((error) => console.error("Error loading catalog:", error))
}

async function showBookDetail(book, bookImage = null) {
  // Información básica del libro
  document.getElementById("detailTitle").textContent = book.title
  document.getElementById("detailAuthor").textContent = book.author
  document.getElementById("detailPublisher").textContent = book.publisher
  document.getElementById("detailCategory").textContent = book.category
  document.getElementById("detailAvailable").textContent = book.available_quantity
  document.getElementById("detailCondition").textContent = book.condition
  document.getElementById("detailSummary").textContent = book.summary

  // Configurar imagen del libro
  const bookImageElement = document.getElementById("detailBookImage")
  const finalImage = bookImage || book.book_image || "https://via.placeholder.com/200x300?text=Sin+Imagen"

  // Mostrar la imagen en el modal
  if (bookImageElement) {
    bookImageElement.src = finalImage
    bookImageElement.alt = `Portada de ${book.title}`
    bookImageElement.style.display = "block"
  }

  // Mostrar el modal
  document.getElementById("bookDetailModal").style.display = "block"
}

function filterCatalog() {
  const searchTerm = document.getElementById("catalogSearch").value.toLowerCase()
  const categoryFilter = document.getElementById("catalogCategoryFilter").value

  const bookCards = document.querySelectorAll(".book-card")
  bookCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase()
    const author = card.querySelector("p").textContent.toLowerCase()
    const category = card.querySelectorAll("p")[1].textContent.toLowerCase()

    const matchesSearch = title.includes(searchTerm) || author.includes(searchTerm)
    const matchesCategory = !categoryFilter || category.includes(categoryFilter)

    card.style.display = matchesSearch && matchesCategory ? "block" : "none"
  })
}

function loadMyLoans() {
  const user = JSON.parse(sessionStorage.getItem("user"))

  fetch(`../php/student_loans.php?student_id=${user.id}`)
    .then((response) => response.json())
    .then((data) => {
      // Actualizar estadísticas de préstamos
      document.getElementById("activeLoansCount").textContent = data.active_loans.length
      document.getElementById("historyLoansCount").textContent = data.total_loans

      // Cargar préstamos activos
      const activeLoansTable = document.getElementById("activeLoansTable")
      activeLoansTable.innerHTML = ""

      data.active_loans.forEach((loan) => {
        const row = document.createElement("tr")
        row.innerHTML = `
                    <td>${loan.book_title}</td>
                    <td>${loan.loan_date}</td>
                    <td>${getStatusBadge(loan.status)}</td>
                `
        activeLoansTable.appendChild(row)
      })

      // Cargar historial de préstamos
      const historyTable = document.getElementById("loansHistoryTable")
      historyTable.innerHTML = ""

      data.loan_history.forEach((loan) => {
        const row = document.createElement("tr")
        row.innerHTML = `
                    <td>${loan.book_title}</td>
                    <td>${loan.loan_date}</td>
                    <td>${loan.return_date || "Pendiente"}</td>
                    <td>${getStatusBadge(loan.status)}</td>
                `
        historyTable.appendChild(row)
      })
    })
    .catch((error) => console.error("Error loading loans:", error))
}

function loadAccountInfo() {
  const user = JSON.parse(sessionStorage.getItem("user"))

  // Establecer información básica
  document.getElementById("accountName").textContent = user.name
  document.getElementById("accountId").textContent = user.identification
  document.getElementById("accountGrade").textContent = `${user.grade}° Grado`
  document.getElementById("accountAddress").textContent = user.address

  // Load loan summary
  fetch(`../php/student_loans.php?student_id=${user.id}`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("accountActiveLoans").textContent = data.active_loans.length
      document.getElementById("accountTotalLoans").textContent = data.total_loans
    })
    .catch((error) => console.error("Error loading account info:", error))
}

function getStatusBadge(status) {
  const badges = {
    active: '<span class="badge badge-warning">Activo</span>',
    returned: '<span class="badge badge-success">Devuelto</span>',
    overdue: '<span class="badge badge-danger">Vencido</span>',
  }
  return badges[status] || status
}
