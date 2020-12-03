"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareCommand = exports.getCommandsJSON = exports.Command = void 0;
const ramda_1 = __importDefault(require("ramda"));
var Command;
(function (Command) {
    Command["SUBSCRIBE"] = "SUB";
    Command["PUBLISH"] = "PUB";
    Command["REQUEST"] = "REQ";
})(Command = exports.Command || (exports.Command = {}));
;
const getCommandsJSON = () => JSON.stringify(ramda_1.default.values(Command));
exports.getCommandsJSON = getCommandsJSON;
const compareCommand = (command, value) => {
    return ramda_1.default.equals(ramda_1.default.toLower(value), ramda_1.default.toLower(command));
};
exports.compareCommand = compareCommand;
