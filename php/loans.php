<?php
require_once 'config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Get single loan
                $stmt = $pdo->prepare("
                    SELECT l.*, s.identification as student_identification, s.name as student_name, b.title as book_title
                    FROM loans l
                    JOIN students s ON l.student_id = s.id
                    JOIN books b ON l.book_id = b.id
                    WHERE l.id = ?
                ");
                $stmt->execute([$_GET['id']]);
                $loan = $stmt->fetch();
                echo json_encode($loan);
            } else {
                // Get all loans
                $stmt = $pdo->query("
                    SELECT l.*,s.identification as student_identification, s.name as student_name, b.title as book_title
                    FROM loans l
                    JOIN students s ON l.student_id = s.id
                    JOIN books b ON l.book_id = b.id
                    ORDER BY l.loan_date DESC
                ");
                echo json_encode($stmt->fetchAll());
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Check if book is available
            $stmt = $pdo->prepare("
                SELECT b.quantity, 
                       COALESCE(active_loans.count, 0) as active_loans
                FROM books b
                LEFT JOIN (
                    SELECT book_id, COUNT(*) as count 
                    FROM loans 
                    WHERE status = 'active' 
                    GROUP BY book_id
                ) active_loans ON b.id = active_loans.book_id
                WHERE b.id = ?
            ");
            $stmt->execute([$data['book_id']]);
            $book = $stmt->fetch();
            
            if (!$book || $book['quantity'] <= $book['active_loans']) {
                echo json_encode(['success' => false, 'message' => 'El libro no está disponible']);
                break;
            }
            
            // Check if student already has this book
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as count 
                FROM loans 
                WHERE student_id = ? AND book_id = ? AND status = 'active'
            ");
            $stmt->execute([$data['student_id'], $data['book_id']]);
            if ($stmt->fetch()['count'] > 0) {
                echo json_encode(['success' => false, 'message' => 'El estudiante ya tiene este libro prestado']);
                break;
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO loans (student_id, book_id, loan_date, status) 
                VALUES (?, ?, ?, 'active')
            ");
            
            $result = $stmt->execute([
                $data['student_id'],
                $data['book_id'],
                $data['loan_date']
            ]);
            
            echo json_encode(['success' => $result]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
