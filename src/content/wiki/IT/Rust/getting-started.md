---
title: Начало работы с Rust
title_en: Getting Started with Rust
title_ru: Начало работы с Rust
title_fr: Commencer avec Rust
title_es: Comenzando con Rust
title_zh: Rust入门
title_ja: Rustを始める
title_ko: Rust 시작하기
category: it/rust
updatedAt: 2025-11-29
---

<!-- lang:en -->
# Getting Started with Rust

This document captures steps for installing the toolchain, creating projects, and formatting best practices.

## Installation

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup default stable
rustup component add clippy rustfmt
```

## First Project

```bash
cargo new hello-rust --bin
cd hello-rust
cargo run
```

## Ideas for Notes

- Workspace structure and dependency management in `Cargo.toml`.
- Macros, trait bounds, lifetimes.
- Tools: `cargo fmt`, `cargo clippy`, `cargo test`, `cargo watch`.
<!-- /lang:en -->

<!-- lang:ru -->
# Начало работы с Rust

Этот документ фиксирует шаги по установке toolchain, созданию проектов и оформлению best practices.

## Установка

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup default stable
rustup component add clippy rustfmt
```

## Первый проект

```bash
cargo new hello-rust --bin
cd hello-rust
cargo run
```

## Идеи для заметок

- Структура workspace и управление зависимостями в `Cargo.toml`.
- Macros, trait bounds, lifetimes.
- Инструменты: `cargo fmt`, `cargo clippy`, `cargo test`, `cargo watch`.
<!-- /lang:ru -->
