<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    // Get total books
    $stmt = $pdo->query("SELECT SUM(quantity) as total FROM books");
    $totalBooks = $stmt->fetch()['total'] ?? 0;
    
    // Get total students
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM students");
    $totalStudents = $stmt->fetch()['total'] ?? 0;
    
    // Get active loans
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM loans WHERE status = 'active'");
    $activeLoans = $stmt->fetch()['total'] ?? 0;
    
    
    
    // Get recent activity
    $stmt = $pdo->query("
        SELECT 
            s.name as student_name,
            b.title as book_title,
            CASE 
                WHEN l.return_date IS NULL THEN 'Préstamo'
                ELSE 'Devolución'
            END as action,
            COALESCE(l.return_date, l.loan_date) as date
        FROM loans l
        JOIN students s ON l.student_id = s.id
        JOIN books b ON l.book_id = b.id
        ORDER BY COALESCE(l.return_date, l.loan_date) DESC
        LIMIT 10
    ");
    $recentActivity = $stmt->fetchAll();
    
    echo json_encode([
        'totalBooks' => $totalBooks,
        'totalStudents' => $totalStudents,
        'activeLoans' => $activeLoans,
        'recentActivity' => $recentActivity
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
