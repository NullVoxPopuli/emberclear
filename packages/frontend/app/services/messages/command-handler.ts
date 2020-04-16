import Service from '@ember/service';

class TextCommand {
  name!: string;
  aliases!: string[];
  params!: string[];
  execute!: (args: string[] | void) => void;

  constructor(
    name: string,
    aliases: string[],
    params: string[],
    execute: (args: string[] | void) => void
  ) {
    this.name = name;
    this.aliases = aliases;
    this.params = params;
    this.execute = execute;
  }

  helpString(): string {
    let commandString = '';
    this.aliases.forEach((alias) => {
      commandString += '(' + alias + ') ';
    });
    commandString += this.name;
    this.params.forEach((parameter) => {
      commandString += ' ';
      commandString += '[' + parameter + ']';
    });
    commandString += '\n';
    return commandString;
  }
}

export default class CommandHandler extends Service {
  commands: TextCommand[] = [
    new TextCommand('state', ['s'], [], this.printState),
    new TextCommand('add-member', ['a'], ['user'], this.addMember),
    new TextCommand('remove-member', ['r'], ['user'], this.removeMember),
    new TextCommand('promote-member', ['p'], ['user'], this.changeAdmin),
    new TextCommand('vote', ['v'], ['vote', 'choice'], this.vote),
    new TextCommand('cancel-vote', ['cv'], ['vote'], this.cancelVote),
    new TextCommand('change-user-context-admin', ['ucp'], ['user'], this.changeUserContextAdmin),
    new TextCommand(
      'change-user-context-add-member',
      ['uca'],
      ['user'],
      this.changeUserContextAddMember
    ),
    new TextCommand(
      'change-user-context-remove-member',
      ['ucr'],
      ['user'],
      this.changeUserContextRemoveMember
    ),
    new TextCommand('view-user-context', ['ucv'], ['user'], this.viewUserContext),
  ];

  //TODO: get the author and channel of the command
  parseCommand(text: string) {
    const args = text.slice(1).trim().split(/ +/g);
    const command = args.shift();

    if (command === undefined) {
      this.showHelp('No command provided.');
      return;
    }

    for (let textCommand of this.commands) {
      if (textCommand.name === command || textCommand.aliases.includes(command!)) {
        this.handleCommand(textCommand, args);
        return;
      }
    }

    this.showHelp('Command not found.');
  }

  handleCommand(textCommand: TextCommand, args: string[]): void {
    let paramCount = 0;
    textCommand.params.forEach((_param) => {
      paramCount++;
    });
    if (args.length !== paramCount) {
      this.showHelp('Incorrect parameters. Expected ' + paramCount + ', got ' + args.length);
      return;
    }
    textCommand.execute(args);
  }

  printState(): void {
    //TODO
  }

  addMember(_args: string[]): void {
    //TODO
  }

  removeMember(_args: string[]): void {
    //TODO
  }

  changeAdmin(_args: string[]): void {
    //TODO
  }

  vote(_args: string[]): void {
    //TODO
  }

  changeUserContextAdmin(_args: string[]): void {
    //TODO
  }

  changeUserContextAddMember(_args: string[]): void {
    //TODO
  }

  changeUserContextRemoveMember(_args: string[]): void {
    //TODO
  }

  viewUserContext(_args: string[]): void {
    //TODO
  }

  cancelVote(_args: string[]): void {
    //TODO
  }

  reset(): void {
    //TODO
  }

  showHelp(error: string): void {
    // TODO replace with system message
    let helpString = 'Error: ' + error + '\n';
    this.commands.forEach((textCommand) => {
      helpString += textCommand.helpString();
    });
    alert(helpString);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/command-handler': CommandHandler;
  }
}
