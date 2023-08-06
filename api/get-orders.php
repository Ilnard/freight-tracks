<?php
session_start();
require '../service.php';
$input = json_decode(file_get_contents("php://input"), true);
$user_id = $_SESSION['user']['id'];
$response = [
    'orders' => [],
    'generalAll' => false
];
// Получение всех заявок кроме биржи
if (!$input['generalMore']) {
    $get_orders_query = "";
    switch ($_SESSION['user']['role']) {
        case 'driver': {
                $get_orders_query = "SELECT * FROM orders WHERE offerToUserId = $user_id OR acceptedUserId = $user_id ORDER BY createDate";
                break;
            }
        case 'client': {
                $get_orders_query = "SELECT * FROM orders WHERE clientId = $user_id ORDER BY createDate";
                break;
            }
    }
    $result = query($get_orders_query);
    $order = null;
    switch ($_SESSION['user']['role']) {
        case 'driver': {
                while ($order = mysqli_fetch_assoc($result)) {
                    $client_company_query = "SELECT company FROM users WHERE id = '$order[clientId]'";
                    $order['client'] = mysqli_fetch_assoc(query($client_company_query))['company'];
                    if ($order['status'] == 'accepted' || $order['status'] == 'completed') {
                        $contractor_query = "SELECT name, surname FROM users WHERE id = $order[acceptedUserId]";
                        $contractor = mysqli_fetch_assoc(query($contractor_query));
                        $order['contractor']= $contractor;
                    }
                    array_push($response['orders'], $order);
                }
                break;
            }
        case 'client': {
                while ($order = mysqli_fetch_assoc($result)) {
                    $order['client'] = $_SESSION['user']['company'];
                    if ($order['status'] == 'accepted' || $order['status'] == 'completed') {
                        $contractor_query = "SELECT name, surname FROM users WHERE id = $order[acceptedUserId]";
                        $contractor = mysqli_fetch_assoc(query($contractor_query));
                        $order['contractor']= $contractor;
                    }
                    array_push($response['orders'], $order);
                }
                break;
            }
    }
}
// Получение заявок биржи
$count_skip = $input['generalCount'] - $input['generalCountSkipDifference'];
$get_general_query = "SELECT * FROM orders WHERE view = 'public' AND status = 'search' ORDER BY createDate LIMIT $count_skip, $input[generalCount]";
$count_skip = $input['generalCount'];
$query_check_general_all = "SELECT id FROM orders WHERE view = 'public' AND status = 'search' LIMIT $count_skip, 1";
$result2 = query($get_general_query);
while ($order = mysqli_fetch_assoc($result2)) {
    $push = true;
    $client_company_query = "SELECT company FROM users WHERE id = '$order[clientId]'";
    $order['client'] = mysqli_fetch_assoc(query($client_company_query))['company'];
    
    if ($_SESSION['user']['role'] == 'client') {
        $found_index = array_search($order['id'], array_column($response['orders'], 'id'));
        if ($response['orders'][$found_index]['id'] == $order['id']) {
            $response['orders'][$found_index]['for'] = 'market';
            $push = false;
        }
    }
    $order['for'] = 'market';
    if ($push) array_push($response['orders'], $order);
}
if (!mysqli_fetch_assoc(query($query_check_general_all))) {
    $response['generalAll'] = true;
}
// Добавление телефона и Email клиента в информацию заявки
for ($i = 0; $i < count($response['orders']); $i++) {
    $client_id = $response['orders'][$i]['clientId'];
    $sql = "SELECT phone, email FROM users WHERE id = $client_id";
    $client_contact_data = mysqli_fetch_assoc(query($sql));
    $response['orders'][$i]['clientInfo'] = $client_contact_data;
}

echo json_encode($response);
