<?php
session_start();
require_once '../includes/db.php';

$data = json_decode(file_get_contents('php://input'), true);

$user_id = $data['user_id'];
$stage_id = $data['stage_id'];
$action = $data['action'];
$detail = $data['detail'];
$score = json_decode($detail, true)['score'];

$completed_at = ($score === 2) ? date('Y-m-d H:i:s') : null;
$points = ($score === 2) ? 100 : 0;

// 1. Insert or Update progress
$stmt = $conn->prepare("INSERT INTO progress (user_id, stage_id, score, attempts, completed_at)
  VALUES (?, ?, ?, 1, ?)
  ON DUPLICATE KEY UPDATE
  score = VALUES(score),
  attempts = attempts + 1,
  completed_at = VALUES(completed_at)");
$stmt->bind_param("iiis", $user_id, $stage_id, $points, $completed_at);
$stmt->execute();
$stmt->close();

// 2. Log action
$stmt = $conn->prepare("INSERT INTO game_logs (user_id, stage_id, action, detail) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiss", $user_id, $stage_id, $action, $detail);
$stmt->execute();
$stmt->close();

echo json_encode(['status' => 'ok']);
