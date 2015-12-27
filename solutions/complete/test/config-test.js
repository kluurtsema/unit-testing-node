/* jshint node: true */
/* jshint mocha: true */
/* jshint expr: true */

'use strict';

var Config = require('../lib/config');
var scriptName = require('../../../package.json').name;
var helpers = require('./helpers');
var LogHelper = require('./helpers/log-helper');
var chai = require('chai');
var path = require('path');

var expect = chai.expect;

describe('Config', function() {
  var logHelper, newConfig;

  before(function() {
    logHelper = new LogHelper();
    delete process.env.HUBOT_SLACK_GITHUB_ISSUES_CONFIG_PATH;
  });

  afterEach(function() {
    delete process.env.HUBOT_SLACK_GITHUB_ISSUES_CONFIG_PATH;
  });

  newConfig = function(config) {
    try {
      logHelper.captureLog();
      return new Config(config);
    } finally {
      logHelper.restoreLog();
    }
  };

  it('should validate a valid configuration', function() {
    var baseConfig = helpers.baseConfig(),
        config = new Config(baseConfig);
    expect(JSON.stringify(config)).to.equal(JSON.stringify(baseConfig));
  });

  it('should validate a rule specifying a channel', function() {
    var configWithChannelRule = helpers.baseConfig(),
        config;
    
    configWithChannelRule.rules.push({
      'reactionName': 'smiley',
      'githubRepository': '18F/hubot-slack-github-issues',
      'channelNames': ['hub']
    });
    config = newConfig(configWithChannelRule);
    expect(JSON.stringify(config)).to.eql(
      JSON.stringify(configWithChannelRule));
    expect(logHelper.messages).to.be.empty;
  });

  it('should raise errors for missing required fields', function() {
    var errors = [
          'missing githubUser',
          'missing githubTimeout',
          'missing slackTimeout',
          'missing successReaction',
          'missing rules'
        ],
        errorMessage = 'Invalid configuration:\n  ' + errors.join('\n  ');

    expect(function() { newConfig({}); }).to.throw(Error, errorMessage);
    expect(logHelper.messages).to.eql([scriptName + ': ' + errorMessage]);
  });

  it('should raise errors for missing required rules fields', function() {
    var config = helpers.baseConfig(),
        errors,
        errorMessage;

    delete config.rules[0].reactionName;
    delete config.rules[0].githubRepository;

    errors = [
      'rule 0 missing reactionName',
      'rule 0 missing githubRepository'
    ];
    errorMessage = 'Invalid configuration:\n  ' + errors.join('\n  ');

    expect(function() { newConfig(config); }).to.throw(Error, errorMessage);
    expect(logHelper.messages).to.eql([scriptName + ': ' + errorMessage]);
  });

  it('should raise errors for unknown properties', function() {
    var config = helpers.baseConfig(),
        errors,
        errorMessage;

    config.foo = {};
    config.bar = {};
    config.rules[0].baz = {};
    config.rules.push({
      'reactionName': 'smiley',
      'githubRepository': '18F/hubot-slack-github-issues',
      'channelNames': ['hub'],
      'quux': {}
    });

    errors = [
      'unknown property foo',
      'unknown property bar',
      'rule 0 contains unknown property baz',
      'rule 3 contains unknown property quux',
    ];
    errorMessage = 'Invalid configuration:\n  ' + errors.join('\n  ');

    expect(function() { newConfig(config); }).to.throw(Error, errorMessage);
    expect(logHelper.messages).to.eql([scriptName + ': ' + errorMessage]);
  });

  it('should load from HUBOT_SLACK_GITHUB_ISSUES_CONFIG_PATH', function() {
    var testConfig = require('./helpers/test-config.json'),
        config;

    process.env.HUBOT_SLACK_GITHUB_ISSUES_CONFIG_PATH = path.join(
      __dirname, 'helpers', 'test-config.json');
    config = newConfig();

    expect(JSON.stringify(config)).to.eql(JSON.stringify(testConfig));
    expect(logHelper.messages).to.eql([
      scriptName + ': loading config from ' +
        process.env.HUBOT_SLACK_GITHUB_ISSUES_CONFIG_PATH
    ]);
  });

  it('should load from config/slack-github-issues.json by default', function() {
    var defaultConfig = require('../config/slack-github-issues.json'),
        config;

    config = newConfig();
    expect(JSON.stringify(config)).to.eql(JSON.stringify(defaultConfig));
    expect(logHelper.messages).to.eql([
      scriptName + ': loading config from ' +
        'config/slack-github-issues.json'
    ]);
  });
});