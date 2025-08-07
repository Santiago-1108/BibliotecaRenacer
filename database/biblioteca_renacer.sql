-- Base de datos: `biblioteca_renacer`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrators`
--

CREATE TABLE `administrators` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `administrators`
--

INSERT INTO `administrators` (`id`, `name`, `username`, `password`, `created_at`) VALUES
(1, 'Administrador Principal', 'admin', 'admin123', '2025-06-08 23:40:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `books`
--

CREATE TABLE `books` (
  `id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `author` text,
  `publisher` varchar(100) NOT NULL,
  `category` enum('niños','matematicas','español','sociales','culturales','quimica','fisica','deportes','cuentos','ciencias','ingles','religion','etica','enciclopedias') NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `book_condition` enum('bueno','regular','malo') NOT NULL DEFAULT 'bueno',
  `summary` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `book_image` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `books`
--

INSERT INTO `books` (`id`, `title`, `author`, `publisher`, `category`, `quantity`, `book_condition`, `summary`, `created_at`, `book_image`) VALUES
(65, 'Don Quijote de la Mancha', 'Miguel de Cervantes Saavedra', 'dad', 'niños', 4, 'bueno', '*Don Quijote de la Mancha* es una novela escrita por el español Miguel de Cervantes Saavedra. Publicada su primera parte con el título de *El ingenioso hidalgo don Quijote de la Mancha* a comienzos de 1605, es la obra más destacada de la literatura española y una de las principales de la literatura universal. En 1615 apareció su continuación con el título de *Segunda parte del ingenioso caballero don Quijote de la Mancha.* Es la primera obra genuinamente desmitificadora de la tradición caballeresca y cortés por su tratamiento burlesco. Representa la primera novela moderna y la primera novela polifónica; como tal, ejerció un enorme influjo en toda la narrativa europea. La novela ha sido calificada por numerosos autores de renombre como la «mejor novela de todos los tiempos» y la «obra más importante y fundamental de la literatura universal». Don Quijote es también uno de los libros más traducidos del mundo y una de las novelas más vendidas de todos los tiempos.\n\n\n----------\n\n\n*The Ingenious Gentleman Don Quixote of La Mancha* known simply as *Don Quixote* is a Spanish novel by Miguel de Cervantes, originally published in two parts, in 1605 and 1615 and considered a founding work of Western literature. It\s often said to be the first modern novel. The novel has been labelled by many well-known authors as the \"best novel of all time\" and the \"best and most central work in world literature\". Don Quixote is also one of the most-translated books in the world and one of the best-selling novels of all time.', '2025-07-22 00:22:45', 'https://covers.openlibrary.org/b/id/14428305-L.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `loans`
--

CREATE TABLE `loans` (
  `id` int NOT NULL,
  `student_id` int NOT NULL,
  `book_id` int NOT NULL,
  `loan_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('active','returned','overdue') NOT NULL DEFAULT 'active',
  `returned_book_condition` enum('bueno','regular','malo') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `loans`
--

INSERT INTO `loans` (`id`, `student_id`, `book_id`, `loan_date`, `return_date`, `status`, `returned_book_condition`, `created_at`) VALUES
(34, 16, 65, '2025-07-22', '2025-07-22', 'returned', NULL, '2025-07-22 01:08:41'),
(35, 16, 65, '2025-07-22', '2025-07-22', 'returned', NULL, '2025-07-22 01:18:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `students`
--

CREATE TABLE `students` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `identification` varchar(20) NOT NULL,
  `address` varchar(200) NOT NULL,
  `grade` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `students`
--

INSERT INTO `students` (`id`, `name`, `identification`, `address`, `grade`, `created_at`) VALUES
(16, 'eyner santiago casso beavides', '1059236474', 'Calle 98 #76-54', 1, '2025-06-17 22:50:27');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrators`
--
ALTER TABLE `administrators`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_books_category` (`category`),
  ADD KEY `idx_books_condition` (`book_condition`);

--
-- Indices de la tabla `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_loans_student_id` (`student_id`),
  ADD KEY `idx_loans_book_id` (`book_id`),
  ADD KEY `idx_loans_status` (`status`);

--
-- Indices de la tabla `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identification` (`identification`),
  ADD KEY `idx_students_identification` (`identification`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administrators`
--
ALTER TABLE `administrators`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `books`
--
ALTER TABLE `books`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT de la tabla `loans`
--
ALTER TABLE `loans`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `students`
--
ALTER TABLE `students`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;
COMMIT;
