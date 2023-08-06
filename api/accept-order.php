<?php
require '../service.php';
$order_id = json_decode(file_get_contents("php://input"), true)['orderId'];
$response = [
    'status' => true,
    'message' => '',
    'acceptDate' => '' 
];
session_start();
$personal_orders = [];
$user_id = $_SESSION['user']['id'];
$query = "UPDATE orders SET status = 'accepted', acceptedUserId = $user_id, acceptDate = CURRENT_TIMESTAMP WHERE id = $order_id";
if (!query($query)) {
    $response['status'] = false;
    $response['message'] = 'Не удалось принять заказ';
}
else {
    $get_timestamp_query = "SELECT acceptDate FROM orders WHERE id = $order_id";
    $response['acceptDate'] = mysqli_fetch_assoc(query($get_timestamp_query))['acceptDate'];
    $response['message'] = 'Заявка успешно принята';
    
}
echo json_encode($response);