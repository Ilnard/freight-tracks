<?php
require 'auth-functions.php';
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Ответ по умолчанию
$GLOBALS['response'] = [
    'status' => true,
    'have_validation_errors' => false,
    'validation_errors' => [],
    'message' => ''
];
$GLOBALS['auth'] = $data['form'];

switch ($GLOBALS['auth']) {
    case 'auth': {
        $form_data = $data['data'];
        $errors = ['', ''];
        if (mb_strlen($form_data[0]) == '') $errors[0] = "Поле не должно быть пустым";
        else if (!preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $form_data[0])) $errors[0] = "Введите email корректно";
        
        if (mb_strlen($form_data[1]) < 8) $errors[1] = "Пароль должен содержать не менее 8 символов";
        
        $GLOBALS['response']['validation_errors'] = $errors;
        break;
    }
    case 'reg-driver': {
        $form_data = $data['data'];
        $errors = ['', '', '', '', '', ''];
        if (mb_strlen($form_data[0]) == '') $errors[0] = "Поле не должно быть пустым";
        else if (!preg_match('/^[А-ЯЁЪЫЬа-яёъыь]+$/u', $form_data[0])) $errors[0] = "Введите имя на кириллице";

        if (mb_strlen($form_data[1]) == '') $errors[1] = "Поле не должно быть пустым";
        else if (!preg_match('/^[А-ЯЁЪЫЬа-яёъыь]+$/u', $form_data[1])) $errors[1] = "Введите фамилию на кириллице";

        if (mb_strlen($form_data[2]) == '') $errors[2] = "Поле не должно быть пустым";
        else if (!preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $form_data[2])) $errors[2] = "Введите email корректно";

        if (mb_strlen($form_data[3]) == '') $errors[3] = "Поле не должно быть пустым";
        else if (!preg_match('/^\+\d{11}$/', $form_data[3])) $errors[3] = "Введите номер телефона в формате +7XXXXXXXXXX";

        if (mb_strlen($form_data[4]) == '') $errors[4] = "Поле не должно быть пустым";
        else if (!preg_match('/^[А-ЯЁЪЫЬа-яёъыьa-zA-Z0-9._ -]+$/u', $form_data[4])) $errors[4] = "Введите марку и модель транспорта корректно";

        if (mb_strlen($form_data[5]) < 8) $errors[5] = "Пароль должен содержать не менее 8 символов";
        
        $GLOBALS['response']['validation_errors'] = $errors;
        break;
    }
    case 'reg-company': {
        $form_data = $data['data'];
        $errors = ['', '', '', '', '', ''];
        if (mb_strlen($form_data[0]) == '') $errors[0] = "Поле не должно быть пустым";
        else if (!preg_match('/^[А-ЯЁЪЫЬа-яёъыь]+$/u', $form_data[0])) $errors[0] = "Введите имя на кириллице";

        if (mb_strlen($form_data[1]) == '') $errors[1] = "Поле не должно быть пустым";
        else if (!preg_match('/^[А-Яа-яЁёЪЫЬъыь]+$/u', $form_data[1])) $errors[1] = "Введите фамилию на кириллице";

        if (mb_strlen($form_data[2]) == '') $errors[2] = "Поле не должно быть пустым";
        else if (!preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $form_data[2])) $errors[2] = "Введите email корректно";

        if (mb_strlen($form_data[3]) == '') $errors[3] = "Поле не должно быть пустым";
        else if (!preg_match('/^\+\d{11}$/', $form_data[3])) $errors[3] = "Введите номер телефона в формате +7XXXXXXXXXX";

        if (mb_strlen($form_data[4]) == '') $errors[4] = "Поле не должно быть пустым";
        else if (!preg_match('/^[А-Яа-яЁёЪъЫыЬьa-zA-Z0-9._ -]+$/u', $form_data[4])) $errors[4] = "Введите название компании корректно";

        if (mb_strlen($form_data[5]) < 8) $errors[5] = "Пароль должен содержать не менее 8 символов";
        
        $GLOBALS['response']['validation_errors'] = $errors;
        break;
    }
}
// Изменение статуса о существовании ошибок, если они есть
foreach($GLOBALS['response']['validation_errors'] as $error) if ($error != '') {
    $GLOBALS['response']['have_validation_errors'] = true;
    $GLOBALS['response']['status'] = false;
}

if (!$GLOBALS['response']['have_validation_errors']) {
    switch ($GLOBALS['auth']) {
        case 'auth': {
            $result = auth($data['data']);
            if ($result['status']) {
                session_start();
                $_SESSION['user'] = $result['user_data'];
            }
            else {
                $GLOBALS['response']['status'] = false;
                $GLOBALS['response']['message'] = $result['message'];
            }
            break;
        }
        case 'reg-driver': {
            $result = reg($data['data'], 'reg-driver');
            if ($result['status']) {
                session_start();
                $result2 = auth([$data['data'][2], $data['data'][5]]);
                $_SESSION['user'] = $result2['user_data'];
            }
            else {
                $GLOBALS['response']['status'] = false;
                $GLOBALS['response']['message'] = $result['message'];
            }
            break;
        }
        case 'reg-company': {
            $result = reg($data['data'], 'reg-company');
            if ($result['status']) {
                session_start();
                $result2 = auth([$data['data'][2], $data['data'][5]]);
                $_SESSION['user'] = $result2['user_data'];
            }
            else {
                $GLOBALS['response']['status'] = false;
                $GLOBALS['response']['message'] = $result['message'];
            }
            break;
        }
    }
}
echo json_encode($GLOBALS['response']);