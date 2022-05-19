"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const userRoute_1 = require("./routes/userRoute");
const postRoute_1 = require("./routes/postRoute");
const commentRoute_1 = require("./routes/commentRoute");
const conversationRoute_1 = require("./routes/conversationRoute");
const messageRoute_1 = require("./routes/messageRoute");
const errorController_1 = require("./controller/errorController");
const appError_1 = require("./utils/appError");
const sessionStore_1 = require("./store/sessionStore");
const sessionStore = new sessionStore_1.InMemorySessionStore();
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
    .connect(DB, {
    autoIndex: false
})
    .then(() => console.log('Database Connected Successfully'))
    .catch(err => console.log(err));
const app = express();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000']
    }
});
app.enable('trust proxy');
const port = process.env.PORT || 8000;
app.options('*', (0, cors_1.default)());
app.use((0, cors_1.default)());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join('public', 'images')));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use('/api/users', userRoute_1.router);
app.use('/api/posts', postRoute_1.postRouter);
app.use('/api/comments', commentRoute_1.commentRouter);
app.use('/api/conversations', conversationRoute_1.conversationRouter);
app.use('/api/messages', messageRoute_1.messageRouter);
app.use(errorController_1.errorController);
app.all('*', (req, res, next) => {
    next(new appError_1.AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
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
        return next(new appError_1.AppError('Trouble connecting. Please reload', 400));
    }
    next();
});
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    sessionStore.saveSession(socket.data.sessionId, {
        userId: socket.data.userId,
        username: socket.data.username,
        connected: true
    });
    socket.emit('session', {
        sessionId: socket.data.sessionId,
        userId: socket.data.userId
    });
    socket.join(socket.data.userId);
    const users = [];
    sessionStore.findAllSessions().forEach(session => {
        users.push({
            userId: session.userId,
            username: session.username,
            connected: session.connected
        });
    });
    socket.emit('users', users);
    socket.broadcast.emit('userConnected', {
        userId: socket.data.userId,
        connected: true
    });
    socket.on('privateMessage', ({ content, to, from }) => {
        socket.to(to._id).to(socket.data.userId).emit('privateMessage', {
            content: content,
            to,
            from
        });
    });
    socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
        const matchingSockets = yield io.in(socket.data.userId).allSockets();
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
            socket.broadcast.emit('userDisconnected', socket.data.userId);
            sessionStore.saveSession(socket.data.sessionId, {
                userId: socket.data.userId,
                username: socket.data.username,
                connected: false
            });
        }
    }));
}));
httpServer.listen(port, () => {
    console.log(`listening on port ${port}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map