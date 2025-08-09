<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!isset($_GET['type'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Report type is required']);
    exit;
}

$type = $_GET['type'];

try {
    switch ($type) {
        case 'pending_returns':
            $stmt = $pdo->query("
                SELECT s.name as 'Estudiante', 
                       s.identification as 'Identificación',
                       b.title as 'Libro',
                       l.loan_date as 'Fecha Préstamo',
                       DATEDIFF(CURDATE(), l.loan_date) as 'Días Prestado'
                FROM loans l
                JOIN students s ON l.student_id = s.id
                JOIN books b ON l.book_id = b.id
                WHERE l.status = 'active'
                ORDER BY l.loan_date
            ");
            break;
            
        case 'book_inventory':
            $stmt = $pdo->query("
                SELECT b.title as 'Título',
                       b.author as 'Autor',
                       b.category as 'Categoría',
                       b.quantity as 'Cantidad Total',
                       COALESCE(active_loans.count, 0) as 'Prestados',
                       (b.quantity - COALESCE(active_loans.count, 0)) as 'Disponibles'
                FROM books b
                LEFT JOIN (
                    SELECT book_id, COUNT(*) as count 
                    FROM loans 
                    WHERE status = 'active' 
                    GROUP BY book_id
                ) active_loans ON b.id = active_loans.book_id
                ORDER BY b.category, b.title
            ");
            break;
            
        case 'loan_history':
            $stmt = $pdo->query("
                SELECT s.name as 'Estudiante',
                       b.title as 'Libro',
                       l.loan_date as 'Fecha Préstamo',
                       l.return_date as 'Fecha Devolución',
                       CASE
                           WHEN l.status = 'active' THEN 'Activo'
                           WHEN l.status = 'returned' THEN 'Devuelto'
                           ELSE 'Desconocido'
                       END as 'Estado',
                       CASE 
                           WHEN l.return_date IS NULL THEN DATEDIFF(CURDATE(), l.loan_date)
                           ELSE DATEDIFF(l.return_date, l.loan_date)
                       END as 'Días'
                FROM loans l
                JOIN students s ON l.student_id = s.id
                JOIN books b ON l.book_id = b.id
                ORDER BY l.loan_date DESC
                LIMIT 100
            ");
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid report type']);
            exit;
    }
    
    echo json_encode($stmt->fetchAll());
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
