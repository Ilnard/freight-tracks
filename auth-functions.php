<?php
require 'service.php';

// Регистрация
function reg($data, $user)
{

    $response = [
        'status' => true,
        'message' => ''
    ];
    $name = htmlspecialchars($data[0]);
    $surname = htmlspecialchars($data[1]);
    $email = htmlspecialchars($data[2]);
    $phone = htmlspecialchars($data[3]);
    $custom_data = htmlspecialchars($data[4]);
    $password = htmlspecialchars($data[5]);
    // Проверка на существование аккаунта в двух таблицах
    $check_query = "SELECT EXISTS(SELECT email from users WHERE email = '$data[2]')";
    // Если аккаунт с таким email уже существует, то возвращаем ошибку
    if (mysqli_fetch_assoc(query($check_query))["EXISTS(SELECT email from users WHERE email = '$data[2]')"]) {
        $response['status'] = false;
        $response['message'] = 'Аккаунт с данным email уже существует';
    }
    // При положительном результате выполняется запись аккаунта в базу данных
    else {
        $query = '';
        switch ($user) {
            case 'reg-driver': {
                    $query = "INSERT INTO users (name, surname, email, phone, model, password, role, `reg_date`) VALUES ('$name', '$surname', '$email', '$phone', '$custom_data', '$password', 'driver', CURRENT_TIMESTAMP)";
                    break;
                }
            case 'reg-company': {
                    $query = "INSERT INTO users (name, surname, email, phone, company, password, role, `reg_date`) VALUES ('$name', '$surname', '$email', '$phone', '$custom_data', '$password', 'client', CURRENT_TIMESTAMP)";
                    break;
                }
        }
        if (!query($query)) {
            $response['status'] = false;
            $response['message'] = 'Ошибка регистрации';
        };
    }
    return $response;
}

// Авторизация
function auth($data)
{
    $response = [
        'status' => true,
        'message' => '',
        'user_data' => []
    ];
    $login = htmlspecialchars($data[0]);
    $password = htmlspecialchars($data[1]);
    $query = "SELECT * FROM users WHERE email = '$login' AND password = '$password'";
    // Если такой аккаунт есть в таблице пользователей, 
    // то записываем данные аккаунта в ответ
    $result = query($query);
    if ($result && mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        $response['user_data'] = $user;
        switch ($response['user_data']['role']) {
            case 'driver': {
                unset($response['user_data']['company']);
                break;
            }
            case 'client': {
                unset($response['user_data']['model']);
                break;
            }
        }
        unset($response['user_data']['password']);
    }
    // Иначе возвращаем ошибку с сообщением
    else {
        $response['status'] = false;
        $response['message'] = 'Неправильные данные';
    }
    return $response;
}
