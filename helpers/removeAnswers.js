const removeAnswers = (input, type) => {
    if (type === 'B' || type === 'C') {
        const x = input.toString().match(/\[\[(.+?)\]\]/g);
        x.forEach(ans => {
            input = input.replace(
                ans,
                '[[' + '*'.repeat(ans.length - 4) + ']]'
            );
        });
        return input;
    }
    if (type === 'D') {
        if (input) {
            input = input.toString().replace('[[', '');
            input = input.toString().replace(']]', '');
        }

        return input;
    }
    if (type === 'DPartA') {
        if (input) {
            const x = input.toString().match(/\[\[(.+?)\]\]/g);
            if (x) {
                x.forEach(ans => {
                    input = input.replace(ans, '______');
                });
            }
        }

        return input;
    }
};

module.exports = { removeAnswers };
