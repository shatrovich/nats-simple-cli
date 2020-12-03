import { createInterface } from 'readline';

import nats from 'nats';
import R, { always, tryCatch } from 'ramda';

import { getCommandsJSON, Command, compareCommand } from './command';

const tryParse = tryCatch(text => JSON.parse(text), always(null));

const { NATS_URI = 'nats://127.0.0.1:4222', NATS_REQ_TIMEOUT = 2000 } = process.env;

const connection = nats.connect(NATS_URI, { json: true });

connection.on('close', () => {
    console.error('nats closed connection');

    process.exit(1);
});

const app = createInterface(process.stdin, process.stdout, undefined, true);

const handleLine = async (value: string) => {
    const [command, subject, ...payload] = R.split(' ', value);

    const message = tryParse(R.join('', payload));

    if (compareCommand(Command.PUBLISH, command)) {
        return await new Promise(resolve => connection.publish(subject, message, resolve));
    } else if (compareCommand(Command.REQUEST, command)) {
        const response = await new Promise(resolve => {
            connection.requestOne(subject, NATS_REQ_TIMEOUT, message, resolve);
        });
        return process.stdout.write(`${JSON.stringify(response)}\n`);
    } else if (compareCommand(Command.SUBSCRIBE, command)) {
        connection.subscribe(subject, (message: any) =>
            process.stdout.write(`${subject} = ${JSON.stringify(message)}\n`));
    } else {
        return process.stdout.write(`commands for usage: ${getCommandsJSON()}\n`);
    }
}

app.on('SIGINT', (code: number) => process.exit(code));

app.on('line', handleLine);
