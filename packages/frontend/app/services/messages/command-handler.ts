import Service from '@ember/service';

export default class CommandHandler extends Service {

    handleCommand(text: String) {
        const args = text.slice(1).trim().split(/ +/g);
        const command = args[0];
        // TODO channel
        // const channel = message.channel.name;
        // TODO author
        // const author = message.author;

        if (command === "state" || command === "s") {
        // TODO 
        } 

        else if (command === "add-member" || command === "a") {
        // TODO
        }

        else if (command === "remove-member" || command === "r") {
        // TODO
        }

        else if (command === "change-admin" || command === "p") {
        // TODO
        }

        else if (command === "vote" || command === "v") {
        // TODO
        }

        else if (command === "change-user-context-admin"  || command === "ucp") {
        // TODO
        }

        else if (command === "change-user-context-add-member" || command === "uca") {
        // TODO
        }

        else if (command === "change-user-context-remove-member" || command === "ucr") {
        // TODO
        }

        else if (command === "view-user-context" || command === "ucv") {
        // TODO
        }
        
        else if (command === "cancel-vote" || command === "cv") {
        // TODO
        }

        else if (command === "reset" || command === "rs") {
        // TODO
        }

        else if (command === "sync-discord-roles" || command === "d") {
        // TODO
        }
        
        else {
        // TODO help message
        }
    }
    
}