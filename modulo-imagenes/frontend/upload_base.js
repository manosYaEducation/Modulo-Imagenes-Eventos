document.getElementById("uploadForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById("imageInput");

    // Verificar si se seleccionó un archivo
    if (fileInput.files.length === 0) {
        alert("Por favor selecciona una imagen.");
        return;
    }

    const formData = new FormData();
    formData.append("imageInput", fileInput.files[0]);

    try {
        // Enviar la solicitud al backend
        const response = await fetch("../backend/upload_base.php", {
            method: "POST",
            body: formData
        });

        // Verificar si la respuesta es exitosa
        const result = await response.json();

        if (result.success) {
            alert("Imagen subida correctamente.");
        } else {
            throw new Error("Error al subir la imagen: " + result.message);
        }
    } catch (error) {
        console.error("Error al enviar la solicitud:", error);
        alert("Hubo un error al subir la imagen.");
    }
});