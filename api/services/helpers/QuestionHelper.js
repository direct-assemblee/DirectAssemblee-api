let SENTENCE_REGEX = /\(?[^.?!]+[.!?]\)?/g;
let WRONG_SENTENCE_END_REGEX = /(^|\s)(m|mme|etc)([.]|[.]\))$/i;

module.exports = {
    formatQuestionWithLineBreaks: function(question) {
        let newText;
        let matchedSentences = question.match(SENTENCE_REGEX);
        let sentences = [];
        let wrongSentence;
        for (let i in matchedSentences) {
            if (wrongSentence) {
                matchedSentences[i] = wrongSentence + matchedSentences[i];
                wrongSentence = null;
            }
            if (matchedSentences[i].match(WRONG_SENTENCE_END_REGEX)) {
                wrongSentence = matchedSentences[i];
            } else {
                sentences.push(matchedSentences[i]);
            }
        }
        if (sentences) {
            newText = sentences[0] + '\n';
            for (let i = 1 ; i < sentences.length - 1 ; i += 2) {
                newText += sentences[i].trim();
                if (i + 2 <= sentences.length - 1) {
                    newText += sentences[i + 1];
                }
                newText += '\n';
            }
            let lastSentence = sentences[sentences.length - 1];
            if (lastSentence) {
                newText += lastSentence.trim();
            }
        } else {
            newText = question;
        }
        return newText;
    }
}
