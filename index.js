/**
* stdlib Async Strategy Playground
* Showcase for GSoC 2026 - Idea #9
* Author: Payal Goswami
*/

var forEach = require('@stdlib/utils/async/for-each');
var parallel = require('@stdlib/utils/async/parallel');
var format = require('@stdlib/string/format');
var setTimeout = require('@stdlib/timers/set-timeout');
-
var tasks = [600, 200, 800, 300, 100];

function mockWorker(duration, index, next) {
    var start = Date.now();

    setTimeout(function onTimeout() {
        var timeTaken = Date.now() - start;
        console.log(format('  [Task %d] Finished in %dms', index, timeTaken));
        next();
    }, duration);
}

// STRATEGY A: Sequential (Series)
function runSequential(callback) {
    console.log('\n▶ STRATEGY A: Sequential (Series Execution)');
    console.log('  Expected: Sum of all tasks (~2000ms)');

    var startTime = Date.now();

    forEach(tasks, mockWorker, function onDone(err) {
        if (err) throw err;

        var total = Date.now() - startTime;
        console.log(format('✔ SUCCESS: Total Sequential Time: %dms', total));

        callback();
    });
}

// STRATEGY B: Full Parallel
function runParallel(callback) {
    console.log('\n▶ STRATEGY B: Full Parallel (Concurrent Execution)');
    console.log('  Expected: Max task time (~800ms)');

    var startTime = Date.now();

    var wrappedTasks = tasks.map(function (t, i) {
        return function (next) {
            mockWorker(t, i, next);
        };
    });

    parallel(wrappedTasks, function onDone(err) {
        if (err) throw err;

        var total = Date.now() - startTime;
        console.log(format('✔ SUCCESS: Total Parallel Time: %dms', total));

        callback();
    });
}

// STRATEGY C: Limited Concurrency
function runLimited(limit, callback) {
    console.log('\n▶ STRATEGY C: Limited Concurrency (limit = ' + limit + ')');
    console.log('  Expected: Balanced between series & parallel');

    var startTime = Date.now();
    var index = 0;
    var running = 0;
    var completed = 0;

    function runNext() {
        while (running < limit && index < tasks.length) {
            (function (i) {
                running++;

                mockWorker(tasks[i], i, function () {
                    running--;
                    completed++;

                    if (completed === tasks.length) {
                        var total = Date.now() - startTime;
                        console.log(format('✔ SUCCESS: Total Limited Time: %dms', total));
                        return callback();
                    }

                    runNext();
                });

            })(index);

            index++;
        }
    }

    runNext();
}


console.log('   STDLIB ASYNC STRATEGY PLAYGROUND      ');

runSequential(function () {
    runParallel(function () {
        runLimited(2, function () {

            console.log('\n============================================');
            console.log('ANALYSIS FOR MENTORS:');
            console.log('Sequential → Safe but slow');
            console.log('Parallel → Fast but risky (resource heavy)');
            console.log('Limited → Balanced (controlled concurrency)');
            console.log('');
            console.log('My GSoC goal: Implement async utilities like');
            console.log('mapLimit, eachLimit, retry for stdlib.');
            console.log('============================================');

        });
    });
});
