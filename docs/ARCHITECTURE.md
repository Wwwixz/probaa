# Архитектура фронтенда

Стек: **Astro + React + TypeScript + Tailwind CSS**.

## Контекст проекта

Хакатон-проект на основе MCP (Model Context Protocol) — сервис для
путешественников. Фронтенд реализует UI по Figma-макетам; интеграция с
MCP-инструментами (ИИ-агент, tool calls) закладывается на уровне формата
сообщений чата, но не реализуется, пока не определено конкретное
направление.

## Общий подход

Astro используется в режиме, близком к SPA: включён `ClientRouter`
(`astro:transitions`), поэтому переходы между страницами не перезагружают
документ и не рвут клиентское состояние (WebSocket-соединение чата,
авторизацию и т.д.).

Постоянные вещи — соединение чата, стор авторизации, нижняя навигация —
живут в React-острове уровня layout (`AppShell`), а не пересоздаются на
каждой странице.

## Структура папок

```
src/
  pages/              # маршруты Astro (тонкие обёртки)
    login.astro
    login/forgot.astro
    login/forgot/code.astro
    index.astro
    article/[id].astro
    chats/index.astro
    chats/[id].astro
    map.astro
    ai-agent.astro

  layouts/
    AppLayout.astro     # базовый layout, ClientRouter, глобальные стили

  widgets/              # крупные составные блоки
    bottom-nav/
    chat-thread/
    content-feed/

  features/             # функциональность конкретных экранов
    auth/
      LoginForm.tsx
      ForgotPasswordForm.tsx
      OtpCodeInput.tsx
    ai-agent/
    chat/
    articles/

  entities/              # доменные сущности и хуки данных
    user/
    article/
    hotel/
    message/

  shared/
    ui/                  # атомы дизайн-системы (Card, Button, Input, ...)
    api/                 # единая точка сетевых запросов + моки (MSW)
    lib/                 # хелперы

  assets/
    images/               # статичные изображения (фоны и т.п.)
```

## Гидратация React-островов

- `client:load` — компоненты, нужные сразу: формы авторизации, чат,
  ИИ-агент, нижняя навигация.
- `client:visible` — тяжёлые виджеты, не нужные в первом кадре
  (например, карта).

## Работа с данными

Весь сетевой слой проходит через `shared/api/client.ts` и хуки в
`entities/*`. На этапе, пока нет бэкенда, запросы перехватываются MSW —
переключение на реальный API выполняется заменой базового URL и, при
необходимости, парсинга ответа, без изменений в компонентах.

## Состояние

| Тип данных | Инструмент |
|---|---|
| Авторизация | Zustand-стор в `AppShell` |
| Данные с сервера (статьи, отели) | React Query |
| Сообщения чата | Zustand-стор + подписка на WebSocket |
| UI-состояние экрана | `useState` локально |
