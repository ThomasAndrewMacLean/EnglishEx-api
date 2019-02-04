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
    assert({
        given: 'type D input',
        should: 'remove input',
        actual: removeAnswers('[[world]]', 'D'),
        expected: 'world'
    });
    assert({
        given: 'type D input',
        should: 'not remove input if not an correct answer',
        actual: removeAnswers('world', 'D'),
        expected: 'world'
    });
    assert({
        given: 'type D partA',
        should: 'replace answer with underscores',
        actual: removeAnswers('world [[beautifull]] hellooo', 'DPartA'),
        expected: 'world ______ hellooo'
    });
    assert({
        given: 'type D partA, without answer',
        should: 'return the partA',
        actual: removeAnswers('world hellooo', 'DPartA'),
        expected: 'world hellooo'
    });
});
