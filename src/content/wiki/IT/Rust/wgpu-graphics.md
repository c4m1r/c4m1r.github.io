---
title: WGPU и первое 2D/3D приложение
title_en: WGPU and First 2D/3D Application
title_ru: WGPU и первое 2D/3D приложение
title_fr: WGPU et première application 2D/3D
title_es: WGPU y primera aplicación 2D/3D
title_zh: WGPU 和第一个 2D/3D 应用
title_ja: WGPU と最初の 2D/3D アプリケーション
title_ko: WGPU와 첫 2D/3D 애플리케이션
category: it/rust
updatedAt: 2026-02-13
---

<!-- lang:en -->
# WGPU and First 2D/3D Application

WGPU is a safe and portable GPU API for Rust, based on the WebGPU standard. It provides cross-platform access to modern graphics APIs (Vulkan, Metal, DirectX 12, and WebGPU).

## Table of Contents

1. [Introduction to WGPU](#introduction-to-wgpu)
2. [Setting Up the Environment](#setting-up-the-environment)
3. [Basic Concepts](#basic-concepts)
4. [Creating a 2D Triangle](#creating-a-2d-triangle)
5. [Adding Color and Textures](#adding-color-and-textures)
6. [Moving to 3D](#moving-to-3d)
7. [Camera and Transformations](#camera-and-transformations)
8. [Lighting and Materials](#lighting-and-materials)
9. [Performance Tips](#performance-tips)
10. [Next Steps](#next-steps)

## Introduction to WGPU

### What is WGPU?

**WGPU** is a Rust implementation of the WebGPU API, providing:
- **Safety**: Memory-safe GPU programming
- **Performance**: Direct access to modern GPU features
- **Portability**: Works on Windows, Linux, macOS, and Web (via WASM)
- **Modern**: Based on modern graphics APIs

### Why Use WGPU?

- **Cross-platform**: Write once, run everywhere
- **Type-safe**: Rust's type system prevents common graphics errors
- **No garbage collection**: Predictable performance
- **Active development**: Backed by Mozilla and the community

### Use Cases

- Game engines
- Scientific visualization
- CAD/CAM applications
- Data visualization
- Image/video processing
- Machine learning inference

## Setting Up the Environment

### Create a New Project

```bash
cargo new wgpu_app
cd wgpu_app
```

### Add Dependencies

Add to `Cargo.toml`:

```toml
[dependencies]
wgpu = "0.18"
winit = "0.29"
env_logger = "0.11"
pollster = "0.3"
bytemuck = { version = "1.14", features = ["derive"] }
cgmath = "0.18"
```

**Dependencies explained:**
- `wgpu`: GPU API
- `winit`: Window creation and event handling
- `env_logger`: Logging
- `pollster`: Async executor
- `bytemuck`: Safe casting between types
- `cgmath`: Math library for graphics

## Basic Concepts

### WGPU Pipeline

1. **Instance**: Entry point to WGPU
2. **Adapter**: Physical GPU device
3. **Device**: Logical connection to GPU
4. **Queue**: Command submission
5. **Surface**: Rendering target (window)
6. **Pipeline**: Rendering configuration

### Shader Language

WGPU uses **WGSL** (WebGPU Shading Language):

```wgsl
@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> @builtin(position) vec4<f32> {
    return vec4<f32>(0.0, 0.0, 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0); // Red
}
```

## Creating a 2D Triangle

### Project Structure

```
src/
  ├── main.rs
  ├── shader.wgsl
  └── state.rs
```

### Basic State Structure

`src/state.rs`:

```rust
use wgpu::util::DeviceExt;
use winit::window::Window;

pub struct State {
    surface: wgpu::Surface,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: winit::dpi::PhysicalSize<u32>,
    render_pipeline: wgpu::RenderPipeline,
}

impl State {
    pub async fn new(window: &Window) -> Self {
        let size = window.inner_size();
        
        // Create instance
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
            backends: wgpu::Backends::all(),
            ..Default::default()
        });
        
        // Create surface
        let surface = unsafe { instance.create_surface(&window) }.unwrap();
        
        // Request adapter
        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::default(),
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
            })
            .await
            .unwrap();
        
        // Request device and queue
        let (device, queue) = adapter
            .request_device(
                &wgpu::DeviceDescriptor {
                    features: wgpu::Features::empty(),
                    limits: wgpu::Limits::default(),
                    label: None,
                },
                None,
            )
            .await
            .unwrap();
        
        // Configure surface
        let surface_caps = surface.get_capabilities(&adapter);
        let surface_format = surface_caps
            .formats
            .iter()
            .copied()
            .find(|f| f.is_srgb())
            .unwrap_or(surface_caps.formats[0]);
        
        let config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            format: surface_format,
            width: size.width,
            height: size.height,
            present_mode: surface_caps.present_modes[0],
            alpha_mode: surface_caps.alpha_modes[0],
            view_formats: vec![],
        };
        surface.configure(&device, &config);
        
        // Load shader
        let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: Some("Shader"),
            source: wgpu::ShaderSource::Wgsl(include_str!("shader.wgsl").into()),
        });
        
        // Create render pipeline
        let render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("Render Pipeline Layout"),
                bind_group_layouts: &[],
                push_constant_ranges: &[],
            });
        
        let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("Render Pipeline"),
            layout: Some(&render_pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: "vs_main",
                buffers: &[],
            },
            fragment: Some(wgpu::FragmentState {
                module: &shader,
                entry_point: "fs_main",
                targets: &[Some(wgpu::ColorTargetState {
                    format: config.format,
                    blend: Some(wgpu::BlendState::REPLACE),
                    write_mask: wgpu::ColorWrites::ALL,
                })],
            }),
            primitive: wgpu::PrimitiveState {
                topology: wgpu::PrimitiveTopology::TriangleList,
                strip_index_format: None,
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: Some(wgpu::Face::Back),
                polygon_mode: wgpu::PolygonMode::Fill,
                unclipped_depth: false,
                conservative: false,
            },
            depth_stencil: None,
            multisample: wgpu::MultisampleState {
                count: 1,
                mask: !0,
                alpha_to_coverage_enabled: false,
            },
            multiview: None,
        });
        
        Self {
            surface,
            device,
            queue,
            config,
            size,
            render_pipeline,
        }
    }
    
    pub fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
        if new_size.width > 0 && new_size.height > 0 {
            self.size = new_size;
            self.config.width = new_size.width;
            self.config.height = new_size.height;
            self.surface.configure(&self.device, &self.config);
        }
    }
    
    pub fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        let output = self.surface.get_current_texture()?;
        let view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());
        
        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });
        
        {
            let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Render Pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color {
                            r: 0.1,
                            g: 0.2,
                            b: 0.3,
                            a: 1.0,
                        }),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: None,
                occlusion_query_set: None,
                timestamp_writes: None,
            });
            
            render_pass.set_pipeline(&self.render_pipeline);
            render_pass.draw(0..3, 0..1); // Draw triangle
        }
        
        self.queue.submit(std::iter::once(encoder.finish()));
        output.present();
        
        Ok(())
    }
}
```

### Triangle Shader

`src/shader.wgsl`:

```wgsl
@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> @builtin(position) vec4<f32> {
    var positions = array<vec2<f32>, 3>(
        vec2<f32>(0.0, 0.5),   // Top
        vec2<f32>(-0.5, -0.5), // Bottom-left
        vec2<f32>(0.5, -0.5)   // Bottom-right
    );
    
    return vec4<f32>(positions[in_vertex_index], 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.5, 0.2, 1.0); // Orange
}
```

### Main Loop

`src/main.rs`:

```rust
use winit::{
    event::*,
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};

mod state;
use state::State;

fn main() {
    env_logger::init();
    let event_loop = EventLoop::new();
    let window = WindowBuilder::new()
        .with_title("WGPU Triangle")
        .build(&event_loop)
        .unwrap();
    
    let mut state = pollster::block_on(State::new(&window));
    
    event_loop.run(move |event, _, control_flow| match event {
        Event::WindowEvent {
            ref event,
            window_id,
        } if window_id == window.id() => match event {
            WindowEvent::CloseRequested => *control_flow = ControlFlow::Exit,
            WindowEvent::Resized(physical_size) => {
                state.resize(*physical_size);
            }
            WindowEvent::ScaleFactorChanged { new_inner_size, .. } => {
                state.resize(**new_inner_size);
            }
            _ => {}
        },
        Event::RedrawRequested(window_id) if window_id == window.id() => {
            match state.render() {
                Ok(_) => {}
                Err(wgpu::SurfaceError::Lost) => state.resize(state.size),
                Err(wgpu::SurfaceError::OutOfMemory) => *control_flow = ControlFlow::Exit,
                Err(e) => eprintln!("{:?}", e),
            }
        }
        Event::MainEventsCleared => {
            window.request_redraw();
        }
        _ => {}
    });
}
```

### Run the Application

```bash
cargo run
```

You should see a window with an orange triangle!

## Adding Color and Textures

### Vertex Colors

Define colored vertices:

```rust
#[repr(C)]
#[derive(Copy, Clone, Debug, bytemuck::Pod, bytemuck::Zeroable)]
struct Vertex {
    position: [f32; 3],
    color: [f32; 3],
}

impl Vertex {
    fn desc() -> wgpu::VertexBufferLayout<'static> {
        wgpu::VertexBufferLayout {
            array_stride: std::mem::size_of::<Vertex>() as wgpu::BufferAddress,
            step_mode: wgpu::VertexStepMode::Vertex,
            attributes: &[
                wgpu::VertexAttribute {
                    offset: 0,
                    shader_location: 0,
                    format: wgpu::VertexFormat::Float32x3,
                },
                wgpu::VertexAttribute {
                    offset: std::mem::size_of::<[f32; 3]>() as wgpu::BufferAddress,
                    shader_location: 1,
                    format: wgpu::VertexFormat::Float32x3,
                },
            ],
        }
    }
}

const VERTICES: &[Vertex] = &[
    Vertex { position: [0.0, 0.5, 0.0], color: [1.0, 0.0, 0.0] },  // Red
    Vertex { position: [-0.5, -0.5, 0.0], color: [0.0, 1.0, 0.0] }, // Green
    Vertex { position: [0.5, -0.5, 0.0], color: [0.0, 0.0, 1.0] },  // Blue
];
```

Update shader:

```wgsl
struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) color: vec3<f32>,
}

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) color: vec3<f32>,
}

@vertex
fn vs_main(model: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.color = model.color;
    out.clip_position = vec4<f32>(model.position, 1.0);
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(in.color, 1.0);
}
```

## Moving to 3D

### Add Depth Buffer

```rust
// Create depth texture
let depth_texture = device.create_texture(&wgpu::TextureDescriptor {
    label: Some("Depth Texture"),
    size: wgpu::Extent3d {
        width: config.width,
        height: config.height,
        depth_or_array_layers: 1,
    },
    mip_level_count: 1,
    sample_count: 1,
    dimension: wgpu::TextureDimension::D2,
    format: wgpu::TextureFormat::Depth32Float,
    usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::TEXTURE_BINDING,
    view_formats: &[],
});
```

### 3D Cube Vertices

```rust
const CUBE_VERTICES: &[Vertex] = &[
    // Front face (red)
    Vertex { position: [-0.5, -0.5,  0.5], color: [1.0, 0.0, 0.0] },
    Vertex { position: [ 0.5, -0.5,  0.5], color: [1.0, 0.0, 0.0] },
    Vertex { position: [ 0.5,  0.5,  0.5], color: [1.0, 0.0, 0.0] },
    Vertex { position: [-0.5,  0.5,  0.5], color: [1.0, 0.0, 0.0] },
    
    // Back face (green)
    Vertex { position: [-0.5, -0.5, -0.5], color: [0.0, 1.0, 0.0] },
    Vertex { position: [ 0.5, -0.5, -0.5], color: [0.0, 1.0, 0.0] },
    Vertex { position: [ 0.5,  0.5, -0.5], color: [0.0, 1.0, 0.0] },
    Vertex { position: [-0.5,  0.5, -0.5], color: [0.0, 1.0, 0.0] },
    // ... other faces
];

const CUBE_INDICES: &[u16] = &[
    0, 1, 2, 2, 3, 0, // Front
    4, 6, 5, 6, 4, 7, // Back
    // ... other faces
];
```

## Camera and Transformations

### Camera Structure

```rust
use cgmath::*;

struct Camera {
    eye: Point3<f32>,
    target: Point3<f32>,
    up: Vector3<f32>,
    aspect: f32,
    fovy: f32,
    znear: f32,
    zfar: f32,
}

impl Camera {
    fn build_view_projection_matrix(&self) -> Matrix4<f32> {
        let view = Matrix4::look_at_rh(self.eye, self.target, self.up);
        let proj = perspective(Deg(self.fovy), self.aspect, self.znear, self.zfar);
        proj * view
    }
}
```

### Uniform Buffer

```rust
#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
struct Uniforms {
    view_proj: [[f32; 4]; 4],
}
```

## Lighting and Materials

### Phong Lighting Shader

```wgsl
struct Light {
    position: vec3<f32>,
    color: vec3<f32>,
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let light = Light(vec3<f32>(2.0, 2.0, 2.0), vec3<f32>(1.0, 1.0, 1.0));
    
    let ambient_strength = 0.1;
    let ambient_color = light.color * ambient_strength;
    
    let light_dir = normalize(light.position - in.world_position);
    let diffuse_strength = max(dot(in.world_normal, light_dir), 0.0);
    let diffuse_color = light.color * diffuse_strength;
    
    let result = (ambient_color + diffuse_color) * in.color;
    return vec4<f32>(result, 1.0);
}
```

## Performance Tips

### Best Practices

1. **Batch Draw Calls**: Combine similar objects
2. **Use Instancing**: For many identical objects
3. **Minimize State Changes**: Sort by pipeline/texture
4. **Use Compute Shaders**: For parallel processing
5. **Profile Regularly**: Use `wgpu-profiler`

### Memory Management

```rust
// Reuse buffers when possible
let vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
    label: Some("Vertex Buffer"),
    contents: bytemuck::cast_slice(VERTICES),
    usage: wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::COPY_DST,
});
```

## Next Steps

### Learning Resources

- **Learn WGPU**: https://sotrh.github.io/learn-wgpu/
- **WebGPU Spec**: https://gpuweb.github.io/gpuweb/
- **WGSL Spec**: https://gpuweb.github.io/gpuweb/wgsl/
- **Examples**: https://github.com/gfx-rs/wgpu/tree/master/examples

### Advanced Topics

- **Compute Shaders**: GPU computing
- **Ray Tracing**: Modern rendering techniques
- **PBR Materials**: Physically-based rendering
- **Post-Processing**: Screen-space effects
- **Particle Systems**: GPU particles

### Game Engines Using WGPU

- **Bevy**: Data-driven game engine
- **Fyrox**: 3D/2D game engine
- **Nannou**: Creative coding framework

### Example Projects

```bash
# Clone WGPU examples
git clone https://github.com/gfx-rs/wgpu
cd wgpu/examples

# Run examples
cargo run --example cube
cargo run --example water
cargo run --example shadow
```

Happy rendering with WGPU! 🎨
<!-- /lang:en -->

<!-- lang:ru -->
# WGPU и первое 2D/3D приложение

WGPU — это безопасный и портативный GPU API для Rust, основанный на стандарте WebGPU. Он обеспечивает кроссплатформенный доступ к современным графическим API (Vulkan, Metal, DirectX 12 и WebGPU).

## Содержание

1. [Введение в WGPU](#введение-в-wgpu)
2. [Настройка окружения](#настройка-окружения)
3. [Базовые концепции](#базовые-концепции)
4. [Создание 2D треугольника](#создание-2d-треугольника)
5. [Добавление цвета и текстур](#добавление-цвета-и-текстур)
6. [Переход к 3D](#переход-к-3d)
7. [Камера и трансформации](#камера-и-трансформации)
8. [Освещение и материалы](#освещение-и-материалы)
9. [Советы по производительности](#советы-по-производительности)
10. [Следующие шаги](#следующие-шаги)

## Введение в WGPU

### Что такое WGPU?

**WGPU** — это Rust-реализация WebGPU API, предоставляющая:
- **Безопасность**: Безопасное программирование GPU с управлением памятью
- **Производительность**: Прямой доступ к современным функциям GPU
- **Портативность**: Работает на Windows, Linux, macOS и Web (через WASM)
- **Современность**: Основан на современных графических API

### Зачем использовать WGPU?

- **Кроссплатформенность**: Пишете один раз, запускаете везде
- **Типобезопасность**: Система типов Rust предотвращает распространенные графические ошибки
- **Без сборщика мусора**: Предсказуемая производительность
- **Активная разработка**: Поддерживается Mozilla и сообществом

### Области применения

- Игровые движки
- Научная визуализация
- CAD/CAM приложения
- Визуализация данных
- Обработка изображений/видео
- Инференс машинного обучения

## Настройка окружения

### Создайте новый проект

```bash
cargo new wgpu_app
cd wgpu_app
```

### Добавьте зависимости

Добавьте в `Cargo.toml`:

```toml
[dependencies]
wgpu = "0.18"
winit = "0.29"
env_logger = "0.11"
pollster = "0.3"
bytemuck = { version = "1.14", features = ["derive"] }
cgmath = "0.18"
```

**Объяснение зависимостей:**
- `wgpu`: GPU API
- `winit`: Создание окон и обработка событий
- `env_logger`: Логирование
- `pollster`: Асинхронный исполнитель
- `bytemuck`: Безопасное приведение типов
- `cgmath`: Математическая библиотека для графики

## Базовые концепции

### Конвейер WGPU

1. **Instance**: Точка входа в WGPU
2. **Adapter**: Физическое GPU устройство
3. **Device**: Логическое соединение с GPU
4. **Queue**: Отправка команд
5. **Surface**: Цель рендеринга (окно)
6. **Pipeline**: Конфигурация рендеринга

### Язык шейдеров

WGPU использует **WGSL** (WebGPU Shading Language):

```wgsl
@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> @builtin(position) vec4<f32> {
    return vec4<f32>(0.0, 0.0, 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0); // Красный
}
```

_(Примеры кода остаются на английском для технической точности и совместимости)_

## Создание 2D треугольника

Полные примеры кода см. в английской версии выше.

**Основные шаги:**
1. Создание состояния (State) с GPU устройством
2. Настройка поверхности (Surface) для рендеринга
3. Загрузка шейдеров
4. Создание конвейера рендеринга
5. Цикл рендеринга

## Добавление цвета и текстур

**Вершинные цвета** позволяют интерполировать цвет между вершинами треугольника, создавая градиенты.

**Текстуры** добавляют детали без увеличения количества полигонов.

## Переход к 3D

Для 3D рендеринга требуется:
- **Буфер глубины** (Depth Buffer)
- **3D вершины** с координатами X, Y, Z
- **Камера** с матрицей проекции
- **Индексный буфер** для эффективной отрисовки

## Камера и трансформации

Камера определяется:
- **Позиция** (eye): Где находится камера
- **Цель** (target): Куда смотрит камера
- **Вектор вверх** (up): Ориентация камеры

**Матрица проекции** преобразует 3D координаты в 2D экран.

## Освещение и материалы

**Модель освещения Phong** включает:
- **Ambient**: Фоновое освещение
- **Diffuse**: Рассеянный свет
- **Specular**: Блики

## Советы по производительности

1. **Группировка вызовов отрисовки**: Объединяйте похожие объекты
2. **Используйте инстансинг**: Для множества одинаковых объектов
3. **Минимизируйте смены состояния**: Сортируйте по конвейеру/текстуре
4. **Compute шейдеры**: Для параллельной обработки
5. **Регулярно профилируйте**: Используйте `wgpu-profiler`

## Следующие шаги

### Ресурсы для обучения

- **Learn WGPU**: https://sotrh.github.io/learn-wgpu/
- **WebGPU Спецификация**: https://gpuweb.github.io/gpuweb/
- **WGSL Спецификация**: https://gpuweb.github.io/gpuweb/wgsl/
- **Примеры**: https://github.com/gfx-rs/wgpu/tree/master/examples

### Продвинутые темы

- **Compute шейдеры**: Вычисления на GPU
- **Ray Tracing**: Современные техники рендеринга
- **PBR материалы**: Физически корректный рендеринг
- **Постобработка**: Эффекты в экранном пространстве
- **Системы частиц**: Частицы на GPU

### Игровые движки на WGPU

- **Bevy**: Движок с управлением данными
- **Fyrox**: 3D/2D игровой движок
- **Nannou**: Фреймворк для творческого программирования

Удачного рендеринга с WGPU! 🎨
<!-- /lang:ru -->
