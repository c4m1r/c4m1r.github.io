---
title: Начало работы с React
title_en: Getting Started with React
title_ru: Начало работы с React
title_fr: Commencer avec React
title_es: Comenzando con React
title_zh: React入门
title_ja: Reactを始める
title_ko: React 시작하기
category: it/react
updatedAt: 2026-02-13
---

<!-- lang:en -->
# Getting Started with React

React is a JavaScript library for building user interfaces, particularly single-page applications. It was developed by Facebook and allows developers to create reusable UI components.

## Table of Contents

1. [Why React?](#why-react)
2. [Prerequisites](#prerequisites)
3. [Installation and Setup](#installation-and-setup)
4. [React Basics](#react-basics)
5. [Components](#components)
6. [JSX - JavaScript XML](#jsx---javascript-xml)
7. [Props and State](#props-and-state)
8. [Hooks](#hooks)
9. [Event Handling](#event-handling)
10. [Conditional Rendering](#conditional-rendering)
11. [Lists and Keys](#lists-and-keys)
12. [Forms](#forms)
13. [React Router](#react-router)
14. [State Management](#state-management)
15. [Best Practices](#best-practices)
16. [Next Steps](#next-steps)

## Why React?

### Key Benefits

- **Component-Based**: Build encapsulated components that manage their own state
- **Declarative**: Design views for each state in your application
- **Virtual DOM**: Efficient updates and rendering
- **Rich Ecosystem**: Vast collection of libraries and tools
- **Large Community**: Active community support and resources
- **React Native**: Use React to build mobile applications

### When to Use React

- Single-page applications (SPAs)
- Complex interactive UIs
- Projects requiring frequent DOM updates
- Progressive web apps
- Mobile apps (with React Native)

## Prerequisites

Before starting with React, you should be familiar with:

### Essential Knowledge

- **HTML/CSS**: Basic web development
- **JavaScript**: ES6+ features (arrow functions, destructuring, modules)
- **npm/yarn**: Package management

### Recommended JavaScript Concepts

```javascript
// Arrow functions
const greet = (name) => `Hello, ${name}!`;

// Destructuring
const { name, age } = user;
const [first, second] = array;

// Spread operator
const newArray = [...oldArray, newItem];
const newObject = { ...oldObject, newProp: value };

// Template literals
const message = `User ${name} is ${age} years old`;

// Ternary operator
const result = condition ? valueIfTrue : valueIfFalse;

// Array methods
const doubled = numbers.map(n => n * 2);
const filtered = numbers.filter(n => n > 10);
```

## Installation and Setup

### Method 1: Create React App (CRA)

Traditional method, still widely used:

```bash
npx create-react-app my-app
cd my-app
npm start
```

### Method 2: Vite (Recommended)

Faster build tool with better developer experience:

```bash
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev
```

For TypeScript:
```bash
npm create vite@latest my-react-app -- --template react-ts
```

### Method 3: Next.js

Full-stack React framework with server-side rendering:

```bash
npx create-next-app@latest my-next-app
cd my-next-app
npm run dev
```

### Project Structure (Vite)

```
my-react-app/
├── node_modules/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## React Basics

### Your First Component

```jsx
// src/App.jsx
function App() {
  return (
    <div>
      <h1>Hello, React!</h1>
      <p>Welcome to your first React app.</p>
    </div>
  );
}

export default App;
```

### Entry Point

```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Components

### Functional Components (Modern Approach)

```jsx
// Simple component
function Welcome() {
  return <h1>Welcome!</h1>;
}

// Component with props
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Arrow function component
const Button = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

export { Welcome, Greeting, Button };
```

### Component Composition

```jsx
function UserCard({ user }) {
  return (
    <div className="card">
      <Avatar url={user.avatarUrl} />
      <UserInfo name={user.name} email={user.email} />
    </div>
  );
}

function Avatar({ url }) {
  return <img src={url} alt="Avatar" className="avatar" />;
}

function UserInfo({ name, email }) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}
```

## JSX - JavaScript XML

### What is JSX?

JSX is a syntax extension for JavaScript that looks similar to HTML:

```jsx
// JSX
const element = <h1>Hello, world!</h1>;

// Compiles to JavaScript
const element = React.createElement('h1', null, 'Hello, world!');
```

### JSX Rules

```jsx
// 1. Must return single root element
function Component() {
  return (
    <div>
      <h1>Title</h1>
      <p>Paragraph</p>
    </div>
  );
}

// Or use Fragment
function Component() {
  return (
    <>
      <h1>Title</h1>
      <p>Paragraph</p>
    </>
  );
}

// 2. Close all tags
<img src="image.jpg" />
<input type="text" />

// 3. Use camelCase for attributes
<div className="container" onClick={handleClick}>

// 4. JavaScript expressions in curly braces
const name = "John";
<h1>Hello, {name}!</h1>
<p>{2 + 2}</p>
<p>{user.isAdmin ? 'Admin' : 'User'}</p>
```

### Conditional Rendering in JSX

```jsx
function Greeting({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <h1>Welcome back!</h1>
      ) : (
        <h1>Please sign in.</h1>
      )}
    </div>
  );
}

// Using && operator
function Notification({ messages }) {
  return (
    <div>
      {messages.length > 0 && (
        <p>You have {messages.length} unread messages.</p>
      )}
    </div>
  );
}
```

## Props and State

### Props (Properties)

Props are read-only data passed from parent to child:

```jsx
// Parent component
function App() {
  return (
    <div>
      <Welcome name="Alice" age={25} />
      <Welcome name="Bob" age={30} />
    </div>
  );
}

// Child component
function Welcome({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Age: {age}</p>
    </div>
  );
}

// Props with default values
function Button({ text = "Click me", variant = "primary" }) {
  return <button className={variant}>{text}</button>;
}

// Children prop
function Card({ children }) {
  return <div className="card">{children}</div>;
}

// Usage
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

### Props Destructuring

```jsx
// Without destructuring
function User(props) {
  return <div>{props.name} - {props.email}</div>;
}

// With destructuring
function User({ name, email }) {
  return <div>{name} - {email}</div>;
}

// With default values
function User({ name = "Guest", email = "No email" }) {
  return <div>{name} - {email}</div>;
}

// Rest props
function Button({ onClick, children, ...rest }) {
  return <button onClick={onClick} {...rest}>{children}</button>;
}
```

## Hooks

### useState - State Management

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// Multiple state variables
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
    </form>
  );
}

// State with objects
function UserProfile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  });

  const updateName = (name) => {
    setUser({ ...user, name });
  };

  return <div>{user.name}</div>;
}
```

### useEffect - Side Effects

```jsx
import { useState, useEffect } from 'react';

// Run once on mount
function Component() {
  useEffect(() => {
    console.log('Component mounted');
    
    return () => {
      console.log('Component unmounted');
    };
  }, []); // Empty dependency array
}

// Run when dependencies change
function User({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]); // Runs when userId changes

  return <div>{user?.name}</div>;
}

// Cleanup function
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>Seconds: {seconds}</div>;
}
```

### useContext - Global State

```jsx
import { createContext, useContext, useState } from 'react';

// Create context
const ThemeContext = createContext();

// Provider component
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// Consumer component
function Toolbar() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div className={theme}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### useRef - References

```jsx
import { useRef, useEffect } from 'react';

// Focus input on mount
function AutoFocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} />;
}

// Store mutable value without re-render
function Timer() {
  const intervalRef = useRef(null);
  const [seconds, setSeconds] = useState(0);

  const start = () => {
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
  };

  return (
    <div>
      <p>Seconds: {seconds}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### useMemo and useCallback - Optimization

```jsx
import { useState, useMemo, useCallback } from 'react';

// useMemo - memoize expensive calculations
function ExpensiveComponent({ items }) {
  const total = useMemo(() => {
    console.log('Calculating total...');
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]); // Only recalculate when items change

  return <div>Total: ${total}</div>;
}

// useCallback - memoize functions
function TodoList() {
  const [todos, setTodos] = useState([]);

  const addTodo = useCallback((text) => {
    setTodos(prev => [...prev, { id: Date.now(), text }]);
  }, []); // Function doesn't change

  return <TodoForm onAdd={addTodo} />;
}
```

## Event Handling

```jsx
// Click events
function Button() {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return <button onClick={handleClick}>Click me</button>;
}

// With arguments
function Button() {
  const handleClick = (id) => {
    console.log(`Button ${id} clicked`);
  };

  return <button onClick={() => handleClick(123)}>Click me</button>;
}

// Prevent default
function Form() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Submit</button>
    </form>
  );
}

// Input events
function Input() {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return <input value={value} onChange={handleChange} />;
}

// Multiple events
function Element() {
  return (
    <div
      onClick={() => console.log('Clicked')}
      onMouseEnter={() => console.log('Mouse entered')}
      onMouseLeave={() => console.log('Mouse left')}
    >
      Hover or click me
    </div>
  );
}
```

## Conditional Rendering

```jsx
// Using if-else
function Greeting({ isLoggedIn }) {
  if (isLoggedIn) {
    return <h1>Welcome back!</h1>;
  } else {
    return <h1>Please sign in.</h1>;
  }
}

// Using ternary operator
function Greeting({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? <h1>Welcome back!</h1> : <h1>Please sign in.</h1>}
    </div>
  );
}

// Using && operator
function Mailbox({ unreadMessages }) {
  return (
    <div>
      <h1>Hello!</h1>
      {unreadMessages.length > 0 && (
        <h2>You have {unreadMessages.length} unread messages.</h2>
      )}
    </div>
  );
}

// Rendering nothing
function Warning({ show }) {
  if (!show) {
    return null;
  }
  return <div className="warning">Warning!</div>;
}

// Switch-like logic
function Status({ status }) {
  const statusMessages = {
    loading: <p>Loading...</p>,
    error: <p>Error occurred</p>,
    success: <p>Success!</p>
  };

  return statusMessages[status] || <p>Unknown status</p>;
}
```

## Lists and Keys

```jsx
// Basic list
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

// With components
function UserList({ users }) {
  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

// With index (avoid if list can be reordered)
function List({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

// Filtering lists
function TodoList({ todos }) {
  const completedTodos = todos.filter(todo => todo.completed);
  
  return (
    <ul>
      {completedTodos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

## Forms

### Controlled Components

```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}

// Multiple inputs with one handler
function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />
      <button type="submit">Register</button>
    </form>
  );
}
```

### Form Validation

```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Form is valid', { email, password });
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
```

## React Router

### Installation

```bash
npm install react-router-dom
```

### Basic Routing

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Route Parameters

```jsx
import { useParams, useNavigate } from 'react-router-dom';

// Define route
<Route path="/user/:id" element={<UserProfile />} />

// Use in component
function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h1>User {id}</h1>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
}
```

## State Management

### Context API (Built-in)

```jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Usage
function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Zustand (External Library)

```bash
npm install zustand
```

```jsx
import create from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

function Counter() {
  const { count, increment, decrement, reset } = useStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## Best Practices

### Component Structure

```jsx
// Good: Small, focused components
function UserCard({ user }) {
  return (
    <div className="card">
      <Avatar url={user.avatar} />
      <UserInfo name={user.name} email={user.email} />
    </div>
  );
}

// Bad: One large component doing everything
function UserCard({ user }) {
  return (
    <div>
      {/* Hundreds of lines of code */}
    </div>
  );
}
```

### Prop Naming

```jsx
// Good: Clear, descriptive names
<Button onClick={handleClick} isDisabled={false} variant="primary" />

// Bad: Unclear abbreviations
<Button clk={handleClick} dis={false} v="p" />
```

### State Management

```jsx
// Good: State close to where it's used
function TodoList() {
  const [filter, setFilter] = useState('all');
  // Filter only used in this component
}

// Bad: Unnecessary global state
// Don't put everything in global state
```

### Performance

```jsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// Use useCallback for functions passed as props
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

### Code Organization

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   └── Input.jsx
│   └── features/
│       ├── UserProfile/
│       │   ├── UserProfile.jsx
│       │   ├── Avatar.jsx
│       │   └── UserInfo.jsx
│       └── TodoList/
│           ├── TodoList.jsx
│           ├── TodoItem.jsx
│           └── TodoForm.jsx
├── hooks/
│   ├── useAuth.js
│   └── useFetch.js
├── contexts/
│   └── AuthContext.jsx
├── utils/
│   └── helpers.js
└── App.jsx
```

## Next Steps

### Learning Resources

1. **Official React Documentation**: [react.dev](https://react.dev/)
2. **React Tutorial**: Interactive tutorial on official site
3. **Scrimba React Course**: Interactive video lessons
4. **Full Stack Open**: Free comprehensive course

### Practice Projects

1. **Todo App**: CRUD operations, filtering
2. **Weather App**: API integration, state management
3. **Blog**: Routing, dynamic content
4. **E-commerce**: Shopping cart, checkout flow
5. **Social Media Dashboard**: Real-time updates, complex UI

### Advanced Topics

- **TypeScript with React**: Type safety
- **Next.js**: Server-side rendering, static generation
- **Testing**: Jest, React Testing Library, Cypress
- **Performance Optimization**: Code splitting, lazy loading
- **State Management**: Redux, MobX, Recoil
- **Styling**: CSS Modules, Styled Components, Tailwind CSS
- **Forms**: Formik, React Hook Form
- **Data Fetching**: TanStack Query, SWR

### Popular Libraries

- **UI Components**: Material-UI, Ant Design, Chakra UI
- **Routing**: React Router
- **State**: Zustand, Redux Toolkit, Jotai
- **Forms**: React Hook Form, Formik
- **HTTP**: Axios, TanStack Query
- **Animation**: Framer Motion, React Spring
- **Charts**: Recharts, Victory

## Conclusion

React is a powerful library for building modern user interfaces. Start with the basics, practice building small components, and gradually explore more advanced concepts. The key to mastering React is consistent practice and building real projects.

Remember:
- Think in components
- Use hooks effectively
- Keep components simple and focused
- Follow React best practices
- Join the React community for support
- Build, build, build!

Happy coding!
<!-- /lang:en -->

<!-- lang:ru -->
# Начало работы с React

React — это JavaScript библиотека для создания пользовательских интерфейсов, особенно одностраничных приложений. Она была разработана Facebook и позволяет разработчикам создавать переиспользуемые UI компоненты.

## Содержание

1. [Почему React?](#почему-react)
2. [Предварительные требования](#предварительные-требования)
3. [Установка и настройка](#установка-и-настройка)
4. [Основы React](#основы-react)
5. [Компоненты](#компоненты)
6. [JSX - JavaScript XML](#jsx---javascript-xml)
7. [Props и State](#props-и-state)
8. [Хуки](#хуки)
9. [Обработка событий](#обработка-событий)
10. [Условный рендеринг](#условный-рендеринг)
11. [Списки и ключи](#списки-и-ключи)
12. [Формы](#формы)
13. [React Router](#react-router)
14. [Управление состоянием](#управление-состоянием)
15. [Лучшие практики](#лучшие-практики)
16. [Следующие шаги](#следующие-шаги)

## Почему React?

### Ключевые преимущества

- **Компонентный подход**: Создавайте инкапсулированные компоненты, которые управляют своим состоянием
- **Декларативный**: Проектируйте представления для каждого состояния приложения
- **Виртуальный DOM**: Эффективные обновления и рендеринг
- **Богатая экосистема**: Огромная коллекция библиотек и инструментов
- **Большое сообщество**: Активная поддержка сообщества и ресурсы
- **React Native**: Используйте React для создания мобильных приложений

### Когда использовать React

- Одностраничные приложения (SPA)
- Сложные интерактивные UI
- Проекты, требующие частых обновлений DOM
- Прогрессивные веб-приложения
- Мобильные приложения (с React Native)

## Предварительные требования

Перед началом работы с React вы должны быть знакомы с:

### Необходимые знания

- **HTML/CSS**: Базовая веб-разработка
- **JavaScript**: Возможности ES6+ (стрелочные функции, деструктуризация, модули)
- **npm/yarn**: Управление пакетами

### Рекомендуемые концепции JavaScript

```javascript
// Стрелочные функции
const greet = (name) => `Привет, ${name}!`;

// Деструктуризация
const { name, age } = user;
const [first, second] = array;

// Оператор spread
const newArray = [...oldArray, newItem];
const newObject = { ...oldObject, newProp: value };

// Шаблонные литералы
const message = `Пользователю ${name} ${age} лет`;

// Тернарный оператор
const result = condition ? valueIfTrue : valueIfFalse;

// Методы массивов
const doubled = numbers.map(n => n * 2);
const filtered = numbers.filter(n => n > 10);
```

## Установка и настройка

### Метод 1: Create React App (CRA)

Традиционный метод, все еще широко используется:

```bash
npx create-react-app my-app
cd my-app
npm start
```

### Метод 2: Vite (Рекомендуется)

Более быстрый инструмент сборки с лучшим опытом разработки:

```bash
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev
```

Для TypeScript:
```bash
npm create vite@latest my-react-app -- --template react-ts
```

### Метод 3: Next.js

Full-stack React фреймворк с серверным рендерингом:

```bash
npx create-next-app@latest my-next-app
cd my-next-app
npm run dev
```

### Структура проекта (Vite)

```
my-react-app/
├── node_modules/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Основы React

### Ваш первый компонент

```jsx
// src/App.jsx
function App() {
  return (
    <div>
      <h1>Привет, React!</h1>
      <p>Добро пожаловать в ваше первое React приложение.</p>
    </div>
  );
}

export default App;
```

### Точка входа

```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Компоненты

### Функциональные компоненты (Современный подход)

```jsx
// Простой компонент
function Welcome() {
  return <h1>Добро пожаловать!</h1>;
}

// Компонент с props
function Greeting({ name }) {
  return <h1>Привет, {name}!</h1>;
}

// Компонент со стрелочной функцией
const Button = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

export { Welcome, Greeting, Button };
```

### Композиция компонентов

```jsx
function UserCard({ user }) {
  return (
    <div className="card">
      <Avatar url={user.avatarUrl} />
      <UserInfo name={user.name} email={user.email} />
    </div>
  );
}

function Avatar({ url }) {
  return <img src={url} alt="Avatar" className="avatar" />;
}

function UserInfo({ name, email }) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}
```

## JSX - JavaScript XML

### Что такое JSX?

JSX — это расширение синтаксиса для JavaScript, которое выглядит похоже на HTML:

```jsx
// JSX
const element = <h1>Привет, мир!</h1>;

// Компилируется в JavaScript
const element = React.createElement('h1', null, 'Привет, мир!');
```

### Правила JSX

```jsx
// 1. Должен возвращать один корневой элемент
function Component() {
  return (
    <div>
      <h1>Заголовок</h1>
      <p>Параграф</p>
    </div>
  );
}

// Или используйте Fragment
function Component() {
  return (
    <>
      <h1>Заголовок</h1>
      <p>Параграф</p>
    </>
  );
}

// 2. Закрывайте все теги
<img src="image.jpg" />
<input type="text" />

// 3. Используйте camelCase для атрибутов
<div className="container" onClick={handleClick}>

// 4. JavaScript выражения в фигурных скобках
const name = "Иван";
<h1>Привет, {name}!</h1>
<p>{2 + 2}</p>
<p>{user.isAdmin ? 'Админ' : 'Пользователь'}</p>
```

## Props и State

### Props (Свойства)

Props — это данные только для чтения, передаваемые от родителя к потомку:

```jsx
// Родительский компонент
function App() {
  return (
    <div>
      <Welcome name="Алиса" age={25} />
      <Welcome name="Боб" age={30} />
    </div>
  );
}

// Дочерний компонент
function Welcome({ name, age }) {
  return (
    <div>
      <h1>Привет, {name}!</h1>
      <p>Возраст: {age}</p>
    </div>
  );
}

// Props со значениями по умолчанию
function Button({ text = "Нажми меня", variant = "primary" }) {
  return <button className={variant}>{text}</button>;
}

// Prop children
function Card({ children }) {
  return <div className="card">{children}</div>;
}

// Использование
<Card>
  <h2>Заголовок</h2>
  <p>Содержимое</p>
</Card>
```

## Хуки

### useState - Управление состоянием

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Счетчик: {count}</p>
      <button onClick={() => setCount(count + 1)}>Увеличить</button>
      <button onClick={() => setCount(count - 1)}>Уменьшить</button>
      <button onClick={() => setCount(0)}>Сбросить</button>
    </div>
  );
}

// Несколько переменных состояния
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
    </form>
  );
}
```

### useEffect - Побочные эффекты

```jsx
import { useState, useEffect } from 'react';

// Запустить один раз при монтировании
function Component() {
  useEffect(() => {
    console.log('Компонент смонтирован');
    
    return () => {
      console.log('Компонент размонтирован');
    };
  }, []); // Пустой массив зависимостей
}

// Запустить при изменении зависимостей
function User({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]); // Запускается при изменении userId

  return <div>{user?.name}</div>;
}
```

## Лучшие практики

### Структура компонентов

```jsx
// Хорошо: Небольшие, сфокусированные компоненты
function UserCard({ user }) {
  return (
    <div className="card">
      <Avatar url={user.avatar} />
      <UserInfo name={user.name} email={user.email} />
    </div>
  );
}
```

### Организация кода

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   └── Input.jsx
│   └── features/
│       ├── UserProfile/
│       └── TodoList/
├── hooks/
│   ├── useAuth.js
│   └── useFetch.js
├── contexts/
│   └── AuthContext.jsx
└── App.jsx
```

## Следующие шаги

### Ресурсы для обучения

1. **Официальная документация React**: [react.dev](https://react.dev/)
2. **React Tutorial**: Интерактивный туториал на официальном сайте
3. **Курсы**: Scrimba React Course, Full Stack Open

### Практические проекты

1. **Todo приложение**: CRUD операции, фильтрация
2. **Погодное приложение**: Интеграция API, управление состоянием
3. **Блог**: Маршрутизация, динамический контент
4. **E-commerce**: Корзина покупок, оформление заказа
5. **Социальная сеть**: Обновления в реальном времени, сложный UI

### Продвинутые темы

- **TypeScript с React**: Типобезопасность
- **Next.js**: Серверный рендеринг, статическая генерация
- **Тестирование**: Jest, React Testing Library
- **Оптимизация производительности**: Разделение кода, ленивая загрузка
- **Управление состоянием**: Redux, MobX, Zustand
- **Стилизация**: CSS Modules, Styled Components, Tailwind CSS

## Заключение

React — мощная библиотека для создания современных пользовательских интерфейсов. Начните с основ, практикуйтесь в создании небольших компонентов и постепенно изучайте более продвинутые концепции.

Помните:
- Думайте компонентами
- Эффективно используйте хуки
- Держите компоненты простыми и сфокусированными
- Следуйте лучшим практикам React
- Присоединяйтесь к сообществу React
- Практикуйтесь, практикуйтесь, практикуйтесь!

Удачного кодирования!
<!-- /lang:ru -->
