"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const http_1 = __importDefault(require("http"));
const os_1 = require("os");
const process_1 = __importDefault(require("process"));
const sticky_1 = require("@socket.io/sticky");
const numCPUs = (0, os_1.cpus)().length;
if (cluster_1.default.isPrimary) {
    console.log(`Primary ${process_1.default.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster_1.default.fork();
    });
}
else {
    console.log(`Worker ${process_1.default.pid} started`);
    const httpServer = http_1.default.createServer();
    (0, sticky_1.setUpMaster)(httpServer, {
        loadBalancingMethod: 'least-connection'
    });
}
//# sourceMappingURL=cluster.js.map