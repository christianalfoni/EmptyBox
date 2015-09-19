var Home = require('./Home.js');
var install = require('./markdown/install.md');
var react = require('./markdown/react.md');
var angular = require('./markdown/angular.md');
var immutableStore = require('./markdown/immutable-store.md');
var baobab = require('./markdown/baobab.md');
var tcomb = require('./markdown/tcomb.md');
var documentation = require('./markdown/documentation.md');
var signals = require('./markdown/signals.md');
var actions = require('./markdown/actions.md');
var input = require('./markdown/input.md');
var state = require('./markdown/state.md');
var output = require('./markdown/output.md');
var services = require('./markdown/services.md');
var factories = require('./markdown/factories.md');
var chains = require('./markdown/chains.md');
var async = require('./markdown/async.md');
var typeChecking = require('./markdown/typeChecking.md');
var events = require('./markdown/events.md');
var routing = require('./markdown/routing.md');
var transitions = require('./markdown/transitions.md');
var bestPractices = require('./markdown/best-practices.md');
var modals = require('./markdown/modals.md');

module.exports = [
  {
    label: 'Cerebral',
    icon: 'home',
    content: Home
  }, {
    label: 'Install',
    icon: 'download',
    content: install
  }, [
    {
      label: 'React',
      icon: 'television',
      content: react
    },
    {
      label: 'Angular',
      icon: 'television',
      content: angular
    },
    {
      label: 'Immutable-Store',
      icon: 'database',
      content: immutableStore
    },
    {
      label: 'Baobab',
      icon: 'database',
      content: baobab
    },
    {
      label: 'Tcomb',
      icon: 'database',
      content: tcomb
    }
  ],
  {
    label: 'Documentation',
    icon: 'book',
    content: documentation
  },
  [
    {
      label: 'Signals',
      icon: 'file-text',
      content: signals
    },
    {
      label: 'Actions',
      icon: 'file-text',
      content: actions
    },
    {
      label: 'Input',
      icon: 'file-text',
      content: input
    },
    {
      label: 'State',
      icon: 'file-text',
      content: state
    },
    {
      label: 'Output',
      icon: 'file-text',
      content: output
    },
    {
      label: 'Services',
      icon: 'file-text',
      content: services
    },
    {
      label: 'Factories',
      icon: 'file-text',
      content: factories
    },
    {
      label: 'Chains',
      icon: 'file-text',
      content: chains
    },
    {
      label: 'Async',
      icon: 'file-text',
      content: async
    },
    {
      label: 'Type checking',
      icon: 'file-text',
      content: typeChecking
    },
    {
      label: 'Events',
      icon: 'file-text',
      content: events
    }
  ],
  {
    label: 'Routing',
    icon: 'map-signs',
    content: routing
  }, [
    {
      label: 'Transitions',
      icon: 'compress',
      content: transitions
    }
  ],
  {
    label: 'Best Practices',
    icon: 'heart',
    content: bestPractices
  }/*, [
    {
      label: 'Modals',
      icon: 'heart-o',
      content: modals
    }
  ]*/
];
