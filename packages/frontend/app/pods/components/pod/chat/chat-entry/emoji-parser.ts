const emojiDict = new Map([
    [":partyparrot:", "'(\\(0>0)/)'"] // TODO: use gif
]);

export default class EmojiParser {

    parseEmoji(message: string): string {
        let emojiRegex = /:.*:/gi;
        let matches = message.match(emojiRegex);
        let emojifiedMessage : string = message;
    
        if (matches !== null) {
            matches.forEach(match => {
                let emoji = emojiDict.get(match);
                if (emoji !== undefined) {
                    emojifiedMessage = emojifiedMessage.replace(match, emoji);
                }
            });
        }
        
        return emojifiedMessage;
    }
}