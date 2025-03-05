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

// Configurar la paginación
$imagesPerPage = 6;
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;

// Contar el total de imágenes relacionadas
$totalQuery = $conn->prepare("SELECT COUNT(*) as total FROM imagenes_base64 WHERE carta_front = ?");
$totalQuery->bind_param('s', $carta_front);
$totalQuery->execute();
$totalResult = $totalQuery->get_result();
$totalRow = $totalResult->fetch_assoc();
$total = $totalRow['total'];

$totalPages = ceil($total / $imagesPerPage);
$page = min($page, $totalPages);

// Calcular el offset
$offset = ($page - 1) * $imagesPerPage;

// Preparar la consulta con paginación
$query = "SELECT * FROM imagenes_base64 WHERE carta_front = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
if ($stmt = $conn->prepare($query)) {
    $stmt->bind_param('sii', $carta_front, $imagesPerPage, $offset);
    $stmt->execute();
    $result = $stmt->get_result();

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

    echo json_encode([
        "images" => $imagenesRelacionadas,
        "currentPage" => $page,
        "totalPages" => $totalPages,
        "total" => $total,
        "imagesPerPage" => $imagesPerPage,
        "showing" => count($imagenesRelacionadas)
    ]);
    exit();
} else {
    echo json_encode(["error" => "Error en la consulta"]);
    exit();
}

// Cerrar la conexión
$conn->close();
?>