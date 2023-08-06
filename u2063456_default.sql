-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Авг 06 2023 г., 17:24
-- Версия сервера: 8.0.30
-- Версия PHP: 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `u2063456_default`
--

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `townFrom` varchar(255) NOT NULL,
  `dateFrom` datetime NOT NULL,
  `streetFrom` varchar(255) NOT NULL,
  `houseFrom` int NOT NULL,
  `townTo` varchar(255) NOT NULL,
  `dateTo` datetime NOT NULL,
  `streetTo` varchar(255) NOT NULL,
  `houseTo` int NOT NULL,
  `clientId` int NOT NULL,
  `offerToUserId` int DEFAULT NULL,
  `weight` int DEFAULT NULL,
  `weightUnit` varchar(2) DEFAULT NULL,
  `volume` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `price` varchar(255) NOT NULL,
  `perish` tinyint(1) DEFAULT NULL,
  `fragil` tinyint(1) DEFAULT NULL,
  `description` text,
  `view` varchar(255) NOT NULL,
  `acceptedUserId` int DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'search',
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `acceptDate` datetime DEFAULT NULL,
  `completeDate` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `orders`
--

INSERT INTO `orders` (`id`, `townFrom`, `dateFrom`, `streetFrom`, `houseFrom`, `townTo`, `dateTo`, `streetTo`, `houseTo`, `clientId`, `offerToUserId`, `weight`, `weightUnit`, `volume`, `height`, `price`, `perish`, `fragil`, `description`, `view`, `acceptedUserId`, `status`, `createDate`, `acceptDate`, `completeDate`) VALUES
(1, 'Москва', '2023-05-29 12:00:00', 'Ул. Красная', 114, 'Уфа', '2023-06-02 11:00:00', 'Пр. Салавата Юлаева', 52, 2, NULL, NULL, NULL, NULL, NULL, '50000', NULL, NULL, NULL, 'public', NULL, 'search', '2023-05-28 18:46:42', NULL, NULL),
(2, 'Стерлитамак', '2023-06-02 00:00:00', 'Ул. Артема', 43, 'Ишимбай', '2023-06-02 10:00:00', 'Ул. Гафури', 97, 2, NULL, NULL, NULL, NULL, NULL, '15000', NULL, NULL, NULL, 'public', NULL, 'search', '2023-05-28 18:49:34', NULL, NULL),
(3, 'Орел', '2023-05-26 02:00:00', 'Ул. Тютчева', 190, 'Санкт Петербург', '2023-05-30 22:00:00', 'Пр. Октября', 231, 11, NULL, NULL, NULL, NULL, NULL, '35000', NULL, NULL, NULL, 'public', NULL, 'search', '2023-05-28 19:24:28', NULL, NULL),
(4, 'Грозный', '2023-06-10 10:05:00', 'Ул. Тверская', 30, 'Уфа', '2023-06-17 11:20:00', 'Ул. Сочинская', 124, 2, NULL, 2, 'т', 30, 9, '85999', NULL, 1, 'Осторожнее, везете правые арбузы!', 'public', NULL, 'search', '2023-05-29 10:46:39', NULL, NULL),
(29, 'Чекмагуш', '2023-10-10 15:00:00', 'Ул. Ленина', 12, 'Толбазы', '2023-10-11 17:00:00', 'Ул. Фрунзе', 15, 2, 1, 200, 'кг', 200, 20, '7000', 1, NULL, 'Везете хрупкую тару!', 'private', NULL, 'canceled', '2023-05-29 10:52:34', NULL, NULL),
(30, 'Челябинск', '2023-05-31 10:05:00', 'Ул. Турецкая', 20, 'Уфа', '2023-06-01 10:15:00', 'Ул. Космонавтов', 22, 2, 1, 200, 'кг', NULL, NULL, '9000', NULL, NULL, NULL, 'private', 1, 'canceled', '2023-05-29 10:56:41', '2023-05-29 10:56:54', NULL),
(31, 'Махачкала', '2023-06-01 10:00:00', 'Ул. Нурмагомедова', 5, 'Уфа', '2023-06-08 15:10:00', 'Ул. Зорге', 3, 2, 1, 200, 'т', NULL, NULL, '40000', 1, NULL, 'Везете персики!', 'private', 1, 'completed', '2023-05-29 10:59:57', '2023-05-29 11:00:16', '2023-05-29 08:00:45'),
(32, 'Уфа', '2023-06-09 02:00:00', 'Ул. Радулова', 15, 'Москва', '2023-06-13 03:00:00', 'Ул. Весенняя', 55, 2, 1, NULL, NULL, NULL, NULL, '50000', 1, NULL, NULL, 'private', NULL, 'search', '2023-06-08 21:06:18', NULL, NULL),
(33, 'Уфа', '2023-06-15 00:00:00', 'Ул. Валеева', 57, 'Санкт Петербург', '2023-06-18 11:00:00', 'Ул. Лебедева', 116, 2, NULL, NULL, NULL, NULL, NULL, '50000', NULL, NULL, NULL, 'public', NULL, 'search', '2023-06-11 23:19:17', NULL, NULL),
(34, 'Стерлитамак', '2023-06-20 00:00:00', 'Ул. Шаймуратова', 95, 'Белорецк', '2023-06-21 04:00:00', 'Ул. Худайбердина', 55, 2, NULL, NULL, NULL, NULL, NULL, '27000', NULL, NULL, NULL, 'public', NULL, 'search', '2023-06-11 23:21:12', NULL, NULL),
(35, 'Москва', '2023-06-15 01:24:00', 'Ул. Московская', 114, 'Оренбург', '2023-06-17 01:24:00', 'Ул. Климова', 78, 2, NULL, NULL, NULL, NULL, NULL, '70000', NULL, 1, NULL, 'public', NULL, 'search', '2023-06-11 23:24:21', NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(12) NOT NULL,
  `model` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `reg_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `name`, `surname`, `email`, `phone`, `model`, `company`, `password`, `role`, `reg_date`) VALUES
(1, 'Ильнард', 'Шагизиганов', 'ilnard18@yandex.ru', '+79603919086', 'Fuso', NULL, '12312312', 'driver', '2023-05-02 17:59:52'),
(2, 'Сергей', 'Иванов', 'serega-5345@yandex.ru', '+79174474993', NULL, 'ИП Геннадий Горин Александрович', '12312312', 'client', '2023-05-02 18:00:51'),
(11, 'Василий', 'Петров', 'gvasya88@gmail.com', '+79874327876', NULL, 'ООО Технотулс', '12312312', 'client', '2023-05-28 16:23:16');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
