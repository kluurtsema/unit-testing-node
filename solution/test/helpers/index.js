/* jshint node: true */

'use strict';

var SlackClient = require('../../lib/slack-client');
var scriptName = require('../../../package.json').name;
var testConfig = require('./test-config.json');
var Hubot = require('hubot');
var SlackBot = require('hubot-slack');

exports = module.exports = {
  GITHUB_USER: '18F',
  REPOSITORY: 'handbook',
  REACTION: 'evergreen_tree',
  SUCCESS_REACTION: 'heavy_check_mark',
  USER_ID: 'U5150OU812',
  CHANNEL_ID: 'C5150OU812',
  TIMESTAMP: '1360782804.083113',
  MSG_ID: 'C5150OU812:1360782804.083113',
  PERMALINK: 'https://18f.slack.com/archives/handbook/p1360782804083113',
  ISSUE_URL: 'https://github.com/18F/handbook/issues/1',

  baseConfig: function() {
    // Notes on the `rules:` property:
    // - The first one matches the 'evergreen_tree' reaction from
    //   reactionAddedMessage(), but is specific to a different channel.
    // - The second one doesn't match reactionAddedMessage() at all.
    // - The third one matches an 'evergreen_tree' message in any channel, and
    //   should match reactionAddedMessage().
    return JSON.parse(JSON.stringify(testConfig));
  },

  configRule: function() {
    return {
      reactionName: exports.REACTION,
      githubRepository: 'hubot-slack-github-issues',
      channelNames: ['hub']
    };
  },

  reactionAddedMessage: function() {
    var user, text, message;

    user = new Hubot.User(exports.USER_ID,
      { id: exports.USER_ID, name: 'mikebland', room: 'handbook' });
    text = 'Hello, world!';
    message = {
      type: SlackClient.REACTION_ADDED,
      user: exports.USER_ID,
      item: {
        type: 'message',
        channel: exports.CHANNEL_ID,
        ts: exports.TIMESTAMP
      },
      reaction: exports.REACTION,
      'event_ts': exports.TIMESTAMP
    };
    return new SlackBot.SlackTextMessage(user, text, text, message);
  },

  messageWithReactions: function() {
    return {
      ok: true,
      type: 'message',
      channel: exports.CHANNEL_ID,
      message: {
        type: 'message',
        user: exports.USER_ID,
        ts: exports.TIMESTAMP,
        permalink: exports.PERMALINK,
        reactions: [
          {
            name: exports.REACTION,
            count: 1,
            users: [ exports.USER_ID ]
          }
        ]
      }
    };
  },

  metadata: function() {
    return {
      channel: 'handbook',
      timestamp: exports.TIMESTAMP,
      url: exports.PERMALINK,
      date: new Date(1360782804.083113 * 1000),
      title: 'Update from #handbook at Wed, 13 Feb 2013 19:13:24 GMT',
    };
  },

  githubParams: function() {
    return {
      title: exports.metadata().title,
      body:  exports.metadata().url
    };
  },

  logMessage: function(message) {
    return scriptName + ': ' + exports.MSG_ID + ': ' + message;
  },

  matchingRuleLogMessage: function() {
    var matchingRule = exports.baseConfig().rules[2];
    return exports.logMessage('matches rule: ' + JSON.stringify(matchingRule));
  },

  getReactionsLogMessage: function() {
    return exports.logMessage('getting reactions for ' + exports.PERMALINK);
  },

  githubLogMessage: function() {
    return exports.logMessage('making GitHub request for ' + exports.PERMALINK);
  },

  addSuccessReactionLogMessage: function() {
    return exports.logMessage('adding ' + exports.SUCCESS_REACTION);
  },

  successLogMessage: function() {
    return exports.logMessage('created: ' + exports.ISSUE_URL);
  },

  failureMessage: function(message) {
    return 'failed to create a GitHub issue in ' +
      exports.GITHUB_USER + '/' + exports.REPOSITORY + ': ' + message;
  },

  failureLogMessage: function(message) {
    return exports.logMessage(exports.failureMessage(message));
  }
};