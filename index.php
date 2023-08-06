<? require 'config.php' ?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/service.css">
    <link rel="stylesheet" href="css/global.css">
    <link rel="shortcut icon" href="resources/favicon.svg">
    <script src="https://unpkg.com/vue/dist/vue.global.prod.js"></script>
    <script src="https://unpkg.com/vue-router@4"></script>
    <script src="https://unpkg.com/vuex@4"></script>
    <title>Фрахт</title>
</head>

<body>
    <div id="app">
        <v-header></v-header>
        <v-sidebar></v-sidebar>
        <router-view></router-view>
        <v-notifs></v-notifs>
    </div>

    <script src="js/app.js"></script>
</body>

</html>