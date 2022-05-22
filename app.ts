import express = require('express');
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose = require('mongoose');
import dotenv = require('dotenv');
import morgan = require('morgan');
import path = require('path');
import { Application, Request, Response, NextFunction } from 'express';
import { router as userRouter } from './routes/userRoute';
import { postRouter } from './routes/postRoute';
import { commentRouter } from './routes/commentRoute';
import { conversationRouter } from './routes/conversationRoute';
import { messageRouter } from './routes/messageRoute';
import { errorController } from './controller/errorController';
import { AppError } from './utils/appError';
import { InMemorySessionStore } from './store/sessionStore';

const sessionStore = new InMemorySessionStore();
console.log(sessionStore);

interface User {
  readonly _id: string;
}

export interface ClientToServerEvents {
  privateMessage: ({
    content,
    to,
    from
  }: {
    content: string;
    to: User;
    from: object;
  }) => void;
}

export interface ServerToClientEvents {
  userConnected: (data: object) => void;
  session: (data: object) => void;
  users: (...data: any[]) => void;
  privateMessage: ({
    content,
    to,
    from
  }: {
    content: string;
    to: object;
    from: object;
  }) => void;
  userDisconnected: (data: string) => void;
}

export interface SocketData {
  sessionId?: string;
  userId?: string;
  _id?: string;
  username?: string;
  connected: boolean;
}

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    autoIndex: false
  })
  .then(() => console.log('Database Connected Successfully'))
  .catch(err => console.log(err));

const app: Application = express();
const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>(httpServer, {
  cors: {
    origin: ['http://localhost:3000']
  }
});
app.enable('trust proxy');
const port = process.env.PORT || 8000;
app.options('*', cors<Request>());
app.use(cors<Request>());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join('public', 'images')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/conversations', conversationRouter);
app.use('/api/messages', messageRouter);

app.use(errorController);
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

io.use((socket, next) => {
  const sessionId = socket.handshake.auth._id;
  if (sessionId) {
    const session = sessionStore.findSession(sessionId);
    if (session) {
      socket.data.sessionId = sessionId;
      socket.data.userId = session.userId;
      socket.data._id = session.userId;
      socket.data.username = session.username;
      return next();
    }
  }

  socket.data.sessionId = socket.handshake.auth._id;
  socket.data.userId = socket.handshake.auth.userId;
  socket.data.username = socket.handshake.auth.username;
  socket.data._id = socket.handshake.auth._id;
  if (!sessionId) {
    return next(new AppError('Trouble connecting. Please reload', 400));
  }
  next();
});

io.on('connection', async socket => {
  sessionStore.saveSession(socket.data.sessionId!, {
    userId: socket.data.userId,
    username: socket.data.username,
    connected: true
  });

  socket.emit('session', {
    sessionId: socket.data.sessionId,
    userId: socket.data.userId
  });

  socket.join(socket.data.userId!);

  const users: any[] = [];

  sessionStore.findAllSessions().forEach(session => {
    users.push({
      userId: session.userId,
      username: session.username,
      connected: session.connected
    });
  });

  socket.emit('users', users);
  socket.broadcast.emit('userConnected', {
    _id: socket.data.userId,
    connected: true
  });

  socket.on('privateMessage', ({ content, to, from }) => {
    socket.to(to._id).to(socket.data.userId!).emit('privateMessage', {
      content: content,
      to,
      from
    });
  });

  socket.on('disconnect', async () => {
    const matchingSockets = await io.in(socket.data.userId!).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      socket.broadcast.emit('userDisconnected', socket.data.userId!);

      sessionStore.saveSession(socket.data.sessionId!, {
        userId: socket.data.userId,
        username: socket.data.username,
        connected: false
      });
    }
  });
});

httpServer.listen(port, () => {
  console.log(`listening on port ${port}`);
});

export default app;
