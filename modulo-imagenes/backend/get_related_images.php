<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

// Cargar variables de entorno usando ruta relativa
$env_file = '../.env';
if (!file_exists($env_file)) {
    echo json_encode(["error" => "Archivo .env no encontrado en: " . $env_file]);
    exit();
}

$env = parse_ini_file($env_file);
$host = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASSWORD'];
$dbname = $env['DB_NAME'];

// Conectar con MySQL usando mysqli
$conn = new mysqli($host, $username, $password, $dbname);

// Verificar si la conexión fue exitosa
if ($conn->connect_error) {
    echo json_encode(["error" => "Conexión fallida: " . $conn->connect_error]);
    exit();
}

// Obtener el parámetro 'carta_front' de la URL (GET)
if (!isset($_GET['carta_front'])) {
    echo json_encode(["error" => "Parámetro carta_front no proporcionado"]);
    exit();
}

$carta_front = $_GET['carta_front'];

// Preparar la consulta
$query = "SELECT * FROM imagenes_base64 WHERE carta_front = ?";
if ($stmt = $conn->prepare($query)) {
    $stmt->bind_param('s', $carta_front);
    $stmt->execute();
    $result = $stmt->get_result();

    // Verificar si hay resultados
    if ($result->num_rows > 0) {
        $imagenesRelacionadas = [];
        while ($row = $result->fetch_assoc()) {
            if (!empty($row['carta_front'])) { // Filtrar registros vacíos
                // Convertir el BLOB en Base64 si existe
                if (!empty($row['imagen'])) {
                    $row['imagen'] = "data:image/jpeg;base64," . base64_encode($row['imagen']);
                    $row['image_type'] = "base64";
                } elseif (!empty($row['url'])) {
                    $row['image_type'] = "url";
                } else {
                    $row['image_type'] = "unknown";
                }
                $imagenesRelacionadas[] = $row;
            }
        }
        echo json_encode(["images" => $imagenesRelacionadas]);
        exit();
    } else {
        echo json_encode(["error" => "No se encontraron imágenes relacionadas"]);
        exit();
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "Error en la consulta"]);
    exit();
}

// Cerrar la conexión
$conn->close();
?>