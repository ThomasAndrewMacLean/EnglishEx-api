const removeAnswers = (input, type) => {
    if (type === 'B' || type === 'C') {
        const x = input.match(/\[\[(.+?)\]\]/g);
        x.forEach(ans => {
            input = input.replace(
                ans,
                '[[' + '*'.repeat(ans.length - 4) + ']]'
            );
        });
        return input;
    }
};

module.exports = { removeAnswers };
