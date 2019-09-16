const { CardFactory } = require('botbuilder');

module.exports = function(cardData) {
    return CardFactory.heroCard(
        cardData.title,
        `By: ${cardData.author}, taken at: ${cardData.date}`,
        CardFactory.images([cardData.url]),
        CardFactory.actions([
            {
                type: "messageBack",
                title: "More from this author",
                value: {
                    "action": "author_more",
                    "author_id": cardData.authorId
                }
            },            
            {
                type: "messageBack",
                title: "Description",
                value: {
                    "action": "photo_description",
                    "text": "Photo description: "+cardData.description
                }
            }
        ])
    );
}


