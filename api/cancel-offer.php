<?php
require '../service.php';
$order_id = json_decode(file_get_contents("php://input"), true)['orderId'];
$response = [
    'status' => true,
    'message' => ''
];
session_start();
$personal_orders = [];
$user_id = $_SESSION['user']['id'];
$query = "UPDATE orders SET status = 'canceled' WHERE id = $order_id AND offerToUserId = $user_id";
if (!query($query)) {
    $response['status'] = false;
    $response['message'] = 'Не удалось отменить предложение';
}
else $response['message'] = 'Предложение успешно отклонено';
echo json_encode($response);