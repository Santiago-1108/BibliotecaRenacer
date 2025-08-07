// CONFIGURACIÓN DE BÚSQUEDA - MOVER AL INICIO DEL ARCHIVO
const SEARCH_CONFIG = {
  initialResults: 10, // Resultados iniciales
  loadMoreIncrement: 10, // Cuántos más cargar con "Ver más"
  maxTotalResults: 500, // null = sin límite, obtener todos los disponibles
}

// Variables globales para "Ver más"
let currentSearchResults = []
let displayedResults = 0
let currentSearchTerm = ""

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado, iniciando aplicación...")

  // Check if user is logged in
  const user = JSON.parse(sessionStorage.getItem("user"))
  if (!user || user.type !== "admin") {
    window.location.href = "../index.html"
    return
  }

  // Set admin name
  document.getElementById("adminName").textContent = user.name

  // Navigation
  const navItems = document.querySelectorAll(".sidebar-nav li[data-page]")
  const pages = document.querySelectorAll(".page")

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const pageId = this.getAttribute("data-page")

      // Update active nav item
      navItems.forEach((nav) => nav.classList.remove("active"))
      this.classList.add("active")

      // Show selected page, hide others
      pages.forEach((page) => {
        if (page.id === pageId) {
          page.style.display = "block"
        } else {
          page.style.display = "none"
        }
      })
    })
  })

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("user")
    window.location.href = "../index.html"
  })

  // Load dashboard data
  loadDashboardData()

  // Books management
  const addBookBtn = document.getElementById("addBookBtn")
  const bookModal = document.getElementById("bookModal")
  const bookForm = document.getElementById("bookForm")
  const closeBtns = document.querySelectorAll(".close, .close-modal")

  // Modificar la función que abre el modal para agregar libro
  addBookBtn.addEventListener("click", () => {
    console.log("Abriendo modal de agregar libro...")
    document.getElementById("bookModalTitle").textContent = "Agregar Nuevo Libro"
    bookForm.reset()
    document.getElementById("bookId").value = ""

    // LIMPIAR CAMPOS ESPECÍFICAMENTE
    document.getElementById("bookTitle").value = ""
    document.getElementById("bookAuthor").value = ""
    document.getElementById("bookPublisher").value = ""
    document.getElementById("bookSummary").value = ""

    clearBookPreview()
    bookModal.style.display = "block"
    setupOpenLibrarySearch()
  })

  bookForm.addEventListener("submit", (e) => {
    e.preventDefault()
    saveBook()
  })

  // Students management
  const addStudentBtn = document.getElementById("addStudentBtn")
  const studentModal = document.getElementById("studentModal")
  const studentForm = document.getElementById("studentForm")

  addStudentBtn.addEventListener("click", () => {
    document.getElementById("studentModalTitle").textContent = "Agregar Nuevo Estudiante"
    studentForm.reset()
    document.getElementById("studentId").value = ""
    studentModal.style.display = "block"
  })

  studentForm.addEventListener("submit", (e) => {
    e.preventDefault()
    saveStudent()
  })

  // Loans management
  const newLoanBtn = document.getElementById("newLoanBtn")
  const loanModal = document.getElementById("loanModal")
  const loanForm = document.getElementById("loanForm")

  newLoanBtn.addEventListener("click", () => {
    loadStudentsForLoan()
    loadBooksForLoan()
    document.getElementById("loanDate").valueAsDate = new Date()
    loanModal.style.display = "block"
  })

  loanForm.addEventListener("submit", (e) => {
    e.preventDefault()
    saveLoan()
  })

  // Returns management
  const returnForm = document.getElementById("returnForm")

  returnForm.addEventListener("submit", (e) => {
    e.preventDefault()
    saveReturn()
  })

  // Close modals
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      bookModal.style.display = "none"
      studentModal.style.display = "none"
      loanModal.style.display = "none"
      document.getElementById("returnModal").style.display = "none"
    })
  })

  // Search and filter functionality
  document.getElementById("bookSearch").addEventListener("input", () => {
    filterBooks()
  })

  document.getElementById("categoryFilter").addEventListener("change", () => {
    filterBooks()
  })

  document.getElementById("studentSearch").addEventListener("input", () => {
    filterStudents()
  })

  document.getElementById("gradeFilter").addEventListener("change", () => {
    filterStudents()
  })

  document.getElementById("loanSearch").addEventListener("input", () => {
    filterLoans()
  })

  document.getElementById("returnSearch").addEventListener("input", () => {
    filterReturns()
  })

  // Load initial data
  loadBooks()
  loadStudents()
  loadLoans()
  loadReturns()

  // Reports functionality
  document
    .getElementById("pendingReturnsReport")
    .querySelector("button")
    .addEventListener("click", () => {
      generatePendingReturnsReport()
    })

  document
    .getElementById("bookInventoryReport")
    .querySelector("button")
    .addEventListener("click", () => {
      generateBookInventoryReport()
    })

  document
    .getElementById("loanHistoryReport")
    .querySelector("button")
    .addEventListener("click", () => {
      generateLoanHistoryReport()
    })
})

// NUEVA FUNCIÓN: Configurar búsqueda de Open Library
function setupOpenLibrarySearch() {
  console.log("Configurando búsqueda de Open Library...")

  const searchBtn = document.getElementById("searchBooksBtn")
  const titleInput = document.getElementById("bookTitle")

  console.log("Botón de búsqueda:", searchBtn)
  console.log("Input de título:", titleInput)

  if (!searchBtn) {
    console.error("No se encontró el botón de búsqueda!")
    return
  }

  if (!titleInput) {
    console.error("No se encontró el input de título!")
    return
  }

  // Remover event listeners anteriores
  const newBtn = searchBtn.cloneNode(true)
  searchBtn.parentNode.replaceChild(newBtn, searchBtn)

  // Agregar nuevo event listener
  newBtn.addEventListener("click", (e) => {
    e.preventDefault()
    console.log("Botón de búsqueda clickeado!")

    const title = titleInput.value.trim()
    console.log("Título a buscar:", title)

    if (title) {
      searchOpenLibrary(title)
    } else {
      alert("Por favor ingrese un título para buscar")
    }
  })

  console.log("Event listener agregado al botón de búsqueda")
}

// BÚSQUEDA CON "VER MÁS" - RESETEAR EN NUEVA BÚSQUEDA
async function searchOpenLibrary(title) {
  console.log("=== INICIANDO NUEVA BÚSQUEDA ===")
  console.log("Título:", title)

  const searchBtn = document.getElementById("searchBooksBtn")
  if (!searchBtn) {
    console.error("No se encontró el botón de búsqueda")
    return
  }

  const originalHTML = searchBtn.innerHTML

  try {
    // Cambiar estado del botón
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...'
    searchBtn.disabled = true

    // RESETEAR VARIABLES PARA NUEVA BÚSQUEDA
    currentSearchResults = []
    displayedResults = 0
    currentSearchTerm = title

    console.log("=== VARIABLES RESETEADAS PARA NUEVA BÚSQUEDA ===")

    // Buscar obras - SIN LÍMITE si maxTotalResults es null
    const searchQuery = encodeURIComponent(title)
    let apiUrl
    if (SEARCH_CONFIG.maxTotalResults === null) {
      // Sin límite - obtener todos los resultados disponibles
      apiUrl = `https://openlibrary.org/search.json?q=${searchQuery}`
      console.log("Búsqueda SIN LÍMITE - obteniendo todos los resultados disponibles")
    } else {
      // Con límite específico
      apiUrl = `https://openlibrary.org/search.json?q=${searchQuery}&limit=${SEARCH_CONFIG.maxTotalResults}`
      console.log(`Búsqueda CON LÍMITE de ${SEARCH_CONFIG.maxTotalResults} resultados`)
    }

    console.log("URL de búsqueda:", apiUrl)

    const response = await fetch(apiUrl)
    console.log("Respuesta HTTP:", response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Datos de búsqueda:", data)

    if (data.docs && data.docs.length > 0) {
      console.log(`Se encontraron ${data.docs.length} libros de ${data.numFound} totales disponibles en Open Library`)

      if (SEARCH_CONFIG.maxTotalResults === null) {
        console.log("✅ OBTENIENDO TODOS LOS RESULTADOS DISPONIBLES")
      } else {
        console.log(`✅ LIMITADO A ${SEARCH_CONFIG.maxTotalResults} resultados`)
      }

      // Guardar todos los resultados
      currentSearchResults = data.docs

      // Mostrar los primeros 10 resultados
      await displayInitialResults()
    } else {
      console.log("No se encontraron libros")
      showNoResultsMessage()
    }
  } catch (error) {
    console.error("Error en búsqueda:", error)
    showErrorMessage(error.message)
  } finally {
    // Restaurar botón
    searchBtn.innerHTML = originalHTML
    searchBtn.disabled = false
  }
}

// NUEVA FUNCIÓN: Mostrar resultados iniciales
async function displayInitialResults() {
  console.log("=== MOSTRANDO RESULTADOS INICIALES ===")

  const initialBooks = currentSearchResults.slice(0, SEARCH_CONFIG.initialResults)
  displayedResults = initialBooks.length

  console.log(`Mostrando ${displayedResults} de ${currentSearchResults.length} resultados`)

  // Procesar libros iniciales
  const enrichedBooks = await Promise.all(
    initialBooks.map(async (book) => {
      return await getBookWithEditions(book)
    }),
  )

  // Mostrar resultados
  displayOpenLibraryResults(enrichedBooks, {
    showing: displayedResults,
    total: currentSearchResults.length,
    hasMore: displayedResults < currentSearchResults.length,
  })
}

// NUEVA FUNCIÓN: Cargar más resultados
async function loadMoreResults() {
  console.log("=== CARGANDO MÁS RESULTADOS ===")

  const nextBatch = currentSearchResults.slice(displayedResults, displayedResults + SEARCH_CONFIG.loadMoreIncrement)

  console.log(`Cargando ${nextBatch.length} resultados más`)

  // Procesar nuevos libros
  const enrichedBooks = await Promise.all(
    nextBatch.map(async (book) => {
      return await getBookWithEditions(book)
    }),
  )

  // Actualizar contador
  displayedResults += nextBatch.length

  // Agregar a los resultados existentes
  appendMoreResults(enrichedBooks, {
    showing: displayedResults,
    total: currentSearchResults.length,
    hasMore: displayedResults < currentSearchResults.length,
  })
}

// NUEVA FUNCIÓN MEJORADA: Hacer coincidir imagen con editorial
async function getBookWithEditions(book) {
  console.log("=== OBTENIENDO EDICIONES PARA:", book.title, "===")

  const enrichedBook = { ...book }

  try {
    if (book.key) {
      // Obtener ediciones de la obra
      const editionsUrl = `https://openlibrary.org${book.key}/editions.json?limit=20`
      const editionsResponse = await fetch(editionsUrl)
      const editionsData = await editionsResponse.json()

      let matchingEdition = null
      let bestEdition = null
      const allPublishers = new Set()

      if (editionsData.entries && editionsData.entries.length > 0) {
        editionsData.entries.forEach((edition) => {
          // Recopilar todos los editores
          if (edition.publishers && Array.isArray(edition.publishers)) {
            edition.publishers.forEach((publisher) => {
              if (publisher && typeof publisher === "string" && publisher.trim()) {
                allPublishers.add(publisher.trim())
              }
            })
          }

          // Buscar edición que coincida con la imagen
          if (book.cover_i && edition.covers && Array.isArray(edition.covers)) {
            if (edition.covers.includes(book.cover_i)) {
              matchingEdition = edition
            }
          }

          // Guardar la primera edición con editorial como respaldo
          if (!bestEdition && edition.publishers && edition.publishers.length > 0) {
            bestEdition = edition
          }
        })

        const selectedEdition = matchingEdition || bestEdition

        if (selectedEdition && selectedEdition.publishers && selectedEdition.publishers.length > 0) {
          enrichedBook.publisher_info = selectedEdition.publishers[0]
          enrichedBook.image_publisher_match = !!matchingEdition
        }

        enrichedBook.all_publishers = Array.from(allPublishers).slice(0, 5)
      }
    }

    // Respaldo con Google Books si no tenemos editorial
    if (!enrichedBook.publisher_info) {
      try {
        const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(book.title)}&maxResults=1`
        const googleResponse = await fetch(googleUrl)
        const googleData = await googleResponse.json()

        if (googleData.items && googleData.items.length > 0) {
          const googleBook = googleData.items[0].volumeInfo
          if (googleBook.publisher) {
            enrichedBook.publisher_info = googleBook.publisher
            enrichedBook.image_publisher_match = false
          }
        }
      } catch (googleError) {
        console.log("Error con Google Books:", googleError)
      }
    }
  } catch (error) {
    console.error("Error obteniendo ediciones:", error)
  }

  // Valor por defecto
  if (!enrichedBook.publisher_info) {
    enrichedBook.publisher_info = "Editorial no disponible"
    enrichedBook.image_publisher_match = false
  }

  return enrichedBook
}

function displayOpenLibraryResults(books, searchInfo = {}) {
  console.log("=== MOSTRANDO RESULTADOS DE OPEN LIBRARY ===")

  const resultsContainer = document.getElementById("googleBooksResults")
  if (!resultsContainer) {
    console.error("No se encontró el contenedor de resultados")
    return
  }

  // Limpiar contenedor para nueva búsqueda
  resultsContainer.innerHTML = `
    <h4 style="margin: 0 0 10px 0; color: #28a745;">
      <i class="fas fa-check-circle"></i> Se encontraron ${searchInfo.total} libros (mostrando ${searchInfo.showing}):
    </h4>
    <div id="booksResultsList"></div>
  `

  const booksList = document.getElementById("booksResultsList")

  books.forEach((book, index) => {
    const resultDiv = createBookResultDiv(book)
    booksList.appendChild(resultDiv)
  })

  // Agregar botón "Ver más" si hay más resultados
  if (searchInfo.hasMore) {
    const loadMoreDiv = document.createElement("div")
    loadMoreDiv.style.cssText = `
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    `

    const loadMoreBtn = document.createElement("button")
    loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Ver más resultados'
    loadMoreBtn.style.cssText = `
      padding: 10px 20px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    `

    loadMoreBtn.addEventListener("click", async () => {
      loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...'
      loadMoreBtn.disabled = true
      await loadMoreResults()
    })

    loadMoreDiv.appendChild(loadMoreBtn)
    booksList.appendChild(loadMoreDiv)
  }

  // Agregar opción manual
  const manualDiv = createManualOptionDiv()
  booksList.appendChild(manualDiv)

  resultsContainer.style.display = "block"
}

// NUEVA FUNCIÓN: Agregar más resultados sin limpiar
function appendMoreResults(books, searchInfo) {
  console.log("=== AGREGANDO MÁS RESULTADOS ===")

  const booksList = document.getElementById("booksResultsList")
  if (!booksList) return

  // Remover botón "Ver más" anterior y opción manual
  const oldLoadMore = booksList.querySelector("div[style*='text-align: center']")
  const oldManual = booksList.querySelector(".manual-option")
  if (oldLoadMore) oldLoadMore.remove()
  if (oldManual) oldManual.remove()

  // Actualizar header
  const header = document.querySelector("#googleBooksResults h4")
  if (header) {
    header.innerHTML = `
      <i class="fas fa-check-circle"></i> Se encontraron ${searchInfo.total} libros (mostrando ${searchInfo.showing}):
    `
  }

  // Agregar nuevos libros
  books.forEach((book) => {
    const resultDiv = createBookResultDiv(book)
    booksList.appendChild(resultDiv)
  })

  // Agregar nuevo botón "Ver más" si hay más resultados
  if (searchInfo.hasMore) {
    const loadMoreDiv = document.createElement("div")
    loadMoreDiv.style.cssText = `
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    `

    const loadMoreBtn = document.createElement("button")
    loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Ver más resultados'
    loadMoreBtn.style.cssText = `
      padding: 10px 20px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    `

    loadMoreBtn.addEventListener("click", async () => {
      loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...'
      loadMoreBtn.disabled = true
      await loadMoreResults()
    })

    loadMoreDiv.appendChild(loadMoreBtn)
    booksList.appendChild(loadMoreDiv)
  }

  // Agregar opción manual al final
  const manualDiv = createManualOptionDiv()
  booksList.appendChild(manualDiv)
}

// NUEVA FUNCIÓN: Crear div de resultado de libro
function createBookResultDiv(book) {
  const resultDiv = document.createElement("div")
  resultDiv.className = "openlibrary-book-result"
  resultDiv.style.cssText = `
    border: 1px solid #ddd;
    padding: 12px;
    margin: 8px 0;
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    gap: 12px;
    transition: all 0.2s;
    background: white;
  `

  // IMAGEN CORREGIDA - Sin placeholder externo
  const coverId = book.cover_i
  let thumbnail
  if (coverId) {
    thumbnail = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
  } else {
    // Crear imagen SVG inline en lugar de usar placeholder externo
    thumbnail = `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="90" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="90" fill="#f8f9fa" stroke="#dee2e6"/>
        <text x="30" y="35" text-anchor="middle" font-family="Arial" font-size="8" fill="#6c757d">Sin</text>
        <text x="30" y="50" text-anchor="middle" font-family="Arial" font-size="8" fill="#6c757d">Imagen</text>
      </svg>
    `)}`
  }

  // Información de editorial con indicador
  let publisherText = book.publisher_info || "Editorial no disponible"
  let publisherIcon = "fas fa-building"
  let publisherColor = "#666"

  if (book.image_publisher_match === true) {
    publisherIcon = "fas fa-check-circle"
    publisherColor = "#28a745"
    publisherText += " ✓"
  } else if (book.image_publisher_match === false) {
    publisherIcon = "fas fa-info-circle"
    publisherColor = "#ffc107"
  }

  if (book.all_publishers && book.all_publishers.length > 1) {
    publisherText += ` (+${book.all_publishers.length - 1} más)`
  }

  resultDiv.innerHTML = `
    <img src="${thumbnail}" alt="Portada" style="width: 60px; height: 90px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
    <div style="flex: 1;">
      <strong style="color: #333; font-size: 14px;">${book.title || "Sin título"}</strong><br>
      <span style="color: #666; font-size: 13px;">
        <i class="fas fa-user"></i> ${book.author_name?.join(", ") || "Autor desconocido"}
      </span><br>
      <span style="color: ${publisherColor}; font-size: 13px;">
        <i class="${publisherIcon}"></i> ${publisherText}
      </span><br>
      <span style="color: #666; font-size: 12px;">
        <i class="fas fa-calendar"></i> ${book.first_publish_year || "Fecha desconocida"}
      </span>
      ${
        book.all_publishers && book.all_publishers.length > 1
          ? `<br><small style="color: #999; font-size: 11px;">Otros editores: ${book.all_publishers.slice(1, 3).join(", ")}</small>`
          : ""
      }
    </div>
  `

  resultDiv.addEventListener("mouseenter", () => {
    resultDiv.style.backgroundColor = "#f0f8ff"
    resultDiv.style.borderColor = "#007bff"
    resultDiv.style.transform = "translateY(-1px)"
  })

  resultDiv.addEventListener("mouseleave", () => {
    resultDiv.style.backgroundColor = "white"
    resultDiv.style.borderColor = "#ddd"
    resultDiv.style.transform = "translateY(0)"
  })

  resultDiv.addEventListener("click", () => {
    console.log("Libro seleccionado:", book.title)
    selectOpenLibraryBook(book)
    document.getElementById("googleBooksResults").style.display = "none"
  })

  return resultDiv
}

// NUEVA FUNCIÓN: Crear div de opción manual
function createManualOptionDiv() {
  const manualDiv = document.createElement("div")
  manualDiv.className = "manual-option"
  manualDiv.style.cssText = `
    border: 2px dashed #007bff;
    padding: 15px;
    margin: 10px 0;
    cursor: pointer;
    border-radius: 6px;
    text-align: center;
    color: #007bff;
    background: #f8f9ff;
    transition: all 0.2s;
  `
  manualDiv.innerHTML = `
    <i class="fas fa-edit"></i> 
    <strong>Completar información manualmente</strong>
    <br><small>Si ninguno de estos libros es el correcto</small>
  `

  manualDiv.addEventListener("mouseenter", () => {
    manualDiv.style.backgroundColor = "#e3f2fd"
  })

  manualDiv.addEventListener("mouseleave", () => {
    manualDiv.style.backgroundColor = "#f8f9ff"
  })

  manualDiv.addEventListener("click", () => {
    console.log("Opción manual seleccionada")
    showManualImageOption()
    document.getElementById("googleBooksResults").style.display = "none"
  })

  return manualDiv
}

async function selectOpenLibraryBook(book) {
  console.log("=== LLENANDO CAMPOS AUTOMÁTICAMENTE ===")

  // LIMPIAR CAMPOS PRIMERO
  const titleField = document.getElementById("bookTitle")
  const authorField = document.getElementById("bookAuthor")
  const publisherField = document.getElementById("bookPublisher")
  const summaryField = document.getElementById("bookSummary")

  if (titleField) titleField.value = ""
  if (authorField) authorField.value = ""
  if (publisherField) publisherField.value = ""
  if (summaryField) summaryField.value = ""

  // Llenar campos del formulario
  if (titleField && book.title) {
    titleField.value = book.title
  }

  if (authorField && book.author_name && book.author_name.length > 0) {
    authorField.value = book.author_name.join(", ")
  }

  if (publisherField && book.publisher_info) {
    publisherField.value = book.publisher_info
  }

  // Intentar obtener descripción
  let bookDescription = "Descripción no disponible"
  if (book.key) {
    try {
      const detailResponse = await fetch(`https://openlibrary.org${book.key}.json`)
      const detailData = await detailResponse.json()

      if (detailData.description) {
        if (typeof detailData.description === "string") {
          bookDescription = detailData.description
        } else if (detailData.description.value) {
          bookDescription = detailData.description.value
        }
      }
    } catch (error) {
      console.log("No se pudieron obtener detalles adicionales:", error)
    }
  }

  if (summaryField) {
    summaryField.value = bookDescription
  }

  // Mostrar vista previa
  displayBookPreview(
    {
      title: book.title,
      author_name: book.author_name || [],
      publisher: [book.publisher_info],
      first_publish_year: book.first_publish_year,
      description: bookDescription,
      cover_i: book.cover_i,
    },
    false,
  )
}

function displayBookPreview(book, isManual = false) {
  const previewContainer = document.getElementById("bookPreviewContainer")
  if (!previewContainer) return

  // Determinar la imagen a usar - CORREGIDA
  let thumbnail
  let hasImage = false

  if (book.book_image) {
    thumbnail = book.book_image
    hasImage = true
  } else if (book.cover_i) {
    thumbnail = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
    hasImage = true
  } else if (isManual && book.imageLinks?.thumbnail) {
    thumbnail = book.imageLinks.thumbnail
    hasImage = true
  } else {
    // Imagen SVG inline para vista previa también
    thumbnail = `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="150" fill="#f8f9fa" stroke="#dee2e6"/>
        <text x="50" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#6c757d">Sin</text>
        <text x="50" y="85" text-anchor="middle" font-family="Arial" font-size="12" fill="#6c757d">Imagen</text>
      </svg>
    `)}`
  }

  const title = book.title || document.getElementById("bookTitle")?.value || "Sin título"
  const authors = book.author_name?.join(", ") || document.getElementById("bookAuthor")?.value || "Por completar"
  const publisher = book.publisher?.[0] || document.getElementById("bookPublisher")?.value || "Por completar"
  const year = book.first_publish_year || "Por completar"
  const description = book.description || document.getElementById("bookSummary")?.value || "Por completar"

  previewContainer.innerHTML = `
    <div style="border: 1px solid #28a745; padding: 15px; border-radius: 8px; background: #f8fff8; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h4 style="color: #28a745; margin: 0 0 15px 0;">
        <i class="fas fa-eye"></i> Vista previa del libro:
      </h4>
      <div style="display: flex; gap: 15px; align-items: flex-start;">
        <img src="${thumbnail}" alt="Portada" style="width: 100px; height: 150px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="flex: 1;">
          <strong style="font-size: 16px; color: #333;">${title}</strong><br><br>
          <div style="line-height: 1.6;">
            <span style="color: #666;"><i class="fas fa-user" style="width: 16px;"></i> <strong>Autor(es):</strong> ${authors}</span><br>
            <span style="color: #666;"><i class="fas fa-building" style="width: 16px;"></i> <strong>Editorial:</strong> ${publisher}</span><br>
            <span style="color: #666;"><i class="fas fa-calendar" style="width: 16px;"></i> <strong>Año:</strong> ${year}</span><br>
            <span style="color: #666;"><i class="fas fa-info-circle" style="width: 16px;"></i> <strong>Descripción:</strong> ${description.length > 100 ? description.substring(0, 100) + "..." : description}</span><br>
          </div>
          ${
            !hasImage
              ? `<button type="button" id="manualImageBtn" style="margin-top: 15px; padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                   <i class="fas fa-camera"></i> Agregar imagen manualmente
                 </button>`
              : '<div style="margin-top: 15px; color: #28a745; font-size: 14px;"><i class="fas fa-check-circle"></i> Imagen encontrada</div>'
          }
        </div>
      </div>
    </div>
  `

  // Guardar imagen para el guardado
  if (hasImage) {
    previewContainer.dataset.bookImage = thumbnail
  }

  // Configurar botón de imagen manual
  const manualBtn = document.getElementById("manualImageBtn")
  if (manualBtn) {
    manualBtn.addEventListener("click", () => {
      setupManualImageUpload()
    })
  }

  previewContainer.style.display = "block"
}

function setupManualImageUpload() {
  let fileInput = document.getElementById("bookImageInput")
  if (!fileInput) {
    fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.id = "bookImageInput"
    fileInput.accept = "image/*"
    fileInput.style.display = "none"
    document.body.appendChild(fileInput)
  }

  fileInput.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es muy grande. Por favor seleccione una imagen menor a 5MB.")
        return
      }

      if (!file.type.startsWith("image/")) {
        alert("Por favor seleccione un archivo de imagen válido.")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        displayBookPreview(
          {
            title: document.getElementById("bookTitle").value,
            author_name: [document.getElementById("bookAuthor").value],
            publisher: [document.getElementById("bookPublisher").value],
            cover_i: null,
            imageLinks: { thumbnail: e.target.result },
          },
          true,
        )
      }
      reader.readAsDataURL(file)
    }
  }

  fileInput.click()
}

function showNoResultsMessage() {
  const resultsContainer = document.getElementById("googleBooksResults")
  if (!resultsContainer) return

  resultsContainer.innerHTML = `
    <div style="text-align: center; padding: 20px; border: 2px dashed #ffc107; border-radius: 8px; background: #fffbf0;">
      <i class="fas fa-search" style="font-size: 24px; color: #ffc107; margin-bottom: 10px;"></i>
      <h4 style="color: #856404; margin: 10px 0;">No se encontraron libros</h4>
      <p style="color: #856404; margin: 10px 0;">No se encontraron libros con ese título en Open Library.</p>
      <button type="button" id="manualOptionBtn" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
        <i class="fas fa-edit"></i> Completar información manualmente
      </button>
    </div>
  `

  document.getElementById("manualOptionBtn").addEventListener("click", () => {
    showManualImageOption()
    resultsContainer.style.display = "none"
  })

  resultsContainer.style.display = "block"
}

function showErrorMessage(error) {
  const resultsContainer = document.getElementById("googleBooksResults")
  if (!resultsContainer) return

  resultsContainer.innerHTML = `
    <div style="text-align: center; padding: 20px; border: 2px solid #dc3545; border-radius: 8px; background: #f8d7da;">
      <i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #dc3545; margin-bottom: 10px;"></i>
      <h4 style="color: #721c24; margin: 10px 0;">Error en la búsqueda</h4>
      <p style="color: #721c24; margin: 10px 0;">Error: ${error}</p>
      <button type="button" id="manualOptionBtn" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
        <i class="fas fa-edit"></i> Completar información manualmente
      </button>
    </div>
  `

  document.getElementById("manualOptionBtn").addEventListener("click", () => {
    showManualImageOption()
    resultsContainer.style.display = "none"
  })

  resultsContainer.style.display = "block"
}

function showManualImageOption() {
  const previewContainer = document.getElementById("bookPreviewContainer")
  if (!previewContainer) return

  previewContainer.innerHTML = `
    <div style="border: 2px dashed #007bff; padding: 20px; border-radius: 8px; text-align: center; background: #f8f9ff;">
      <i class="fas fa-edit" style="font-size: 24px; color: #007bff; margin-bottom: 10px;"></i>
      <h4 style="color: #007bff; margin: 10px 0;">Completar información manualmente</h4>
      <p style="color: #495057; margin: 10px 0;">Complete los campos del formulario manualmente y agregue una imagen si lo desea.</p>
      <button type="button" id="manualImageBtn" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
        <i class="fas fa-camera"></i> Agregar imagen del libro
      </button>
    </div>
  `

  document.getElementById("manualImageBtn").addEventListener("click", () => {
    setupManualImageUpload()
  })

  previewContainer.style.display = "block"
}

function clearBookPreview() {
  const previewContainer = document.getElementById("bookPreviewContainer")
  const resultsContainer = document.getElementById("googleBooksResults")

  if (previewContainer) {
    previewContainer.style.display = "none"
    previewContainer.innerHTML = ""
    delete previewContainer.dataset.bookImage
  }

  if (resultsContainer) {
    resultsContainer.style.display = "none"
    resultsContainer.innerHTML = ""
  }
}

// Dashboard functions
function loadDashboardData() {
  fetch("../php/dashboard.php")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("totalBooks").textContent = data.totalBooks
      document.getElementById("totalStudents").textContent = data.totalStudents
      document.getElementById("activeLoans").textContent = data.activeLoans

      const activityTable = document.getElementById("recentActivityTable")
      activityTable.innerHTML = ""

      data.recentActivity.forEach((activity) => {
        const row = document.createElement("tr")
        row.innerHTML = `
                    <td>${activity.student_name}</td>
                    <td>${activity.book_title}</td>
                    <td>${activity.action}</td>
                    <td>${activity.date}</td>
                `
        activityTable.appendChild(row)
      })
    })
    .catch((error) => console.error("Error loading dashboard data:", error))
}

// Books functions
function loadBooks() {
  fetch("../php/books.php")
    .then((response) => response.json())
    .then((data) => {
      const booksTable = document.getElementById("booksTable")
      booksTable.innerHTML = ""

      data.forEach((book) => {
        const row = document.createElement("tr")
        row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.publisher}</td>
                    <td>${book.category}</td>
                    <td>${book.quantity}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit book-edit-btn" data-id="${book.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete book-delete-btn" data-id="${book.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `
        booksTable.appendChild(row)
      })

      document.querySelectorAll(".book-edit-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          editBook(this.getAttribute("data-id"))
        })
      })

      document.querySelectorAll(".book-delete-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          deleteBook(this.getAttribute("data-id"))
        })
      })
    })
    .catch((error) => console.error("Error loading books:", error))
}

function saveBook() {
  const bookId = document.getElementById("bookId").value
  const previewContainer = document.getElementById("bookPreviewContainer")

  const bookData = {
    title: document.getElementById("bookTitle").value,
    author: document.getElementById("bookAuthor").value,
    publisher: document.getElementById("bookPublisher").value,
    category: document.getElementById("bookCategory").value,
    quantity: document.getElementById("bookQuantity").value,
    summary: document.getElementById("bookSummary").value,
    book_image: previewContainer?.dataset.bookImage || null,
  }

  const url = "../php/books.php"
  const method = bookId ? "PUT" : "POST"

  if (bookId) {
    bookData.id = bookId
  }

  fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("bookModal").style.display = "none"
        loadBooks()
        loadDashboardData()
        clearBookPreview()
      } else {
        alert("Error: " + data.message)
      }
    })
    .catch((error) => {
      console.error("Error saving book:", error)
      alert("Error al guardar el libro")
    })
}

function editBook(id) {
  fetch(`../php/books.php?id=${id}`)
    .then((response) => response.json())
    .then((book) => {
      document.getElementById("bookModalTitle").textContent = "Editar Libro"
      document.getElementById("bookId").value = book.id
      document.getElementById("bookTitle").value = book.title
      document.getElementById("bookAuthor").value = book.author
      document.getElementById("bookPublisher").value = book.publisher
      document.getElementById("bookCategory").value = book.category
      document.getElementById("bookQuantity").value = book.quantity
      document.getElementById("bookSummary").value = book.summary

      if (book.book_image) {
        displayBookPreview(
          {
            title: book.title,
            author_name: book.author ? book.author.split(", ") : [],
            publisher: book.publisher ? [book.publisher] : [],
            first_publish_year: book.publish_year || "",
            description: book.summary || "",
            cover_i: null,
            book_image: book.book_image,
          },
          true,
        )
      }

      document.getElementById("bookModal").style.display = "block"
      setupOpenLibrarySearch()
    })
    .catch((error) => console.error("Error loading book details:", error))
}

function deleteBook(id) {
  if (confirm("¿Está seguro de que desea eliminar este libro?")) {
    fetch(`../php/books.php?id=${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadBooks()
          loadDashboardData()
          alert("Libro eliminado exitosamente")
        } else {
          alert("Error: " + data.message)
        }
      })
      .catch((error) => console.error("Error deleting book:", error))
  }
}

function filterBooks() {
  const searchTerm = document.getElementById("bookSearch").value.toLowerCase()
  const categoryFilter = document.getElementById("categoryFilter").value

  const rows = document.querySelectorAll("#booksTable tr")
  rows.forEach((row) => {
    const title = row.cells[0]?.textContent.toLowerCase() || ""
    const author = row.cells[1]?.textContent.toLowerCase() || ""
    const category = row.cells[3]?.textContent.toLowerCase() || ""

    const matchesSearch = title.includes(searchTerm) || author.includes(searchTerm)
    const matchesCategory = !categoryFilter || category === categoryFilter

    row.style.display = matchesSearch && matchesCategory ? "" : "none"
  })
}

// Students functions
function loadStudents() {
  fetch("../php/students.php")
    .then((response) => response.json())
    .then((data) => {
      const studentsTable = document.getElementById("studentsTable")
      studentsTable.innerHTML = ""

      data.forEach((student) => {
        const row = document.createElement("tr")
        row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.identification}</td>
                    <td>${student.grade}°</td>
                    <td>${student.address}</td>
                    <td>${student.active_loans || 0}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit student-edit-btn" data-id="${student.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete student-delete-btn" data-id="${student.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `
        studentsTable.appendChild(row)
      })

      document.querySelectorAll(".student-edit-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          editStudent(this.getAttribute("data-id"))
        })
      })

      document.querySelectorAll(".student-delete-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          deleteStudent(this.getAttribute("data-id"))
        })
      })
    })
    .catch((error) => console.error("Error loading students:", error))
}

function saveStudent() {
  const studentId = document.getElementById("studentId").value
  const studentData = {
    name: document.getElementById("studentName").value,
    identification: document.getElementById("studentIdentification").value,
    address: document.getElementById("studentAddress").value,
    grade: document.getElementById("studentGrade").value,
  }

  const url = "../php/students.php"
  const method = studentId ? "PUT" : "POST"

  if (studentId) {
    studentData.id = studentId
  }

  fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("studentModal").style.display = "none"
        loadStudents()
        loadDashboardData()
        alert("Estudiante guardado exitosamente")
      } else {
        alert("Error: " + data.message)
      }
    })
    .catch((error) => console.error("Error saving student:", error))
}

function editStudent(id) {
  fetch(`../php/students.php?id=${id}`)
    .then((response) => response.json())
    .then((student) => {
      document.getElementById("studentModalTitle").textContent = "Editar Estudiante"
      document.getElementById("studentId").value = student.id
      document.getElementById("studentName").value = student.name
      document.getElementById("studentIdentification").value = student.identification
      document.getElementById("studentAddress").value = student.address
      document.getElementById("studentGrade").value = student.grade

      document.getElementById("studentModal").style.display = "block"
    })
    .catch((error) => console.error("Error loading student details:", error))
}

function deleteStudent(id) {
  if (confirm("¿Está seguro de que desea eliminar este estudiante?")) {
    fetch(`../php/students.php?id=${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadStudents()
          loadDashboardData()
          alert("Estudiante eliminado exitosamente")
        } else {
          alert("Error: " + data.message)
        }
      })
      .catch((error) => console.error("Error deleting student:", error))
  }
}

function filterStudents() {
  const searchTerm = document.getElementById("studentSearch").value.toLowerCase()
  const gradeFilter = document.getElementById("gradeFilter").value

  const rows = document.querySelectorAll("#studentsTable tr")
  rows.forEach((row) => {
    const name = row.cells[0]?.textContent.toLowerCase() || ""
    const identification = row.cells[1]?.textContent.toLowerCase() || ""
    const grade = row.cells[2]?.textContent.replace("°", "") || ""

    const matchesSearch = name.includes(searchTerm) || identification.includes(searchTerm)
    const matchesGrade = !gradeFilter || grade === gradeFilter

    row.style.display = matchesSearch && matchesGrade ? "" : "none"
  })
}

// Loans functions
function loadLoans() {
  fetch("../php/loans.php")
    .then((response) => response.json())
    .then((data) => {
      const loansTable = document.getElementById("loansTable")
      loansTable.innerHTML = ""

      data.forEach((loan) => {
        const row = document.createElement("tr")
        row.innerHTML = `
                      <td>${loan.student_identification}</td>
                      <td>${loan.student_name}</td>
                      <td>${loan.book_title}</td>
                      <td>${loan.loan_date}</td>
                      <td>${loan.return_date || "Pendiente"}</td>
                      <td>${getStatusBadge(loan.status)}</td>
                      <td>
                          <div class="action-buttons">
                              ${loan.status === "active" ? `<button class="btn-view" onclick="returnBook(${loan.id})"><i class="fas fa-undo"></i></button>` : ""}
                          </div>
                      </td>
                `
        loansTable.appendChild(row)
      })
    })
    .catch((error) => console.error("Error loading loans:", error))
}

function loadStudentsForLoan() {
  fetch("../php/students.php")
    .then((response) => response.json())
    .then((data) => {
      const select = document.getElementById("loanStudent")
      select.innerHTML = '<option value="">Seleccionar estudiante</option>'

      data.forEach((student) => {
        const option = document.createElement("option")
        option.value = student.id
        option.textContent = `${student.name} (${student.identification})`
        select.appendChild(option)
      })
    })
    .catch((error) => console.error("Error loading students for loan:", error))
}

function loadBooksForLoan() {
  fetch("../php/books.php?available=true")
    .then((response) => response.json())
    .then((data) => {
      const select = document.getElementById("loanBook")
      select.innerHTML = '<option value="">Seleccionar libro</option>'

      data.forEach((book) => {
        if (book.available_quantity > 0) {
          const option = document.createElement("option")
          option.value = book.id
          option.textContent = `${book.title} - ${book.author} (Disponibles: ${book.available_quantity})`
          select.appendChild(option)
        }
      })
    })
    .catch((error) => console.error("Error loading books for loan:", error))
}

function saveLoan() {
  const loanData = {
    student_id: document.getElementById("loanStudent").value,
    book_id: document.getElementById("loanBook").value,
    loan_date: document.getElementById("loanDate").value,
  }

  fetch("../php/loans.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loanData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("loanModal").style.display = "none"
        loadLoans()
        loadBooks()
        loadDashboardData()
        alert("Préstamo registrado exitosamente")
      } else {
        alert("Error: " + data.message)
      }
    })
    .catch((error) => console.error("Error saving loan:", error))
}

function returnBook(loanId) {
  fetch(`../php/loans.php?id=${loanId}`)
    .then((response) => response.json())
    .then((loan) => {
      document.getElementById("returnLoanId").value = loan.id
      document.getElementById("returnStudentName").value = loan.student_name
      document.getElementById("returnBookTitle").value = loan.book_title
      document.getElementById("returnDate").valueAsDate = new Date()

      document.getElementById("returnModal").style.display = "block"
    })
    .catch((error) => console.error("Error loading loan details:", error))
}

function saveReturn() {
  const returnData = {
    loan_id: document.getElementById("returnLoanId").value,
    return_date: document.getElementById("returnDate").value,
  }

  fetch("../php/returns.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(returnData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("returnModal").style.display = "none"
        loadLoans()
        loadReturns()
        loadBooks()
        loadDashboardData()
        alert("Devolución registrada exitosamente")
      } else {
        alert("Error: " + data.message)
      }
    })
    .catch((error) => console.error("Error saving return:", error))
}

function loadReturns() {
  fetch("../php/returns.php")
    .then((response) => response.json())
    .then((data) => {
      const returnsTable = document.getElementById("returnsTable")
      returnsTable.innerHTML = ""

      data.forEach((returnItem) => {
        const row = document.createElement("tr")
        row.innerHTML = `
                    <td>${returnItem.loan_id}</td>
                    <td>${returnItem.student_name}</td>
                    <td>${returnItem.book_title}</td>
                    <td>${returnItem.loan_date}</td>
                    <td>${returnItem.return_date}</td>
                    <td>Devuelto</td>
                `
        returnsTable.appendChild(row)
      })
    })
    .catch((error) => console.error("Error loading returns:", error))
}

function filterLoans() {
  const searchTerm = document.getElementById("loanSearch").value.toLowerCase()

  const rows = document.querySelectorAll("#loansTable tr")
  rows.forEach((row) => {
    const studentIdentification = row.cells[0]?.textContent || ""
    const student = row.cells[1]?.textContent.toLowerCase() || ""
    const book = row.cells[2]?.textContent.toLowerCase() || ""

    const matches =
      student.includes(searchTerm) || book.includes(searchTerm) || studentIdentification.includes(searchTerm)
    row.style.display = matches ? "" : "none"
  })
}

function filterReturns() {
  const searchTerm = document.getElementById("returnSearch").value.toLowerCase()

  const rows = document.querySelectorAll("#returnsTable tr")
  rows.forEach((row) => {
    const student = row.cells[1]?.textContent.toLowerCase() || ""
    const book = row.cells[2]?.textContent.toLowerCase() || ""

    const matches = student.includes(searchTerm) || book.includes(searchTerm)
    row.style.display = matches ? "" : "none"
  })
}

// Reports functions
function generatePendingReturnsReport() {
  fetch("../php/reports.php?type=pending_returns")
    .then((response) => response.json())
    .then((data) => {
      displayReport("Estudiantes con Libros Pendientes", data)
    })
    .catch((error) => console.error("Error generating report:", error))
}

function generateBookInventoryReport() {
  fetch("../php/reports.php?type=book_inventory")
    .then((response) => response.json())
    .then((data) => {
      displayReport("Inventario de Libros", data)
    })
    .catch((error) => console.error("Error generating report:", error))
}

function generateLoanHistoryReport() {
  fetch("../php/reports.php?type=loan_history")
    .then((response) => response.json())
    .then((data) => {
      displayReport("Historial de Préstamos", data)
    })
    .catch((error) => console.error("Error generating report:", error))
}

function displayReport(title, data) {
  const reportResult = document.getElementById("reportResult")
  reportResult.innerHTML = `
        <h2>${title}</h2>
        <div class="report-content">
            ${generateReportTable(data)}
        </div>
    `
}

function generateReportTable(data) {
  if (!data || data.length === 0) {
    return "<p>No hay datos para mostrar.</p>"
  }

  const headers = Object.keys(data[0])
  let table = "<table><thead><tr>"

  headers.forEach((header) => {
    table += `<th>${header.replace("_", " ").toUpperCase()}</th>`
  })

  table += "</tr></thead><tbody>"

  data.forEach((row) => {
    table += "<tr>"
    headers.forEach((header) => {
      table += `<td>${row[header]}</td>`
    })
    table += "</tr>"
  })

  table += "</tbody></table>"
  return table
}

function getStatusBadge(status) {
  const badges = {
    active: '<span class="badge badge-warning">Activo</span>',
    returned: '<span class="badge badge-success">Devuelto</span>',
    overdue: '<span class="badge badge-danger">Vencido</span>',
  }
  return badges[status] || status
}
