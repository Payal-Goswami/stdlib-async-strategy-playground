/**
* stdlib Async Strategy Playground
* Showcase for GSoC 2026 - Idea #9
* Author: Payal Goswami
*/

var forEach = require('@stdlib/utils-async-for-each');
var parallel = require('@stdlib/utils-async-parallel');
var format = require('@stdlib/string-format');

var tasks = [600, 200, 800, 300, 100];

/**
* Custom eachLimit implementation
* This addresses the core of GSoC Idea #9: Implementing controlled concurrency.
* It ensures that no more than `limit` tasks are running at any given time.
*/
function eachLimit(collection, limit, worker, done) {
    var index = 0;
    var running = 0;
    var completed = 0;
    var errored = false;

    function next(err) {
        if (errored) return;
        if (err) {
            errored = true;
            return done(err);
        }
        running -= 1;
        completed += 1;

        if (completed === collection.length) {
            return done();
        }
        spawn();
    }

    function spawn() {
        while (running < limit && index < collection.length) {
            var i = index;
            index += 1;
            running += 1;
            worker(collection[i], i, next);
        }
    }

    spawn();
}

function mockWorker(duration, index, next) {
    var start = Date.now();

    // Using global setTimeout for environment stability
    setTimeout(function onTimeout() {
        var timeTaken = Date.now() - start;
        console.log(format('  [Task %d] Finished in %dms', index, timeTaken));
        next();
    }, duration);
}

// STRATEGY A: True Sequential (Series)
function runSequential(callback) {
    console.log('\n▶ STRATEGY A: Sequential (Series Execution)');
    console.log('  Expected: Sum of all tasks (~2000ms)');

    var startTime = Date.now();

    eachLimit(tasks, 1, mockWorker, function onDone(err) {
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

    eachLimit(tasks, limit, mockWorker, function onDone(err) {
        if (err) throw err;

        var total = Date.now() - startTime;
        console.log(format('✔ SUCCESS: Total Limited Time: %dms', total));

        callback();
    });
}

console.log('   STDLIB ASYNC STRATEGY PLAYGROUND      ');

runSequential(function () {
    runParallel(function () {
        runLimited(2, function () {

            console.log('\n============================================');
            console.log('ANALYSIS FOR MENTORS:');
            console.log('Sequential → Sum of durations (Safe/Slow)');
            console.log('Parallel   → Max duration (Fast/Resource-heavy)');
            console.log('Limited    → Controlled throughput (Balanced)');
            console.log('');
            console.log('My GSoC goal: Implement async utilities like');
            console.log('mapLimit, eachLimit, and retry for stdlib.');
            console.log('============================================');

        });
    });
});
