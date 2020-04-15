import Service from '@ember/service';

export default class CommandHandler extends Service {
  handleCommand(text: string) {
    const args = text.slice(1).trim().split(/ +/g);
    const command = args[0];

    // TODO channel
    // const channel = message.channel.name;

    // TODO author
    // const author = message.author;

    if (command === "state" || command === "s") {
      this.printState();
    } 

    else if (command === "add-member" || command === "a") {
      this.addMember();
    }

    else if (command === "remove-member" || command === "r") {
      this.removeMember();
    }

    else if (command === "change-admin" || command === "p") {
      this.changeAdmin();
    }

    else if (command === "vote" || command === "v") {
      this.vote();
    }

    else if (command === "change-user-context-admin"  || command === "ucp") {
      this.changeUserContextAdmin();
    }

    else if (command === "change-user-context-add-member" || command === "uca") {
      this.changeUserContextAddMember();
    }

    else if (command === "change-user-context-remove-member" || command === "ucr") {
      this.changeUserContextRemoveMember();
    }

    else if (command === "view-user-context" || command === "ucv") {
      this.viewUserContext();
    }

    else if (command === "cancel-vote" || command === "cv") {
      this.cancelVote();
    }

    else if (command === "reset" || command === "rs") {
      this.reset();
    }

    else {
      this.showHelp();
    }
  }

  printState() {
    // TODO
  }

  addMember() {
    // TODO
  }

  removeMember() {
    // TODO
  }

  changeAdmin() {
    // TODO
  }

  vote() {
    // TODO
  }

  changeUserContextAdmin() {
    // TODO
  }

  changeUserContextAddMember() {
    // TODO
  }

  changeUserContextRemoveMember() {
    // TODO
  }

  viewUserContext() {
    // TODO
  }

  cancelVote() {
    // TODO
  }

  reset() {
    // TODO
  }

  showHelp() {
    // TODO replace with system message
    const commands = [
      "(t) test",
      "(s) state",
      "(a) add-member [user] [role]",
      "(r) remove-member [user] [role]",
      "(p) change-admin [user] [role]",
      "(v) vote [yes/no] <user>",
      "(c) create-channel [role]",
      "(cv) cancel-vote",
      "(ucp) change-user-context-admin [user] [role]",
      "(uca) change-user-context-add-user [user] [role]",
      "(ucr) change-user-context-remove-user [user] [role]",
      "(ucv) view-user-context [user] [role]",
      "(rs) reset",
      "(d) sync-discord-roles [user]"
    ];
    alert(commands.join('\n'));
  }
}
