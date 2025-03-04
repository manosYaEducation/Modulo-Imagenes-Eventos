<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

// Cargar variables de entorno usando ruta relativa
$env_file = '../.env';
if (!file_exists($env_file)) {
    die(json_encode(["error" => "Archivo .env no encontrado en: " . $env_file]));
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
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}

// Obtener el parámetro 'carta_front' de la URL (GET)
if (isset($_GET['carta_front'])) {
    $carta_front = $_GET['carta_front'];
    
    // Preparar la consulta para obtener imágenes relacionadas
    $query = "SELECT * FROM imagenes_base64 WHERE carta_front = ?";
    
    if ($stmt = $conn->prepare($query)) {
        // Enlazar el parámetro 'carta_front'
        $stmt->bind_param('s', $carta_front); // 's' para string
        $stmt->execute();
        $result = $stmt->get_result();
        
        // Verificar si se encontraron resultados
        if ($result->num_rows > 0) {
            $imagenesRelacionadas = [];
            while ($row = $result->fetch_assoc()) {
                $imagenesRelacionadas[] = $row; // Almacenar los resultados
            }
            // Devolver las imágenes en formato JSON
            echo json_encode(['images' => $imagenesRelacionadas]);
        } else {
            echo json_encode(['error' => 'No se encontraron imágenes relacionadas']);
        }
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Error en la consulta']);
    }
} else {
    echo json_encode(['error' => 'Parámetro carta_front no proporcionado']);
}

// Cerrar la conexión
$conn->close();
?>