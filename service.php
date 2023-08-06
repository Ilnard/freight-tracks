<?php
function location($url = '') {
    header("Location: $url");
}
function query($query) {
    // $db = new mysqli('localhost', 'u2063456_default', 'u2063456_default', 'u2063456_default');
    $db = new mysqli('localhost', 'root', '', 'u2063456_default');
    $db->query("SET NAMES 'utf8'");
    $db->query("SET CHARACTER SET 'utf8'");
    $db->query("SET SESSION collation_connection = 'utf8_general_ci'");
    $result = mysqli_query($db, $query);
    mysqli_close($db);
    return $result;
}