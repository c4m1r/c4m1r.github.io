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

1. Частичная реализация формата .wsz: необязательные sprites теперь безопасно пропускаются, `pledit.txt`, `viscolor.txt` и четыре `region.txt` sections подключены. До полного Webamp parity ещё не хватает части sprite/cursor mappings и corpus/browser compatibility tests.
2. Настоящий MilkDrop добавлен через Butterchurn 2.6.7 с локальным preset pack и отдельным режимом. Импорт локальных Butterchurn preset JSON добавлен в сам режим; сырые legacy .milk текстовые файлы не заявляются как поддерживаемый импортируемый формат.
3. Локальные MP3 читают ID3v2.2/v2.3/v2.4 и ID3v1; FLAC Vorbis comments, Ogg Vorbis/OpusTags, WAV INFO и MP4/M4A ilst atoms читаются для title/artist/album/track. Расширенные поля и редкие нестандартные варианты контейнеров ещё не поддержаны.
4. M3U поддерживает `#EXTM3U` / `#EXTINF`, BOM и Unicode metadata, дробные длительности при импорте и round-trip для HTTP(S)-URL. Экспорт принимает только строгий `MM:SS` с секундами `00–59`; некорректные, неизвестные и переполненные значения превращаются в `-1`, а не нормализуются молча. Относительные, `file:` и временные `blob:` ссылки пропускаются; HLS `#EXT-X-*` манифесты отклоняются. Метаданные экспортируемых записей очищаются от CR/LF. Локальные файлы переносятся через `.wampack`, а не M3U.
5. Анимационный цикл ограничен 60 FPS и изолирован во внешнем frame store; parent Winamp не получает 60-FPS state updates. RAF приостанавливается в background tab и возобновляется при возврате; подписка на контроллер/visibility остаётся единой для обеих поверхностей. SVG gradient IDs четвёртого окна уникальны для экземпляра компонента. 60-FPS high-DPI profiling и browser lifecycle acceptance всё ещё нужны.
6. HTML-экспорт Playlist добавлен после аудита. Media Session API также подключён; оба требуют browser acceptance.
7. Классический внешний вид пока является собственной реконструкцией, а не пиксельно-точным skin renderer: есть расхождение геометрии окна 269/275 px и большой набор последовательно добавленных CSS override-блоков.

**Приоритет исправлений:** корректность данных и производительность → надёжность .wsz → полнота плейлиста и системная интеграция → визуальная калибровка → дополнительные функции.

## 2. Сравнение по функциям

| Область | Наша реализация | Webamp | Вывод |
|---|---|---|---|
| Воспроизведение | Единый `winampController`, HTMLAudioElement, play/pause/stop/next/previous/seek | Web Audio/HTML5 playback и публичный API управления | Базовый функционал есть у обеих сторон |
| Форматы аудио | Браузерные форматы; локальные файлы, сохранённые в IndexedDB | Форматы, поддерживаемые браузером; файлы и URL | Нужны тесты по браузерам и метаданным |
| Локальная библиотека | Сохранение локальных файлов и восстановление object URL после перезагрузки | В документации описана загрузка файлов/URL; наша IndexedDB-библиотека — дополнительное преимущество | Наша версия функционально богаче в persistence |
| Playlist | Добавление, удаление, выбор, сортировка drag-and-drop, длительности, M3U import/export | Классические команды Playlist, drag/drop, дополнительные команды и HTML export | У нас есть основа; не хватает ряда классических команд |
| M3U | `#EXTM3U` / `#EXTINF`, HTTP(S)-URL, Unicode/BOM и duration round-trip; относительные, `file:` и `blob:` entries пропускаются, HLS отклоняется | Поддержка playlist workflow в рамках Webamp | M3U используется для сетевых ссылок; локальные файлы переносятся через `.wampack` |
| ID3 / metadata | Локальные MP3 (ID3v2.2/v2.3/v2.4 + ID3v1), FLAC (Vorbis comments), Ogg Vorbis/OpusTags, WAV INFO, MP4/M4A ilst: title/artist/album/track | Читает ID3 и другую metadata при загрузке | Базовые common tags покрыты; нужны fixtures и редкие контейнерные варианты |
| Equalizer | 10 полос, preamp, balance, ON, EQF import/export, 7 встроенных presets и пользовательские presets | Классический 10-band EQ, встроенные Winamp presets, EQF | База есть; набор заводских presets и skin-defined поведение слабее |
| .wsz skins | Собственный ZIP parser, atlas cropper; необязательные отсутствующие/битые sprites теперь пропускаются, Main sheet остаётся обязательным | Совместимость с классическими Winamp 2.x skins, включая их нестандартные элементы | Импорт устойчивее, но полный skin fidelity ещё не достигнут |
| Playlist skin data | `pledit.txt` colors/font применяются к списку и menu panels | Playlist colors/fonts и skin artwork поддерживаются | Базовые colors/font подключены; custom regions ещё нет |
| Visualizer colors | `viscolor.txt` palette применяется к Main analyzer | Skin-defined visualizer colors | Базовая palette подключена |
| Skin regions | `region.txt` валидируется и применяется SVG clipPath к Main/Equalizer normal + WindowShade | Поддержка custom window regions | Базовые четыре region sections подключены; browser QA и редкие malformed files ещё нужны |
| Classic analyzer | Spectrum / Oscilloscope / Peak meter | Классические analyzer modes | Функциональный паритет по основным режимам |
| WMP visualizers | Alchemy, Bars and Waves, Battery и legacy-набор | Не является основной функцией Webamp | Наше преимущество |
| AVS / MilkDrop | Оригинальные AVS/procedural MilkDrop сцены плюс отдельный genuine MilkDrop (Butterchurn 2.6.7) с локальным preset pack и переходами | AVS не является центральной частью Webamp; MilkDrop через Butterchurn | Genuine MilkDrop теперь присутствует; пользовательские внешние preset-файлы не заявлены как импортируемые |
| MilkDrop presets | Локальный `butterchurn-presets` pack, выбор/переходы; четыре авторских процедурных варианта остаются отдельным режимом | Butterchurn, библиотека presets, random cycling и переходы | Базовый движок и preset pack подключены; пользовательский импорт preset-файлов отдельно не реализован |
| Fullscreen | Четвёртое окно разворачивается; seek/track/play/mode/exit panel и горячие клавиши | У MilkDrop есть собственные Full Screen / Desktop режимы | Наш generic fullscreen удобнее для локального Video и всего окна |
| Keyboard | Winamp transport keys, arrows; F для fullscreen; отдельные fullscreen bindings | Более полный набор Winamp hotkeys, numpad shortcuts и MilkDrop hotkeys | Нужна таблица полного соответствия |
| Window management | Main/EQ/Playlist/Video, attach/detach, group drag, magnetic snap, Playlist resize, shade | Main/EQ/Playlist и MilkDrop, drag, shade, resize Playlist/MilkDrop | Наша компоновка функционально шире, но требует browser QA |
| Media Session | Подключены metadata/playbackState, play/pause/stop/next/previous/seek handlers и position state | Опциональная интеграция с Media Session API | Базовый паритет; browser/OS acceptance ещё нужен |
| HTML Playlist export | Экспорт HTML для web-address tracks; локальные object URLs исключаются | Есть генерация HTML-файла | Базовая функция добавлена; локальные файлы требуют bundle/manifest |
| Mini visualizer в Playlist | Не реализован | Есть в определённой компоновке окон | Опциональное улучшение, не блокирует основные сценарии плеера |
| Accessibility | Часть кнопок имеет title/aria-label/aria-pressed; единая keyboard/focus acceptance ещё не проведена | В актуальном changelog улучшены Tab navigation, button names и aria-pressed | Нужно довести доступность системно |

## 3. Подтверждённые слабости исходного кода

### P0 — визуализатор обновляет весь компонент на каждом кадре

**Статус: исправлено в текущем проходе.** Частота публикации установлена на 60 FPS; кадры публикуются через внешний frame store и `useSyncExternalStore`. Только Main и Fourth visualizer surfaces получают 60-FPS обновления — крупный Winamp parent, Playlist и window manager не перерисовываются из-за аудиокадров. Оба визуализатора используют тот же analyser после EQ и тот же AudioContext. Синтетическая случайная активность удалена; без analyser сцена затухает в idle.

**Отложено:** browser profiling на 60 Hz/high-DPI и CPU/GPU нагрузка. Исходный код приостанавливает RAF для скрытой вкладки; реальное поведение в браузере пока не подтверждалось.

### P0 — неизвестная длительность заменяется выдуманными 180 секундами

**Статус: исправлено в этом проходе.** Контроллер отдаёт фактическое значение duration (включая 0), подписчик UI сбрасывает устаревшую длительность при загрузке следующего трека.

Историческая проблема заключалась в подстановке фиктивных 180 секунд вместо неизвестной длительности. Исправление уже находится в текущем коде: controller отдаёт фактическое значение, включая 0, UI сбрасывает устаревшее значение при смене трека и ожидает `loadedmetadata`. Seek/progress должны оставаться безопасными при неизвестной длительности. Повторно этот пункт не считается открытой задачей.

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

**Статус: частично исправлено в этом проходе.** Playlist list colors/font из `pledit.txt`, Playlist menu colors и Main analyzer palette из `viscolor.txt` теперь применяются. `region.txt` теперь валидируется и применяется к Main/Equalizer normal + WindowShade через SVG clipPath.

`parseWinampSkinArchive()` возвращает:
- `playlistStyle` из `pledit.txt`;
- `visualizerColors` из `viscolor.txt`;
- `regionText` из `region.txt`.

`applySkinFile()` теперь сохраняет `playlistStyle` и `visualizerColors`; renderer применяет Playlist list/menu colors/font и Main analyzer palette. `regionText` теперь парсится в ограниченные polygons; Main/Equalizer normal и WindowShade получают SVG clipPath, только если секция прошла валидацию.

**Оставшееся последствие:** требуется browser QA для разных размеров/масштабов и некорректных region sections; остальные перечисленные playlist/visualizer metadata уже подключены.

**Отложено:** проверка `region.txt` на реальном skin corpus и интерактивных областях относится к browser QA; некорректные sections уже проходят валидацию и игнорируются.

### M3U и переносимость локальной библиотеки

**Статус: разделение форматов реализовано.** `parseM3uPlaylist()` и `createM3uPlaylist()` поддерживают стандартный обмен HTTP(S)-ссылками через `#EXTM3U` / `#EXTINF`, Unicode/BOM и duration round-trip. Относительные пути, `file:` и временные `blob:` URL пропускаются; HLS manifests отклоняются. Экспортируемые имена/метаданные очищаются от CR/LF, чтобы одна запись не могла внедрить дополнительные строки плейлиста.

Локальные IndexedDB-backed файлы переносятся отдельным ZIP-архивом `.wampack`: он сохраняет оригинальные байты, порядок плейлиста, повторные ссылки на один asset и метаданные, не сериализуя object URLs или машинные пути. Это намеренное разделение контрактов, а не незавершённость M3U.

**Остаётся проверить в браузере:** round-trip M3U на реальных сетевых треках и `.wampack` на реальных локальных файлах, включая повторяющиеся записи, крупный архив и отказ IndexedDB transaction.

### P1 — технические параметры в Main display были статическими, а не считанными из файла

**Статус: устранено вводящее в заблуждение отображение.** Значения 128 kbps / 44 kHz / stereo заменены на неизвестные, пока реальные metadata не извлекаются. Это не полноценная поддержка metadata, но интерфейс больше не выдаёт предположения за факты.

### P1 — неполное ID3/metadata extraction

**Статус: частично исправлено, базовые common tags поддерживаются.** Добавлен локальный parser ID3v2.2/v2.3/v2.4 + ID3v1 для MP3, FLAC Vorbis comments, Ogg Vorbis/OpusTags, WAV INFO и MP4/M4A ilst atoms. Читаются title/artist/album/track number; локальные metadata сохраняются в IndexedDB и восстанавливаются вместе с библиотекой. Отсутствующие/битые теги используют filename fallback; duration читается browser audio metadata event.

Осталось: редкие ID3/container variants и extended tags. Основные common-tag fixtures добавлены и проходят CI; проверка на реальных файлах и browser QA перенесены на отдельный этап.

### P2 — Media Session API

**Статус: базовая реализация добавлена после аудита.** Подключены metadata, playbackState, position state и обработчики play/pause/stop/previous/next/seekbackward/seekforward/seekto. Обработчики очищаются при размонтировании плеера. Требуется browser/OS acceptance на macOS, iOS и поддерживаемых desktop browsers; нельзя считать аппаратные media keys проверенными только по наличию API.

### P2 — дополнительные команды Playlist (вне обязательного текущего scope)

**HTML export добавлен.** Формируется автономный HTML-файл со ссылками на HTTP(S)-треки, заголовком, исполнителем и длительностью. Локальные object URLs намеренно исключаются, поскольку они не переживают закрытие вкладки и не являются переносимыми путями.

Дополнительные команды Remove/Crop/Reverse/Select/Sort и расширенные контекстные меню не входят в обязательный текущий parity scope; базовые добавление/удаление/выбор/перемещение и M3U/.wampack import-export реализованы. Их можно добавить отдельным функциональным расширением без блокировки текущего плеера.

### P2 — CSS и геометрия Classic renderer: безопасная консолидация после visual baseline

В `winamp.css` остаются исторические override-блоки и повторные корректировки. Их безопасная консолидация требует визуального baseline: в Classic renderer есть различие между outer width, content width и sprite width. Без браузерного сравнения удалять старые правила вслепую нельзя; этот cleanup отложен вместе с visual QA.

**Отложено до browser QA:**
- снять реальные размеры элементов в браузере и сверить с atlas;
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

### Настоящий MilkDrop — отдельный режим, не замена нашим сценам

**Статус: реализовано.** Отдельный пункт `MilkDrop (Butterchurn)` добавлен, текущий авторский procedural `MilkDrop` и AVS/MilkDrop-inspired сцены сохранены и по-прежнему работают без WebGL.

Butterchurn — WebGL2-реализация MilkDrop с отдельным пакетом presets. Upstream README документирует создание renderer на существующем AudioContext, подключение audio node, загрузку preset и resize. Основной пакет опубликован как MIT `butterchurn@2.6.7`, пакет presets — MIT `butterchurn-presets@2.4.7`. В проекте используются lazy/dynamic imports только при выборе нового режима, проверка WebGL2 и сохранение текущих сцен как fallback. Canvas остаётся внутри существующего четвёртого окна; fullscreen использует тот же canvas и не создаёт новое окно.

**Audio graph source audit: выполнено.** Используется текущий controller AudioContext и post-EQ/post-balance node; отдельные AudioContext/HTMLAudioElement и второй audible output не создаются. В Butterchurn подключается только отдельная анализирующая ветвь; `disconnectAudio` отключает эту ветвь. Presets локальные, переключаются с плавным blend; CDN/API не используются. Browser QA аудиовыхода отложен вместе с общей проверкой плеера.

## 5. Рекомендуемый порядок реализации

| Приоритет | Работа | Почему |
|---|---|---|
| P0 | Исправить duration=180 fallback и сброс duration на смене трека | Точность позиции и seek |
| P0 | Browser profile 60 FPS visualizer on high-DPI displays | Подтвердить реальную плавность и CPU/GPU cost |
| P1 | Расширить .wsz fallback и применить region.txt / остальные palette fields | Полнота skin compatibility |
| P1 | Подключить pledit.txt и viscolor.txt к UI | Фактическое применение skin metadata |
| P1 | Расширить metadata parser на FLAC/Ogg/MP4/WAV | Качество локальной библиотеки |
| P2 | Browser QA для M3U и `.wampack` round-trip на реальных файлах | Подтвердить переносимость и rollback |
| P2 | Browser QA для Media Session API | Подтвердить системные media keys / lock screen |
| P2 | Дополнительные Playlist commands и portable local-library export | Реализованы Reverse/Crop, mini visualizer и .wampack; browser acceptance deferred |
| P2 | Консолидация Classic CSS и pixel QA | Долгосрочная визуальная точность |
| P3 | Настоящий MilkDrop через Butterchurn + локальные presets | Реализовано в `MilkDrop (Butterchurn)`; дальнейший импорт пользовательских preset-файлов не входит в текущий scope |

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
- [ ] ID3v2/v1 test fixtures: Latin-1, UTF-8, UTF-16, malformed frame, empty tag, oversized tag.
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

- [x] Установлена частота 60 FPS; frame store и `useSyncExternalStore` изолировали аудиокадры от большого Winamp parent.
- [x] Удалён случайный synthetic spectrum при недоступном analyser. Без достоверных данных сцена затухает/остаётся idle, а не изображает несуществующий аудиосигнал.
- [x] Убраны вложенные React state setters: bars, peaks и waveform вычисляются раздельно.
- [x] Контроллер больше не подменяет неизвестную длительность трека фиктивными 180 секундами; UI получает реальный 0/unknown и сбрасывает stale duration при смене трека.
- [x] Защищён fullscreen double-click handler от повторного запроса fullscreen, если сцена уже развёрнута.
- [x] Подключены `pledit.txt` list colors/font + menu colors к Playlist и `viscolor.txt` palette к Main analyzer для импортированного .wsz.
- [x] Импорт .wsz больше не падает из-за отсутствующих optional sprite sheets или отдельных atlas sprites; Main sheet остаётся обязательным.
- [x] Добавлен валидируемый `region.txt` parser и SVG clipPath для Main/Equalizer normal и WindowShade.
- [x] Добавлен локальный metadata reader: ID3v2.2/v2.3/v2.4 + ID3v1, FLAC Vorbis comments, Ogg Vorbis/OpusTags, WAV INFO и MP4/M4A ilst atoms. локальные tags сохраняются в IndexedDB.
- [x] Добавлен автономный HTML Playlist export для HTTP(S) tracks; локальные object URLs не экспортируются как неработающие ссылки.
- [x] Удалены фиксированные ложные значения 128 kbps / 44 kHz / stereo из Main display: пока metadata не читается, интерфейс показывает неизвестное значение, а не выдуманные характеристики.
- [x] Подключён Media Session API к существующему controller: track metadata, playback/position state, play/pause/stop/next/previous и seek handlers; handlers/metadata очищаются при закрытии плеера.

**Оставшиеся ограничения:** browser QA для `region.txt` clip paths, portable local M3U/IndexedDB export, дополнительные Playlist commands, browser QA для Media Session, реальные metadata fixtures, настоящая Butterchurn/MilkDrop интеграция и 60-FPS browser performance profiling.

Эти изменения проверены по исходному коду на уровне patch construction; успешный typecheck/build/CI и browser behavior должны быть подтверждены отдельными результатами ниже. Не считать визуальный проход Verified без реального браузера.

## 10. Следующая реализационная итерация — portable local-library backup

Обычный M3U не может безопасно переносить локальные треки, потому что сохранённый `blob:` URL существует только в текущем контексте браузера. Поэтому локальная библиотека будет экспортироваться отдельным ZIP-архивом `.wampack`, а M3U останется стандартным форматом для сетевых URL.

Контракт архива:
- `manifest.json` содержит версию схемы, порядок плейлиста, метаданные и archive-relative asset IDs.
- `audio/` содержит исходные байты файлов без перекодирования.
- object URLs не сохраняются; при импорте они создаются заново из Blob.
- ZIP проверяется до записи в IndexedDB: границы central directory, количество и общий размер entries, CRC, traversal paths, manifest schema/version.
- Импорт сначала валидирует весь архив, затем сохраняет файлы и добавляет playlist entries только после успешной записи.
- Повторяющиеся позиции одного локального трека в плейлисте сохраняются через ссылки manifest на один asset.
- UI размещается в существующем Playlist MISC меню; новых окон не добавляется.

Это пока спецификация, не готовая функция. До реализации нельзя показывать BACKUP IN/OUT как рабочие кнопки или обещать совместимость с произвольными ZIP.

## 11. Butterchurn: безопасная интеграция

Butterchurn остаётся отдельным режимом `MilkDrop (Butterchurn)`; текущий процедурный `MilkDrop` и AVS-inspired режимы сохраняются. Интеграция должна быть lazy-loaded, локальной и ограниченной существующим четвёртым окном.

Критическая часть — не сам Canvas, а аудиограф: контроллер уже пропускает сигнал через EQ → preamp → balance → analyser → destination. Нельзя повторно подключать аудиосигнал к destination и получать удвоенную громкость/фазовое наложение. Перед кодом требуется проверить точный `connectAudio` контракт установленной версии Butterchurn. Если библиотеке нужен собственный анализатор, допустима отдельная silent tap-ветка внутри того же AudioContext; основной audible path остаётся единственным и неизменным.

Проверки до статуса Verified: WebGL2 fallback/context loss, resize/fullscreen reuse, disconnect собственных tap nodes, отсутствие второго AudioContext/HTMLAudioElement, локальные presets, lazy bundle и 60-FPS профиль на high-DPI. Подробные acceptance пункты находятся в `docs/tasks.md`.
## 12. Реализация .wampack — первая версия

В Playlist → MISC добавлены Backup local library и Restore local library. Архив строится из IndexedDB Blob records и текущего порядка playlist; временные blob URL не сериализуются. Manifest сохраняет track metadata, исходное имя файла, MIME type, размер и lastModified; одинаковый локальный asset, встречающийся повторно, включается в ZIP один раз. HTTP(S) playlist items сохраняются как URL references без скачивания удалённого контента.

ZIP writer создаёт UTF-8 STORE entries и CRC32 без дополнительной зависимости. Reader принимает только STORE entries и до записи в IndexedDB проверяет EOCD/central directory, локальные заголовки, CRC, пути, дубликаты, предел 512 MB / 1002 entries / 4 MB manifest, ссылки на отсутствующие assets и неиспользуемые payload files. Imported blobs записываются одним IndexedDB read-write transaction, после чего для player создаются новые object URLs.

Ограничения первой версии: нет DEFLATE, split ZIP, ZIP64 и автоматического объединения с уже имеющимися одинаковыми файлами. Большие архивы обрабатываются в памяти; размер ограничен 512 MB. Browser round-trip и malformed archive fixtures ещё не прогнаны, поэтому функция не отмечается как browser-verified.

Файлы: src/system/audio/winampArchive.ts, src/system/audio/winampLocalLibrary.ts, src/apps/winamp/WinampPlayer.tsx.

## 13. Winamp follow-up implementation — 2026-11-25

- Playlist MISC now exposes Reverse playlist and Crop to selection. The shared controller preserves the active track by stable ID when reversing and switches safely to the first retained entry when cropping removes the active track.
- LIST OPT now includes an optional compact live mini visualizer, disabled by default. It consumes the existing external analyser frame store rather than adding a second audio graph or forcing parent-level 60 FPS renders.
- Genuine MilkDrop (Butterchurn) now accepts local Butterchurn preset JSON files through LOAD PRESET. Imported presets are available immediately through NEXT PRESET and participate in the existing PSET cycling. Raw legacy .milk text is not parsed by this importer.
- These are source-level implementations. Browser interaction, layout, real preset compatibility and audio lifecycle acceptance remain deferred; no manual/browser pass is claimed.


## 14. Video queue transport follow-up — 2026-11-25

- The fourth-window Video toolbar now exposes Previous and Next controls outside fullscreen as well as the existing fullscreen transport. Previous moves back through the selected local queue and restarts the first item; Next is disabled at the queue end. The current video queue remains independent from the audio playlist; no implicit audio/video sync is claimed.
- Keyboard/touch/browser acceptance and narrow-toolbar layout verification remain deferred to the owner-approved browser-QA pass.
