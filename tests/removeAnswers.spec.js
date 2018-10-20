let { describe } = require('riteway');
let { removeAnswers } = require('../helpers/removeAnswers');

describe('removeAnsers()', async assert => {
    assert({
        given: 'type B one input',
        should: 'remove input',
        actual: removeAnswers('helllo [[world]]', 'B'),
        expected: 'helllo [[*****]]'
    });
    assert({
        given: 'type C one input',
        should: 'remove input',
        actual: removeAnswers('helllo [[world]]', 'C'),
        expected: 'helllo [[*****]]'
    });
    assert({
        given: 'type B one input',
        should: 'remove input, replace with correct number of stars',
        actual: removeAnswers('helllo [[world!]]', 'B'),
        expected: 'helllo [[******]]'
    });
    assert({
        given: 'type B multiple input',
        should: 'remove input',
        actual: removeAnswers('helllo [[world]], its [[weekend]]', 'B'),
        expected: 'helllo [[*****]], its [[*******]]'
    });
});
