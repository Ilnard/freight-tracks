<?php
require '../service.php';
$order_id = json_decode(file_get_contents("php://input"), true)['orderId'];
$response = [
    'status' => true,
    'message' => '',
    'completeDate' => ''
];
session_start();
$query = "UPDATE orders SET status = 'completed', completeDate = CURRENT_TIMESTAMP WHERE id = $order_id";
if (!query($query)) {
    $response['status'] = false;
    $response['message'] = "Не удалось отметить выполненным заявку $order_id";
}
else {
    $get_timestamp_query = "SELECT completeDate FROM orders WHERE id = $order_id";
    $response['acceptDate'] = mysqli_fetch_assoc(query($get_timestamp_query))['acceptDate'];
    $response['message'] = "Заявка успешно отмечена выполненным";
}
echo json_encode($response);