# PokerGame - Plataforma de Poker Online

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs) ![Express](https://img.shields.io/badge/Express-5.1.0-000000?logo=express) ![MongoDB](https://img.shields.io/badge/MongoDB-8.18.3-47A248?logo=mongodb) ![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-010101?logo=socketdotio) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?logo=vite)

Sistema de poker multiplayer en tiempo real con arquitectura de microservicios.

## Arquitectura

```
pokergame_front          → Frontend del jugador (React + TypeScript + Vite)
pokergame_front_admin    → Panel de administración
pokergame_auth           → API de autenticación de usuarios
pokergame_auth_admin     → API de autenticación de administradores
pokergame_logic_admin    → API de lógica del juego + WebSocket (Socket.io)
pokergame_pay            → API de gestión de pagos (PayIn/PayOut)
```

## Funcionalidades

### Jugadores
- Autenticación con JWT (registro, login, logout)
- Unirse a mesas de poker en tiempo real
- Sistema de apuestas con comunicación via WebSocket
- Gestión de dinero: ingresos y reintegros
- Vista visual de mesa de poker con cartas comunitarias

### Administradores
- Panel de control para gestión de usuarios
- Creación y administración de mesas
- Control de sesiones de juego
- Gestión de transacciones de pago

## Tecnologías

### Frontend
- **React 19** con TypeScript
- **Vite** como bundler
- **Socket.io-client** para comunicación en tiempo real
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **date-fns** para manipulación de fechas

### Backend
- **Node.js** con **Express 5**
- **MongoDB** con **Mongoose**
- **Socket.io** para comunicación en tiempo real
- **JWT** para autenticación
- **bcrypt** para hashing de contraseñas

### Deployment
- Compatible con **Vercel** (configuración incluida en frontends)

## Inicio Rápido

### Requisitos
- Node.js 18+
- MongoDB (local o Atlas)

### Backend

```bash
# Autenticación jugadores
cd pokergame_auth && npm install && npm run dev

# Autenticación administradores
cd pokergame_auth_admin && npm install && npm run dev

# Lógica del juego (con Socket.io)
cd pokergame_logic_admin && npm install && npm run dev

# API de pagos
cd pokergame_pay && npm install && npm run dev
```

### Frontend

```bash
# Frontend jugadores
cd pokergame_front && npm install && npm run dev

# Panel administración
cd pokergame_front_admin && npm install && npm run dev
```

## Estructura de un Microservicio Backend

```
src/
├── config/
│   └── db.js           # Conexión a MongoDB
├── controllers/        # Lógica de negocio
├── models/             # Modelos Mongoose
├── routes/             # Rutas Express
└── app.js              # Configuración principal
```

## Estructura de un Microservicio Frontend

```
src/
├── components/         # Componentes React
├── assets/             # Recursos estáticos
├── types.ts            # Definiciones TypeScript
├── socket.ts           # Configuración Socket.io
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada
```

## Modelo de Datos

### User
- id, username, password (hash), balance

### Admin
- id, username, password (hash)

### Table
- id, name, stakes, maxPlayers, activePlayers

### Game
- id, table, players[], winner, pot

### PayIn / PayOut
- id, user, amount, cardNumber, notes, timestamp

## Seguridad

- Contraseñas hasheadas con **bcrypt**
- Autenticación mediante **JWT**
- Middleware de autenticación en rutas protegidas
- Variables de entorno para datos sensibles (`.env`)

## Anexos
Puedes encontrar la web en este enlaca:

https://pokerface-three.vercel.app/

Puedes encontrar el repositorio del Back-End:

https://github.com/WilmerJr01/WebSocket
