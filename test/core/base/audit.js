/*global Audit, Rule */
describe('Audit', function () {
	'use strict';
	var a;

	var mockChecks = [{
		id: 'positive1-check1',
		evaluate: function () {
			return true;
		}
	}, {
		id: 'positive2-check1',
		evaluate: function () {
			return true;
		}
	}, {
		id: 'negative1-check1',
		evaluate: function () {
			return true;
		}
	}, {
		id: 'positive3-check1',
		evaluate: function () {
			return true;
		}
	}];

	var mockRules = [{
		id: 'positive1',
		selector: 'input',
		any: [{
			id: 'positive1-check1',
		}]
	}, {
		id: 'positive2',
		selector: '#monkeys',
		any: ['positive2-check1']
	}, {
		id: 'negative1',
		selector: 'div',
		none: ['negative1-check1']
	}, {
		id: 'positive3',
		selector: 'blink',
		any: ['positive3-check1']
	}];

	var fixture = document.getElementById('fixture');

	beforeEach(function () {
		a = new Audit();
		mockRules.forEach(function (r) {
			a.addRule(r);
		});
		mockChecks.forEach(function (c) {
			a.addCheck(c);
		});
	});
	afterEach(function () {
		fixture.innerHTML = '';
	});

	it('should be a function', function () {
		assert.isFunction(Audit);
	});

	describe('Audit#addRule', function () {
		it('should override existing rule', function () {
			var audit = new Audit();
			audit.addRule({
				id: 'target',
				matches: 'hello',
				selector: 'bob'
			});
			assert.lengthOf(audit.rules, 1);
			assert.equal(audit.rules[0].selector, 'bob');
			assert.equal(audit.rules[0].matches, 'hello');

			audit.addRule({
				id: 'target',
				selector: 'fred'
			});

			assert.lengthOf(audit.rules, 1);
			assert.equal(audit.rules[0].selector, 'fred');
			assert.equal(audit.rules[0].matches, 'hello');
		});
		it('should otherwise push new rule', function () {
			var audit = new Audit();
			audit.addRule({
				id: 'target',
				selector: 'bob'
			});
			assert.lengthOf(audit.rules, 1);
			assert.equal(audit.rules[0].id, 'target');
			assert.equal(audit.rules[0].selector, 'bob');

			audit.addRule({
				id: 'target2',
				selector: 'fred'
			});

			assert.lengthOf(audit.rules, 2);
			assert.equal(audit.rules[1].id, 'target2');
			assert.equal(audit.rules[1].selector, 'fred');
		});

	});

	describe('Audit#addCheck', function () {
		it('should create a new check', function () {
			var audit = new Audit();
			assert.equal(audit.checks.target, undefined);
			audit.addCheck({
				id: 'target',
				selector: 'bob',
				options: 'jane'
			});
			assert.ok(audit.checks.target);
			assert.equal(audit.checks.target.selector, 'bob');
		});
		it('should configure the metadata, if passed', function () {
			var audit = new Audit();
			assert.equal(audit.checks.target, undefined);
			audit.addCheck({
				id: 'target',
				metadata: 'bob'
			});
			assert.ok(audit.checks.target);
			assert.equal(audit.data.checks.target, 'bob');
		});
		it('should reconfigure existing check', function () {
			var audit = new Audit();
			audit.addCheck({
				id: 'target',
				selector: 'bob',
				options: 'jane'
			});
			assert.equal(audit.checks.target.selector, 'bob');
			assert.equal(audit.checks.target.options, 'jane');

			audit.addCheck({
				id: 'target',
				selector: 'fred'
			});

			assert.equal(audit.checks.target.selector, 'fred');
			assert.equal(audit.checks.target.options, 'jane');
		});
	});

	describe('Audit#run', function () {
		it('should run all the rules', function (done) {
			fixture.innerHTML = '<input type="text" aria-label="monkeys">' +
				'<div id="monkeys">bananas</div>' +
				'<input aria-labelledby="monkeys" type="text">' +
				'<blink>FAIL ME</blink>';

			a.run({ include: [fixture] }, {}, function (results) {
				var expected = [{
					id: 'positive1',
					result: 'NA',
					pageLevel: false,
					impact: null,
					nodes: [{
						node: {
							selector: ['#fixture > input:nth-of-type(1)'],
							source: null
						},
						any: [{
							id: 'positive1-check1',
							result: true,
							data: null,
							relatedNodes: []
						}],
						all: [],
						none: []
					}, {
						node: {
							selector: ['#fixture > input:nth-of-type(2)'],
							source: '<input aria-labelledby="monkeys" type="text">'
						},
						any: [{
							id: 'positive1-check1',
							result: true,
							data: null,
							relatedNodes: []
						}],
						all: [],
						none: []
					}]
				}, {
					id: 'positive2',
					result: 'NA',
					pageLevel: false,
					impact: null,
					nodes: [{
						node: {
							selector: ['#monkeys'],
							source: '<div id="monkeys">bananas</div>'
						},
						any: [{
							id: 'positive2-check1',
							result: true,
							data: null,
							relatedNodes: []
						}],
						all: [],
						none: []
					}]
				}, {
					id: 'negative1',
					result: 'NA',
					pageLevel: false,
					impact: null,
					nodes: [{
						node: {
							selector: ['#fixture'],
							source: '<div id="fixture"><input type="text" aria-label="monkeys"><div id="monkeys">bananas</div><input aria-labelledby="monkeys" type="text"><blink>FAIL ME</blink></div>'
						},
						none: [{
							id: 'negative1-check1',
							result: true,
							data: null,
							relatedNodes: []
						}],
						all: [],
						any: []
					}, {
						node: {
							selector: ['#monkeys'],
							source: '<div id="monkeys">bananas</div>'
						},
						none: [{
							id: 'negative1-check1',
							result: true,
							data: null,
							relatedNodes: []
						}],
						all: [],
						any: []
					}]
				}, {
					id: 'positive3',
					result: 'NA',
					pageLevel: false,
					impact: null,
					nodes: [{
						node: {
							selector: ['#fixture > blink'],
							source: '<blink>FAIL ME</blink>'
						},
						any: [{
							id: 'positive3-check1',
							result: true,
							data: null,
							relatedNodes: []
						}],
						all: [],
						none: []
					}]
				}];
				var out = results[0].nodes[0].node.source;
				results[0].nodes[0].node.source = null;
				assert.deepEqual(JSON.parse(JSON.stringify(results)), expected);
				assert.match(out, /^<input(\s+type="text"|\s+aria-label="monkeys"){2,}>/);
				done();
			});
		});
		it('should not run rules disabled by the options', function (done) {
			a.run({ include: [document] }, {
					rules: {
						'positive3': {
							enabled: false
						}
					}
				}, function (results) {
					assert.equal(results.length, 3);
					done();
				});
		});
		it('should not run rules disabled by the configuration', function (done) {
			var a = new Audit();
			var success = true;
			a.rules.push(new Rule({
				id: 'positive1',
				selector: '*',
				enabled: false,
				any: [{
					id: 'positive1-check1',
					evaluate: function () {
						success = false;
					}
				}]
			}));
			a.run({ include: [document] }, {}, function () {
				assert.ok(success);
				done();
			});
		});
		it('should call the rule\'s run function', function (done) {
			var targetRule = mockRules[mockRules.length - 1],
				rule = utils.findBy(a.rules, 'id', targetRule.id),
				called = false,
				orig;

			fixture.innerHTML = '<a href="#">link</a>';
			orig = rule.run;
			rule.run = function (node, options, callback) {
				called = true;
				callback({});
			};
			a.run({ include: [document] }, {}, function () {
				assert.isTrue(called);
				rule.run = orig;
				done();
			});
		});
		it('should pass the option to the run function', function (done) {
			var targetRule = mockRules[mockRules.length - 1],
				rule = utils.findBy(a.rules, 'id', targetRule.id),
				passed = false,
				orig, options;

			fixture.innerHTML = '<a href="#">link</a>';
			orig = rule.run;
			rule.run = function (node, o, callback) {
				assert.deepEqual(o, options);
				passed = true;
				callback({});
			};
			options = {rules: {}};
			(options.rules[targetRule.id] = {}).data = 'monkeys';
			a.run({ include: [document] }, options, function () {
				assert.ok(passed);
				rule.run = orig;
				done();
			});
		});

		it('should skip pageLevel rules if context is not set to entire page', function () {
			var audit = new Audit();

			audit.rules.push(new Rule({
				pageLevel: true,
				enabled: true,
				evaluate: function () {
					assert.ok(false, 'Should not run');
				}
			}));

			audit.run({ include: [ document.body ], page: false }, {}, function (results) {
				assert.deepEqual(results, []);
			});

		});

		it('should run audit.validateOptions to ensure valid input', function () {
			fixture.innerHTML = '<input type="text" aria-label="monkeys">' +
				'<div id="monkeys">bananas</div>' +
				'<input aria-labelledby="monkeys" type="text">' +
				'<blink>FAIL ME</blink>';
			var checked = 'options not validated';

			a.validateOptions = function () {
				checked = 'options validated';
			};

			a.run({ include: [fixture] }, {}, function () {});
			assert.equal(checked, 'options validated');
		});
	});
	describe('Audit#after', function () {
		it('should run Rule#after on any rule whose result is passed in', function () {
			var audit = new Audit();
			var success = false;
			var options = [{ id: 'hehe', enabled: true, monkeys: 'bananas' }];
			var results = [{
				id: 'hehe',
				monkeys: 'bananas'
			}];
			audit.rules.push(new Rule({
				id: 'hehe',
				pageLevel: false,
				enabled: false
			}));

			audit.rules[0].after = function (res, opts) {
				assert.equal(res, results[0]);
				assert.deepEqual(opts, options);
				success = true;
			};

			audit.after(results, options);
		});
	});

	describe('Audit#validateOptions', function () {

		it('returns the options object when it is valid', function () {
			var opt = {
				runOnly: {
					type: 'rule',
					value: ['positive1', 'positive2']
				},
				rules: {
					negative1: { enabled: false }
				}
			};
			assert(a.validateOptions(opt), opt);
		});

		it('throws an error when option.runOnly has an unknown rule', function () {
			assert.throws(function () {
				a.validateOptions({
					runOnly: {
						type: 'rule',
						value: ['frakeRule']
					}
				});
			});
		});

		it('throws an error when option.runOnly has an unknown tag', function () {
			assert.throws(function () {
				a.validateOptions({
					runOnly: {
						type: 'tags',
						value: ['fakeTag']
					}
				});
			});
		});

		it('throws an error when option.rules has an unknown rule', function () {
			assert.throws(function () {
				a.validateOptions({
					rules: {
						fakeRule: { enabled: false}
					}
				});
			});
		});

	});

});
