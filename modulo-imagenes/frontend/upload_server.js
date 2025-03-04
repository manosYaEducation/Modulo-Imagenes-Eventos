document.getElementById("uploadForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Evita que la página se recargue

    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecciona una imagen.");
        return;
    }

    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch("../backend/upload_server.php", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            alert("Imagen subida con éxito.");
            fileInput.value = ""; // Limpiar input después de subir la imagen
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        alert("Hubo un problema al subir la imagen.");
    }
});