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

$query = "UPDATE orders SET status = 'search', acceptedUserId = NULL, acceptDate = NULL WHERE id = $order_id";
if (!query($query)) {
    $response['status'] = false;
    $response['message'] = 'Не удалось отменить заказ';
}
else {
    $response['message'] = 'Заявка успешно отменена';
}
echo json_encode($response);