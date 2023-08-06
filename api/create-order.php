<?php
require '../service.php';
session_start();
$order = json_decode(file_get_contents("php://input"), true);
$user_id = $_SESSION['user']['id'];
$response = [
    'status' => true,
    'message' => '',
    'errors' => null
];
if ($order) foreach ($order as $key => $value) {
    $order[$key] = htmlspecialchars($value);
}

if (!$order['townFrom'] || $order['townFrom'] == '' || !preg_match('/^[\p{Cyrillic}\s-]+$/u', $order['townFrom'])) {
    $response['status'] = false;
    $response['errors']['townFrom'] = 'Введите название города корректно';
}
if (!$order['townTo'] || $order['townTo'] == '' || !preg_match('/^[\p{Cyrillic}\s-]+$/u', $order['townTo'])) {
    $response['status'] = false;
    $response['errors']['townTo'] = 'Введите город';
}
if (!$order['dateFrom'] || $order['dateFrom'] == '') {
    $response['status'] = false;
    $response['errors']['dateFrom'] = 'Введите дату';
}
if (!$order['dateTo'] || $order['dateTo'] == '') {
    $response['status'] = false;
    $response['errors']['dateTo'] = 'Введите дату';
}
else if (date($order['dateTo']) < date($order['dateFrom'])) {
    $response['status'] = false;
    $response['errors']['dateTo'] = 'Не может быть раньше даты отправления';
}
if (!$order['streetFrom'] || $order['streetFrom'] == '' || !preg_match('/^[\p{Cyrillic}\s.]+(?:[\s.]\d+)?+[\p{Cyrillic}\s-]+$/u', $order['streetFrom'])) {
    $response['status'] = false;
    $response['errors']['streetFrom'] = 'Введите улицу корректно';
}
if (!$order['streetTo'] || $order['streetTo'] == '' || !preg_match('/^[\p{Cyrillic}\s.]+(?:[\s.]\d+)?+[\p{Cyrillic}\s-]+$/u', $order['streetTo'])) {
    $response['status'] = false;
    $response['errors']['streetTo'] = 'Введите улицу корректно';
}
if (!$order['houseFrom'] || $order['houseFrom'] <= 0) {
    $response['status'] = false;
    $response['errors']['houseFrom'] = 'Введите номер дома корректно';
}
if (!$order['houseTo'] || $order['houseTo'] <= 0) {
    $response['status'] = false;
    $response['errors']['houseTo'] = 'Введите номер дома корректно';
}
if (!$order['price'] || $order['price'] == '' || !preg_match('/^\d+$/', $order['price'])) {
    $response['status'] = false;
    $response['errors']['price'] = 'Введите цену корректно';
} else if (!preg_match('/\d/', $order['price'])) {
    $response['status'] = false;
    $response['errors']['price'] = 'Цена может содержать только цифры';
}
if ($order['weight'] != null && $order['weight'] < 0) {
    $response['status'] = false;
    $response['errors']['weight'] = 'Вес не может быть отрицательным';
}
if ($order['volume'] != null && $order['volume'] < 0) {
    $response['status'] = false;
    $response['errors']['volume'] = 'Объем не может быть отрицательным';
}
if ($order['height'] != null && $order['height'] < 0) {
    $response['status'] = false;
    $response['errors']['height'] = 'Длина не может быть отрицательной';
}
if ($order['description'] && mb_strlen($order['description']) > 512) {
    $response['status'] = false;
    $response['errors']['description'] = 'Комментарий содержит более 512 символов';
}
function formateTown($str)
{
    $town = mb_convert_case($str, MB_CASE_TITLE, "UTF-8"); // делаем первую букву в словах заглавной
    $town = preg_replace('/\-/', ' ', $town); // заменяем "-" на пробелы
    return $town;
}
function formateStreet($str)
{
    $str = mb_strtolower($str);
    $pattern = "/(?:^|[^\p{L}])[а-яa-z]|(?<=\.)[а-яa-z]/u";
    $replacer = function ($matches) {
        return mb_strtoupper($matches[0]);
    };
    $street = preg_replace_callback($pattern, $replacer, $str);
    $street = preg_replace("/\.(?![[:space:]])/", ". ", $street);

    return $street;
}
if ($order['view'] == 'private') {
    if (!$order['offerToUserId'] || $order['offerToUserId'] == '') {
        $response['status'] = false;
        $response['errors']['offerToUserId'] = 'Введите id пользователя';
    } else if (!preg_match('/\d/', $order['offerToUserId'])) {
        $response['status'] = false;
        $response['errors']['offerToUserId'] = 'id может содержать только цифры';
    }
}
if ($response['status']) {
    $order['townFrom'] = formateTown($order['townFrom']);
    $order['townTo'] = formateTown($order['townTo']);
    $order['streetFrom'] = formateStreet($order['streetFrom']);
    $order['streetTo'] = formateStreet($order['streetTo']);
    $query_part1 = "INSERT INTO orders (townFrom, dateFrom, streetFrom, houseFrom, townTo, dateTo, streetTo, houseTo, clientId, price, view, createDate";
    if ($order['perish'] != null) $query_part1 = $query_part1 . ", perish";
    if ($order['fragil'] != null) $query_part1 = $query_part1 . ", fragil";
    if ($order['weight'] != null) $query_part1 = $query_part1 . ", weight, weightUnit";
    if ($order['volume'] != null) $query_part1 = $query_part1 . ", volume";
    if ($order['height'] != null) $query_part1 = $query_part1 . ", height";
    if ($order['description'] != null) $query_part1 = $query_part1 . ", description";
    if ($order['view'] == 'private') $query_part1 = $query_part1 . ", offerToUserId";
    $query_part1 = $query_part1 . ") ";
    $query_part2 = "VALUES ('$order[townFrom]', '$order[dateFrom]', '$order[streetFrom]', $order[houseFrom], '$order[townTo]', '$order[dateTo]', '$order[streetTo]', $order[houseTo], $user_id, '$order[price]', '$order[view]', CURRENT_TIMESTAMP";
    if ($order['perish'] != null) $query_part2 = $query_part2 . ", $order[perish]";
    if ($order['fragil'] != null) $query_part2 = $query_part2 . ", $order[fragil]";
    if ($order['weight'] != null) $query_part2 = $query_part2 . ", $order[weight], '$order[weightUnit]'";
    if ($order['volume'] != null) $query_part2 = $query_part2 . ", $order[volume]";
    if ($order['height'] != null) $query_part2 = $query_part2 . ", $order[height]";
    if ($order['description'] != null) $query_part2 = $query_part2 . ", '$order[description]'";
    if ($order['view'] == 'private') $query_part2 = $query_part2 . ", $order[offerToUserId]";
    $query_part2 = $query_part2 . ")";
    $query = $query_part1 . $query_part2;
    if (!query($query)) {
        $response['status'] = false;
        $response['message'] = 'Не удалось создать заявку';
    }
    else {
        $response['message'] = 'Заявка успешно создана!';
    }
}
echo json_encode($response);
