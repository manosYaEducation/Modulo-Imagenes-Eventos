const masonry = document.querySelector(".masonry");
let currentPage = 1;
let totalPages = 1;
const IMAGES_PER_PAGE = 6;

// Crear contenedor de paginación
const paginationContainer = document.createElement("div");
paginationContainer.className = "pagination-container";
masonry.parentNode.insertBefore(paginationContainer, masonry.nextSibling);

// Función para mezclar array aleatoriamente
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Función para obtener imágenes
async function fetchImages(page = 1) {
  try {
    document.getElementById("result").innerText = "Cargando imágenes...";

    const response = await fetch(
      `http://localhost/fusion_apis/backend/get_all_b64_2.php?page=${page}`
    );
    const data = await response.json();

    if (data.images && data.images.length > 0) {
      // Mezclar las imágenes aleatoriamente
      const shuffledImages = shuffleArray([...data.images]);
      renderImages(shuffledImages);
      totalPages = data.totalPages;
      currentPage = data.currentPage;
      updatePagination();
      document.getElementById(
        "result"
      ).innerText = `Mostrando página ${currentPage} de ${totalPages} (Total: ${data.total} imágenes)`;
    } else {
      document.getElementById("result").innerText =
        "No hay imágenes para mostrar en esta página";
    }
    // Oculta el GIF de carga después de cargar las imágenes
    document.getElementById('loading').style.display = 'none';
  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    document.getElementById("result").innerText =
      "Error al cargar las imágenes";
    // En caso de error, también ocultamos el GIF
    document.getElementById('loading').style.display = 'none';
  }
}

// Función para renderizar imágenes
function renderImages(images) {
  masonry.innerHTML = "";

  const gridContainer = document.createElement("div");
  gridContainer.className = "grid-container";

  // Asignar aleatoriamente cuáles serán las imágenes destacadas
  const featuredIndices = shuffleArray([...Array(images.length).keys()]).slice(
    0,
    2
  );

  images.forEach((imgData, index) => {
    const container = document.createElement("div");
    container.className = "flip-container grid-item";

    // Asignar featured aleatoriamente
    if (featuredIndices.includes(index)) {
      container.classList.add("featured");
    }

    const flipper = document.createElement("div");
    flipper.className = "flipper";

    const frontImg = document.createElement("img");
    frontImg.className = "front";
    // Verificar si la imagen es base64 o una URL externa
      frontImg.src = 'data:image/jpeg;base64,' + imgData.url; // Imagen en Base64
      

    // Imagen de carga mientras se carga la imagen real
    frontImg.style.opacity = "0";
    frontImg.onload = () => {
      frontImg.style.opacity = "1";
      container.style.transform = "translateY(0)";
    };

    const backImg = document.createElement("img");
    backImg.className = "back";
    backImg.src = imgData.carta_front;

    flipper.appendChild(frontImg);
    flipper.appendChild(backImg);
    container.appendChild(flipper);
    gridContainer.appendChild(container);

    // Evento de click
    container.addEventListener("click", () => {
      container.classList.toggle("flipped");
      const resultDisplay = document.getElementById("result");
      resultDisplay.innerText = imgData.frase;
    });
  });

  masonry.appendChild(gridContainer);
}

// Función para actualizar la paginación
function updatePagination() {
  paginationContainer.innerHTML = "";

  // Solo mostrar botones si hay más de una página
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.className = `page-button ${i === currentPage ? "active" : ""}`;
      pageButton.innerText = i;
      pageButton.onclick = () => {
        if (i !== currentPage) {
          fetchImages(i);
        }
      };
      paginationContainer.appendChild(pageButton);
    }
  }
}

// Botón de reorganizar
const shuffleButton = document.createElement("button");
shuffleButton.innerText = "Reorganizar";
shuffleButton.className = "page-button shuffle-button";
shuffleButton.onclick = () => fetchImages(currentPage);
paginationContainer.parentNode.insertBefore(shuffleButton, paginationContainer);

// Inicializar la página
fetchImages();

// Manejar resize de la ventana
window.addEventListener("resize", () => {
  document.querySelectorAll(".front").forEach((img) => {
    if (img.naturalWidth) {
      const container = img.closest(".grid-item");
      if (container) {
        container.style.height = `${container.offsetWidth}px`;
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("Script cargado correctamente");

  const sidebar = document.getElementById("sidebar");
  const abrirBtn = document.getElementById("abrirSidebar");
  const cerrarBtn = document.getElementById("cerrarSidebar");
  const contenido = document.getElementById("contenido");
  const sidebarCartas = document.getElementById("sidebarCartas");

  if (!sidebar || !abrirBtn || !cerrarBtn || !contenido || !sidebarCartas) {
      console.error("No se encontraron los elementos en el DOM.");
      return;
  }

  abrirBtn.addEventListener("click", function () {
      console.log("Abriendo sidebar...");
      sidebar.classList.add("active");
      contenido.classList.add("contenido-desplazado");

      // Llenar el sidebar con todas las cartas
      mostrarCartasEnSidebar();
  });

  function mostrarCartasEnSidebar() {
    sidebarCartas.innerHTML = ""; // Limpiar contenido previo
  
    fetch(`http://localhost/Fusion_apis/backend/get_all_b64_2.php?page=1`)
      .then(response => response.json())
      .then(data => {
        if (!data.totalPages) {
          console.error("No se encontró 'totalPages' en la respuesta de la API.");
          return;
        }
  
        let totalPages = data.totalPages;
        let allImages = [];
        let fetchPromises = [];
  
        // Usar un Set para evitar duplicados
        let cartasVista = new Set();
  
        for (let i = 1; i <= totalPages; i++) {
          let promise = fetch(`http://localhost/Fusion_apis/backend/get_all_b64_2.php?page=${i}`)
            .then(response => response.json())
            .then(pageData => {
              if (pageData.images) {
                pageData.images.forEach(imgData => {
                  // Verificar si la imagen ya fue añadida
                  if (!cartasVista.has(imgData.carta_front)) {
                    allImages.push(imgData);
                    cartasVista.add(imgData.carta_front);
                  }
                });
              }
            })
            .catch(error => console.error(`Error en la página ${i}:`, error));
  
          fetchPromises.push(promise);
        }
  
        // Esperar que todas las solicitudes terminen
        Promise.all(fetchPromises).then(() => {
          if (allImages.length > 0) {
            allImages.forEach(imgData => {
              const cartaImg = document.createElement("img");
              cartaImg.src = imgData.carta_front;
              cartaImg.className = "sidebar-carta";
              cartaImg.setAttribute("data-carta-id", imgData.carta_front);  // Asignamos un ID único a cada carta
              sidebarCartas.appendChild(cartaImg);
            });
  
            // Ahora asignamos los eventos de clic
            setupSidebarClickEvents();  // Llamamos a la función para configurar los eventos de clic
  
          } else {
            sidebarCartas.innerHTML = "<p>No hay cartas disponibles.</p>";
          }
        });
      })
      .catch(error => console.error("Error al obtener el número de páginas:", error));
  }

  // Cerrar el sidebar
  cerrarBtn.addEventListener("click", function () {
      console.log("Cerrando sidebar...");
      sidebar.classList.remove("active");
      contenido.classList.remove("contenido-desplazado");
  });
});

//Cartas sidebar

// Función para obtener imágenes relacionadas
async function fetchRelatedImages(carta_front) {
  try {

    const response = await fetch(
      `http://localhost/Fusion_apis/backend/get_related_images.php?carta_front=${carta_front}`
    );
    const data = await response.json();

    if (data.images && data.images.length > 0) {
      // Mezclar las imágenes aleatoriamente
      const shuffledImages = shuffleArray([...data.images]);
      renderImages(shuffledImages); // Renderizar las imágenes relacionadas
      
    } else {
      document.getElementById("result").innerText = "No hay imágenes relacionadas disponibles.";
    }

    // Oculta el GIF de carga después de cargar las imágenes
    document.getElementById('loading').style.display = 'none';
  } catch (error) {
    console.error("Error al obtener imágenes relacionadas:", error);
    document.getElementById("result").innerText = "Error al cargar las imágenes relacionadas";
    document.getElementById('loading').style.display = 'none';
  }
}

// Función para renderizar las imágenes en la masonry
function renderImages(images) {
  const masonry = document.querySelector('.masonry');
  masonry.innerHTML = ""; // Limpiar contenido previo

  const gridContainer = document.createElement("div");
  gridContainer.className = "grid-container";

  // Asignar aleatoriamente cuáles serán las imágenes destacadas
  const featuredIndices = shuffleArray([...Array(images.length).keys()]).slice(0, 2);

  images.forEach((imgData, index) => {
    const container = document.createElement("div");
    container.className = "flip-container grid-item";

    // Asignar featured aleatoriamente
    if (featuredIndices.includes(index)) {
      container.classList.add("featured");
    }

    const flipper = document.createElement("div");
    flipper.className = "flipper";

    const frontImg = document.createElement("img");
    frontImg.className = "front";
    frontImg.src = imgData.url;

    // Imagen de carga mientras se carga la imagen real
    frontImg.style.opacity = "0";
    frontImg.onload = () => {
      frontImg.style.opacity = "1";
      container.style.transform = "translateY(0)";
    };

    const backImg = document.createElement("img");
    backImg.className = "back";
    backImg.src = imgData.carta_front;

    flipper.appendChild(frontImg);
    flipper.appendChild(backImg);
    container.appendChild(flipper);
    gridContainer.appendChild(container);

    // Evento de click para mostrar la frase
    container.addEventListener("click", () => {
      container.classList.toggle("flipped");
      const resultDisplay = document.getElementById("result");
      resultDisplay.innerText = imgData.frase;
    });
  });

  masonry.appendChild(gridContainer); // Agregar las nuevas imágenes al contenedor masonry
}

// Función para manejar el clic en las cartas del sidebar
function setupSidebarClickEvents() {
  console.log("Configurando eventos de clic en las cartas del sidebar");

  // Agregar el evento de clic en todas las cartas del sidebar
  document.querySelectorAll('.sidebar-carta').forEach(cartaImg => {
    cartaImg.addEventListener('click', function () {
      const carta_front = cartaImg.getAttribute('data-carta-id'); // Obtener el ID de la carta seleccionada
      console.log("Carta seleccionada con ID:", carta_front); // Verifica si el ID se está obteniendo
      fetchRelatedImages(carta_front); // Obtener imágenes relacionadas con esa carta
    });
  });

  // Agregar el evento de clic al botón "Ver Todo"
  const verTodoBtn = document.getElementById('verTodo');
  if (verTodoBtn) {
    verTodoBtn.addEventListener('click', function () {
      console.log("Botón 'Ver Todo' clickeado");
      fetchImages(1); // Llamar a la función con page = 1
    });
  }
}

// Función para mezclar el arreglo de imágenes aleatoriamente
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Llamamos a la función que agrega el evento de clic en el sidebar cuando cargue el contenido
setupSidebarClickEvents();
