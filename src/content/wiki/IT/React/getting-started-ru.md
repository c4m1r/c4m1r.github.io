# Начало работы с React

React - это JavaScript библиотека для создания пользовательских интерфейсов.

## Основные концепции

### Компоненты
Компоненты - это строительные блоки React приложений. Они могут быть функциональными или классовыми.

### JSX
JSX - это синтаксическое расширение JavaScript, которое позволяет писать HTML-подобный код в JavaScript.

### Props
Props (свойства) - это способ передачи данных от родительского компонента к дочернему.

### State
State (состояние) - это данные, которые могут изменяться в течение жизненного цикла компонента.

## Установка

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

## Пример компонента

```typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Счетчик: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Увеличить
      </button>
    </div>
  );
}

export default Counter;
```