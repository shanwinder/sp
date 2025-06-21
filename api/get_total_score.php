<?php
session_start();
require_once '../includes/db.php';

$user_id = $_SESSION['user_id'];

$sql = "SELECT SUM(score) as total_score FROM progress WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($total_score);
$stmt->fetch();
$stmt->close();

echo json_encode(['score' => $total_score ?: 0]);
