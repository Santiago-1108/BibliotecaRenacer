<?php
require_once 'config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get all returns
            $stmt = $pdo->query("
                SELECT l.id as loan_id, l.loan_date, l.return_date,
                       s.name as student_name, b.title as book_title

                FROM loans l
                JOIN students s ON l.student_id = s.id
                JOIN books b ON l.book_id = b.id
                WHERE l.status = 'returned'
                ORDER BY l.return_date DESC
            ");
            echo json_encode($stmt->fetchAll());
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Update loan with return information
            $stmt = $pdo->prepare("
                UPDATE loans 
                SET return_date = ?, status = 'returned'
                WHERE id = ?
            ");
            
            $result = $stmt->execute([
                $data['return_date'],
                $data['loan_id']
            ]);
            
            
            echo json_encode(['success' => $result]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
