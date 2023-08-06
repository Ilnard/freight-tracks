<?php
require '../service.php';
$order_id = json_decode(file_get_contents("php://input"), true)['orderId'];
$response = [
    'status' => true,
    'message' => '',
];
$query = "DELETE FROM orders WHERE id = $order_id";
if (!query($query)) {
    $response['status'] = false;
    $response['message'] = 'Не удалось удалить заявку';
}
else $response['message'] = 'Заявка успешно удалена';
echo json_encode($response);