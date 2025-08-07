# Sistema de Gestión Biblioteca Renacer

## Descripción
Sistema completo de gestión para la Biblioteca Renacer que permite administrar libros, estudiantes y préstamos de manera eficiente.

## Características

### Apartado Administrador
- Inicio de sesión seguro
- Dashboard con estadísticas en tiempo real
- Gestión completa de libros (agregar, editar, eliminar, filtrar)
- Gestión de estudiantes (registro, actualización, eliminación)
- Sistema de préstamos y devoluciones
- Control de estado de libros
- Generación de reportes detallados
- Registro automático de estudiantes con credenciales de acceso

### Apartado Estudiante
- Inicio de sesión con número de identificación
- Catálogo de libros disponibles
- Filtrado por categorías
- Visualización de préstamos activos
- Historial de préstamos
- Información de cuenta personal

## Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Base de Datos**: MySQL 8.0+
- **Servidor Local**: XAMPP

## Instalación

### Requisitos Previos
- XAMPP instalado y funcionando
- Navegador web moderno

### Pasos de Instalación

1. **Configurar XAMPP**
   - Iniciar Apache y MySQL desde el panel de control de XAMPP

2. **Crear la Base de Datos**
   - Abrir phpMyAdmin (http://localhost/phpmyadmin)
   - Ejecutar el script SQL ubicado en `database/biblioteca_renacer.sql`

3. **Configurar los Archivos**
   - Copiar todos los archivos del proyecto a la carpeta `htdocs` de XAMPP
   - Verificar que la configuración de base de datos en `php/config.php` sea correcta

4. **Acceder al Sistema**
   - Abrir el navegador y ir a `http://localhost/biblioteca_renacer`

## Credenciales por Defecto

### Administrador
- **Usuario**: admin
- **Contraseña**: admin123

### Estudiantes (ejemplos)
- **Usuario/Contraseña**: 12345678 (Juan Pérez)
- **Usuario/Contraseña**: 87654321 (María García)
- **Usuario/Contraseña**: 11223344 (Carlos López)
- **Usuario/Contraseña**: 44332211 (Ana Rodríguez)

## Estructura del Proyecto

\`\`\`
biblioteca_renacer/
├── index.html              # Página de inicio de sesión
├── admin/
│   └── index.html          # Panel de administración
├── student/
│   └── index.html          # Portal de estudiantes
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   ├── login.js           # Lógica de inicio de sesión
│   ├── admin.js           # Funcionalidades del administrador
│   └── student.js         # Funcionalidades del estudiante
├── php/
│   ├── config.php         # Configuración de base de datos
│   ├── login.php          # Autenticación
│   ├── dashboard.php      # Estadísticas del dashboard
│   ├── books.php          # CRUD de libros
│   ├── students.php       # CRUD de estudiantes
│   ├── loans.php          # Gestión de préstamos
│   ├── returns.php        # Gestión de devoluciones
│   ├── catalog.php        # Catálogo para estudiantes
│   ├── student_loans.php  # Préstamos de estudiantes
│   └── reports.php        # Generación de reportes
├── database/
│   └── biblioteca_renacer.sql  # Script de base de datos
└── README.md              # Documentación
\`\`\`

## Funcionalidades Principales

### Gestión de Libros
- Registro con título, autor, editorial, categoría, cantidad, estado y resumen
- 13 categorías disponibles: Niños, Matemáticas, Español, Sociales, Culturales, Química, Física, Deportes, Cuentos, Ciencias Naturales, Inglés, Religión, Ética y Valores
- Control de estado: Bueno, Regular, Malo
- Filtrado y búsqueda avanzada

### Gestión de Estudiantes
- Registro con nombre, identificación, dirección y grado
- Creación automática de credenciales de acceso
- Control de préstamos activos
- Historial completo de actividades

### Sistema de Préstamos
- Registro automático de fecha y hora
- Control de disponibilidad en tiempo real
- Gestión de devoluciones con estado del libro
- Actualización automática de inventario

### Reportes
- Estudiantes con libros pendientes
- Inventario completo de libros
- Libros dañados
- Historial de préstamos

## Soporte
Para soporte técnico o consultas, contactar al administrador del sistema.

## Licencia
Este proyecto está desarrollado para uso educativo de la Biblioteca Renacer.
