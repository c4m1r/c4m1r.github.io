---
title: Первые шаги с Proxmox
title_en: First Steps with Proxmox
title_ru: Первые шаги с Proxmox
title_fr: Premiers pas avec Proxmox
title_es: Primeros pasos con Proxmox
title_zh: Proxmox 第一步
title_ja: Proxmox の最初のステップ
title_ko: Proxmox 첫 걸음
category: it/proxmox
updatedAt: 2026-02-13
---

<!-- lang:en -->
# First Steps with Proxmox

Proxmox Virtual Environment (Proxmox VE) is an open-source server virtualization management platform. It allows you to manage virtual machines, containers, storage, and networking through a web-based interface.

## Table of Contents

1. [What is Proxmox?](#what-is-proxmox)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Initial Configuration](#initial-configuration)
5. [Creating Your First VM](#creating-your-first-vm)
6. [Working with Containers (LXC)](#working-with-containers-lxc)
7. [Storage Configuration](#storage-configuration)
8. [Network Setup](#network-setup)
9. [Backup and Restore](#backup-and-restore)
10. [Useful Commands](#useful-commands)

## What is Proxmox?

Proxmox VE combines two virtualization technologies:
- **KVM** (Kernel-based Virtual Machine) for full virtualization
- **LXC** (Linux Containers) for lightweight container-based virtualization

### Key Features

- Web-based management interface
- Support for VMs and containers
- High availability clustering
- Built-in backup and restore
- Live migration
- Software-defined storage and networking

## System Requirements

### Minimum Requirements

- **CPU**: 64-bit processor with virtualization support (Intel VT-x or AMD-V)
- **RAM**: 2GB minimum (4GB+ recommended)
- **Storage**: 32GB disk space minimum
- **Network**: 1 Gbps network interface

### Recommended Hardware

- **CPU**: Multi-core processor (4+ cores)
- **RAM**: 16GB+ for multiple VMs
- **Storage**: SSD for system, additional drives for VM storage
- **Network**: Multiple network interfaces for separation

## Installation

### Download Proxmox VE

1. Visit [proxmox.com](https://www.proxmox.com/en/downloads)
2. Download the latest ISO image
3. Create a bootable USB drive using tools like:
   - Rufus (Windows)
   - Etcher (cross-platform)
   - dd (Linux)

### Installation Steps

1. Boot from the USB drive
2. Select "Install Proxmox VE"
3. Accept the EULA
4. Select target disk (WARNING: will be wiped)
5. Configure timezone and keyboard layout
6. Set root password and email
7. Configure network:
   - IP address (static recommended)
   - Gateway
   - DNS server
8. Complete installation and reboot

### First Access

After installation, access the web interface:
```
https://your-proxmox-ip:8006
```

Login with:
- Username: `root`
- Password: (the one you set during installation)

## Initial Configuration

### Update System

```bash
# Update package list
apt update

# Upgrade packages
apt dist-upgrade

# Reboot if kernel was updated
reboot
```

### Configure Repositories

#### Remove Enterprise Repository (if no subscription)

```bash
# Edit sources list
nano /etc/apt/sources.list.d/pve-enterprise.list

# Comment out the line by adding # at the beginning
# deb https://enterprise.proxmox.com/debian/pve bullseye pve-enterprise
```

#### Add No-Subscription Repository

```bash
# Add to sources
echo "deb http://download.proxmox.com/debian/pve bullseye pve-no-subscription" > /etc/apt/sources.list.d/pve-no-subscription.list

# Update
apt update
```

### Configure NTP

```bash
# Install chrony for time synchronization
apt install chrony

# Start and enable
systemctl enable --now chrony
```

## Creating Your First VM

### Via Web Interface

1. Select your node in the left panel
2. Click "Create VM" button
3. **General Tab**:
   - VM ID: (auto or custom)
   - Name: `my-first-vm`
4. **OS Tab**:
   - Select ISO image (upload first if needed)
   - OS Type: Linux/Windows
5. **System Tab**:
   - Graphics card: Default
   - SCSI Controller: VirtIO SCSI
6. **Disks Tab**:
   - Bus/Device: SCSI
   - Storage: local-lvm
   - Disk size: 32GB
7. **CPU Tab**:
   - Cores: 2
   - Type: host
8. **Memory Tab**:
   - Memory: 2048MB
9. **Network Tab**:
   - Bridge: vmbr0
   - Model: VirtIO
10. **Confirm** and create

### Via Command Line

```bash
# Create VM
qm create 100 --name my-first-vm --memory 2048 --cores 2 --net0 virtio,bridge=vmbr0

# Add disk
qm set 100 --scsi0 local-lvm:32

# Set boot order
qm set 100 --boot order=scsi0

# Set OS type
qm set 100 --ostype l26

# Start VM
qm start 100
```

## Working with Containers (LXC)

### Download Container Template

```bash
# List available templates
pveam available

# Download Ubuntu template
pveam download local ubuntu-22.04-standard_22.04-1_amd64.tar.zst
```

### Create Container via Web Interface

1. Click "Create CT" button
2. **General**:
   - CT ID: 101
   - Hostname: my-container
   - Password: (set root password)
3. **Template**:
   - Select downloaded template
4. **Disks**:
   - Storage: local-lvm
   - Disk size: 8GB
5. **CPU**:
   - Cores: 1
6. **Memory**:
   - Memory: 512MB
   - Swap: 512MB
7. **Network**:
   - Bridge: vmbr0
   - IPv4: DHCP or static
8. **Create**

### Via Command Line

```bash
# Create container
pct create 101 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname my-container \
  --password MySecurePassword \
  --memory 512 \
  --swap 512 \
  --cores 1 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --rootfs local-lvm:8

# Start container
pct start 101

# Enter container
pct enter 101
```

## Storage Configuration

### Storage Types

- **Directory**: Simple file-based storage
- **LVM**: Logical Volume Manager
- **LVM-Thin**: Thin provisioned LVM
- **ZFS**: Advanced filesystem with snapshots
- **Ceph**: Distributed storage (for clusters)
- **NFS**: Network File System

### Add NFS Storage

```bash
# Via command line
pvesm add nfs nfs-storage --server 192.168.1.100 --export /mnt/storage --content images,vztmpl,backup

# Via Web Interface:
# Datacenter -> Storage -> Add -> NFS
```

### ZFS Configuration

```bash
# Create ZFS pool
zpool create -f tank /dev/sdb

# Add to Proxmox
pvesm add zfspool zfs-storage --pool tank --content images,rootdir
```

## Network Setup

### Default Network (vmbr0)

Proxmox creates a default bridge `vmbr0` connected to your physical interface.

### Create Additional Bridge

Edit `/etc/network/interfaces`:

```bash
auto vmbr1
iface vmbr1 inet static
    address 10.0.0.1/24
    bridge-ports none
    bridge-stp off
    bridge-fd 0
```

Apply changes:
```bash
systemctl restart networking
# Or reboot
```

### VLAN Configuration

```bash
auto vmbr0.10
iface vmbr0.10 inet manual
    vlan-raw-device vmbr0

auto vmbr10
iface vmbr10 inet static
    address 192.168.10.1/24
    bridge-ports vmbr0.10
    bridge-stp off
    bridge-fd 0
```

## Backup and Restore

### Create Backup via Web Interface

1. Select VM/Container
2. Click "Backup" button
3. Configure:
   - Storage: local
   - Mode: Snapshot (fastest)
   - Compression: ZSTD
4. Click "Backup"

### Via Command Line

```bash
# Backup VM 100
vzdump 100 --storage local --mode snapshot --compress zstd

# Backup all VMs
vzdump --all 1 --storage local

# Schedule backup (edit /etc/vzdump.conf)
```

### Restore Backup

```bash
# List backups
pvesm list local

# Restore
qmrestore local:vzdump-qemu-100-2024_01_15-10_30_00.vma.zst 100

# For containers
pct restore 101 local:vzdump-lxc-101-2024_01_15-10_30_00.tar.zst
```

## Useful Commands

### VM Management

```bash
# List all VMs
qm list

# Start VM
qm start <vmid>

# Stop VM
qm stop <vmid>

# Shutdown VM (graceful)
qm shutdown <vmid>

# Reset VM
qm reset <vmid>

# Delete VM
qm destroy <vmid>

# VM status
qm status <vmid>

# VM console
qm terminal <vmid>

# Clone VM
qm clone <vmid> <newid> --name new-vm-name
```

### Container Management

```bash
# List containers
pct list

# Start container
pct start <ctid>

# Stop container
pct stop <ctid>

# Shutdown container
pct shutdown <ctid>

# Delete container
pct destroy <ctid>

# Enter container
pct enter <ctid>

# Execute command in container
pct exec <ctid> -- command
```

### Storage Management

```bash
# List storage
pvesm status

# Scan storage
pvesm scan <type>

# Remove storage
pvesm remove <storage-id>

# List content
pvesm list <storage-id>
```

### Node Management

```bash
# Node status
pvesh get /nodes/<node>/status

# Reboot node
shutdown -r now

# Shutdown node
shutdown -h now

# View logs
journalctl -xe

# Check cluster status
pvecm status

# Node info
pveversion
```

### Network Management

```bash
# Show bridges
brctl show

# Show IP configuration
ip addr show

# Restart networking
systemctl restart networking
```

## Next Steps

### Advanced Topics to Explore

1. **High Availability Cluster**: Set up multiple Proxmox nodes
2. **Ceph Storage**: Distributed storage for clusters
3. **Firewall Configuration**: Secure your VMs and containers
4. **API Integration**: Automate with REST API
5. **GPU Passthrough**: Pass GPU to VMs for gaming/computing
6. **Cloud-Init**: Automated VM provisioning
7. **Monitoring**: Set up monitoring with Prometheus/Grafana

### Recommended Documentation

- [Official Proxmox Wiki](https://pve.proxmox.com/wiki/Main_Page)
- [Proxmox Forum](https://forum.proxmox.com/)
- [Proxmox API Documentation](https://pve.proxmox.com/pve-docs/api-viewer/)

### Additional Resources

- Create detailed guides for specific use cases
- Document your network topology
- Keep notes on VM configurations
- Create automation scripts for common tasks
- Set up regular backup schedules

## Troubleshooting

### Common Issues

**Issue**: Cannot access web interface
```bash
# Check service status
systemctl status pveproxy

# Restart service
systemctl restart pveproxy
```

**Issue**: VM won't start
```bash
# Check VM configuration
qm config <vmid>

# Check logs
journalctl -u pve-cluster
```

**Issue**: Storage full
```bash
# Check disk usage
df -h

# Check LVM usage
lvs

# Clean old backups
```

## Conclusion

Proxmox VE is a powerful virtualization platform that combines ease of use with enterprise features. Start with simple VMs and containers, then gradually explore advanced features like clustering and high availability.

Remember to:
- Keep your system updated
- Regular backups are essential
- Document your setup
- Test disaster recovery procedures
- Join the community for support
<!-- /lang:en -->

<!-- lang:ru -->
# Начало работы с Proxmox

Proxmox Virtual Environment (Proxmox VE) — это платформа с открытым исходным кодом для управления виртуализацией серверов. Она позволяет управлять виртуальными машинами, контейнерами, хранилищем и сетью через веб-интерфейс.

## Содержание

1. [Что такое Proxmox?](#что-такое-proxmox)
2. [Системные требования](#системные-требования)
3. [Установка](#установка)
4. [Первоначальная настройка](#первоначальная-настройка)
5. [Создание первой виртуальной машины](#создание-первой-виртуальной-машины)
6. [Работа с контейнерами (LXC)](#работа-с-контейнерами-lxc)
7. [Настройка хранилища](#настройка-хранилища)
8. [Настройка сети](#настройка-сети)
9. [Резервное копирование и восстановление](#резервное-копирование-и-восстановление)
10. [Полезные команды](#полезные-команды)

## Что такое Proxmox?

Proxmox VE объединяет две технологии виртуализации:
- **KVM** (Kernel-based Virtual Machine) для полной виртуализации
- **LXC** (Linux Containers) для легковесной контейнерной виртуализации

### Ключевые возможности

- Веб-интерфейс управления
- Поддержка виртуальных машин и контейнеров
- Кластеризация с высокой доступностью
- Встроенное резервное копирование и восстановление
- Живая миграция
- Программно-определяемое хранилище и сеть

## Системные требования

### Минимальные требования

- **ЦПУ**: 64-битный процессор с поддержкой виртуализации (Intel VT-x или AMD-V)
- **ОЗУ**: минимум 2ГБ (рекомендуется 4ГБ+)
- **Хранилище**: минимум 32ГБ дискового пространства
- **Сеть**: сетевой интерфейс 1 Гбит/с

### Рекомендуемое оборудование

- **ЦПУ**: Многоядерный процессор (4+ ядра)
- **ОЗУ**: 16ГБ+ для нескольких виртуальных машин
- **Хранилище**: SSD для системы, дополнительные диски для хранения ВМ
- **Сеть**: Несколько сетевых интерфейсов для разделения

## Установка

### Скачать Proxmox VE

1. Посетите [proxmox.com](https://www.proxmox.com/en/downloads)
2. Скачайте последний ISO образ
3. Создайте загрузочную USB флешку с помощью:
   - Rufus (Windows)
   - Etcher (кроссплатформенный)
   - dd (Linux)

### Шаги установки

1. Загрузитесь с USB флешки
2. Выберите "Install Proxmox VE"
3. Примите лицензионное соглашение
4. Выберите целевой диск (ВНИМАНИЕ: будет очищен)
5. Настройте часовой пояс и раскладку клавиатуры
6. Установите пароль root и email
7. Настройте сеть:
   - IP адрес (рекомендуется статический)
   - Шлюз
   - DNS сервер
8. Завершите установку и перезагрузитесь

### Первый вход

После установки откройте веб-интерфейс:
```
https://ваш-proxmox-ip:8006
```

Войдите с:
- Имя пользователя: `root`
- Пароль: (который вы установили при установке)

## Первоначальная настройка

### Обновление системы

```bash
# Обновить список пакетов
apt update

# Обновить пакеты
apt dist-upgrade

# Перезагрузка если обновилось ядро
reboot
```

### Настройка репозиториев

#### Отключить Enterprise репозиторий (если нет подписки)

```bash
# Редактировать список источников
nano /etc/apt/sources.list.d/pve-enterprise.list

# Закомментировать строку добавив # в начало
# deb https://enterprise.proxmox.com/debian/pve bullseye pve-enterprise
```

#### Добавить No-Subscription репозиторий

```bash
# Добавить в источники
echo "deb http://download.proxmox.com/debian/pve bullseye pve-no-subscription" > /etc/apt/sources.list.d/pve-no-subscription.list

# Обновить
apt update
```

### Настройка NTP

```bash
# Установить chrony для синхронизации времени
apt install chrony

# Запустить и включить
systemctl enable --now chrony
```

## Создание первой виртуальной машины

### Через веб-интерфейс

1. Выберите узел в левой панели
2. Нажмите кнопку "Create VM"
3. **Вкладка General**:
   - VM ID: (авто или свой)
   - Имя: `my-first-vm`
4. **Вкладка OS**:
   - Выберите ISO образ (сначала загрузите если нужно)
   - Тип ОС: Linux/Windows
5. **Вкладка System**:
   - Видеокарта: Default
   - SCSI контроллер: VirtIO SCSI
6. **Вкладка Disks**:
   - Шина/Устройство: SCSI
   - Хранилище: local-lvm
   - Размер диска: 32GB
7. **Вкладка CPU**:
   - Ядра: 2
   - Тип: host
8. **Вкладка Memory**:
   - Память: 2048MB
9. **Вкладка Network**:
   - Мост: vmbr0
   - Модель: VirtIO
10. **Подтвердить** и создать

### Через командную строку

```bash
# Создать ВМ
qm create 100 --name my-first-vm --memory 2048 --cores 2 --net0 virtio,bridge=vmbr0

# Добавить диск
qm set 100 --scsi0 local-lvm:32

# Установить порядок загрузки
qm set 100 --boot order=scsi0

# Установить тип ОС
qm set 100 --ostype l26

# Запустить ВМ
qm start 100
```

## Работа с контейнерами (LXC)

### Скачать шаблон контейнера

```bash
# Список доступных шаблонов
pveam available

# Скачать шаблон Ubuntu
pveam download local ubuntu-22.04-standard_22.04-1_amd64.tar.zst
```

### Создать контейнер через веб-интерфейс

1. Нажмите кнопку "Create CT"
2. **General**:
   - CT ID: 101
   - Hostname: my-container
   - Password: (установить пароль root)
3. **Template**:
   - Выберите скачанный шаблон
4. **Disks**:
   - Хранилище: local-lvm
   - Размер диска: 8GB
5. **CPU**:
   - Ядра: 1
6. **Memory**:
   - Память: 512MB
   - Swap: 512MB
7. **Network**:
   - Мост: vmbr0
   - IPv4: DHCP или статический
8. **Создать**

### Через командную строку

```bash
# Создать контейнер
pct create 101 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname my-container \
  --password МойБезопасныйПароль \
  --memory 512 \
  --swap 512 \
  --cores 1 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --rootfs local-lvm:8

# Запустить контейнер
pct start 101

# Войти в контейнер
pct enter 101
```

## Настройка хранилища

### Типы хранилищ

- **Directory**: Простое файловое хранилище
- **LVM**: Менеджер логических томов
- **LVM-Thin**: LVM с тонким выделением
- **ZFS**: Продвинутая файловая система со снимками
- **Ceph**: Распределенное хранилище (для кластеров)
- **NFS**: Сетевая файловая система

### Добавить NFS хранилище

```bash
# Через командную строку
pvesm add nfs nfs-storage --server 192.168.1.100 --export /mnt/storage --content images,vztmpl,backup

# Через веб-интерфейс:
# Datacenter -> Storage -> Add -> NFS
```

### Настройка ZFS

```bash
# Создать ZFS пул
zpool create -f tank /dev/sdb

# Добавить в Proxmox
pvesm add zfspool zfs-storage --pool tank --content images,rootdir
```

## Настройка сети

### Сеть по умолчанию (vmbr0)

Proxmox создает мост по умолчанию `vmbr0`, подключенный к вашему физическому интерфейсу.

### Создать дополнительный мост

Редактировать `/etc/network/interfaces`:

```bash
auto vmbr1
iface vmbr1 inet static
    address 10.0.0.1/24
    bridge-ports none
    bridge-stp off
    bridge-fd 0
```

Применить изменения:
```bash
systemctl restart networking
# Или перезагрузка
```

### Настройка VLAN

```bash
auto vmbr0.10
iface vmbr0.10 inet manual
    vlan-raw-device vmbr0

auto vmbr10
iface vmbr10 inet static
    address 192.168.10.1/24
    bridge-ports vmbr0.10
    bridge-stp off
    bridge-fd 0
```

## Резервное копирование и восстановление

### Создать резервную копию через веб-интерфейс

1. Выберите ВМ/Контейнер
2. Нажмите кнопку "Backup"
3. Настройте:
   - Хранилище: local
   - Режим: Snapshot (самый быстрый)
   - Сжатие: ZSTD
4. Нажмите "Backup"

### Через командную строку

```bash
# Резервная копия ВМ 100
vzdump 100 --storage local --mode snapshot --compress zstd

# Резервная копия всех ВМ
vzdump --all 1 --storage local

# Запланировать резервное копирование (редактировать /etc/vzdump.conf)
```

### Восстановить резервную копию

```bash
# Список резервных копий
pvesm list local

# Восстановить
qmrestore local:vzdump-qemu-100-2024_01_15-10_30_00.vma.zst 100

# Для контейнеров
pct restore 101 local:vzdump-lxc-101-2024_01_15-10_30_00.tar.zst
```

## Полезные команды

### Управление ВМ

```bash
# Список всех ВМ
qm list

# Запустить ВМ
qm start <vmid>

# Остановить ВМ
qm stop <vmid>

# Выключить ВМ (корректно)
qm shutdown <vmid>

# Перезагрузить ВМ
qm reset <vmid>

# Удалить ВМ
qm destroy <vmid>

# Статус ВМ
qm status <vmid>

# Консоль ВМ
qm terminal <vmid>

# Клонировать ВМ
qm clone <vmid> <newid> --name new-vm-name
```

### Управление контейнерами

```bash
# Список контейнеров
pct list

# Запустить контейнер
pct start <ctid>

# Остановить контейнер
pct stop <ctid>

# Выключить контейнер
pct shutdown <ctid>

# Удалить контейнер
pct destroy <ctid>

# Войти в контейнер
pct enter <ctid>

# Выполнить команду в контейнере
pct exec <ctid> -- команда
```

### Управление хранилищем

```bash
# Список хранилищ
pvesm status

# Сканировать хранилище
pvesm scan <type>

# Удалить хранилище
pvesm remove <storage-id>

# Список содержимого
pvesm list <storage-id>
```

### Управление узлом

```bash
# Статус узла
pvesh get /nodes/<node>/status

# Перезагрузить узел
shutdown -r now

# Выключить узел
shutdown -h now

# Просмотр логов
journalctl -xe

# Проверить статус кластера
pvecm status

# Информация об узле
pveversion
```

### Управление сетью

```bash
# Показать мосты
brctl show

# Показать конфигурацию IP
ip addr show

# Перезапустить сеть
systemctl restart networking
```

## Дальнейшие шаги

### Продвинутые темы для изучения

1. **Кластер высокой доступности**: Настройка нескольких узлов Proxmox
2. **Хранилище Ceph**: Распределенное хранилище для кластеров
3. **Настройка файрвола**: Защита ваших ВМ и контейнеров
4. **Интеграция с API**: Автоматизация через REST API
5. **Проброс GPU**: Передача GPU в ВМ для игр/вычислений
6. **Cloud-Init**: Автоматизированное развертывание ВМ
7. **Мониторинг**: Настройка мониторинга с Prometheus/Grafana

### Рекомендуемая документация

- [Официальная Wiki Proxmox](https://pve.proxmox.com/wiki/Main_Page)
- [Форум Proxmox](https://forum.proxmox.com/)
- [Документация API Proxmox](https://pve.proxmox.com/pve-docs/api-viewer/)

### Дополнительные ресурсы

- Создавайте детальные руководства для конкретных случаев
- Документируйте вашу топологию сети
- Ведите заметки о конфигурациях ВМ
- Создавайте скрипты автоматизации для частых задач
- Настройте регулярное резервное копирование

## Решение проблем

### Частые проблемы

**Проблема**: Не удается получить доступ к веб-интерфейсу
```bash
# Проверить статус сервиса
systemctl status pveproxy

# Перезапустить сервис
systemctl restart pveproxy
```

**Проблема**: ВМ не запускается
```bash
# Проверить конфигурацию ВМ
qm config <vmid>

# Проверить логи
journalctl -u pve-cluster
```

**Проблема**: Хранилище заполнено
```bash
# Проверить использование диска
df -h

# Проверить использование LVM
lvs

# Очистить старые резервные копии
```

## Заключение

Proxmox VE — мощная платформа виртуализации, сочетающая простоту использования с корпоративными функциями. Начните с простых ВМ и контейнеров, затем постепенно изучайте продвинутые возможности, такие как кластеризация и высокая доступность.

Не забывайте:
- Поддерживать систему обновленной
- Регулярные резервные копии критически важны
- Документировать вашу настройку
- Тестировать процедуры восстановления после сбоев
- Присоединиться к сообществу для поддержки
<!-- /lang:ru -->
