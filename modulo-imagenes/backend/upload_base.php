<?php
try {
    // Conectar a la base de datos
    $host = "localhost";
    $dbname = "alphadocere_aiweekend_salfi_card";
    $username = "root";
    $password = "";
    $conn = new mysqli($host, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Error de conexión a la base de datos: " . $conn->connect_error);
    }

    // Verificar si el archivo se ha subido correctamente
    if (isset($_FILES['imageInput']) && $_FILES['imageInput']['error'] === UPLOAD_ERR_OK) {
        // Obtener los datos del archivo subido
        $image = $_FILES['imageInput'];  // Archivo de la imagen

        // Validar que el archivo tiene un tipo permitido
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($image['type'], $allowed_types)) {
            throw new Exception('Tipo de imagen no permitido.');
        }

        // Leer la imagen y convertirla en datos binarios
        $image_data = file_get_contents($image['tmp_name']);

        // Obtener datos de la API externa
        $api_url = "https://www.alphadocere.cl/API/cartas-random/";
        $api_response = file_get_contents($api_url);
        $card_data = json_decode($api_response, true);

        if (!$card_data || !isset($card_data['carta_front']) || !isset($card_data['frase'])) {
            throw new Exception("Error al obtener datos de la API de cartas.");
        }

        // Extraer datos de la carta
        $carta_front = $card_data['carta_front'];
        $frase = $card_data['frase'];

        // Insertar en la base de datos
        $stmt = $conn->prepare("INSERT INTO imagenes_base64 (carta_front, frase, imagen) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $carta_front, $frase, $image_data);

        if (!$stmt->execute()) {
            throw new Exception("Error al guardar la información: " . $stmt->error);
        }

        // Responder con un mensaje de éxito
        echo json_encode([
            'success' => true,
            'message' => 'Imagen subida correctamente.'
        ]);
    } else {
        throw new Exception('Error al cargar el archivo.');
    }
} catch (Exception $e) {
    // Responder con un mensaje de error en formato JSON
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
