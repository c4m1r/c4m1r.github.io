# Winamp Classic vs Webamp — функциональный и визуальный аудит

**Дата:** 2026-11-25  
**Проверенная ветка:** `main`  
**Объект аудита:** собственная реализация Winamp в `src/apps/winamp/WinampPlayer.tsx`, `src/apps/winamp/winamp.css` и `src/system/audio/*`.  
**Эталон сравнения:** официальный проект [captbaritone/webamp](https://github.com/captbaritone/webamp), его документация и опубликованный changelog.  
**Тип проверки:** анализ исходного кода и публичной документации. Полноценный запуск в браузере, визуальное сравнение скриншотов и ручной тест звука в этой проверке не выполнялись. Поэтому визуальные и интерактивные пункты, требующие реального рендеринга, помечены как требующие browser QA.

---

## 1. Краткий вывод

Наша реализация уже вышла за рамки простого Webamp-клона: в ней есть локальная постоянная библиотека аудио, импорт/экспорт EQF и M3U, отдельное четвёртое окно Video / Visualization, несколько семейств WMP-визуализаций, собственные AVS/MilkDrop-inspired сцены, расширенное управление окнами, изменение размера Playlist и полноэкранная панель управления.

При этом **Webamp пока сильнее в точности Winamp 2.x и совместимости со скинами/визуализатором**. Главные отставания нашей версии:

1. Частичная реализация формата .wsz: разобранные параметры скина не все доходят до UI; отсутствие одного ожидаемого sprite sheet может прервать импорт.
2. Нет настоящего MilkDrop/Butterchurn и совместимости с MilkDrop preset-файлами.
3. Локальные аудиофайлы не проходят полноценное чтение ID3/metadata; длительность читается отдельно, а название/исполнитель в основном берутся из имени файла.
4. M3U поддерживает только абсолютные HTTP(S)-URL; относительные и локальные пути пропускаются, поэтому экспорт локальной библиотеки не является переносимым плейлистом.
5. Анимационный цикл обновляет React state на каждом кадре, что заставляет перерисовывать крупный родительский компонент с частотой дисплея.
6. Не реализован HTML-экспорт Playlist. Media Session API подключён в ходе исправлений после аудита.
7. Классический внешний вид пока является собственной реконструкцией, а не пиксельно-точным skin renderer: есть расхождение геометрии окна 269/275 px и большой набор последовательно добавленных CSS override-блоков.

**Приоритет исправлений:** корректность данных и производительность → надёжность .wsz → полнота плейлиста и системная интеграция → визуальная калибровка → дополнительные функции.

## 2. Сравнение по функциям

| Область | Наша реализация | Webamp | Вывод |
|---|---|---|---|
| Воспроизведение | Единый `winampController`, HTMLAudioElement, play/pause/stop/next/previous/seek | Web Audio/HTML5 playback и публичный API управления | Базовый функционал есть у обеих сторон |
| Форматы аудио | Браузерные форматы; локальные файлы, сохранённые в IndexedDB | Форматы, поддерживаемые браузером; файлы и URL | Нужны тесты по браузерам и метаданным |
| Локальная библиотека | Сохранение локальных файлов и восстановление object URL после перезагрузки | В документации описана загрузка файлов/URL; наша IndexedDB-библиотека — дополнительное преимущество | Наша версия функционально богаче в persistence |
| Playlist | Добавление, удаление, выбор, сортировка drag-and-drop, длительности, M3U import/export | Классические команды Playlist, drag/drop, дополнительные команды и HTML export | У нас есть основа; не хватает ряда классических команд |
| M3U | Только абсолютные HTTP(S)-URL; локальные/relative entries пропускаются | Поддержка playlist workflow в рамках Webamp | Наша текущая M3U реализация ограничена и не переносит локальную библиотеку |
| ID3 / metadata | Для локальных файлов заголовок и исполнитель обычно выводятся из имени файла; отдельно извлекается duration | Читает ID3 и другую metadata при загрузке | Существенный функциональный разрыв |
| Equalizer | 10 полос, preamp, balance, ON, EQF import/export, 7 встроенных presets и пользовательские presets | Классический 10-band EQ, встроенные Winamp presets, EQF | База есть; набор заводских presets и skin-defined поведение слабее |
| .wsz skins | Собственный ZIP parser, atlas cropper, часть Main/EQ sprites | Совместимость с классическими Winamp 2.x skins, включая их нестандартные элементы | Самое заметное отставание по skin fidelity |
| Playlist skin data | `pledit.txt` парсится, но его значения не применяются к Playlist | Playlist colors/fonts и skin artwork поддерживаются | Данные сейчас теряются на UI-слое |
| Visualizer colors | `viscolor.txt` парсится, но не применяется | Skin-defined visualizer colors | Данные сейчас не используются |
| Skin regions | `region.txt` парсится, но форма окна не применяется | Поддержка custom window regions; есть отдельные исправления для Firefox/zoom | Нет нестандартных контуров окон |
| Classic analyzer | Spectrum / Oscilloscope / Peak meter | Классические analyzer modes | Функциональный паритет по основным режимам |
| WMP visualizers | Alchemy, Bars and Waves, Battery и legacy-набор | Не является основной функцией Webamp | Наше преимущество |
| AVS / MilkDrop | Собственные процедурные SVG-варианты; не исполняют presets | AVS не является центральной частью Webamp; MilkDrop через Butterchurn | Нельзя считать наши сцены заменой настоящего MilkDrop |
| MilkDrop presets | Четыре авторских варианта с PSET-переключением | Butterchurn, библиотека presets, random cycling и переходы | Существенное отставание по движку и библиотеке эффектов |
| Fullscreen | Четвёртое окно разворачивается; seek/track/play/mode/exit panel и горячие клавиши | У MilkDrop есть собственные Full Screen / Desktop режимы | Наш generic fullscreen удобнее для локального Video и всего окна |
| Keyboard | Winamp transport keys, arrows; F для fullscreen; отдельные fullscreen bindings | Более полный набор Winamp hotkeys, numpad shortcuts и MilkDrop hotkeys | Нужна таблица полного соответствия |
| Window management | Main/EQ/Playlist/Video, attach/detach, group drag, magnetic snap, Playlist resize, shade | Main/EQ/Playlist и MilkDrop, drag, shade, resize Playlist/MilkDrop | Наша компоновка функционально шире, но требует browser QA |
| Media Session | Подключены metadata/playbackState, play/pause/stop/next/previous/seek handlers и position state | Опциональная интеграция с Media Session API | Базовый паритет; browser/OS acceptance ещё нужен |
| HTML Playlist export | Не реализован | Есть генерация HTML-файла | Небольшая, но заметная классическая функция |
| Mini visualizer в Playlist | Не реализован | Есть в определённой компоновке окон | Опциональное улучшение |
| Accessibility | Часть кнопок имеет title/aria-label/aria-pressed; единая keyboard/focus acceptance ещё не проведена | В актуальном changelog улучшены Tab navigation, button names и aria-pressed | Нужно довести доступность системно |

## 3. Подтверждённые слабости исходного кода

### P0 — визуализатор обновляет весь компонент на каждом кадре

**Статус: частично исправлено в этом проходе.** Частота публикации ограничена 30 FPS, вложенные setters удалены, synthetic random signal убран. Полная изоляция renderer от родительского компонента остаётся отдельной оптимизацией.

В `WinampPlayer.tsx` цикл `requestAnimationFrame` вызывает `setWaveform`, `setBars` и `setPeaks` при каждом кадре. Эти состояния находятся в родительском `WinampPlayer`, поэтому обновление затрагивает не только сцену визуализатора, но и JSX всего плеера: Main, EQ, Playlist и Video.

Дополнительная проблема: `setPeaks` вызывается из updater-функции `setBars`. Это усложняет порядок обновлений и не является хорошей границей ответственности.

При отсутствии активного analyser сейчас генерируются случайные synthetic bars/waveform. Это создаёт видимость аудиореакции, хотя реального сигнала нет.

**Исправление:**
- ограничить частоту публикации кадров до разумного стабильного лимита (первый безопасный проход — 30 FPS);
- вычислять bars/peaks/waveform отдельно и обновлять каждое состояние один раз на кадр, не вкладывая setter в updater другого setter;
- убрать случайную активность без analyser: показывать затухание/idle, не имитировать звук;
- отдельным последующим этапом вынести visualizer renderer в memoized/isolated component, чтобы аудиокадры не пересчитывали всю оболочку.

### P0 — неизвестная длительность заменяется выдуманными 180 секундами

**Статус: исправлено в этом проходе.** Контроллер отдаёт фактическое значение duration (включая 0), подписчик UI сбрасывает устаревшую длительность при загрузке следующего трека.

В `winampController.getState()` возвращается `duration: this.duration || 180`. При загрузке нового трека контроллер сбрасывает duration в 0, но UI не получает 0 как реальное состояние и может временно отображать/использовать длительность предыдущего трека или фиктивные три минуты.

**Исправление:** отдавать фактическую длительность, включая 0/unknown; подписчик UI должен сбрасывать duration в 0 при смене трека и ждать `loadedmetadata`. Seek и progress UI должны безопасно обрабатывать неизвестную длительность.

### P1 — импорт .wsz чрезмерно строгий к необязательным ресурсам

`applySkinFile()` запрашивает большой фиксированный набор sprites одним вызовом `extractWinampSkinSprites()`. Экстрактор выбрасывает ошибку, если отсутствует любой запрошенный atlas asset или sprite выходит за его границы. Поэтому скин с отсутствующим необязательным ресурсом может быть отклонён целиком.

Webamp исторически исправлял fallback для отсутствующих изображений и отдельных ресурсов скина. Это важный сценарий совместимости, а не редкий косметический случай.

**Исправление:**
- разделить обязательные и необязательные sprite sheets;
- не прерывать импорт из-за необязательного ресурса;
- для отсутствующих sprites использовать fallback-ресурсы встроенного Classic skin или корректный CSS fallback;
- отдельно проверить PNG/BMP, вложенные ZIP-пути, разные варианты titlebar/playlist и skins с неполными наборами;
- не считать skin renderer совместимым с любым .wsz до corpus-тестирования.

### P1 — парсер извлекает skin metadata, но renderer её игнорирует

**Статус: частично исправлено в этом проходе.** Playlist list colors/font из `pledit.txt` и Main analyzer palette из `viscolor.txt` теперь применяются. `region.txt` и цвета меню Playlist пока не подключены.

`parseWinampSkinArchive()` возвращает:
- `playlistStyle` из `pledit.txt`;
- `visualizerColors` из `viscolor.txt`;
- `regionText` из `region.txt`.

Но `applySkinFile()` сохраняет только имя, URL Main/titlebar и sprites. В JSX/CSS не найдено применения `playlistStyle`, `visualizerColors` или `regionText`.

**Последствия:** Playlist может не соответствовать цветам и шрифту загруженного скина; визуализатор не использует skin palette; нестандартная форма окна игнорируется.

**Исправление:** расширить модель активного скина и последовательно подключить Playlist colors/font и визуализатор palette. `region.txt` — отдельная задача с валидатором формата и browser tests; не применять произвольный текст напрямую как CSS.

### P1 — M3U не переносит локальные файлы

`parseM3uPlaylist()` принимает только абсолютные `http:` и `https:` URL. Локальные пути и relative entries считаются пропущенными. `createM3uPlaylist()` также экспортирует только HTTP(S)-адреса и пропускает локальные blob URL.

**Последствия:** пользователь может сохранить локальную библиотеку внутри приложения, но не может экспортировать её в переносимый M3U с корректными локальными путями.

**Исправление:** не экспортировать blob URL как будто они постоянные пути. Нужен явный экспортный контракт: portable M3U для URL, и отдельный manifest/backup для локальных IndexedDB assets либо ZIP-экспорт с относительными файлами. Импорт локального M3U из браузера должен иметь понятный flow выбора соответствующих файлов, потому что браузер не имеет произвольного доступа к файловой системе.

### P1 — технические параметры в Main display были статическими, а не считанными из файла

**Статус: устранено вводящее в заблуждение отображение.** Значения 128 kbps / 44 kHz / stereo заменены на неизвестные, пока реальные metadata не извлекаются. Это не полноценная поддержка metadata, но интерфейс больше не выдаёт предположения за факты.

### P1 — отсутствует ID3/metadata extraction

При добавлении локальных файлов заголовок формируется из имени файла, исполнитель — `Local file`; временный Audio element извлекает только duration. Webamp использует отдельную библиотеку metadata для чтения ID3 и других контейнерных метаданных.

**Исправление:** добавить локальное чтение metadata без сетевой отправки файлов, сохранять title/artist/album/track number/duration в IndexedDB. При ошибке чтения использовать filename fallback. Не добавлять облачные API.

### P2 — Media Session API

**Статус: базовая реализация добавлена после аудита.** Подключены metadata, playbackState, position state и обработчики play/pause/stop/previous/next/seekbackward/seekforward/seekto. Обработчики очищаются при размонтировании плеера. Требуется browser/OS acceptance на macOS, iOS и поддерживаемых desktop browsers; нельзя считать аппаратные media keys проверенными только по наличию API.

### P2 — отсутствует HTML Playlist export и дополнительные команды

Webamp поддерживает генерацию HTML Playlist. Наша Playlist умеет M3U, но HTML export отсутствует. В дальнейшем также стоит сопоставить команды Remove/Crop/Reverse/Select/Sort и контекстные меню с классическим Webamp.

### P2 — CSS и геометрия Classic renderer требуют консолидации

В `winamp.css` много исторических override-блоков, включая повторные корректировки тех же элементов. В финальных правилах Main/Equalizer заданы шириной 269 px, в то время как atlas и некоторые фоновые sprite размеры рассчитаны на 275 px. Это может быть намеренной компенсацией рамок, но сейчас контракт не выражен единообразно.

**Исправление:**
- сначала снять реальные размеры элементов в браузере и сверить с atlas;
- определить единый outer width / content width / sprite width;
- объединить каскадные override в один финальный Classic layout section;
- не удалять старые правила вслепую до visual regression screenshots.

## 4. Визуальное сравнение и критерии точности

Webamp заявляет pixel-for-pixel skin rendering для Winamp 2.9. Наша версия пока использует отдельную React/CSS раскладку и извлекает некоторые части atlas. Это не эквивалент полного skin interpreter.

Для реального parity недостаточно совпадения общей формы Main/EQ/Playlist. Необходимо проверить:

1. Main: titlebar, LCD digits/indicators, seekbar, volume/balance rails, transport buttons, shuffle/repeat, EQ/Playlist toggles.
2. Equalizer: активная/неактивная titlebar, ON/AUTO, preset selector, preamp, 10 faders, dB scale, graph palette и поведение ползунков.
3. Playlist: верхняя/боковые/нижняя рамки, scrollbar, текстовые цвета, selection/current row, footer, resize и windowshade.
4. Window chrome: close/minimize/shade, pressed/hover sprites, active/inactive state, focus/z-order.
5. Skin variations: стандартный Winamp Classic, скин с изменёнными цветами Playlist, skin с отсутствующими необязательными sprites, skin с region.txt, PNG atlas.
6. Масштабирование: 100%, узкий viewport, touch, high-DPI и browser zoom.

Визуализатор проверяется отдельно:
- Classic analyzer должен быть сдержанным и пиксельно читаемым;
- WMP modes должны сохранять характерную композицию каждой визуализации;
- AVS/MilkDrop-inspired должны быть узнаваемыми самостоятельными сценами, но не называться совместимыми с настоящими presets;
- fullscreen должен использовать то же существующее четвёртое окно и не создавать вторую audio/video сессию.

## 5. Рекомендуемый порядок реализации

| Приоритет | Работа | Почему |
|---|---|---|
| P0 | Исправить duration=180 fallback и сброс duration на смене трека | Точность позиции и seek |
| P0 | Снизить частоту React visualizer updates, убрать fake spectrum | Производительность и честная аудиореакция |
| P1 | Сделать .wsz импорт устойчивым к необязательным отсутствующим sprites | Совместимость с реальными skin archives |
| P1 | Подключить pledit.txt и viscolor.txt к UI | Фактическое применение skin metadata |
| P1 | Реализовать ID3 metadata extraction | Качество локальной библиотеки |
| P1 | Определить portable export для локальных треков и улучшить M3U workflow | Переносимость плейлистов |
| P2 | Browser QA для Media Session API | Подтвердить системные media keys / lock screen |
| P2 | HTML Playlist export и дополнительные Playlist commands | Feature parity |
| P2 | Консолидация Classic CSS и pixel QA | Долгосрочная визуальная точность |
| P3 | Настоящий MilkDrop через Butterchurn + локальные presets | Большой bundle/сложность, отдельное решение |

## 6. Что уже является преимуществом нашей версии

- IndexedDB-backed локальная аудиобиблиотека с восстановлением object URL после перезагрузки.
- EQF import/export и пользовательские EQ presets.
- Main LCD и четвёртое окно имеют независимые режимы.
- WMP core и legacy визуализации, которых нет в стандартном наборе Webamp.
- Дополнительные AVS/MilkDrop-inspired procedural scenes без исполнения внешнего preset-кода.
- Четвёртое окно умеет работать как Video player и как visualizer.
- Полноэкранная панель управления video/audio с seek, track navigation, mode switching и Escape.
- Attach/detach, magnetic snapping и group drag окон.
- Playlist resize по двум осям.
- Всё это использует один общий playback controller и один analyser pipeline.

Эти возможности нужно сохранить при дальнейшей работе. Не следует заменять текущую архитектуру Webamp целиком только ради паритета: правильнее заимствовать проверенные детали skin compatibility, metadata, playlist и accessibility.

## 7. План browser acceptance

До пометки Winamp Classic как Verified выполнить реальный browser pass:

- [ ] Chrome/Firefox/Safari desktop: воспроизведение MP3, WAV, OGG, FLAC, M4A/AAC в поддерживаемых браузером комбинациях.
- [ ] Local file picker и drag-and-drop: одиночный файл, пачка файлов, повторное добавление, удаление текущего трека.
- [ ] Перезагрузка страницы: восстановление локальной библиотеки и корректное воспроизведение.
- [ ] Metadata: ID3 title/artist/album/track number и fallback при отсутствующих/битых тегах.
- [ ] Playlist: selection, multi-select, reorder, remove, M3U import/export, относительные пути, недоступные URL.
- [ ] EQ: все 10 bands, preamp, balance, ON/OFF, preset, EQF round-trip.
- [ ] .wsz: default skin, несколько разных архивов, отсутствующие optional sprites, PNG atlas, pledit/viscolor/region.
- [ ] Keyboard: X/C/V/B/Z, arrows, S/R/L, fullscreen F, fullscreen Left/Right/Up/Down/Space/M/Escape, фокус в input/select.
- [ ] Window management: drag, attach/detach, magnetic snap, shade, Playlist resize, viewport boundaries, touch.
- [ ] Visualizer: bass-heavy, speech, quiet, paused, stopped, analyser unavailable, reduced-motion, hidden window.
- [ ] Fullscreen video: double-click/double-tap, panel auto-hide, hover hold, seek, play/pause, resize/orientation, Escape.
- [ ] Media Session: OS media keys и корректное обновление metadata после смены трека.
- [ ] Console: no React warnings, unhandled promise rejections, object URL leaks or repeated analyser initialization.
- [ ] Build/typecheck/lint и успешный GitHub Actions run на итоговом commit.

## 8. Источники сравнения

- [Webamp repository](https://github.com/captbaritone/webamp) — исходный проект и его назначение.
- [Webamp Skins](https://docs.webamp.org/docs/features/skins/) — совместимость с Winamp 2.x skins и pixel-for-pixel rendering.
- [Webamp Milkdrop](https://docs.webamp.org/docs/features/mikdrop/) — Butterchurn, presets, transitions, track title и fullscreen modes.
- [Webamp Hotkeys](https://docs.webamp.org/docs/features/hotkeys/) — полный список transport/numpad/MilkDrop hotkeys.
- [Webamp Playlist](https://docs.webamp.org/docs/features/playlist/) — HTML Playlist export и mini visualizer.
- [Webamp Equalizer](https://docs.webamp.org/docs/features/equalizer/) — встроенные presets, EQF и skin-defined EQ.
- [Webamp Track Type](https://docs.webamp.org/docs/api/track/) — metadata и duration.
- [Webamp Media Session option](https://docs.webamp.org/docs/api/webamp-constructor/) — системные media keys и lock-screen metadata.
- [Webamp Changelog](https://docs.webamp.org/docs/changelog/) — skin fallback, touch, accessibility и memory-leak fixes.
- Локальный код: `src/apps/winamp/WinampPlayer.tsx`, `src/apps/winamp/winamp.css`, `src/system/audio/winampController.ts`, `src/system/audio/winampSkin.ts`, `src/system/audio/winampSkinAtlas.ts`, `src/system/audio/winampM3u.ts`, `src/system/audio/winampEqf.ts`.

---

**Итог:** наша версия сильнее как расширенный WebOS media module, но пока уступает Webamp в fidelity/compatibility. Самый правильный путь — сохранить уникальные окна и визуализации, одновременно доведя skin parser, metadata, playlist и render performance до надёжного уровня.


## 9. Исправления, выполненные сразу после аудита

**25 ноября 2026 — source-level corrections:**

- [x] Ограничена частота публикации visualizer state до 30 FPS вместо обновления на каждом requestAnimationFrame.
- [x] Удалён случайный synthetic spectrum при недоступном analyser. Без достоверных данных сцена затухает/остаётся idle, а не изображает несуществующий аудиосигнал.
- [x] Убраны вложенные React state setters: bars, peaks и waveform вычисляются раздельно.
- [x] Контроллер больше не подменяет неизвестную длительность трека фиктивными 180 секундами; UI получает реальный 0/unknown и сбрасывает stale duration при смене трека.
- [x] Защищён fullscreen double-click handler от повторного запроса fullscreen, если сцена уже развёрнута.
- [x] Подключены `pledit.txt` list colors/font к Playlist и `viscolor.txt` palette к Main analyzer для импортированного .wsz.
- [x] Удалены фиксированные ложные значения 128 kbps / 44 kHz / stereo из Main display: пока metadata не читается, интерфейс показывает неизвестное значение, а не выдуманные характеристики.
- [x] Подключён Media Session API к существующему controller: track metadata, playback/position state, play/pause/stop/next/previous и seek handlers; handlers/metadata очищаются при закрытии плеера.

**Оставшиеся ограничения:** fallback для отсутствующих optional .wsz sprites, применение `region.txt` и Playlist menu colors, ID3 metadata extraction, portable local M3U workflow, HTML Playlist export, browser QA для Media Session, настоящая Butterchurn/MilkDrop интеграция и изоляция visualizer rendering от родительского компонента.

Эти изменения проверены по исходному коду на уровне patch construction; успешный typecheck/build/CI и browser behavior должны быть подтверждены отдельными результатами ниже. Не считать визуальный проход Verified без реального браузера.
