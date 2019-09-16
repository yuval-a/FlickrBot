
/* This bot will show 5 random photos from Flickr on cards with some info.
 * You may click on a "Description" button to see the description of a photo.
 * Click "More from this author" to get 5 more photos from the same author.
 * This is an assignment for LeO. */

const { ActivityHandler } = require('botbuilder');
const { MessageFactory } = require('botbuilder');

class FlickrBot extends ActivityHandler {
    /**
     * @param {ConversationState} conversationState
     * @param {Dialog} dialog
     */
    constructor(conversationState, dialog) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await this.dialog.run(context, this.dialogState)
                }
            }
        });

        this.onMessage(async (context, next) => {
            // If this is a card action message (button on card clicked)
            if (context.activity.channelData.hasOwnProperty("messageBack")) {
                var value = context.activity.value;
                switch (value.action) {
                    case "author_more":
                        this.dialogState.authorId = value.author_id;
                        await this.dialog.run(context, this.dialogState);
                        break;
                    case "photo_description":
                        const description = MessageFactory.text(value.text);
                        await context.sendActivity(description);
                }
            }

            // Need to find better way to get choices prompt results 
            if (context.activity.text == "1" || context.activity.text == "2") {
                await this.dialog.run(context, this.dialogState);
            }

            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await next();
        });
    }
}

module.exports = FlickrBot;
