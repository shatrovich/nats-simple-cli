import R from 'ramda';

export enum Command {
    SUBSCRIBE = "SUB",
    PUBLISH = "PUB",
    REQUEST = "REQ",
};

export const getCommandsJSON = () => JSON.stringify(R.values(Command));

export const compareCommand = <T extends Command>(command: T, value: string): value is T => {
    return R.equals(R.toLower(value), R.toLower(command));
}
