<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    // Obtenga todos los libros con disponibilidad para el catálogo de estudiantes
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
        ORDER BY b.title
    ");
    
    echo json_encode($stmt->fetchAll());
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
