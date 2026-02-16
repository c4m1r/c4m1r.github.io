---
title: Первые шаги с Rust
title_en: First Steps with Rust
title_ru: Первые шаги с Rust
title_fr: Premiers pas avec Rust
title_es: Primeros pasos con Rust
title_zh: Rust 第一步
title_ja: Rust の最初のステップ
title_ko: Rust 첫 걸음
category: it/rust
updatedAt: 2026-02-13
---

<!-- lang:en -->
# First Steps with Rust

Rust is a systems programming language focused on safety, speed, and concurrency. It provides memory safety without garbage collection and enables developers to write fast and reliable software.

## Table of Contents

1. [Why Rust?](#why-rust)
2. [Installation](#installation)
3. [Your First Rust Program](#your-first-rust-program)
4. [Basic Concepts](#basic-concepts)
5. [Ownership and Borrowing](#ownership-and-borrowing)
6. [Common Data Types](#common-data-types)
7. [Functions and Control Flow](#functions-and-control-flow)
8. [Error Handling](#error-handling)
9. [Cargo - Rust's Build Tool](#cargo-rusts-build-tool)
10. [Essential Tools](#essential-tools)
11. [Next Steps](#next-steps)

## Why Rust?

### Key Benefits

- **Memory Safety**: No null pointers, no dangling pointers, no data races
- **Performance**: Zero-cost abstractions, comparable to C/C++
- **Concurrency**: Fearless concurrency with compile-time guarantees
- **Modern Tooling**: Excellent package manager (Cargo), formatter, linter
- **Growing Ecosystem**: Active community and expanding libraries

### Common Use Cases

- Systems programming
- Web servers and networking
- Command-line tools
- Embedded systems
- WebAssembly
- Game development
- Operating systems

## Installation

### Install Rustup (Recommended)

Rustup is the official Rust toolchain installer and version manager.

#### Linux and macOS

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Follow the on-screen instructions. After installation, reload your shell:

```bash
source $HOME/.cargo/env
```

#### Windows

Download and run `rustup-init.exe` from [rustup.rs](https://rustup.rs/)

Alternatively, use Windows Package Manager:
```powershell
winget install Rustlang.Rustup
```

### Verify Installation

```bash
rustc --version
cargo --version
rustup --version
```

### Install Essential Components

```bash
# Set stable as default
rustup default stable

# Add formatter
rustup component add rustfmt

# Add linter
rustup component add clippy

# Add documentation
rustup component add rust-docs

# Add source code (for IDE integration)
rustup component add rust-src
```

### Update Rust

```bash
rustup update
```

## Your First Rust Program

### Hello World

Create a file `hello.rs`:

```rust
fn main() {
    println!("Hello, World!");
}
```

Compile and run:

```bash
rustc hello.rs
./hello  # On Windows: .\hello.exe
```

### Using Cargo (Recommended)

Cargo is Rust's build system and package manager:

```bash
# Create new project
cargo new hello-rust
cd hello-rust

# Project structure:
# hello-rust/
# ├── Cargo.toml    (Project manifest)
# └── src/
#     └── main.rs   (Main source file)

# Run the project
cargo run

# Build for release (optimized)
cargo build --release

# Run tests
cargo test

# Check code without building
cargo check
```

## Basic Concepts

### Variables and Mutability

```rust
fn main() {
    // Immutable by default
    let x = 5;
    // x = 6;  // Error! Cannot mutate immutable variable
    
    // Mutable variable
    let mut y = 5;
    y = 6;  // OK
    println!("y = {}", y);
    
    // Constants (must have type annotation)
    const MAX_POINTS: u32 = 100_000;
    
    // Shadowing (creating new variable with same name)
    let z = 5;
    let z = z + 1;  // z is now 6
    let z = "text";  // z is now a different type
}
```

### Data Types

#### Scalar Types

```rust
fn main() {
    // Integers
    let a: i32 = -42;      // Signed 32-bit
    let b: u64 = 100;      // Unsigned 64-bit
    let c = 98_222;        // Underscore for readability
    let d = 0xff;          // Hexadecimal
    let e = 0o77;          // Octal
    let f = 0b1111_0000;   // Binary
    
    // Floating-point
    let x = 2.0;           // f64 (default)
    let y: f32 = 3.0;      // f32
    
    // Boolean
    let is_active: bool = true;
    
    // Character (4 bytes, Unicode)
    let c: char = 'z';
    let emoji = '😊';
}
```

#### Compound Types

```rust
fn main() {
    // Tuple
    let tup: (i32, f64, u8) = (500, 6.4, 1);
    let (x, y, z) = tup;  // Destructuring
    let first = tup.0;    // Access by index
    
    // Array (fixed size)
    let arr: [i32; 5] = [1, 2, 3, 4, 5];
    let first = arr[0];
    
    // Array with same value
    let zeroes = [0; 5];  // [0, 0, 0, 0, 0]
}
```

## Ownership and Borrowing

Ownership is Rust's most unique feature for memory safety.

### Ownership Rules

1. Each value has a variable called its owner
2. There can only be one owner at a time
3. When the owner goes out of scope, the value is dropped

```rust
fn main() {
    // s1 owns the String
    let s1 = String::from("hello");
    
    // Ownership moves to s2
    let s2 = s1;
    
    // Error! s1 no longer valid
    // println!("{}", s1);
    
    println!("{}", s2);  // OK
}
```

### Borrowing and References

```rust
fn main() {
    let s1 = String::from("hello");
    
    // Immutable borrow
    let len = calculate_length(&s1);
    println!("Length of '{}' is {}", s1, len);
    
    // Mutable borrow
    let mut s2 = String::from("hello");
    change(&mut s2);
    println!("{}", s2);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn change(s: &mut String) {
    s.push_str(", world");
}
```

### Borrowing Rules

- You can have either one mutable reference OR any number of immutable references
- References must always be valid (no dangling references)

```rust
fn main() {
    let mut s = String::from("hello");
    
    let r1 = &s;      // OK
    let r2 = &s;      // OK
    // let r3 = &mut s;  // Error! Cannot have mutable reference while immutable references exist
    
    println!("{} and {}", r1, r2);
    
    let r3 = &mut s;  // OK now (r1 and r2 no longer used)
    r3.push_str(", world");
}
```

## Common Data Types

### Strings

```rust
fn main() {
    // String literal (stored in binary, immutable)
    let s1: &str = "hello";
    
    // String (heap-allocated, growable, mutable)
    let mut s2 = String::from("hello");
    s2.push_str(", world");
    
    // Convert String to &str
    let s3: &str = &s2;
    
    // String methods
    let len = s2.len();
    let is_empty = s2.is_empty();
    let contains = s2.contains("world");
}
```

### Vectors

```rust
fn main() {
    // Create vector
    let mut v: Vec<i32> = Vec::new();
    v.push(1);
    v.push(2);
    v.push(3);
    
    // Using vec! macro
    let v2 = vec![1, 2, 3];
    
    // Access elements
    let third = v2[2];
    let third = v2.get(2);  // Returns Option<&i32>
    
    // Iterate
    for i in &v2 {
        println!("{}", i);
    }
    
    // Iterate and modify
    for i in &mut v {
        *i += 50;
    }
}
```

### Hash Maps

```rust
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    
    // Insert values
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);
    
    // Get value
    let team_name = String::from("Blue");
    let score = scores.get(&team_name);  // Returns Option<&i32>
    
    // Iterate
    for (key, value) in &scores {
        println!("{}: {}", key, value);
    }
    
    // Update
    scores.insert(String::from("Blue"), 25);  // Overwrite
    
    // Insert if not exists
    scores.entry(String::from("Red")).or_insert(50);
}
```

## Functions and Control Flow

### Functions

```rust
fn main() {
    let result = add(5, 3);
    println!("Result: {}", result);
    
    let (sum, product) = calculate(4, 5);
    println!("Sum: {}, Product: {}", sum, product);
}

fn add(x: i32, y: i32) -> i32 {
    x + y  // Expression (no semicolon)
}

fn calculate(x: i32, y: i32) -> (i32, i32) {
    (x + y, x * y)
}
```

### If Expressions

```rust
fn main() {
    let number = 6;
    
    if number < 5 {
        println!("condition was true");
    } else if number == 5 {
        println!("number is 5");
    } else {
        println!("condition was false");
    }
    
    // If in let statement
    let result = if number < 5 { "small" } else { "large" };
}
```

### Loops

```rust
fn main() {
    // Infinite loop
    let mut counter = 0;
    loop {
        counter += 1;
        if counter == 10 {
            break;
        }
    }
    
    // Return value from loop
    let result = loop {
        counter += 1;
        if counter == 20 {
            break counter * 2;
        }
    };
    
    // While loop
    let mut number = 3;
    while number != 0 {
        println!("{}!", number);
        number -= 1;
    }
    
    // For loop
    let arr = [10, 20, 30, 40, 50];
    for element in arr {
        println!("value: {}", element);
    }
    
    // Range
    for number in 1..4 {
        println!("{}", number);  // 1, 2, 3
    }
    
    // Inclusive range
    for number in 1..=4 {
        println!("{}", number);  // 1, 2, 3, 4
    }
}
```

### Match

```rust
fn main() {
    let number = 7;
    
    match number {
        1 => println!("One!"),
        2 | 3 | 5 | 7 | 11 => println!("Prime"),
        13..=19 => println!("Teen"),
        _ => println!("Something else"),
    }
    
    // Match with Option
    let some_value: Option<i32> = Some(5);
    match some_value {
        Some(x) => println!("Value: {}", x),
        None => println!("No value"),
    }
    
    // if let (pattern matching)
    if let Some(x) = some_value {
        println!("Value: {}", x);
    }
}
```

## Error Handling

### Option Type

```rust
fn divide(numerator: f64, denominator: f64) -> Option<f64> {
    if denominator == 0.0 {
        None
    } else {
        Some(numerator / denominator)
    }
}

fn main() {
    let result = divide(10.0, 2.0);
    
    match result {
        Some(x) => println!("Result: {}", x),
        None => println!("Cannot divide by zero"),
    }
    
    // Using unwrap_or
    let value = divide(10.0, 0.0).unwrap_or(0.0);
}
```

### Result Type

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    // Opening file returns Result<File, Error>
    let file_result = File::open("hello.txt");
    
    let file = match file_result {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => {
                println!("File not found");
                return;
            }
            other_error => {
                println!("Error opening file: {:?}", other_error);
                return;
            }
        },
    };
    
    // Using unwrap (panics on error)
    // let file = File::open("hello.txt").unwrap();
    
    // Using expect (panics with custom message)
    // let file = File::open("hello.txt").expect("Failed to open file");
}
```

### The ? Operator

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut file = File::open("username.txt")?;
    let mut username = String::new();
    file.read_to_string(&mut username)?;
    Ok(username)
}

// Even shorter
fn read_username_short() -> Result<String, io::Error> {
    let mut username = String::new();
    File::open("username.txt")?.read_to_string(&mut username)?;
    Ok(username)
}
```

## Cargo - Rust's Build Tool

### Project Structure

```
my-project/
├── Cargo.toml          # Project manifest
├── Cargo.lock          # Lock file (do not edit manually)
├── src/
│   ├── main.rs         # Binary entry point
│   └── lib.rs          # Library entry point
├── tests/              # Integration tests
├── benches/            # Benchmarks
└── examples/           # Example programs
```

### Cargo.toml

```toml
[package]
name = "my-project"
version = "0.1.0"
edition = "2021"
authors = ["Your Name <you@example.com>"]

[dependencies]
serde = "1.0"
tokio = { version = "1.0", features = ["full"] }

[dev-dependencies]
criterion = "0.5"
```

### Common Commands

```bash
# Create new project
cargo new my-project
cargo new my-lib --lib

# Build project
cargo build
cargo build --release

# Run project
cargo run
cargo run --release

# Check for errors (faster than build)
cargo check

# Run tests
cargo test

# Generate documentation
cargo doc --open

# Format code
cargo fmt

# Lint code
cargo clippy

# Update dependencies
cargo update

# Add dependency
cargo add serde

# Search for packages
cargo search tokio
```

## Essential Tools

### Rustfmt - Code Formatter

```bash
# Format current project
cargo fmt

# Check if formatting needed
cargo fmt -- --check

# Configuration in rustfmt.toml or .rustfmt.toml
```

### Clippy - Linter

```bash
# Run clippy
cargo clippy

# Clippy with all warnings
cargo clippy -- -W clippy::all

# Fix automatically fixable issues
cargo clippy --fix
```

### Rust Analyzer

IDE extension providing:
- Code completion
- Go to definition
- Inline documentation
- Refactoring
- Type hints

Install for your IDE:
- VS Code: "rust-analyzer" extension
- IntelliJ IDEA/CLion: Built-in Rust plugin
- Vim/Neovim: rust-analyzer via LSP

### Cargo Watch

Automatically run commands when files change:

```bash
# Install
cargo install cargo-watch

# Watch and run
cargo watch -x run

# Watch and test
cargo watch -x test

# Multiple commands
cargo watch -x check -x test -x run
```

### Cargo Edit

Manage dependencies from command line:

```bash
# Install
cargo install cargo-edit

# Add dependency
cargo add serde

# Add dev dependency
cargo add --dev criterion

# Remove dependency
cargo rm serde

# Upgrade dependencies
cargo upgrade
```

## Next Steps

### Learning Resources

1. **The Rust Book**: [doc.rust-lang.org/book](https://doc.rust-lang.org/book/)
2. **Rust by Example**: [doc.rust-lang.org/rust-by-example](https://doc.rust-lang.org/rust-by-example/)
3. **Rustlings**: Interactive exercises - [github.com/rust-lang/rustlings](https://github.com/rust-lang/rustlings)
4. **Rust Cookbook**: Common programming tasks - [rust-lang-nursery.github.io/rust-cookbook](https://rust-lang-nursery.github.io/rust-cookbook/)

### Practice Projects

1. **Command-line tool**: Text search, file organizer
2. **Web server**: HTTP server with routing
3. **CLI calculator**: Expression parser and evaluator
4. **Todo app**: CRUD application with file storage
5. **Game**: Guessing game, tic-tac-toe

### Advanced Topics to Explore

- **Traits and Generics**: Code reuse and abstraction
- **Lifetimes**: Advanced memory management
- **Smart Pointers**: `Box`, `Rc`, `Arc`, `RefCell`
- **Concurrency**: Threads, channels, async/await
- **Macros**: Metaprogramming
- **Unsafe Rust**: Low-level control
- **FFI**: Interfacing with C
- **WebAssembly**: Rust in the browser

### Ecosystem

Popular crates (libraries):
- **serde**: Serialization/deserialization
- **tokio**: Async runtime
- **actix-web**: Web framework
- **reqwest**: HTTP client
- **clap**: Command-line argument parser
- **diesel**: ORM and query builder
- **regex**: Regular expressions
- **log**: Logging facade

### Community

- [Rust Users Forum](https://users.rust-lang.org/)
- [Rust Discord](https://discord.gg/rust-lang)
- [r/rust](https://www.reddit.com/r/rust/)
- [This Week in Rust](https://this-week-in-rust.org/)

## Conclusion

Rust offers a unique combination of performance and safety. While it has a steeper learning curve than some languages, the investment pays off in reliable, fast software. Start with small projects, practice the ownership system, and gradually explore more advanced features.

Remember:
- Read compiler errors carefully - they're very helpful
- Use `cargo clippy` regularly for best practices
- Don't fight the borrow checker - learn from it
- Join the community - Rust developers are very helpful
- Practice, practice, practice!
<!-- /lang:en -->

<!-- lang:ru -->
# Начало работы с Rust

Rust — это системный язык программирования, сфокусированный на безопасности, скорости и параллелизме. Он обеспечивает безопасность памяти без сборщика мусора и позволяет разработчикам писать быстрое и надежное программное обеспечение.

## Содержание

1. [Почему Rust?](#почему-rust)
2. [Установка](#установка)
3. [Ваша первая программа на Rust](#ваша-первая-программа-на-rust)
4. [Базовые концепции](#базовые-концепции)
5. [Владение и заимствование](#владение-и-заимствование)
6. [Распространенные типы данных](#распространенные-типы-данных)
7. [Функции и управление потоком](#функции-и-управление-потоком)
8. [Обработка ошибок](#обработка-ошибок)
9. [Cargo - инструмент сборки Rust](#cargo---инструмент-сборки-rust)
10. [Необходимые инструменты](#необходимые-инструменты)
11. [Следующие шаги](#следующие-шаги)

## Почему Rust?

### Ключевые преимущества

- **Безопасность памяти**: Нет нулевых указателей, висячих указателей, гонки данных
- **Производительность**: Абстракции с нулевой стоимостью, сравнимо с C/C++
- **Параллелизм**: Бесстрашный параллелизм с гарантиями на этапе компиляции
- **Современные инструменты**: Отличный менеджер пакетов (Cargo), форматировщик, линтер
- **Растущая экосистема**: Активное сообщество и расширяющиеся библиотеки

### Распространенные случаи использования

- Системное программирование
- Веб-серверы и сетевые приложения
- Утилиты командной строки
- Встраиваемые системы
- WebAssembly
- Разработка игр
- Операционные системы

## Установка

### Установить Rustup (Рекомендуется)

Rustup — официальный установщик и менеджер версий инструментов Rust.

#### Linux и macOS

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Следуйте инструкциям на экране. После установки перезагрузите оболочку:

```bash
source $HOME/.cargo/env
```

#### Windows

Скачайте и запустите `rustup-init.exe` с [rustup.rs](https://rustup.rs/)

Альтернативно, используйте Windows Package Manager:
```powershell
winget install Rustlang.Rustup
```

### Проверка установки

```bash
rustc --version
cargo --version
rustup --version
```

### Установка необходимых компонентов

```bash
# Установить stable по умолчанию
rustup default stable

# Добавить форматировщик
rustup component add rustfmt

# Добавить линтер
rustup component add clippy

# Добавить документацию
rustup component add rust-docs

# Добавить исходный код (для интеграции с IDE)
rustup component add rust-src
```

### Обновление Rust

```bash
rustup update
```

## Ваша первая программа на Rust

### Hello World

Создайте файл `hello.rs`:

```rust
fn main() {
    println!("Привет, Мир!");
}
```

Скомпилируйте и запустите:

```bash
rustc hello.rs
./hello  # В Windows: .\hello.exe
```

### Используя Cargo (Рекомендуется)

Cargo — система сборки и менеджер пакетов Rust:

```bash
# Создать новый проект
cargo new hello-rust
cd hello-rust

# Структура проекта:
# hello-rust/
# ├── Cargo.toml    (Манифест проекта)
# └── src/
#     └── main.rs   (Основной файл с кодом)

# Запустить проект
cargo run

# Собрать для релиза (оптимизированная сборка)
cargo build --release

# Запустить тесты
cargo test

# Проверить код без сборки
cargo check
```

## Базовые концепции

### Переменные и изменяемость

```rust
fn main() {
    // Неизменяемая по умолчанию
    let x = 5;
    // x = 6;  // Ошибка! Нельзя изменить неизменяемую переменную
    
    // Изменяемая переменная
    let mut y = 5;
    y = 6;  // OK
    println!("y = {}", y);
    
    // Константы (должны иметь аннотацию типа)
    const MAX_POINTS: u32 = 100_000;
    
    // Затенение (создание новой переменной с тем же именем)
    let z = 5;
    let z = z + 1;  // z теперь 6
    let z = "текст";  // z теперь другого типа
}
```

### Типы данных

#### Скалярные типы

```rust
fn main() {
    // Целые числа
    let a: i32 = -42;      // Знаковое 32-битное
    let b: u64 = 100;      // Беззнаковое 64-битное
    let c = 98_222;        // Подчеркивание для читаемости
    let d = 0xff;          // Шестнадцатеричное
    let e = 0o77;          // Восьмеричное
    let f = 0b1111_0000;   // Двоичное
    
    // Числа с плавающей точкой
    let x = 2.0;           // f64 (по умолчанию)
    let y: f32 = 3.0;      // f32
    
    // Логический тип
    let is_active: bool = true;
    
    // Символ (4 байта, Unicode)
    let c: char = 'я';
    let emoji = '😊';
}
```

#### Составные типы

```rust
fn main() {
    // Кортеж
    let tup: (i32, f64, u8) = (500, 6.4, 1);
    let (x, y, z) = tup;  // Деструктуризация
    let first = tup.0;    // Доступ по индексу
    
    // Массив (фиксированный размер)
    let arr: [i32; 5] = [1, 2, 3, 4, 5];
    let first = arr[0];
    
    // Массив с одинаковыми значениями
    let zeroes = [0; 5];  // [0, 0, 0, 0, 0]
}
```

## Владение и заимствование

Владение — наиболее уникальная функция Rust для безопасности памяти.

### Правила владения

1. Каждое значение имеет переменную, называемую владельцем
2. Может быть только один владелец за раз
3. Когда владелец выходит из области видимости, значение удаляется

```rust
fn main() {
    // s1 владеет String
    let s1 = String::from("привет");
    
    // Владение переходит к s2
    let s2 = s1;
    
    // Ошибка! s1 больше не действителен
    // println!("{}", s1);
    
    println!("{}", s2);  // OK
}
```

### Заимствование и ссылки

```rust
fn main() {
    let s1 = String::from("привет");
    
    // Неизменяемое заимствование
    let len = calculate_length(&s1);
    println!("Длина '{}' равна {}", s1, len);
    
    // Изменяемое заимствование
    let mut s2 = String::from("привет");
    change(&mut s2);
    println!("{}", s2);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn change(s: &mut String) {
    s.push_str(", мир");
}
```

### Правила заимствования

- Вы можете иметь либо одну изменяемую ссылку, ЛИБО любое количество неизменяемых ссылок
- Ссылки всегда должны быть действительны (нет висячих ссылок)

```rust
fn main() {
    let mut s = String::from("привет");
    
    let r1 = &s;      // OK
    let r2 = &s;      // OK
    // let r3 = &mut s;  // Ошибка! Нельзя иметь изменяемую ссылку пока существуют неизменяемые
    
    println!("{} и {}", r1, r2);
    
    let r3 = &mut s;  // OK сейчас (r1 и r2 больше не используются)
    r3.push_str(", мир");
}
```

## Распространенные типы данных

### Строки

```rust
fn main() {
    // Строковый литерал (хранится в бинарнике, неизменяемая)
    let s1: &str = "привет";
    
    // String (размещается в куче, растущая, изменяемая)
    let mut s2 = String::from("привет");
    s2.push_str(", мир");
    
    // Преобразовать String в &str
    let s3: &str = &s2;
    
    // Методы строк
    let len = s2.len();
    let is_empty = s2.is_empty();
    let contains = s2.contains("мир");
}
```

### Векторы

```rust
fn main() {
    // Создать вектор
    let mut v: Vec<i32> = Vec::new();
    v.push(1);
    v.push(2);
    v.push(3);
    
    // Используя макрос vec!
    let v2 = vec![1, 2, 3];
    
    // Доступ к элементам
    let third = v2[2];
    let third = v2.get(2);  // Возвращает Option<&i32>
    
    // Итерация
    for i in &v2 {
        println!("{}", i);
    }
    
    // Итерация с изменением
    for i in &mut v {
        *i += 50;
    }
}
```

### Хеш-карты

```rust
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    
    // Вставить значения
    scores.insert(String::from("Синие"), 10);
    scores.insert(String::from("Желтые"), 50);
    
    // Получить значение
    let team_name = String::from("Синие");
    let score = scores.get(&team_name);  // Возвращает Option<&i32>
    
    // Итерация
    for (key, value) in &scores {
        println!("{}: {}", key, value);
    }
    
    // Обновить
    scores.insert(String::from("Синие"), 25);  // Перезаписать
    
    // Вставить если не существует
    scores.entry(String::from("Красные")).or_insert(50);
}
```

## Функции и управление потоком

### Функции

```rust
fn main() {
    let result = add(5, 3);
    println!("Результат: {}", result);
    
    let (sum, product) = calculate(4, 5);
    println!("Сумма: {}, Произведение: {}", sum, product);
}

fn add(x: i32, y: i32) -> i32 {
    x + y  // Выражение (без точки с запятой)
}

fn calculate(x: i32, y: i32) -> (i32, i32) {
    (x + y, x * y)
}
```

### Выражения If

```rust
fn main() {
    let number = 6;
    
    if number < 5 {
        println!("условие истинно");
    } else if number == 5 {
        println!("число равно 5");
    } else {
        println!("условие ложно");
    }
    
    // If в выражении let
    let result = if number < 5 { "маленькое" } else { "большое" };
}
```

### Циклы

```rust
fn main() {
    // Бесконечный цикл
    let mut counter = 0;
    loop {
        counter += 1;
        if counter == 10 {
            break;
        }
    }
    
    // Вернуть значение из цикла
    let result = loop {
        counter += 1;
        if counter == 20 {
            break counter * 2;
        }
    };
    
    // Цикл While
    let mut number = 3;
    while number != 0 {
        println!("{}!", number);
        number -= 1;
    }
    
    // Цикл For
    let arr = [10, 20, 30, 40, 50];
    for element in arr {
        println!("значение: {}", element);
    }
    
    // Диапазон
    for number in 1..4 {
        println!("{}", number);  // 1, 2, 3
    }
    
    // Включительный диапазон
    for number in 1..=4 {
        println!("{}", number);  // 1, 2, 3, 4
    }
}
```

### Match (сопоставление с образцом)

```rust
fn main() {
    let number = 7;
    
    match number {
        1 => println!("Один!"),
        2 | 3 | 5 | 7 | 11 => println!("Простое"),
        13..=19 => println!("Подросток"),
        _ => println!("Что-то еще"),
    }
    
    // Match с Option
    let some_value: Option<i32> = Some(5);
    match some_value {
        Some(x) => println!("Значение: {}", x),
        None => println!("Нет значения"),
    }
    
    // if let (сопоставление с образцом)
    if let Some(x) = some_value {
        println!("Значение: {}", x);
    }
}
```

## Обработка ошибок

### Тип Option

```rust
fn divide(numerator: f64, denominator: f64) -> Option<f64> {
    if denominator == 0.0 {
        None
    } else {
        Some(numerator / denominator)
    }
}

fn main() {
    let result = divide(10.0, 2.0);
    
    match result {
        Some(x) => println!("Результат: {}", x),
        None => println!("Нельзя делить на ноль"),
    }
    
    // Используя unwrap_or
    let value = divide(10.0, 0.0).unwrap_or(0.0);
}
```

### Тип Result

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    // Открытие файла возвращает Result<File, Error>
    let file_result = File::open("hello.txt");
    
    let file = match file_result {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => {
                println!("Файл не найден");
                return;
            }
            other_error => {
                println!("Ошибка открытия файла: {:?}", other_error);
                return;
            }
        },
    };
    
    // Используя unwrap (паникует при ошибке)
    // let file = File::open("hello.txt").unwrap();
    
    // Используя expect (паникует с пользовательским сообщением)
    // let file = File::open("hello.txt").expect("Не удалось открыть файл");
}
```

### Оператор ?

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut file = File::open("username.txt")?;
    let mut username = String::new();
    file.read_to_string(&mut username)?;
    Ok(username)
}

// Еще короче
fn read_username_short() -> Result<String, io::Error> {
    let mut username = String::new();
    File::open("username.txt")?.read_to_string(&mut username)?;
    Ok(username)
}
```

## Cargo - инструмент сборки Rust

### Структура проекта

```
my-project/
├── Cargo.toml          # Манифест проекта
├── Cargo.lock          # Файл блокировки (не редактируйте вручную)
├── src/
│   ├── main.rs         # Точка входа для исполняемого файла
│   └── lib.rs          # Точка входа для библиотеки
├── tests/              # Интеграционные тесты
├── benches/            # Бенчмарки
└── examples/           # Примеры программ
```

### Cargo.toml

```toml
[package]
name = "my-project"
version = "0.1.0"
edition = "2021"
authors = ["Ваше Имя <you@example.com>"]

[dependencies]
serde = "1.0"
tokio = { version = "1.0", features = ["full"] }

[dev-dependencies]
criterion = "0.5"
```

### Распространенные команды

```bash
# Создать новый проект
cargo new my-project
cargo new my-lib --lib

# Собрать проект
cargo build
cargo build --release

# Запустить проект
cargo run
cargo run --release

# Проверить на ошибки (быстрее чем сборка)
cargo check

# Запустить тесты
cargo test

# Генерировать документацию
cargo doc --open

# Форматировать код
cargo fmt

# Линтинг кода
cargo clippy

# Обновить зависимости
cargo update

# Добавить зависимость
cargo add serde

# Искать пакеты
cargo search tokio
```

## Необходимые инструменты

### Rustfmt - Форматировщик кода

```bash
# Форматировать текущий проект
cargo fmt

# Проверить нужно ли форматирование
cargo fmt -- --check

# Конфигурация в rustfmt.toml или .rustfmt.toml
```

### Clippy - Линтер

```bash
# Запустить clippy
cargo clippy

# Clippy со всеми предупреждениями
cargo clippy -- -W clippy::all

# Автоматически исправить исправимые проблемы
cargo clippy --fix
```

### Rust Analyzer

Расширение для IDE, предоставляющее:
- Автодополнение кода
- Переход к определению
- Встроенная документация
- Рефакторинг
- Подсказки типов

Установить для вашей IDE:
- VS Code: расширение "rust-analyzer"
- IntelliJ IDEA/CLion: встроенный плагин Rust
- Vim/Neovim: rust-analyzer через LSP

### Cargo Watch

Автоматически выполняйте команды при изменении файлов:

```bash
# Установить
cargo install cargo-watch

# Отслеживать и запускать
cargo watch -x run

# Отслеживать и тестировать
cargo watch -x test

# Несколько команд
cargo watch -x check -x test -x run
```

### Cargo Edit

Управляйте зависимостями из командной строки:

```bash
# Установить
cargo install cargo-edit

# Добавить зависимость
cargo add serde

# Добавить dev зависимость
cargo add --dev criterion

# Удалить зависимость
cargo rm serde

# Обновить зависимости
cargo upgrade
```

## Следующие шаги

### Ресурсы для обучения

1. **Книга Rust**: [doc.rust-lang.org/book](https://doc.rust-lang.org/book/)
2. **Rust на примерах**: [doc.rust-lang.org/rust-by-example](https://doc.rust-lang.org/rust-by-example/)
3. **Rustlings**: Интерактивные упражнения - [github.com/rust-lang/rustlings](https://github.com/rust-lang/rustlings)
4. **Rust Cookbook**: Распространенные задачи программирования

### Практические проекты

1. **Утилита командной строки**: Поиск текста, организатор файлов
2. **Веб-сервер**: HTTP сервер с маршрутизацией
3. **CLI калькулятор**: Парсер и вычислитель выражений
4. **Todo приложение**: CRUD приложение с файловым хранилищем
5. **Игра**: Игра в угадывание, крестики-нолики

### Продвинутые темы для изучения

- **Трейты и дженерики**: Переиспользование кода и абстракция
- **Времена жизни**: Продвинутое управление памятью
- **Умные указатели**: `Box`, `Rc`, `Arc`, `RefCell`
- **Параллелизм**: Потоки, каналы, async/await
- **Макросы**: Метапрограммирование
- **Небезопасный Rust**: Низкоуровневый контроль
- **FFI**: Взаимодействие с C
- **WebAssembly**: Rust в браузере

### Экосистема

Популярные крейты (библиотеки):
- **serde**: Сериализация/десериализация
- **tokio**: Асинхронная среда выполнения
- **actix-web**: Веб-фреймворк
- **reqwest**: HTTP клиент
- **clap**: Парсер аргументов командной строки
- **diesel**: ORM и конструктор запросов
- **regex**: Регулярные выражения
- **log**: Фасад логирования

### Сообщество

- [Форум пользователей Rust](https://users.rust-lang.org/)
- [Rust Discord](https://discord.gg/rust-lang)
- [r/rust](https://www.reddit.com/r/rust/)
- [This Week in Rust](https://this-week-in-rust.org/)

## Заключение

Rust предлагает уникальное сочетание производительности и безопасности. Хотя у него более крутая кривая обучения, чем у некоторых языков, инвестиции окупаются в виде надежного, быстрого программного обеспечения. Начните с небольших проектов, практикуйте систему владения и постепенно изучайте более продвинутые функции.

Помните:
- Внимательно читайте ошибки компилятора - они очень полезны
- Регулярно используйте `cargo clippy` для лучших практик
- Не боритесь с проверкой заимствований - учитесь у нее
- Присоединяйтесь к сообществу - разработчики Rust очень помогают
- Практикуйтесь, практикуйтесь, практикуйтесь!
<!-- /lang:ru -->
