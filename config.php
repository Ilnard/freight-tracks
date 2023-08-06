<?php
require 'service.php';
session_start();
if (!isset($_SESSION['user'])) location("auth.php");
if (isset($_GET['logout'])) {
    session_destroy();
    location('/');
}