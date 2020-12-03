"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = require("readline");
const nats_1 = __importDefault(require("nats"));
const ramda_1 = __importStar(require("ramda"));
const command_1 = require("./command");
const tryParse = ramda_1.tryCatch(text => JSON.parse(text), ramda_1.always(null));
const { NATS_URI = 'nats://127.0.0.1:4222', NATS_REQ_TIMEOUT = 2000 } = process.env;
const connection = nats_1.default.connect(NATS_URI, { json: true });
connection.on('close', () => {
    console.error('nats closed connection');
    process.exit(1);
});
const app = readline_1.createInterface(process.stdin, process.stdout, undefined, true);
const handleLine = async (value) => {
    const [command, subject, ...payload] = ramda_1.default.split(' ', value);
    const message = tryParse(ramda_1.default.join('', payload));
    if (command_1.compareCommand(command_1.Command.PUBLISH, command)) {
        return await new Promise(resolve => connection.publish(subject, message, resolve));
    }
    else if (command_1.compareCommand(command_1.Command.REQUEST, command)) {
        const response = await new Promise(resolve => {
            connection.requestOne(subject, NATS_REQ_TIMEOUT, message, resolve);
        });
        return process.stdout.write(`${JSON.stringify(response)}\n`);
    }
    else if (command_1.compareCommand(command_1.Command.SUBSCRIBE, command)) {
        connection.subscribe(subject, (message) => process.stdout.write(`${subject} = ${JSON.stringify(message)}\n`));
    }
    else {
        return process.stdout.write(`commands for usage: ${command_1.getCommandsJSON()}\n`);
    }
};
app.on('SIGINT', (code) => process.exit(code));
app.on('line', handleLine);
