<?php
require_once 'config.php';

// Configurar headers para evitar errores de CORS y asegurar JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Desactivar la visualización de errores para evitar HTML en respuesta JSON
ini_set('display_errors', 0);
error_reporting(0);

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Obtener un solo libro
                $stmt = $pdo->prepare("SELECT * FROM books WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $book = $stmt->fetch();
                
                if ($book) {
                    echo json_encode($book);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Libro no encontrado']);
                }
            } elseif (isset($_GET['available'])) {
                // Obtener libros disponibles con cantidad
                $stmt = $pdo->query("
                    SELECT b.*, 
                           (b.quantity - COALESCE(active_loans.count, 0)) as available_quantity
                    FROM books b
                    LEFT JOIN (
                        SELECT book_id, COUNT(*) as count 
                        FROM loans 
                        WHERE status = 'active' 
                        GROUP BY book_id
                    ) active_loans ON b.id = active_loans.book_id
                    WHERE b.book_condition != 'malo'
                ");
                echo json_encode($stmt->fetchAll());
            } else {
                // Obtener todos los libros 
                $stmt = $pdo->query("SELECT * FROM books ORDER BY title");
                echo json_encode($stmt->fetchAll());
            }
            break;
            
        case 'POST':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            // Validar datos requeridos
            if (!$data || !isset($data['title']) || empty(trim($data['title']))) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'El título es requerido']);
                break;
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO books (title, author, publisher, category, quantity, book_condition, summary,book_image) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $result = $stmt->execute([
                trim($data['title']),
                trim($data['author'] ?? ''),
                trim($data['publisher'] ?? ''),
                trim($data['category'] ?? ''),
                intval($data['quantity'] ?? 1),
                $data['book_condition'] ?? 'bueno',
                trim($data['summary'] ?? ''),
                trim($data['book_image'] ?? 'default.jpg') // Asignar imagen por defecto si no se proporciona
            ]);
            
            if ($result) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Libro agregado exitosamente',
                    'id' => $pdo->lastInsertId()
                ]);
            } else {
                throw new Exception('Error al insertar el libro');
            }
            break;
            
        case 'PUT':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            // Validar datos requeridos
            if (!$data || !isset($data['id']) || !isset($data['title']) || empty(trim($data['title']))) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID y título son requeridos']);
                break;
            }
            
            $stmt = $pdo->prepare("
                UPDATE books 
                SET title = ?, author = ?, publisher = ?, category = ?, quantity = ?, book_condition = ?, summary = ?, book_image = ?
                WHERE id = ?
            ");
            
            $result = $stmt->execute([
                trim($data['title']),
                trim($data['author'] ?? ''),
                trim($data['publisher'] ?? ''),
                trim($data['category'] ?? ''),
                intval($data['quantity'] ?? 1),
                $data['book_condition'] ?? 'bueno',
                trim($data['summary'] ?? ''),
                trim($data['book_image'] ?? 'default.jpg'), // Asignar imagen por defecto si no se proporciona
                intval($data['id'])
            ]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Libro actualizado exitosamente']);
            } else {
                throw new Exception('Error al actualizar el libro');
            }
            break;
            
        case 'DELETE':
            if (!isset($_GET['id']) || empty($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID es requerido']);
                break;
            }
            
            $id = intval($_GET['id']);
            
            // Verificar si el libro tiene préstamos activos
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM loans WHERE book_id = ? AND status = 'active'");
            $stmt->execute([$id]);
            $activeLoans = $stmt->fetch()['count'];
            
            if ($activeLoans > 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'No se puede eliminar un libro con préstamos activos']);
                break;
            }
            
            $stmt = $pdo->prepare("DELETE FROM books WHERE id = ?");
            $result = $stmt->execute([$id]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Libro eliminado exitosamente']);
            } else {
                throw new Exception('Error al eliminar el libro');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            break;
    }
    
} catch (PDOException $e) {
    error_log("Database error in books.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos']);
} catch (Exception $e) {
    error_log("General error in books.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
