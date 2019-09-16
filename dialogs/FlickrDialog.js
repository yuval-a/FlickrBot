// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { ChoicePrompt, ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');
const AdaptiveCard = require('../resources/adaptiveCard.json');

const FlickrCard = require('../utils/FlickrCard');
const flickr = require('../utils/FlickrAPI');
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class FlickrDialog extends ComponentDialog {
    constructor() {
        super('FlickrDialog');

        // Define the main dialog and its related components.
        this.addDialog(new ChoicePrompt('whatsNextPrompt'));
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.choiceStep.bind(this)
        ]));
        // The initial child Dialog to run.
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        console.log ("DIALOG RESULTS");
        console.dir (results, {depth:null});
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async showAuthorPhotos(stepContext, authorId) {
        let photos, attachments = [];
        photos = await flickr.getAuthorPhotos(authorId, 5);
        for (let photo of photos) attachments.push(FlickrCard(photo));
        await stepContext.context.sendActivity({ attachments: attachments });
        const options = {
            prompt: "What's next?",
            retryPrompt: "That was not a valid choice...",
            choices: ["More from this author...", "New photos"]
        };
        await stepContext.ret
        return await stepContext.prompt('whatsNextPrompt', options);
    }

    /**
     * Show 5 initial random photos, or 5 photos from the same author
     * @param {WaterfallStepContext} stepContext
     */
    async initialStep(stepContext) {
        console.log('MainDialog.initialStep');
        if (stepContext.context.activity.type == "message" && 
            stepContext.context.activity.value &&
            stepContext.context.activity.value.action == "author_more") {
            // Get 5 photos from the same author
            return this.showAuthorPhotos(stepContext, stepContext.context.activity.value.author_id);
        }
        else {
            let photos, attachments = [];
            // Get inital 5 photos
            photos = await flickr.getRandomPhotos(5);
            for (let photo of photos) attachments.push(FlickrCard(photo));
            await stepContext.context.sendActivity({ attachments: attachments });
            return await stepContext.endDialog();    
        }
    }

    async choiceStep(stepContext) {
        console.log ("MainDialog.choiceStep");
        console.dir (stepContext, {depth:null});
        if (stepContext.context.activity &&
            stepContext.context.activity.type == "message" && 
            stepContext.context.activity.text) {
            let choice = stepContext.context.activity.text;
            switch (choice) {
                case "1": return await this.showAuthorPhotos(stepContext, stepContext.parent.dialogs.dialogState.authorId);
                case "2": return await stepContext.endDialog();
                //case "2": return await stepContext.context.sendActivity("restart_dialog");
            }
        }

        
    }

}

module.exports = FlickrDialog
