var Home = require('./Home.js');
var install = require('./markdown/install.md');
var react = require('./markdown/react.md');
var angular = require('./markdown/angular.md');
var baobab = require('./markdown/baobab.md');
var tcomb = require('./markdown/tcomb.md');
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
var structure = require('./markdown/structure.md');
var recording = require('./markdown/recording.md');
var getStarted = require('./markdown/get-started.md');
var utilities = require('./markdown/utilities.md');
var relational = require('./markdown/relational.md');
var internetExplorer = require('./markdown/internetExplorer.md');
var propsAndState = require('./markdown/propsAndState.md');

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
      label: 'Baobab',
      icon: 'database',
      content: baobab
    },
    {
      label: 'Tcomb',
      icon: 'database',
      content: tcomb
    },
    {
      label: 'Internet Explorer',
      icon: 'internet-explorer',
      content: internetExplorer
    }
  ],
  {
    label: 'Get Started',
    icon: 'power-off',
    content: getStarted
  },
  {
    label: 'Signals',
    icon: 'file-text',
    content: signals
  },
  [
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
      label: 'Async',
      icon: 'file-text',
      content: async
    }
  ],
  {
    label: 'Utilities',
    icon: 'wrench',
    content: utilities
  },
  [
    {
      label: 'Services',
      icon: 'wrench',
      content: services
    },
    {
      label: 'Factories',
      icon: 'wrench',
      content: factories
    },
    {
      label: 'Chains',
      icon: 'wrench',
      content: chains
    },
    {
      label: 'Type checking',
      icon: 'wrench',
      content: typeChecking
    },
    {
      label: 'Events',
      icon: 'wrench',
      content: events
    },
    {
      label: 'Recording',
      icon: 'wrench',
      content: recording
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
  }, [
    {
      label: 'Structure',
      icon: 'heart-o',
      content: structure
    },
    {
      label: 'Relational data',
      icon: 'heart-o',
      content: relational
    },
    {
      label: 'Props and State',
      icon: 'heart-o',
      content: propsAndState
    }
  ]
];
