---
title: Первые шаги с Windows
title_en: First Steps with Windows
title_ru: Первые шаги с Windows
title_fr: Premiers pas avec Windows
title_es: Primeros pasos con Windows
title_zh: Windows 第一步
title_ja: Windows の最初のステップ
title_ko: Windows 첫 걸음
category: it/windows
updatedAt: 2026-02-13
---

<!-- lang:en -->
# First Steps with Windows

Windows is the most widely used desktop operating system in the world. This guide covers essential concepts, tools, and best practices for Windows administration and daily use.

## Table of Contents

1. [Windows Basics](#windows-basics)
2. [System Administration](#system-administration)
3. [PowerShell Fundamentals](#powershell-fundamentals)
4. [File System Management](#file-system-management)
5. [User and Group Management](#user-and-group-management)
6. [Networking](#networking)
7. [Security and Updates](#security-and-updates)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)
10. [Useful Tools](#useful-tools)
11. [Command Line Tips](#command-line-tips)
12. [Next Steps](#next-steps)

## Windows Basics

### Windows Versions

#### Consumer Versions (9x kernel - MS-DOS based)
- **Windows 1.0** (1985): First graphical interface for MS-DOS
- **Windows 2.0** (1987): Improved interface, overlapping windows
- **Windows 3.0** (1990): Program Manager, File Manager introduced
- **Windows 3.1** (1992): TrueType fonts, multimedia support
- **Windows 95** (1995): Start menu, taskbar, 32-bit support
- **Windows 98** (1998): USB support, Internet Explorer 4
- **Windows ME** (2000): Last 9x version, multimedia features

#### Business/Professional Versions (NT kernel)
- **Windows NT 3.1** (1993): First NT version, robust architecture
- **Windows NT 4.0** (1996): Windows 95-like interface with NT stability
- **Windows 2000** (2000): Active Directory, improved networking
- **Windows XP** (2001): NT 5.1 - Legendary OS combining NT and 9x consumer features
- **Windows Vista** (2007): NT 6.0 - Introduced Aero design, UAC, heavy system requirements
- **Windows 7** (2009): NT 6.1 - The Stable King, refined Vista
- **Windows 8** (2012): NT 6.2 - Metro UI, removed Start menu
- **Windows 8.1** (2013): NT 6.3 - Start button returns
- **Windows 10** (2015): NT 10.0 - Widely deployed, universal apps, continual updates
- **Windows 11** (2021): NT 10.0.22000+ - Modern UI, centered Start, Android apps support

#### Server Editions
- **Windows Server 2003, 2008, 2012, 2016, 2019, 2022, 2025**
- **Editions**: Evaluation, Core (CLI only), Standard, Datacenter

#### Special Editions
- **LTSC** (Long-Term Servicing Channel): Enterprise stability, minimal updates
- **Pro**: Business features, domain join, BitLocker
- **Enterprise**: Volume licensing, advanced management
- **Education**: For academic institutions
- **IoT**: Embedded devices and boards
- **ARM**: Version with ARM processor support (Surface, tablets)

### System Requirements

#### Windows 11 Minimum Requirements

- **Processor**: 1 GHz or faster, 2+ cores, 64-bit
- **RAM**: 4 GB minimum
- **Storage**: 64 GB or larger
- **TPM**: TPM 2.0
- **Graphics**: DirectX 12 compatible
- **Display**: 720p resolution minimum

#### Windows 10 Minimum Requirements

- **Processor**: 1 GHz or faster
- **RAM**: 1 GB (32-bit) or 2 GB (64-bit)
- **Storage**: 16 GB (32-bit) or 32 GB (64-bit)
- **Graphics**: DirectX 9 or later

## System Administration

### Windows Settings

Access Windows Settings: `Win + I`

#### Key Settings Categories

- **System**: Display, sound, notifications, power
- **Devices**: Bluetooth, printers, mouse
- **Network & Internet**: Wi-Fi, Ethernet, VPN
- **Personalization**: Background, themes, colors
- **Apps**: Installed apps, default apps, startup
- **Accounts**: User accounts, sync settings
- **Time & Language**: Region, language, date/time
- **Gaming**: Game bar, captures, mode
- **Update & Security**: Windows Update, recovery, backup

### Control Panel

Classic administrative tools:

```
Win + R -> control
```

Important Control Panel sections:
- **System and Security**: Windows Defender, Firewall, BitLocker
- **Network and Internet**: Network sharing, adapter settings
- **Hardware and Sound**: Device Manager, sound settings
- **Programs**: Uninstall programs, Windows features
- **User Accounts**: Credential Manager, user profiles

### Computer Management

Access: `Win + X -> Computer Management`

Components:
- **Task Scheduler**: Automate tasks
- **Event Viewer**: System logs and diagnostics
- **Shared Folders**: Network shares
- **Local Users and Groups**: User management
- **Performance**: Resource monitor
- **Device Manager**: Hardware management
- **Disk Management**: Partition management
- **Services**: System services configuration

## PowerShell Fundamentals

### What is PowerShell?

PowerShell is a task automation and configuration management framework consisting of a command-line shell and scripting language.

### Opening PowerShell

```
Method 1: Win + X -> Windows PowerShell (Admin)
Method 2: Win + R -> powershell
Method 3: Search -> "PowerShell"
```

### Basic PowerShell Commands

#### Get System Information

```powershell
# Computer information
Get-ComputerInfo

# OS information
Get-CimInstance Win32_OperatingSystem

# BIOS information
Get-CimInstance Win32_BIOS

# Disk information
Get-PSDrive -PSProvider FileSystem

# Network adapters
Get-NetAdapter
```

#### File and Directory Operations

```powershell
# List files and directories
Get-ChildItem
Get-ChildItem -Path C:\ -Recurse -Force

# Create directory
New-Item -Path "C:\MyFolder" -ItemType Directory

# Create file
New-Item -Path "C:\MyFolder\file.txt" -ItemType File

# Copy file
Copy-Item -Path "C:\source.txt" -Destination "C:\dest.txt"

# Move file
Move-Item -Path "C:\source.txt" -Destination "D:\dest.txt"

# Delete file
Remove-Item -Path "C:\file.txt"

# Delete directory recursively
Remove-Item -Path "C:\MyFolder" -Recurse -Force

# Get file content
Get-Content -Path "C:\file.txt"

# Search for files
Get-ChildItem -Path C:\ -Filter "*.txt" -Recurse -ErrorAction SilentlyContinue
```

#### Process Management

```powershell
# List all processes
Get-Process

# Get specific process
Get-Process -Name "chrome"

# Stop process
Stop-Process -Name "notepad"
Stop-Process -Id 1234

# Start process
Start-Process "notepad.exe"
Start-Process "notepad.exe" -ArgumentList "C:\file.txt"
```

#### Service Management

```powershell
# List all services
Get-Service

# Get specific service
Get-Service -Name "wuauserv"

# Start service
Start-Service -Name "wuauserv"

# Stop service
Stop-Service -Name "wuauserv"

# Restart service
Restart-Service -Name "wuauserv"

# Set service startup type
Set-Service -Name "wuauserv" -StartupType Automatic
```

#### User Management

```powershell
# List local users
Get-LocalUser

# Create new user
New-LocalUser -Name "NewUser" -Password (ConvertTo-SecureString "Password123!" -AsPlainText -Force) -FullName "New User"

# Delete user
Remove-LocalUser -Name "NewUser"

# List local groups
Get-LocalGroup

# Add user to group
Add-LocalGroupMember -Group "Administrators" -Member "NewUser"

# Remove user from group
Remove-LocalGroupMember -Group "Administrators" -Member "NewUser"
```

#### Network Commands

```powershell
# Test network connection
Test-Connection -ComputerName google.com

# Get IP configuration
Get-NetIPAddress
Get-NetIPConfiguration

# DNS lookup
Resolve-DnsName google.com

# List network adapters
Get-NetAdapter

# Disable network adapter
Disable-NetAdapter -Name "Ethernet"

# Enable network adapter
Enable-NetAdapter -Name "Ethernet"

# Get network statistics
Get-NetTCPConnection
Get-NetUDPEndpoint
```

### PowerShell Aliases

Common command aliases:

```powershell
# List aliases
Get-Alias

# Common aliases
ls, dir         -> Get-ChildItem
cd, chdir       -> Set-Location
pwd             -> Get-Location
cat, type       -> Get-Content
cp, copy        -> Copy-Item
mv, move        -> Move-Item
rm, del         -> Remove-Item
ps              -> Get-Process
kill            -> Stop-Process
```

## File System Management

### Disk Management

Access Disk Management:
```
Win + X -> Disk Management
Or: diskmgmt.msc
```

#### Common Tasks

**Create new partition:**
1. Right-click unallocated space
2. Select "New Simple Volume"
3. Follow wizard

**Shrink volume:**
1. Right-click volume
2. Select "Shrink Volume"
3. Enter amount to shrink

**Extend volume:**
1. Right-click volume
2. Select "Extend Volume"
3. Follow wizard

#### PowerShell Disk Management

```powershell
# List disks
Get-Disk

# List partitions
Get-Partition

# List volumes
Get-Volume

# Format volume
Format-Volume -DriveLetter D -FileSystem NTFS -NewFileSystemLabel "Data"

# Create new partition
New-Partition -DiskNumber 1 -Size 50GB -DriveLetter E
```

### File System Permissions

#### View Permissions

```powershell
# Get ACL (Access Control List)
Get-Acl -Path "C:\MyFolder" | Format-List

# Get detailed permissions
(Get-Acl -Path "C:\MyFolder").Access
```

#### Set Permissions

```powershell
# Add permission
$acl = Get-Acl "C:\MyFolder"
$permission = "DOMAIN\User", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl "C:\MyFolder" $acl

# Remove permission
$acl = Get-Acl "C:\MyFolder"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("DOMAIN\User", "FullControl", "Allow")
$acl.RemoveAccessRule($accessRule)
Set-Acl "C:\MyFolder" $acl
```

### File Attributes

```cmd
# View attributes
attrib C:\file.txt

# Set read-only
attrib +R C:\file.txt

# Remove read-only
attrib -R C:\file.txt

# Set hidden
attrib +H C:\file.txt

# Set system file
attrib +S C:\file.txt

# Set archive
attrib +A C:\file.txt
```

## User and Group Management

### Local Users

#### GUI Method

1. `Win + R` -> `lusrmgr.msc`
2. Navigate to Users or Groups
3. Right-click to create/modify

#### PowerShell Method

```powershell
# List users
Get-LocalUser

# Create user
$Password = ConvertTo-SecureString "P@ssw0rd" -AsPlainText -Force
New-LocalUser -Name "JohnDoe" -Password $Password -FullName "John Doe" -Description "Standard user"

# Modify user
Set-LocalUser -Name "JohnDoe" -Description "Updated description"

# Disable user
Disable-LocalUser -Name "JohnDoe"

# Enable user
Enable-LocalUser -Name "JohnDoe"

# Delete user
Remove-LocalUser -Name "JohnDoe"

# Change password
Set-LocalUser -Name "JohnDoe" -Password $Password
```

### Local Groups

```powershell
# List groups
Get-LocalGroup

# Create group
New-LocalGroup -Name "Developers" -Description "Development team"

# Add member to group
Add-LocalGroupMember -Group "Developers" -Member "JohnDoe"

# List group members
Get-LocalGroupMember -Group "Developers"

# Remove member from group
Remove-LocalGroupMember -Group "Developers" -Member "JohnDoe"

# Delete group
Remove-LocalGroup -Name "Developers"
```

## Networking

### Network Configuration

#### View Network Configuration

```powershell
# IP configuration
ipconfig
ipconfig /all

# Network adapters
Get-NetAdapter

# IP addresses
Get-NetIPAddress

# Routing table
route print
Get-NetRoute

# ARP cache
arp -a
Get-NetNeighbor
```

#### Configure Static IP

**GUI:**
1. Control Panel -> Network and Sharing Center
2. Change adapter settings
3. Right-click adapter -> Properties
4. Internet Protocol Version 4 (TCP/IPv4)
5. Use the following IP address

**PowerShell:**
```powershell
# Set static IP
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.100 -PrefixLength 24 -DefaultGateway 192.168.1.1

# Set DNS servers
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("8.8.8.8", "8.8.4.4")
```

### Network Diagnostics

```cmd
# Ping
ping google.com
ping -t google.com    # Continuous
ping -n 10 google.com # 10 packets

# Trace route
tracert google.com

# DNS lookup
nslookup google.com
nslookup google.com 8.8.8.8

# Network statistics
netstat -an           # All connections
netstat -ano          # With process IDs
netstat -r            # Routing table

# Path MTU discovery
ping -f -l 1472 google.com
```

```powershell
# Test connection
Test-Connection -ComputerName google.com -Count 4

# Test port
Test-NetConnection -ComputerName google.com -Port 80

# Resolve DNS
Resolve-DnsName google.com

# Clear DNS cache
Clear-DnsClientCache

# View DNS cache
Get-DnsClientCache
```

### Windows Firewall

```powershell
# Get firewall status
Get-NetFirewallProfile

# Enable firewall
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# Disable firewall (not recommended)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# List firewall rules
Get-NetFirewallRule

# Create inbound rule
New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Delete rule
Remove-NetFirewallRule -DisplayName "Allow HTTP"
```

## Security and Updates

### Windows Update

#### GUI Method

`Settings -> Update & Security -> Windows Update`

#### PowerShell Method

```powershell
# Check for updates
Install-Module PSWindowsUpdate
Get-WindowsUpdate

# Install updates
Install-WindowsUpdate

# Install specific updates
Install-WindowsUpdate -KBArticleID "KB5000001"

# View update history
Get-WindowsUpdateLog
```

### Windows Defender

```powershell
# Get Windows Defender status
Get-MpComputerStatus

# Update definitions
Update-MpSignature

# Run quick scan
Start-MpScan -ScanType QuickScan

# Run full scan
Start-MpScan -ScanType FullScan

# Run custom scan
Start-MpScan -ScanType CustomScan -ScanPath "C:\Suspicious"
```

### BitLocker

```powershell
# Get BitLocker status
Get-BitLockerVolume

# Enable BitLocker
Enable-BitLocker -MountPoint "C:" -EncryptionMethod Aes256 -UsedSpaceOnly -Pin

# Disable BitLocker
Disable-BitLocker -MountPoint "C:"

# Unlock volume
Unlock-BitLocker -MountPoint "E:" -Password $SecureString
```

## Performance Optimization

### Task Manager

Access: `Ctrl + Shift + Esc`

**Tabs:**
- **Processes**: Running applications and processes
- **Performance**: CPU, Memory, Disk, Network usage
- **App history**: Resource usage over time
- **Startup**: Programs that run at startup
- **Users**: Active user sessions
- **Details**: Detailed process information
- **Services**: System services

### Performance Monitor

Access: `Win + R -> perfmon`

**Key features:**
- Real-time monitoring
- Data Collector Sets
- Reports
- Custom counters

### Startup Programs

#### Disable Startup Programs

**Task Manager method:**
1. `Ctrl + Shift + Esc`
2. Startup tab
3. Right-click program -> Disable

**PowerShell method:**
```powershell
# List startup programs
Get-CimInstance Win32_StartupCommand

# Registry locations
# Current User: HKCU\Software\Microsoft\Windows\CurrentVersion\Run
# All Users: HKLM\Software\Microsoft\Windows\CurrentVersion\Run
```

### Disk Cleanup

```cmd
# Disk Cleanup utility
cleanmgr

# Disk Cleanup for C:
cleanmgr /d C:

# Storage Sense
Settings -> System -> Storage -> Storage Sense
```

### System File Check

```cmd
# Check system files
sfc /scannow

# Check specific file
sfc /scanfile=C:\Windows\System32\kernel32.dll

# Check and repair system image
DISM /Online /Cleanup-Image /RestoreHealth
```

## Troubleshooting

### Event Viewer

Access: `Win + X -> Event Viewer`

**Log categories:**
- **Application**: Application events
- **Security**: Security audit events
- **System**: System component events
- **Setup**: Installation events

```powershell
# Get recent error events
Get-EventLog -LogName System -EntryType Error -Newest 10

# Get specific event
Get-EventLog -LogName Application -InstanceId 1000

# Get events from last 24 hours
Get-EventLog -LogName System -After (Get-Date).AddDays(-1)
```

### Blue Screen of Death (BSOD)

#### Analyze Dump Files

**Tool:** WinDbg (Windows Debugger)

**Dump file locations:**
- `C:\Windows\Minidump\` - Minidump files
- `C:\Windows\MEMORY.DMP` - Full dump

**Common BSOD codes:**
- `IRQL_NOT_LESS_OR_EQUAL` - Driver issue
- `PAGE_FAULT_IN_NONPAGED_AREA` - Memory issue
- `SYSTEM_SERVICE_EXCEPTION` - Driver or service issue
- `KERNEL_SECURITY_CHECK_FAILURE` - Security check failure

### Safe Mode

**Enter Safe Mode:**
1. `Settings -> Update & Security -> Recovery`
2. Advanced startup -> Restart now
3. Troubleshoot -> Advanced options -> Startup Settings
4. Restart and select Safe Mode option

**Or:**
```cmd
# Configure boot options
msconfig
# Boot tab -> Safe boot -> Minimal
```

### System Restore

```
Control Panel -> System -> System Protection -> System Restore
```

```powershell
# List restore points
Get-ComputerRestorePoint

# Create restore point
Checkpoint-Computer -Description "Before major changes"

# Restore system
Restore-Computer -RestorePoint 5
```

## Useful Tools

### Built-in Tools

#### System Information

```
Win + R -> msinfo32
```

Shows:
- Hardware resources
- Components
- Software environment

#### Resource Monitor

```
Win + R -> resmon
```

Detailed resource usage:
- CPU
- Memory
- Disk
- Network

#### Registry Editor

```
Win + R -> regedit
```

**Important registry hives:**
- `HKEY_CLASSES_ROOT` - File associations
- `HKEY_CURRENT_USER` - Current user settings
- `HKEY_LOCAL_MACHINE` - System-wide settings
- `HKEY_USERS` - All user profiles
- `HKEY_CURRENT_CONFIG` - Hardware profiles

**Backup registry:**
```cmd
reg export HKLM\Software\MyApp backup.reg
reg import backup.reg
```

### Third-Party Tools

**System utilities:**
- **Sysinternals Suite**: Advanced Windows utilities
  - Process Explorer
  - Autoruns
  - TCPView
  - Process Monitor
- **WinDirStat**: Disk usage analyzer
- **TreeSize**: Disk space manager

**Security:**
- **Malwarebytes**: Anti-malware
- **KeePass**: Password manager

**Network:**
- **Wireshark**: Network protocol analyzer
- **PuTTY**: SSH client

## Command Line Tips

### Useful CMD Commands

```cmd
# System information
systeminfo
hostname
whoami

# Network
ipconfig /all
ipconfig /flushdns
ipconfig /release
ipconfig /renew

# Disk operations
chkdsk C: /F
diskpart

# File operations
xcopy /E /I source dest    # Copy directory tree
robocopy source dest /E    # Robust file copy
tree C:\ /F                # Directory tree

# Task management
tasklist
taskkill /PID 1234
taskkill /IM notepad.exe /F

# Shutdown/Restart
shutdown /s /t 0           # Shutdown now
shutdown /r /t 0           # Restart now
shutdown /a                # Abort shutdown
shutdown /s /t 3600        # Shutdown in 1 hour
```

### Windows Terminal

Modern terminal application supporting:
- Command Prompt
- PowerShell
- WSL (Windows Subsystem for Linux)
- Azure Cloud Shell

**Install:** Microsoft Store -> Windows Terminal

**Features:**
- Tabs
- Split panes
- Unicode support
- Custom themes
- GPU acceleration

## Next Steps

### Advanced Topics

1. **Group Policy**: Enterprise policy management
2. **Active Directory**: Domain services and management
3. **Hyper-V**: Virtualization platform
4. **WSL**: Run Linux on Windows
5. **Windows Server**: Server administration
6. **Scripting**: PowerShell automation
7. **Performance Tuning**: Advanced optimization
8. **Security Hardening**: Enhanced security practices

### Learning Resources

1. **Microsoft Learn**: Official Microsoft training
2. **Windows Sysinternals**: Advanced utilities and documentation
3. **PowerShell Gallery**: PowerShell modules and scripts
4. **TechNet**: Technical documentation
5. **Windows Blog**: Official Windows blog

### Certifications

- **Microsoft 365 Certified**: Modern Desktop Administrator Associate
- **Microsoft Certified**: Windows Server Hybrid Administrator Associate
- **Microsoft Certified**: Azure Administrator Associate

## Conclusion

Windows is a powerful and versatile operating system. Whether you're a home user, developer, or IT professional, understanding Windows fundamentals will help you work more efficiently. Start with the basics, practice with PowerShell, and gradually explore more advanced features.

Remember:
- Keep your system updated
- Use PowerShell for automation
- Learn keyboard shortcuts
- Back up important data regularly
- Stay security-conscious
- Practice, practice, practice!

Happy Windows administration!
<!-- /lang:en -->

<!-- lang:ru -->
# Первые шаги с Windows

Windows — самая широко используемая настольная операционная система в мире. Это руководство охватывает основные концепции, инструменты и лучшие практики для администрирования Windows и повседневного использования.

## Содержание

1. [Основы Windows](#основы-windows)
2. [Системное администрирование](#системное-администрирование)
3. [Основы PowerShell](#основы-powershell)
4. [Управление файловой системой](#управление-файловой-системой)
5. [Управление пользователями и группами](#управление-пользователями-и-группами)
6. [Сеть](#сеть)
7. [Безопасность и обновления](#безопасность-и-обновления)
8. [Оптимизация производительности](#оптимизация-производительности)
9. [Устранение неполадок](#устранение-неполадок)
10. [Полезные инструменты](#полезные-инструменты)
11. [Советы по командной строке](#советы-по-командной-строке)
12. [Следующие шаги](#следующие-шаги)

## Основы Windows

### Версии Windows

#### Потребительские версии (ядро 9x - на базе MS-DOS)
- **Windows 1.0** (1985): Первый графический интерфейс для MS-DOS
- **Windows 2.0** (1987): Улучшенный интерфейс, перекрывающиеся окна
- **Windows 3.0** (1990): Появление Program Manager, File Manager
- **Windows 3.1** (1992): Шрифты TrueType, поддержка мультимедиа
- **Windows 95** (1995): Меню Пуск, панель задач, 32-битная поддержка
- **Windows 98** (1998): Поддержка USB, Internet Explorer 4
- **Windows ME** (2000): Последняя версия 9x, мультимедийные функции

#### Бизнес/Профессиональные версии (ядро NT)
- **Windows NT 3.1** (1993): Первая версия NT, надежная архитектура
- **Windows NT 4.0** (1996): Интерфейс как у Windows 95 со стабильностью NT
- **Windows 2000** (2000): Active Directory, улучшенная работа в сети
- **Windows XP** (2001): NT 5.1 - Легендарная ОС, объединившая NT и 9x
- **Windows Vista** (2007): NT 6.0 - Дизайн Aero, UAC, высокие системные требования
- **Windows 7** (2009): NT 6.1 - Король Стабильности, улучшенная Vista
- **Windows 8** (2012): NT 6.2 - Metro UI, убрано меню Пуск
- **Windows 8.1** (2013): NT 6.3 - Кнопка Пуск возвращается
- **Windows 10** (2015): NT 10.0 - Широко распространенная, универсальные приложения, постоянные обновления
- **Windows 11** (2021): NT 10.0.22000+ - Современный UI, центрированный Пуск, поддержка Android-приложений

#### Серверные редакции
- **Windows Server 2003, 2008, 2012, 2016, 2019, 2022, 2025**
- **Редакции**: Evaluation, Core (только CLI), Standard, Datacenter

#### Специальные редакции
- **LTSC** (Long-Term Servicing Channel): Стабильность предприятия, минимум обновлений
- **Pro**: Бизнес-функции, присоединение к домену, BitLocker
- **Enterprise**: Корпоративное лицензирование, расширенное управление
- **Education**: Для образовательных учреждений
- **IoT**: Встраиваемые устройства и платы
- **ARM**: Версия с поддержкой процессоров ARM (Surface, планшеты)

### Системные требования

#### Минимальные требования Windows 11

- **Процессор**: 1 ГГц или быстрее, 2+ ядра, 64-битный
- **ОЗУ**: Минимум 4 ГБ
- **Хранилище**: 64 ГБ или больше
- **TPM**: TPM 2.0
- **Графика**: Совместимая с DirectX 12
- **Дисплей**: Разрешение минимум 720p

## Системное администрирование

### Параметры Windows

Доступ к параметрам Windows: `Win + I`

#### Основные категории настроек

- **Система**: Дисплей, звук, уведомления, питание
- **Устройства**: Bluetooth, принтеры, мышь
- **Сеть и Интернет**: Wi-Fi, Ethernet, VPN
- **Персонализация**: Фон, темы, цвета
- **Приложения**: Установленные приложения, приложения по умолчанию, автозагрузка
- **Учетные записи**: Учетные записи пользователей, синхронизация
- **Время и язык**: Регион, язык, дата/время
- **Обновление и безопасность**: Windows Update, восстановление, резервное копирование

### Панель управления

Классические административные инструменты:

```
Win + R -> control
```

## Основы PowerShell

### Что такое PowerShell?

PowerShell — это платформа для автоматизации задач и управления конфигурацией, состоящая из командной оболочки и языка сценариев.

### Открытие PowerShell

```
Способ 1: Win + X -> Windows PowerShell (Администратор)
Способ 2: Win + R -> powershell
Способ 3: Поиск -> "PowerShell"
```

### Основные команды PowerShell

#### Получение системной информации

```powershell
# Информация о компьютере
Get-ComputerInfo

# Информация об ОС
Get-CimInstance Win32_OperatingSystem

# Информация о BIOS
Get-CimInstance Win32_BIOS

# Информация о дисках
Get-PSDrive -PSProvider FileSystem

# Сетевые адаптеры
Get-NetAdapter
```

#### Операции с файлами и каталогами

```powershell
# Список файлов и каталогов
Get-ChildItem
Get-ChildItem -Path C:\ -Recurse -Force

# Создать каталог
New-Item -Path "C:\MyFolder" -ItemType Directory

# Создать файл
New-Item -Path "C:\MyFolder\file.txt" -ItemType File

# Копировать файл
Copy-Item -Path "C:\source.txt" -Destination "C:\dest.txt"

# Переместить файл
Move-Item -Path "C:\source.txt" -Destination "D:\dest.txt"

# Удалить файл
Remove-Item -Path "C:\file.txt"

# Удалить каталог рекурсивно
Remove-Item -Path "C:\MyFolder" -Recurse -Force

# Получить содержимое файла
Get-Content -Path "C:\file.txt"

# Поиск файлов
Get-ChildItem -Path C:\ -Filter "*.txt" -Recurse -ErrorAction SilentlyContinue
```

#### Управление процессами

```powershell
# Список всех процессов
Get-Process

# Получить конкретный процесс
Get-Process -Name "chrome"

# Остановить процесс
Stop-Process -Name "notepad"
Stop-Process -Id 1234

# Запустить процесс
Start-Process "notepad.exe"
Start-Process "notepad.exe" -ArgumentList "C:\file.txt"
```

#### Управление службами

```powershell
# Список всех служб
Get-Service

# Получить конкретную службу
Get-Service -Name "wuauserv"

# Запустить службу
Start-Service -Name "wuauserv"

# Остановить службу
Stop-Service -Name "wuauserv"

# Перезапустить службу
Restart-Service -Name "wuauserv"

# Установить тип запуска службы
Set-Service -Name "wuauserv" -StartupType Automatic
```

#### Управление пользователями

```powershell
# Список локальных пользователей
Get-LocalUser

# Создать нового пользователя
New-LocalUser -Name "NewUser" -Password (ConvertTo-SecureString "Password123!" -AsPlainText -Force) -FullName "Новый пользователь"

# Удалить пользователя
Remove-LocalUser -Name "NewUser"

# Список локальных групп
Get-LocalGroup

# Добавить пользователя в группу
Add-LocalGroupMember -Group "Administrators" -Member "NewUser"

# Удалить пользователя из группы
Remove-LocalGroupMember -Group "Administrators" -Member "NewUser"
```

#### Сетевые команды

```powershell
# Проверить сетевое подключение
Test-Connection -ComputerName google.com

# Получить IP конфигурацию
Get-NetIPAddress
Get-NetIPConfiguration

# DNS запрос
Resolve-DnsName google.com

# Список сетевых адаптеров
Get-NetAdapter

# Отключить сетевой адаптер
Disable-NetAdapter -Name "Ethernet"

# Включить сетевой адаптер
Enable-NetAdapter -Name "Ethernet"

# Получить сетевую статистику
Get-NetTCPConnection
Get-NetUDPEndpoint
```

## Управление файловой системой

### Управление дисками

Доступ к управлению дисками:
```
Win + X -> Управление дисками
Или: diskmgmt.msc
```

#### PowerShell управление дисками

```powershell
# Список дисков
Get-Disk

# Список разделов
Get-Partition

# Список томов
Get-Volume

# Форматировать том
Format-Volume -DriveLetter D -FileSystem NTFS -NewFileSystemLabel "Данные"

# Создать новый раздел
New-Partition -DiskNumber 1 -Size 50GB -DriveLetter E
```

### Права доступа к файловой системе

#### Просмотр прав

```powershell
# Получить ACL (Список управления доступом)
Get-Acl -Path "C:\MyFolder" | Format-List

# Получить детальные права
(Get-Acl -Path "C:\MyFolder").Access
```

## Управление пользователями и группами

### Локальные пользователи

#### Метод через GUI

1. `Win + R` -> `lusrmgr.msc`
2. Перейдите к Пользователи или Группы
3. Щелкните правой кнопкой для создания/изменения

#### Метод через PowerShell

```powershell
# Список пользователей
Get-LocalUser

# Создать пользователя
$Password = ConvertTo-SecureString "P@ssw0rd" -AsPlainText -Force
New-LocalUser -Name "ИванИванов" -Password $Password -FullName "Иван Иванов" -Description "Обычный пользователь"

# Изменить пользователя
Set-LocalUser -Name "ИванИванов" -Description "Обновленное описание"

# Отключить пользователя
Disable-LocalUser -Name "ИванИванов"

# Включить пользователя
Enable-LocalUser -Name "ИванИванов"

# Удалить пользователя
Remove-LocalUser -Name "ИванИванов"

# Изменить пароль
Set-LocalUser -Name "ИванИванов" -Password $Password
```

## Сеть

### Конфигурация сети

#### Просмотр конфигурации сети

```powershell
# IP конфигурация
ipconfig
ipconfig /all

# Сетевые адаптеры
Get-NetAdapter

# IP адреса
Get-NetIPAddress

# Таблица маршрутизации
route print
Get-NetRoute

# ARP кэш
arp -a
Get-NetNeighbor
```

#### Настройка статического IP

**GUI:**
1. Панель управления -> Центр управления сетями
2. Изменение параметров адаптера
3. Правый клик на адаптер -> Свойства
4. Протокол Интернета версии 4 (TCP/IPv4)
5. Использовать следующий IP адрес

**PowerShell:**
```powershell
# Установить статический IP
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.100 -PrefixLength 24 -DefaultGateway 192.168.1.1

# Установить DNS серверы
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("8.8.8.8", "8.8.4.4")
```

### Сетевая диагностика

```cmd
# Ping
ping google.com
ping -t google.com    # Непрерывный
ping -n 10 google.com # 10 пакетов

# Трассировка маршрута
tracert google.com

# DNS запрос
nslookup google.com
nslookup google.com 8.8.8.8

# Сетевая статистика
netstat -an           # Все соединения
netstat -ano          # С ID процессов
netstat -r            # Таблица маршрутизации
```

## Безопасность и обновления

### Windows Update

#### Метод через GUI

`Параметры -> Обновление и безопасность -> Windows Update`

#### Метод через PowerShell

```powershell
# Проверить обновления
Install-Module PSWindowsUpdate
Get-WindowsUpdate

# Установить обновления
Install-WindowsUpdate

# Установить конкретные обновления
Install-WindowsUpdate -KBArticleID "KB5000001"

# Просмотр истории обновлений
Get-WindowsUpdateLog
```

### Windows Defender

```powershell
# Получить статус Windows Defender
Get-MpComputerStatus

# Обновить определения
Update-MpSignature

# Запустить быструю проверку
Start-MpScan -ScanType QuickScan

# Запустить полную проверку
Start-MpScan -ScanType FullScan

# Запустить пользовательскую проверку
Start-MpScan -ScanType CustomScan -ScanPath "C:\Suspicious"
```

## Оптимизация производительности

### Диспетчер задач

Доступ: `Ctrl + Shift + Esc`

**Вкладки:**
- **Процессы**: Запущенные приложения и процессы
- **Производительность**: Использование ЦП, памяти, диска, сети
- **Журнал приложений**: Использование ресурсов с течением времени
- **Автозагрузка**: Программы, запускаемые при старте
- **Пользователи**: Активные сеансы пользователей
- **Подробности**: Детальная информация о процессах
- **Службы**: Системные службы

### Программы автозагрузки

#### Отключить программы автозагрузки

**Метод через Диспетчер задач:**
1. `Ctrl + Shift + Esc`
2. Вкладка Автозагрузка
3. Правый клик на программу -> Отключить

**Метод через PowerShell:**
```powershell
# Список программ автозагрузки
Get-CimInstance Win32_StartupCommand

# Расположения в реестре
# Текущий пользователь: HKCU\Software\Microsoft\Windows\CurrentVersion\Run
# Все пользователи: HKLM\Software\Microsoft\Windows\CurrentVersion\Run
```

### Очистка диска

```cmd
# Утилита очистки диска
cleanmgr

# Очистка диска для C:
cleanmgr /d C:

# Storage Sense
Параметры -> Система -> Хранилище -> Storage Sense
```

### Проверка системных файлов

```cmd
# Проверить системные файлы
sfc /scannow

# Проверить конкретный файл
sfc /scanfile=C:\Windows\System32\kernel32.dll

# Проверить и восстановить образ системы
DISM /Online /Cleanup-Image /RestoreHealth
```

## Устранение неполадок

### Просмотр событий

Доступ: `Win + X -> Просмотр событий`

**Категории журналов:**
- **Приложение**: События приложений
- **Безопасность**: События аудита безопасности
- **Система**: События системных компонентов
- **Установка**: События установки

```powershell
# Получить недавние события ошибок
Get-EventLog -LogName System -EntryType Error -Newest 10

# Получить конкретное событие
Get-EventLog -LogName Application -InstanceId 1000

# Получить события за последние 24 часа
Get-EventLog -LogName System -After (Get-Date).AddDays(-1)
```

### Синий экран смерти (BSOD)

#### Анализ файлов дампа

**Инструмент:** WinDbg (Windows Debugger)

**Расположение файлов дампа:**
- `C:\Windows\Minidump\` - Файлы мини-дампов
- `C:\Windows\MEMORY.DMP` - Полный дамп

### Безопасный режим

**Войти в безопасный режим:**
1. `Параметры -> Обновление и безопасность -> Восстановление`
2. Особые варианты загрузки -> Перезагрузить сейчас
3. Устранение неполадок -> Дополнительные параметры -> Параметры загрузки
4. Перезагрузка и выбор параметра безопасного режима

**Или:**
```cmd
# Настроить параметры загрузки
msconfig
# Вкладка Загрузка -> Безопасный режим -> Минимальный
```

## Полезные инструменты

### Встроенные инструменты

#### Сведения о системе

```
Win + R -> msinfo32
```

Показывает:
- Аппаратные ресурсы
- Компоненты
- Программная среда

#### Монитор ресурсов

```
Win + R -> resmon
```

Детальное использование ресурсов:
- ЦП
- Память
- Диск
- Сеть

#### Редактор реестра

```
Win + R -> regedit
```

**Важные ветви реестра:**
- `HKEY_CLASSES_ROOT` - Ассоциации файлов
- `HKEY_CURRENT_USER` - Настройки текущего пользователя
- `HKEY_LOCAL_MACHINE` - Системные настройки
- `HKEY_USERS` - Все профили пользователей
- `HKEY_CURRENT_CONFIG` - Профили оборудования

## Советы по командной строке

### Полезные команды CMD

```cmd
# Системная информация
systeminfo
hostname
whoami

# Сеть
ipconfig /all
ipconfig /flushdns
ipconfig /release
ipconfig /renew

# Дисковые операции
chkdsk C: /F
diskpart

# Файловые операции
xcopy /E /I source dest    # Копировать дерево каталогов
robocopy source dest /E    # Надежное копирование файлов
tree C:\ /F                # Дерево каталогов

# Управление задачами
tasklist
taskkill /PID 1234
taskkill /IM notepad.exe /F

# Выключение/Перезагрузка
shutdown /s /t 0           # Выключить сейчас
shutdown /r /t 0           # Перезагрузить сейчас
shutdown /a                # Отменить выключение
shutdown /s /t 3600        # Выключить через 1 час
```

### Windows Terminal

Современное терминальное приложение с поддержкой:
- Командная строка
- PowerShell
- WSL (Подсистема Windows для Linux)
- Azure Cloud Shell

**Установка:** Microsoft Store -> Windows Terminal

## Следующие шаги

### Продвинутые темы

1. **Групповая политика**: Управление политиками предприятия
2. **Active Directory**: Доменные службы и управление
3. **Hyper-V**: Платформа виртуализации
4. **WSL**: Запуск Linux на Windows
5. **Windows Server**: Администрирование сервера
6. **Скриптинг**: Автоматизация PowerShell
7. **Настройка производительности**: Расширенная оптимизация
8. **Усиление безопасности**: Расширенные практики безопасности

### Ресурсы для обучения

1. **Microsoft Learn**: Официальное обучение Microsoft
2. **Windows Sysinternals**: Расширенные утилиты и документация
3. **PowerShell Gallery**: Модули и скрипты PowerShell
4. **TechNet**: Техническая документация
5. **Windows Blog**: Официальный блог Windows

### Сертификации

- **Microsoft 365 Certified**: Modern Desktop Administrator Associate
- **Microsoft Certified**: Windows Server Hybrid Administrator Associate
- **Microsoft Certified**: Azure Administrator Associate

## Заключение

Windows — мощная и универсальная операционная система. Будь вы домашним пользователем, разработчиком или IT специалистом, понимание основ Windows поможет вам работать более эффективно. Начните с основ, практикуйтесь с PowerShell и постепенно изучайте более продвинутые функции.

Помните:
- Держите систему обновленной
- Используйте PowerShell для автоматизации
- Изучайте клавиатурные сокращения
- Регулярно делайте резервные копии важных данных
- Будьте внимательны к безопасности
- Практикуйтесь, практикуйтесь, практикуйтесь!

Удачного администрирования Windows!
<!-- /lang:ru -->
