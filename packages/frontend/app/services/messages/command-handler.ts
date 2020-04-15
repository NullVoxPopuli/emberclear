import Service from '@ember/service';

class TextCommand {
  names!: string[];
  params!: string[];
  execute!: (args: string[] | void) => void;

  toString(): string {
    let commandString = '';
    this.names.slice(1).forEach((alias) => {
      commandString += '(' + alias + ') ';
    });
    commandString += this.names.objectAt(0);
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
    {
      names: ['state', 's'],
      params: [],
      execute: this.printState,
    },
    {
      names: ['add-member', 'a'],
      params: ['user'],
      execute: this.addMember,
    },
    {
      names: ['remove-member', 'r'],
      params: ['user'],
      execute: this.removeMember,
    },
    {
      names: ['promote-member', 'p'],
      params: ['user'],
      execute: this.changeAdmin,
    },
    {
      names: ['vote', 'v'],
      params: ['vote', 'choice'],
      execute: this.vote,
    },
    {
      names: ['cancel-vote', 'cv'],
      params: ['vote'],
      execute: this.cancelVote,
    },
    {
      names: ['change-user-context-admin', 'ucp'],
      params: ['user'],
      execute: this.changeUserContextAdmin,
    },
    {
      names: ['change-user-context-add-member', 'uca'],
      params: ['user'],
      execute: this.changeUserContextAddMember,
    },
    {
      names: ['change-user-context-remove-member', 'ucr'],
      params: ['user'],
      execute: this.changeUserContextRemoveMember,
    },
    {
      names: ['view-user-context', 'ucv'],
      params: ['user'],
      execute: this.viewUserContext,
    },
  ];

  //TODO: get the author and channel of the command
  parseCommand(text: string) {
    const args = text.slice(1).trim().split(/ +/g);
    const command = args.pop();

    if (command === undefined) {
      this.showHelp('No command provided.');
      return;
    }

    this.commands.forEach((textCommand) => {
      if (textCommand.names.includes(command!)) {
        let paramCount = 0;
        textCommand.params.forEach((_param) => {
          paramCount++;
        });
        if (args.length !== paramCount) {
          this.showHelp('Incorrect parameters. Expected ' + paramCount + ', got ' + args.length);
        }
        textCommand.execute(args);
        return;
      }
    });

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
      helpString += textCommand.toString;
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
