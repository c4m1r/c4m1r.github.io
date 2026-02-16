---
title: Виртуализация Windows
title_en: Windows Virtualization
title_ru: Виртуализация Windows
title_fr: Virtualisation Windows
title_es: Virtualización de Windows
title_zh: Windows 虚拟化
title_ja: Windows 仮想化
title_ko: Windows 가상화
category: it/windows
updatedAt: 2026-02-13
---

<!-- lang:en -->
# Windows Virtualization

Virtualization allows running multiple operating systems simultaneously on a single physical machine. This guide covers the history, technologies, and practical implementation of Windows virtualization.

## Table of Contents

1. [History of Virtualization](#history-of-virtualization)
2. [Virtualization Concepts](#virtualization-concepts)
3. [Hyper-V](#hyper-v)
4. [VirtIO Drivers](#virtio-drivers)
5. [Installing Windows on Virtualization](#installing-windows-on-virtualization)
6. [Performance Optimization](#performance-optimization)
7. [Networking in Virtual Environments](#networking-in-virtual-environments)
8. [Storage Configuration](#storage-configuration)
9. [Security Considerations](#security-considerations)
10. [Best Practices](#best-practices)

## History of Virtualization

### Timeline

**1960s - The Birth**
- **1967**: IBM develops CP-40, first virtual machine system
- Mainframe computers shared among multiple users
- Goal: Maximize expensive hardware utilization

**1970s-1980s - Mainframe Era**
- **1972**: IBM VM/370 - commercial virtualization
- Used primarily in enterprise data centers
- Allowed running multiple OS instances on mainframes

**1990s - Desktop Virtualization Begins**
- **1997**: Connectix Virtual PC for Mac
- **1998**: VMware founded, brings virtualization to x86
- **1999**: VMware Workstation 1.0 released

**2000s - Mainstream Adoption**
- **2001**: VMware ESX Server (bare-metal hypervisor)
- **2003**: Xen Project launched (open-source hypervisor)
- **2006**: VMware acquires Virtual PC
- **2007**: KVM merged into Linux kernel
- **2008**: Microsoft releases Hyper-V

**2010s - Cloud Era**
- **2010**: VirtIO drivers matured
- **2014**: Docker popularizes containers
- **2015**: Windows Server 2016 with nested virtualization
- **2018**: Windows Subsystem for Linux (WSL)

**2020s - Modern Virtualization**
- **2020**: Apple Silicon with virtualization framework
- **2021**: Windows 11 with TPM and virtualization requirements
- **2022**: WSL2 with full Linux kernel
- **2023**: Advanced GPU passthrough and container orchestration

### Key Milestones

**Hardware Virtualization Support**
- **2005**: Intel VT-x (Vanderpool)
- **2006**: AMD-V (Pacifica)
- Enabled efficient CPU virtualization

**I/O Virtualization**
- **2007**: SR-IOV (Single Root I/O Virtualization)
- **2011**: VT-d / AMD-Vi (IOMMU)
- Enabled direct hardware access for VMs

## Virtualization Concepts

### Types of Virtualization

**1. Full Virtualization**
- Complete hardware simulation
- Guest OS runs unmodified
- Examples: VMware, VirtualBox, Hyper-V

**2. Paravirtualization**
- Guest OS modified to run in VM
- Better performance than full virtualization
- Example: Xen with paravirtualized guests

**3. Hardware-Assisted Virtualization**
- Uses CPU virtualization extensions
- Intel VT-x, AMD-V
- Best performance for full virtualization

**4. Container Virtualization**
- OS-level virtualization
- Shared kernel, isolated userspace
- Examples: Docker, LXC, Windows Containers

### Hypervisor Types

**Type 1 (Bare Metal)**
- Runs directly on hardware
- Better performance and security
- Examples: VMware ESXi, Hyper-V, KVM, Xen

```
┌──────────────────────────┐
│   VMs (Guest OS)         │
├──────────────────────────┤
│   Hypervisor (Type 1)    │
├──────────────────────────┤
│   Hardware               │
└──────────────────────────┘
```

**Type 2 (Hosted)**
- Runs on top of host OS
- Easier to set up
- Examples: VMware Workstation, VirtualBox, Parallels

```
┌──────────────────────────┐
│   VMs (Guest OS)         │
├──────────────────────────┤
│   Hypervisor (Type 2)    │
├──────────────────────────┤
│   Host OS                │
├──────────────────────────┤
│   Hardware               │
└──────────────────────────┘
```

### Key Components

**Virtual CPU (vCPU)**
- Virtualized processor cores
- Can oversubscribe physical CPUs
- CPU pinning for better performance

**Virtual Memory**
- RAM allocated to VMs
- Memory ballooning for dynamic allocation
- Memory deduplication for efficiency

**Virtual Storage**
- Virtual hard disks (VHDX, VMDK, QCOW2)
- Snapshots for backup and testing
- Thin vs. thick provisioning

**Virtual Network**
- Virtual switches and adapters
- NAT, bridged, host-only networking
- VLAN and network isolation

## Hyper-V

### Overview

**Hyper-V** is Microsoft's Type 1 hypervisor, available in:
- Windows Server (2008 R2 and later)
- Windows 10/11 Pro, Enterprise, Education
- Free Hyper-V Server

### System Requirements

**Hardware Requirements**:
- 64-bit processor with SLAT (Second Level Address Translation)
- Intel VT-x with EPT or AMD-V with RVI
- Minimum 4 GB RAM (more recommended)
- Virtualization enabled in BIOS/UEFI

**Software Requirements**:
- Windows 10/11 Pro or higher
- Windows Server 2012 or later

### Enabling Hyper-V

**Via PowerShell (Administrator)**:
```powershell
# Enable Hyper-V feature
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All

# Restart computer
Restart-Computer
```

**Via GUI**:
1. Open "Turn Windows features on or off"
2. Check "Hyper-V"
3. Click OK and restart

**Via DISM**:
```cmd
DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V
```

### Creating a Virtual Machine

**Using Hyper-V Manager**:

1. Open Hyper-V Manager
2. Click "New" > "Virtual Machine"
3. Follow wizard:
   - **Name**: VM name
   - **Generation**: 
     - Generation 1: Legacy BIOS
     - Generation 2: UEFI, Secure Boot, better performance
   - **Memory**: Allocate RAM (enable Dynamic Memory if needed)
   - **Network**: Select virtual switch
   - **Storage**: Create virtual hard disk
   - **Installation**: Attach ISO or physical media

**Using PowerShell**:
```powershell
# Create new VM
New-VM -Name "Windows11VM" `
    -MemoryStartupBytes 4GB `
    -Generation 2 `
    -NewVHDPath "C:\VMs\Windows11VM.vhdx" `
    -NewVHDSizeBytes 64GB `
    -SwitchName "External Switch"

# Set processor count
Set-VMProcessor "Windows11VM" -Count 2

# Enable Dynamic Memory
Set-VMMemory "Windows11VM" `
    -DynamicMemoryEnabled $true `
    -MinimumBytes 2GB `
    -MaximumBytes 8GB

# Add DVD drive with ISO
Add-VMDvdDrive -VMName "Windows11VM" `
    -Path "C:\ISOs\Windows11.iso"

# Start VM
Start-VM -Name "Windows11VM"
```

### Hyper-V Features

**Enhanced Session Mode**
- Clipboard sharing
- Drive redirection
- Printer redirection
- Audio redirection

```powershell
# Enable Enhanced Session Mode
Set-VMHost -EnableEnhancedSessionMode $true
```

**Checkpoints (Snapshots)**
```powershell
# Create checkpoint
Checkpoint-VM -Name "Windows11VM" -SnapshotName "Clean Install"

# Restore checkpoint
Restore-VMCheckpoint -Name "Clean Install" -VMName "Windows11VM" -Confirm:$false

# Remove checkpoint
Remove-VMCheckpoint -VMName "Windows11VM" -Name "Clean Install"
```

**Nested Virtualization**
```powershell
# Enable nested virtualization (VM must be off)
Set-VMProcessor -VMName "Windows11VM" -ExposeVirtualizationExtensions $true
```

## VirtIO Drivers

### What is VirtIO?

**VirtIO** is a virtualization standard for device drivers, providing:
- **Performance**: Near-native I/O performance
- **Compatibility**: Works across hypervisors (KVM, QEMU, Proxmox)
- **Efficiency**: Lower CPU overhead than emulated devices

### VirtIO Device Types

**Storage (virtio-blk, virtio-scsi)**
- Virtual hard disks
- Much faster than IDE emulation
- Supports TRIM/discard

**Network (virtio-net)**
- Virtual network adapters
- Low latency, high throughput
- Supports offloading features

**Balloon (virtio-balloon)**
- Dynamic memory management
- Allows host to reclaim unused guest memory

**Serial (virtio-console)**
- Serial console access
- Useful for headless VMs

### Installing VirtIO Drivers on Windows

**Download Drivers**:
```
https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/
```

**During Windows Installation**:
1. When prompted for disk, click "Load driver"
2. Browse to VirtIO ISO
3. Select appropriate driver (vioscsi for SCSI, viostor for block)
4. Continue installation

**After Installation**:
```powershell
# Mount VirtIO ISO
Mount-DiskImage -ImagePath "C:\ISOs\virtio-win.iso"

# Run driver installer
D:\virtio-win-guest-tools.exe
```

### VirtIO vs. Emulated Devices

**Performance Comparison**:

| Device Type | Read Speed | Write Speed | CPU Usage |
|-------------|------------|-------------|-----------|
| IDE (Emulated) | 50 MB/s | 40 MB/s | High |
| SATA (Emulated) | 200 MB/s | 150 MB/s | Medium |
| VirtIO Block | 2000 MB/s | 1800 MB/s | Low |
| VirtIO SCSI | 2500 MB/s | 2200 MB/s | Low |

## Installing Windows on Virtualization

### Preparing the Environment

**1. Download Windows ISO**
```powershell
# Official Windows 11 download
$url = "https://www.microsoft.com/software-download/windows11"
# Use Media Creation Tool or direct download
```

**2. Create Virtual Disk**
```powershell
# Hyper-V
New-VHD -Path "C:\VMs\Windows11.vhdx" -SizeBytes 64GB -Dynamic

# VirtualBox
VBoxManage createhd --filename "Windows11.vdi" --size 65536

# QEMU
qemu-img create -f qcow2 windows11.qcow2 64G
```

**3. Configure VM Settings**

For Windows 11:
- **Processor**: 2+ cores, enable virtualization
- **Memory**: 4 GB minimum, 8 GB recommended
- **TPM**: Enable TPM 2.0 (required for Windows 11)
- **Secure Boot**: Enable (Generation 2 VM)

### Installation Steps

**Hyper-V**:
```powershell
# Create Generation 2 VM for Windows 11
New-VM -Name "Win11" `
    -MemoryStartupBytes 8GB `
    -Generation 2 `
    -NewVHDPath "C:\VMs\Win11.vhdx" `
    -NewVHDSizeBytes 64GB `
    -SwitchName "External"

# Enable TPM
Set-VMKeyProtector -VMName "Win11" -NewLocalKeyProtector
Enable-VMTPM -VMName "Win11"

# Disable Secure Boot (optional, for testing)
Set-VMFirmware -VMName "Win11" -EnableSecureBoot Off

# Add ISO
Add-VMDvdDrive -VMName "Win11" -Path "C:\ISOs\Windows11.iso"

# Set boot order
$dvd = Get-VMDvdDrive -VMName "Win11"
Set-VMFirmware -VMName "Win11" -FirstBootDevice $dvd

# Start VM
Start-VM -Name "Win11"
```

**QEMU/KVM (Linux)**:
```bash
# Install Windows with VirtIO
qemu-system-x86_64 \
  -m 8192 \
  -cpu host \
  -smp 4 \
  -enable-kvm \
  -drive file=windows11.qcow2,if=virtio \
  -drive file=virtio-win.iso,media=cdrom \
  -cdrom Windows11.iso \
  -boot d \
  -netdev user,id=net0 \
  -device virtio-net,netdev=net0 \
  -vga qxl \
  -usbdevice tablet
```

### Post-Installation Optimization

**1. Install Guest Additions/Integration Services**

Hyper-V:
```powershell
# Install Integration Services (usually automatic)
Get-VMIntegrationService -VMName "Win11"
Enable-VMIntegrationService -VMName "Win11" -Name "Guest Service Interface"
```

VMware:
- Install VMware Tools
- Enables clipboard, drag-drop, better graphics

VirtualBox:
- Install Guest Additions
- Mount Guest Additions ISO from Devices menu

**2. Configure Virtual Hardware**

```powershell
# Allocate more processors
Set-VMProcessor -VMName "Win11" -Count 4

# Enable Dynamic Memory
Set-VMMemory -VMName "Win11" `
    -DynamicMemoryEnabled $true `
    -MinimumBytes 2GB `
    -StartupBytes 4GB `
    -MaximumBytes 16GB `
    -Priority 50 `
    -Buffer 20

# Add additional network adapter
Add-VMNetworkAdapter -VMName "Win11" -SwitchName "Internal"
```

**3. Optimize Performance**

```powershell
# Disable auto-checkpoints
Set-VM -Name "Win11" -AutomaticCheckpointsEnabled $false

# Configure processor compatibility mode (for live migration)
Set-VMProcessor -VMName "Win11" -CompatibilityForMigrationEnabled $true

# Enable MAC spoofing (if needed for networking)
Set-VMNetworkAdapter -VMName "Win11" -MacAddressSpoofing On
```

## Performance Optimization

### CPU Optimization

**CPU Pinning (Hyper-V)**:
```powershell
# Reserve specific physical CPU cores
Set-VMProcessor -VMName "Win11" `
    -Reserved 20 `
    -Maximum 80 `
    -RelativeWeight 100
```

**Disable CPU Power Management** (in guest):
```cmd
powercfg /setactive SCHEME_MIN  # High Performance mode
```

### Memory Optimization

**Static vs. Dynamic Memory**:

Static (better performance):
```powershell
Set-VMMemory -VMName "Win11" -DynamicMemoryEnabled $false -StartupBytes 8GB
```

Dynamic (better density):
```powershell
Set-VMMemory -VMName "Win11" `
    -DynamicMemoryEnabled $true `
    -MinimumBytes 2GB `
    -MaximumBytes 16GB `
    -Buffer 20 `
    -Priority 80
```

### Storage Optimization

**Disable Indexing**:
```powershell
# In guest Windows
Get-WmiObject Win32_Volume -Filter "DriveLetter='C:'" | Set-WmiInstance -Arguments @{IndexingEnabled=$false}
```

**Enable TRIM Support** (VirtIO):
```powershell
# Verify TRIM support
fsutil behavior query DisableDeleteNotify
# 0 = TRIM enabled
```

**Use Fixed-Size Disks** (better performance):
```powershell
# Create fixed VHDX (Hyper-V)
New-VHD -Path "C:\VMs\Win11-fixed.vhdx" -SizeBytes 64GB -Fixed
```

### Network Optimization

**Enable Jumbo Frames** (if supported):
```powershell
# In guest
Set-NetAdapterAdvancedProperty -Name "Ethernet" -DisplayName "Jumbo Packet" -DisplayValue "9014 Bytes"
```

**Disable Offloading** (if causing issues):
```powershell
Disable-NetAdapterLso -Name "Ethernet" # Large Send Offload
Disable-NetAdapterChecksumOffload -Name "Ethernet"
```

## Networking in Virtual Environments

### Hyper-V Virtual Switches

**Types**:
1. **External**: Connects to physical network
2. **Internal**: VMs + Host communication
3. **Private**: VMs only (isolated)

**Create Virtual Switches**:
```powershell
# External switch (bridged to physical adapter)
New-VMSwitch -Name "External" `
    -NetAdapterName "Ethernet" `
    -AllowManagementOS $true

# Internal switch
New-VMSwitch -Name "Internal" `
    -SwitchType Internal

# Private switch
New-VMSwitch -Name "Private" `
    -SwitchType Private
```

### Network Configuration

**Static IP (Guest)**:
```powershell
# Set static IP
New-NetIPAddress -InterfaceAlias "Ethernet" `
    -IPAddress 192.168.1.100 `
    -PrefixLength 24 `
    -DefaultGateway 192.168.1.1

# Set DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
    -ServerAddresses 8.8.8.8,8.8.4.4
```

**Port Forwarding (NAT)**:
```powershell
# Create NAT network (Hyper-V)
New-VMSwitch -Name "NATSwitch" -SwitchType Internal
New-NetIPAddress -IPAddress 192.168.0.1 `
    -PrefixLength 24 `
    -InterfaceAlias "vEthernet (NATSwitch)"
New-NetNat -Name "NATNetwork" `
    -InternalIPInterfaceAddressPrefix 192.168.0.0/24

# Forward port 3389 (RDP) to VM
Add-NetNatStaticMapping -NatName "NATNetwork" `
    -Protocol TCP `
    -ExternalIPAddress 0.0.0.0 `
    -ExternalPort 3389 `
    -InternalIPAddress 192.168.0.100 `
    -InternalPort 3389
```

## Storage Configuration

### Virtual Disk Formats

**Hyper-V (VHDX)**:
- Maximum size: 64 TB
- 4 KB sector size
- Resilient to power failures

**VMware (VMDK)**:
- Maximum size: 62 TB
- Industry standard
- Supported by many hypervisors

**QEMU (QCOW2)**:
- Compression support
- Snapshots built-in
- Thin provisioning

### Disk Operations

**Convert Disk Formats**:
```powershell
# VHD to VHDX
Convert-VHD -Path "old.vhd" -DestinationPath "new.vhdx"

# Resize VHDX
Resize-VHD -Path "disk.vhdx" -SizeBytes 128GB
```

**Compact Disks**:
```powershell
# Optimize VHDX (reclaim space)
Optimize-VHD -Path "disk.vhdx" -Mode Full
```

**Passthrough Disks**:
```powershell
# Add physical disk to VM (offline on host first)
Add-VMHardDiskDrive -VMName "Win11" -DiskNumber 1
```

## Security Considerations

### Isolation

- **Network Isolation**: Use private switches for sensitive VMs
- **Resource Limits**: Prevent resource exhaustion attacks
- **Shielded VMs**: Encryption and attestation (Hyper-V)

### Shielded VMs (Windows Server)

```powershell
# Create shielded VM (requires Host Guardian Service)
New-VM -Name "ShieldedVM" `
    -Generation 2 `
    -MemoryStartupBytes 4GB

# Enable shielding
Set-VMSecurity -VMName "ShieldedVM" `
    -VirtualizationBasedSecurityOptOut $false
```

### Best Practices

1. **Keep Software Updated**: Hypervisor, drivers, guest OS
2. **Use Antivirus**: Both host and guest
3. **Backup Regularly**: Snapshots + external backups
4. **Limit Access**: Use RBAC for VM management
5. **Network Segmentation**: Isolate different trust levels
6. **Encrypt Sensitive VMs**: BitLocker or equivalent
7. **Monitor Performance**: Watch for anomalies
8. **Document Configuration**: VM specs, network topology

## Best Practices

### VM Lifecycle Management

**Planning**:
1. Define resource requirements
2. Choose appropriate generation/type
3. Plan networking and storage
4. Consider backup and DR

**Deployment**:
1. Use templates for consistency
2. Automate with PowerShell/scripts
3. Document configurations
4. Test before production

**Operations**:
1. Monitor resource usage
2. Regular checkpoints/backups
3. Patch management
4. Performance tuning

**Decommissioning**:
1. Backup important data
2. Remove from monitoring
3. Delete VM and associated resources
4. Update documentation

### Resource Allocation Guidelines

**CPU**:
- Don't oversubscribe beyond 4:1 ratio
- Reserve cores for critical VMs
- Use processor compatibility for migration

**Memory**:
- Leave 2-4 GB for host OS
- Use dynamic memory carefully
- Monitor memory pressure

**Storage**:
- Use SSD for better performance
- Separate OS and data disks
- Plan for growth (thin provisioning)

**Network**:
- Isolate production and test
- Use VLANs for segmentation
- Monitor bandwidth usage

### Troubleshooting Common Issues

**VM Won't Start**:
```powershell
# Check VM state
Get-VM -Name "Win11" | Select-Object State, Status

# View detailed status
Get-VM -Name "Win11" | Select-Object *

# Check logs
Get-EventLog -LogName "Microsoft-Windows-Hyper-V-VMMS-Admin" -Newest 50
```

**Poor Performance**:
1. Check resource allocation
2. Verify Integration Services installed
3. Disable unnecessary features
4. Use VirtIO/synthetic devices
5. Check host resource usage

**Network Issues**:
```powershell
# Verify virtual switch
Get-VMSwitch

# Check VM network adapter
Get-VMNetworkAdapter -VMName "Win11"

# Test connectivity from host
Test-NetConnection -ComputerName 192.168.1.100
```

Happy virtualizing! 🖥️
<!-- /lang:en -->

<!-- lang:ru -->
# Виртуализация Windows

Виртуализация позволяет запускать несколько операционных систем одновременно на одной физической машине. Это руководство охватывает историю, технологии и практическую реализацию виртуализации Windows.

## Содержание

1. [История виртуализации](#история-виртуализации)
2. [Концепции виртуализации](#концепции-виртуализации)
3. [Hyper-V](#hyper-v)
4. [Драйверы VirtIO](#драйверы-virtio)
5. [Установка Windows на виртуализацию](#установка-windows-на-виртуализацию)
6. [Оптимизация производительности](#оптимизация-производительности)
7. [Сеть в виртуальных средах](#сеть-в-виртуальных-средах)
8. [Настройка хранилища](#настройка-хранилища)
9. [Вопросы безопасности](#вопросы-безопасности)
10. [Лучшие практики](#лучшие-практики)

## История виртуализации

### Хронология

**1960-е - Рождение**
- **1967**: IBM разрабатывает CP-40, первую систему виртуальных машин
- Мейнфреймы используются несколькими пользователями
- Цель: Максимизация использования дорогого оборудования

**1970-1980-е - Эра мейнфреймов**
- **1972**: IBM VM/370 - коммерческая виртуализация
- Использовалась в основном в корпоративных центрах обработки данных

**1990-е - Начало десктопной виртуализации**
- **1997**: Connectix Virtual PC для Mac
- **1998**: Основана VMware, виртуализация для x86
- **1999**: Выпуск VMware Workstation 1.0

**2000-е - Массовое внедрение**
- **2001**: VMware ESX Server (гипервизор на железе)
- **2003**: Запуск проекта Xen (открытый гипервизор)
- **2007**: KVM интегрирован в ядро Linux
- **2008**: Microsoft выпускает Hyper-V

**2010-е - Эра облаков**
- **2010**: Созревание драйверов VirtIO
- **2014**: Docker популяризирует контейнеры
- **2015**: Windows Server 2016 с вложенной виртуализацией

**2020-е - Современная виртуализация**
- **2021**: Windows 11 с требованиями TPM и виртуализации
- **2022**: WSL2 с полным ядром Linux
- **2023**: Продвинутый GPU passthrough и оркестрация контейнеров

## Концепции виртуализации

### Типы виртуализации

**1. Полная виртуализация**
- Полная симуляция оборудования
- Гостевая ОС работает без изменений
- Примеры: VMware, VirtualBox, Hyper-V

**2. Паравиртуализация**
- Гостевая ОС модифицирована для работы в VM
- Лучшая производительность
- Пример: Xen с паравиртуализированными гостями

**3. Аппаратная виртуализация**
- Использует расширения виртуализации процессора
- Intel VT-x, AMD-V
- Лучшая производительность для полной виртуализации

**4. Контейнерная виртуализация**
- Виртуализация на уровне ОС
- Общее ядро, изолированное пространство пользователя
- Примеры: Docker, LXC, Windows Containers

### Типы гипервизоров

**Тип 1 (на железе)**
- Работает непосредственно на оборудовании
- Лучшая производительность и безопасность
- Примеры: VMware ESXi, Hyper-V, KVM, Xen

**Тип 2 (хостовый)**
- Работает поверх хостовой ОС
- Проще в настройке
- Примеры: VMware Workstation, VirtualBox, Parallels

## Hyper-V

### Обзор

**Hyper-V** — гипервизор Типа 1 от Microsoft, доступный в:
- Windows Server (2008 R2 и новее)
- Windows 10/11 Pro, Enterprise, Education
- Бесплатный Hyper-V Server

### Системные требования

**Требования к оборудованию**:
- 64-битный процессор с SLAT
- Intel VT-x с EPT или AMD-V с RVI
- Минимум 4 ГБ ОЗУ
- Виртуализация включена в BIOS/UEFI

### Включение Hyper-V

**Через PowerShell (Администратор)**:
```powershell
# Включить функцию Hyper-V
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All

# Перезагрузить компьютер
Restart-Computer
```

## Драйверы VirtIO

### Что такое VirtIO?

**VirtIO** — стандарт виртуализации для драйверов устройств, обеспечивающий:
- **Производительность**: Производительность близкая к native
- **Совместимость**: Работает с разными гипервизорами (KVM, QEMU, Proxmox)
- **Эффективность**: Меньшая нагрузка на CPU чем эмулируемые устройства

### Типы устройств VirtIO

**Хранилище (virtio-blk, virtio-scsi)**
- Виртуальные жесткие диски
- Намного быстрее чем эмуляция IDE
- Поддержка TRIM/discard

**Сеть (virtio-net)**
- Виртуальные сетевые адаптеры
- Низкая задержка, высокая пропускная способность

**Balloon (virtio-balloon)**
- Динамическое управление памятью
- Позволяет хосту возвращать неиспользуемую память гостя

## Установка Windows на виртуализацию

### Подготовка окружения

**1. Скачать ISO Windows**
**2. Создать виртуальный диск**
**3. Настроить параметры VM**

Для Windows 11:
- **Процессор**: 2+ ядра
- **Память**: Минимум 4 ГБ, рекомендуется 8 ГБ
- **TPM**: Включить TPM 2.0 (требуется для Windows 11)
- **Secure Boot**: Включить

_(Примеры команд см. в английской версии)_

## Оптимизация производительности

### Оптимизация CPU

- Закрепление CPU за ВМ
- Отключение управления питанием CPU

### Оптимизация памяти

**Статическая память** (лучшая производительность) vs. **Динамическая память** (лучшая плотность)

### Оптимизация хранилища

- Отключить индексацию
- Включить поддержку TRIM
- Использовать диски фиксированного размера

### Оптимизация сети

- Включить Jumbo Frames
- Настроить offloading

## Сеть в виртуальных средах

### Виртуальные коммутаторы Hyper-V

**Типы**:
1. **External**: Подключение к физической сети
2. **Internal**: Связь ВМ + Хост
3. **Private**: Только ВМ (изолированно)

## Настройка хранилища

### Форматы виртуальных дисков

- **VHDX** (Hyper-V): Максимум 64 ТБ
- **VMDK** (VMware): Максимум 62 ТБ
- **QCOW2** (QEMU): Поддержка сжатия

## Вопросы безопасности

### Изоляция

- Сетевая изоляция
- Ограничения ресурсов
- Защищенные ВМ (Shielded VMs)

### Лучшие практики

1. Обновляйте ПО
2. Используйте антивирус
3. Регулярные резервные копии
4. Ограничьте доступ
5. Сегментация сети
6. Шифруйте чувствительные ВМ
7. Мониторьте производительность
8. Документируйте конфигурации

## Лучшие практики

### Управление жизненным циклом ВМ

**Планирование**:
1. Определите требования к ресурсам
2. Выберите подходящий тип/поколение
3. Спланируйте сеть и хранилище
4. Учтите резервное копирование и DR

**Развертывание**:
1. Используйте шаблоны для согласованности
2. Автоматизируйте с PowerShell
3. Документируйте конфигурации
4. Тестируйте перед продакшеном

**Эксплуатация**:
1. Мониторьте использование ресурсов
2. Регулярные контрольные точки/бэкапы
3. Управление патчами
4. Настройка производительности

Удачной виртуализации! 🖥️
<!-- /lang:ru -->
