---
title: RDP Service Issues
category: Windows
tags: ['RDP', 'Windows Server', 'Troubleshooting', 'PowerShell']
date: '2025-02-08'
---

<!-- lang:ru -->
# RDP службы

## Контекст проблемы

При попытке выполнить:

```powershell
Restart-Service TermService -Force
```

PowerShell начинает бесконечно выводить предупреждения вида:

```
WARNING: Waiting for service 'Remote Desktop Services (TermService)' to stop...
```

При этом:

* служба не останавливается,
* команда не завершается,
* RDP может быть недоступен или работать нестабильно.

Важно: проблема **может возникать даже при отсутствии RDP-подключений**, например при доступе через **SPICE / Hyper-V / VMware console**.

## Почему это происходит

`TermService` не может корректно завершиться, если в системе присутствуют:

* «зомби»-сессии (`Disconnected`, но не закрытые),
* зависшие процессы RDP-подсистемы (`rdpclip`, `winlogon`, `csrss`),
* некорректное состояние зависимых служб (`UmRdpService`, `SessionEnv`)
* длительный аптайм (часто на Windows Server 2012 / 2012 R2).

`Restart-Service` в этом случае **не работает по дизайну** — он будет ждать остановки бесконечно.

## Что НЕ является причиной

* ❌ активное RDP-подключение (его нет)
* ❌ ошибка PowerShell
* ❌ повреждённая служба
* ❌ нехватка прав

## Правильный алгоритм решения

### 1. Проверить активные сессии

```cmd
query session
```

Обратить внимание на сессии со статусом `Disc`, сессии без пользователя, подозрительные ID.

### 2. Принудительно завершить «зомби»-сессии

```cmd
logoff <SessionID>
```

Пример: `logoff 2`, `logoff 3`. Это безопасно, если сессии не используются.

### 3. Перезапустить службы в корректном порядке

Важно: **использовать Stop/Start, а не Restart**

```powershell
Stop-Service UmRdpService -Force
Stop-Service SessionEnv -Force
Stop-Service TermService -Force

Start-Service TermService
Start-Service SessionEnv
Start-Service UmRdpService
```

## Альтернативные методы

### Вариант A — через sc.exe

```cmd
sc stop TermService
sc query TermService
```

### Вариант B — аварийное завершение процессов

⚠️ Использовать **только при наличии консольного доступа** (SPICE / Hyper-V / IPMI)

```cmd
taskkill /F /IM rdpclip.exe
taskkill /F /IM csrss.exe /FI "SESSION eq 0"
```

⚠️ Неправильное завершение `csrss` приведёт к BSOD.

## Проверка результата

```powershell
Get-Service TermService,UmRdpService,SessionEnv
netstat -an | findstr 3389
```

## Когда решение не работает

Если Windows Server 2012 / 2012 R2 с большим аптаймом, **единственное гарантированное решение — перезагрузка системы**: `shutdown /r /t 0`

## Краткое резюме

* `Restart-Service TermService` может зависать бесконечно — это нормально
* Причина: зомби-сессии и зависимости RDP
* Рабочий путь: **query session → logoff → Stop/Start зависимых служб**
* Для старых систем иногда требуется reboot

## Рекомендации

* Избегать длительного аптайма на Windows Server 2012
* Не использовать `Restart-Service` для `TermService`
* Всегда иметь консольный доступ к VM
<!-- /lang:ru -->

<!-- lang:en -->
# RDP Services

## Problem Context

When attempting to execute:

```powershell
Restart-Service TermService -Force
```

PowerShell starts endlessly outputting warnings like:

```
WARNING: Waiting for service 'Remote Desktop Services (TermService)' to stop...
```

Meanwhile:

* the service does not stop,
* the command does not complete,
* RDP may be unavailable or work unstably.

Important: the problem **can occur even without RDP connections**, for example when accessing via **SPICE / Hyper-V / VMware console**.

## Why This Happens

`TermService` cannot terminate correctly if the system has:

* "zombie" sessions (`Disconnected`, but not closed),
* hung RDP subsystem processes (`rdpclip`, `winlogon`, `csrss`),
* incorrect state of dependent services (`UmRdpService`, `SessionEnv`)
* long uptime (often on Windows Server 2012 / 2012 R2).

`Restart-Service` in this case **does not work by design** — it will wait for stop indefinitely.

## What is NOT the Cause

* ❌ active RDP connection (there is none)
* ❌ PowerShell error
* ❌ corrupted service
* ❌ lack of permissions

## Correct Solution Algorithm

### 1. Check Active Sessions

```cmd
query session
```

Pay attention to sessions with `Disc` status, sessions without user, suspicious IDs.

### 2. Forcibly Terminate Zombie Sessions

```cmd
logoff <SessionID>
```

Example: `logoff 2`, `logoff 3`. This is safe if sessions are not in use.

### 3. Restart Services in Correct Order

Important: **use Stop/Start, not Restart**

```powershell
Stop-Service UmRdpService -Force
Stop-Service SessionEnv -Force
Stop-Service TermService -Force

Start-Service TermService
Start-Service SessionEnv
Start-Service UmRdpService
```

## Alternative Methods

### Option A — via sc.exe

```cmd
sc stop TermService
sc query TermService
```

### Option B — Emergency Process Termination

⚠️ Use **only with console access** (SPICE / Hyper-V / IPMI)

```cmd
taskkill /F /IM rdpclip.exe
taskkill /F /IM csrss.exe /FI "SESSION eq 0"
```

⚠️ Incorrect termination of `csrss` will lead to BSOD.

## Result Verification

```powershell
Get-Service TermService,UmRdpService,SessionEnv
netstat -an | findstr 3389
```

## When Solution Doesn't Work

If Windows Server 2012 / 2012 R2 with long uptime, **the only guaranteed solution is system reboot**: `shutdown /r /t 0`

## Brief Summary

* `Restart-Service TermService` can hang indefinitely — this is normal
* Cause: zombie sessions and RDP dependencies
* Working path: **query session → logoff → Stop/Start dependent services**
* For old systems, reboot is sometimes required

## Recommendations

* Avoid long uptime on Windows Server 2012
* Do not use `Restart-Service` for `TermService`
* Always have console access to VM
<!-- /lang:en -->
