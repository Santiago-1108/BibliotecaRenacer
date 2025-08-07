<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';
$userType = $_POST['userType'] ?? '';

if (empty($username) || empty($password) || empty($userType)) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
    exit;
}

try {
    if ($userType === 'admin') {
        // Check admin credentials
        $stmt = $pdo->prepare("SELECT * FROM administrators WHERE username = ? AND password = ?");
        $stmt->execute([$username, $password]);
        $admin = $stmt->fetch();
        
        if ($admin) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $admin['id'],
                    'name' => $admin['name'],
                    'type' => 'admin'
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Credenciales de administrador incorrectas']);
        }
    } else {
        // Check student credentials (identification as both username and password)
        $stmt = $pdo->prepare("SELECT * FROM students WHERE identification = ? AND identification = ?");
        $stmt->execute([$username, $password]);
        $student = $stmt->fetch();
        
        if ($student) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $student['id'],
                    'name' => $student['name'],
                    'identification' => $student['identification'],
                    'grade' => $student['grade'],
                    'address' => $student['address'],
                    'type' => 'student'
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Credenciales de estudiante incorrectas']);
        }
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>
