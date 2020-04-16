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
        let paramCount = 0;
        textCommand.params.forEach((_param) => {
          paramCount++;
        });
        if (args.length !== paramCount) {
          this.showHelp('Incorrect parameters. Expected ' + paramCount + ', got ' + args.length);
          return;
        }
        textCommand.execute(args);
        return;
      }
    }

    this.showHelp('Command not found.');
  }

  printState(): void {
    alert('Viewing state.');
  }

  addMember(args: string[]): void {
    alert('Adding member ' + args[0]);
  }

  removeMember(args: string[]): void {
    alert('Removing member ' + args[0]);
  }

  changeAdmin(args: string[]): void {
    alert('Promoting member ' + args[0]);
  }

  vote(args: string[]): void {
    alert('Voting ' + args[1] + ' for vote ' + args[0]);
  }

  changeUserContextAdmin(args: string[]): void {
    alert('Changing admin to ' + args[0]);
  }

  changeUserContextAddMember(args: string[]): void {
    alert('Adding member ' + args[0]);
  }

  changeUserContextRemoveMember(args: string[]): void {
    alert('Removing member ' + args[0]);
  }

  viewUserContext(args: string[]): void {
    alert('Viewing user ' + args[0] + "'s context");
  }

  cancelVote(args: string[]): void {
    alert('Cancelling vote ' + args[0]);
  }

  reset(): void {
    alert('Resetting channel.');
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
