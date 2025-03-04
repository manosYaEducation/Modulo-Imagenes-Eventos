<?php
try {
    // Configuración de la base de datos local
    $host = "localhost";
    $dbname = "alphadocere_aiweekend_salfi_card";
    $username = "root";
    $password = "";

    // Crear conexión con MySQL
    $conn = new mysqli($host, $username, $password, $dbname);

    // Verificar conexión
    if ($conn->connect_error) {
        throw new Exception("Error de conexión a la base de datos: " . $conn->connect_error);
    }

    // Verificar si se envió una imagen
    if (!isset($_FILES["image"])) {
        throw new Exception("No se recibió ninguna imagen.");
    }

    // Obtener información del archivo
    $image = $_FILES["image"];
    $uploadDir = "../aiweekend_selfi_card/uploads/"; // Carpeta donde se guardarán las imágenes
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $imageName = time() . "_" . basename($image["name"]); // Nombre único
    $imagePath = $uploadDir . $imageName;

    // Mover el archivo al directorio de destino
    if (!move_uploaded_file($image["tmp_name"], $imagePath)) {
        throw new Exception("Error al subir la imagen.");
    }

    // Obtener datos de la API externa (para asociar una carta aleatoria)
    $api_url = "https://www.alphadocere.cl/API/cartas-random/";
    $api_response = file_get_contents($api_url);
    $card_data = json_decode($api_response, true);

    if (!$card_data || !isset($card_data['carta_front']) || !isset($card_data['frase'])) {
        throw new Exception("Error al obtener datos de la API de cartas.");
    }

    // Extraer datos de la carta
    $carta_front = $card_data['carta_front'];
    $frase = $card_data['frase'];

    // Verificar si la tabla existe
    $table_check = $conn->query("SHOW TABLES LIKE 'imagenes_base64'");
    if ($table_check->num_rows == 0) {
        throw new Exception("La tabla 'imagenes_base64' no existe en la base de datos.");
    }

    // Guardar en la base de datos la ruta de la imagen en lugar de Base64
    $stmt = $conn->prepare("INSERT INTO imagenes_base64 (url, carta_front, frase) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $imagePath, $carta_front, $frase);

    if (!$stmt->execute()) {
        throw new Exception("Error al guardar la información: " . $stmt->error);
    }

    // Cerrar conexión
    $stmt->close();
    $conn->close();

    // Responder con datos de la API junto con mensaje de éxito
    echo json_encode([
        "success" => true,
        "image_url" => $imagePath,
        "carta_front" => $carta_front,
        "frase" => $frase
    ]);

} catch (Exception $e) {
    http_response_code(400); // Código 400 = Bad Request
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>