<?php
require_once 'config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Get single student
                $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $student = $stmt->fetch();
                echo json_encode($student);
            } else {
                // Get all students with active loans count
                $stmt = $pdo->query("
                    SELECT s.*, 
                           COALESCE(active_loans.count, 0) as active_loans
                    FROM students s
                    LEFT JOIN (
                        SELECT student_id, COUNT(*) as count 
                        FROM loans 
                        WHERE status = 'active' 
                        GROUP BY student_id
                    ) active_loans ON s.id = active_loans.student_id
                    ORDER BY s.name
                ");
                echo json_encode($stmt->fetchAll());
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Check if identification already exists
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM students WHERE identification = ?");
            $stmt->execute([$data['identification']]);
            if ($stmt->fetch()['count'] > 0) {
                echo json_encode(['success' => false, 'message' => 'Ya existe un estudiante con esta identificación']);
                break;
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO students (name, identification, address, grade) 
                VALUES (?, ?, ?, ?)
            ");
            
            $result = $stmt->execute([
                $data['name'],
                $data['identification'],
                $data['address'],
                $data['grade']
            ]);
            
            echo json_encode(['success' => $result]);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Check if identification already exists for other students
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM students WHERE identification = ? AND id != ?");
            $stmt->execute([$data['identification'], $data['id']]);
            if ($stmt->fetch()['count'] > 0) {
                echo json_encode(['success' => false, 'message' => 'Ya existe otro estudiante con esta identificación']);
                break;
            }
            
            $stmt = $pdo->prepare("
                UPDATE students 
                SET name = ?, identification = ?, address = ?, grade = ?
                WHERE id = ?
            ");
            
            $result = $stmt->execute([
                $data['name'],
                $data['identification'],
                $data['address'],
                $data['grade'],
                $data['id']
            ]);
            
            echo json_encode(['success' => $result]);
            break;
            
        case 'DELETE':
            $id = $_GET['id'];
            
            // Check if student has active loans
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM loans WHERE student_id = ? AND status = 'active'");
            $stmt->execute([$id]);
            $activeLoans = $stmt->fetch()['count'];
            
            if ($activeLoans > 0) {
                echo json_encode(['success' => false, 'message' => 'No se puede eliminar un estudiante con préstamos activos']);
                break;
            }
            
            $stmt = $pdo->prepare("DELETE FROM students WHERE id = ?");
            $result = $stmt->execute([$id]);
            
            echo json_encode(['success' => $result]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
