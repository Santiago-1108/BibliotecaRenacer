<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!isset($_GET['student_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Student ID is required']);
    exit;
}

$student_id = $_GET['student_id'];

try {
    // Get active loans
    $stmt = $pdo->prepare("
        SELECT l.*, b.title as book_title, b.author
        FROM loans l
        JOIN books b ON l.book_id = b.id
        WHERE l.student_id = ? AND l.status = 'active'
        ORDER BY l.loan_date DESC
    ");
    $stmt->execute([$student_id]);
    $activeLoans = $stmt->fetchAll();
    
    // Get loan history
    $stmt = $pdo->prepare("
        SELECT l.*, b.title as book_title, b.author
        FROM loans l
        JOIN books b ON l.book_id = b.id
        WHERE l.student_id = ?
        ORDER BY l.loan_date DESC
    ");
    $stmt->execute([$student_id]);
    $loanHistory = $stmt->fetchAll();
    
    // Get total loans count
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM loans WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $totalLoans = $stmt->fetch()['total'];
    
    echo json_encode([
        'active_loans' => $activeLoans,
        'loan_history' => $loanHistory,
        'total_loans' => $totalLoans
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
