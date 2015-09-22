# Introducing Cerebral

How we think about building web applications evolves quickly. It is not long ago Backbone was the mainstream choice for developing applications. It still is for a lot of developers. But a lot has happened since its release. We got Ember, Angular and the latest mainstream breaker was React with its Flux architecture.

All these projects has made our lives easier. It is practically impossible to build large scale applications in vanilla JavaScript. We need tools. Some frameworks makes up almost all of the tools in your toolbox, while other lets you choose the best tool for the specific job. But frameworks and libraries are not just about the tools, but what the tools build. Do they inspire you to build a spaghetti-labyrinth where you quickly get lost? Or an abstraction-skyscraper where you have to move up and down the floors to understand how things are connected? No matter what your mental image is, you need it. You need to understand the structure of your application. The flow of changes in your application. If you do not know this it is hard to fix bugs and scale.

## State and UI

We have two main states in our applications. The UI state and the APP state. The UI state is typically expressed with declarative templates or JSX. But you also have an APP state. This state are all the objects, arrays, strings, numbers and booleans that is used to display the UI. Ideally the UI state is a direct representation of the APP state. This is something all frameworks handles pretty well in practice, though some perform a lot better than others. You create the UI representation by passing a model into a template, using $scopes or passing state to a function that returns virtual DOM. The goal is the same, keep UI state in sync with APP state.

How to structure UI state has never been a discussion. It is a tree structure. With children and siblings. How we structure APP state has been a discussion for years though, and still is. Abstractions are often created to handle pieces of your APP state. Frameworks has a tendency to split application state into different containers. Like Backbone.Model, $ngResource or flux stores. Often a router also contains some of your application state.

I wrote an article on [Baobab](http://www.christianalfoni.com/articles/2015_02_06_Plant-a-Baobab-tree-in-your-flux-application). It is called a state tree. It is a very shallow abstraction because your mental image of this tree is a normal JavaScript object. An object with child objects, arrays and other plain JavaScript values. What makes this so great is that your mental image of UI state and APP state has the same structure. It is a tree! The goal is to translate the APP state tree into a UI tree.

I think it is important to prevent putting our APP state into many different containers. Because each container creates at least one new relationship in your application. And when the relationship (dependency) graph becomes too big we start to loose control of our mental image.

## The missing piece

But there is something missing here. How do you make changes to your APP state? What is the mechanism that performs this change? Lets us use an example. The user clicks a button. The button should refresh a list of messages. The latest message content should also be downloaded and displayed next to the list.

Typically you start with an event listener on the button.

```javascript

onButtonClick: function () {

}
```

The big question is, what do you do now? One approach would be to contact the dependency that is responsible for the messages list. Wait for it to complete, then contact the dependency responsible for the current message. The example here uses abstractions from an imagined framework.

```javascript

onButtonClick: function () {
  messages.get(function (messages) {
    currentMessage.setByLatestMessage(messages);
  });
}
```

This is an imperative approach where *messages* and *currentMessage* will emit events when they change. This is what updates any UI depending on them. Although the code is readable we know very little of what is actually is going on. By reading this code we do not know what url is being used or what happens on errors. You might say... "I do not care". And yeah, I agree, but only as long as it is working! If this piece of code does not work it can be difficult to reason about why.

We could make this a bit better by taking advantage of Flux.

```javascript

onButtonClick: function () {
  actions.refreshMessages();
}
```

```javascript

function refreshMessages () {
  dispatch(LOADING_MESSAGES, true);
  fetch('/messages')
    .then(function (messages) {
      dispatch(SET_MESSAGES, messages);
      dispatch(LOADING_MESSAGES, false);
      dispatch(LOADING_MESSAGE, true);    
      return fetch('/messages/' + messages[0].id)
        .then(function (message) {
          dispatch(SET_MESSAGE, message);
          dispatch(LOADING_MESSAGE, false);    
        })
        .catch(function (error) {
          dispatch(SET_MESSAGE_ERROR, error);
          dispatch(LOADING_MESSAGE, false);  
        });
    })
    .catch(function (error) {
      dispatch(SET_MESSAGES_ERROR, error);
      dispatch(LOADING_MESSAGES, false);
    });
}
```

So this initially looks a lot worse. And I agree to some extent. Flux is very verbose. But this approach also gives you some advantages. First of all there is no hidden abstractions here. If we read the implementation details we know what is happening. We know the urls, what library does the fetching, explicitly how we manipulate the state of the application and we also see what happens if the intention of state change does not work out. Debugging this function is a lot easier than the previous example.

What to also notice here is that this function is not a special abstraction from any framework. It is just a normal function. All other state changes in your application will have a function like this. This makes it easier for new developers to understand the project and scale it, as there is only one way to do state changes.

## Making it better

So now we have two different approaches to changing the state of our application. We are now going to look at a third option. The project [Cerebral](http://www.christianalfoni.com) is a contribution to making this part of your application simpler. We want an abstraction, but we want it to be shallow. That will keep readability without hiding too many implementation details.

But what if could take this to a whole new level? What if the state changes could be expressed in a developer tool? You could actually see the flow of these state changes? Explore all the data passed through? Even move back and forth in time?

Take a look at [this video](https://www.youtube.com/watch?v=j2oxt0-pCuc) and then we will go into what Cerebral is all about.

## Cerebral

This is where Cerebral fits into your application:

![Cerebral](/images/cerebral-arch.png)

It is the piece between your state tree and the UI. Think of Cerebral as a controller. It is a single entity where you express state changes using **signals**. Your state is a single model entity, a state tree where you hold all the state of your application. When you trigger a signal Cerebral will execute it and notify your UI to update when necessary.

### Signals

So one challenge is  having many dependencies, each containing a piece of the application state. The other is having one function with lots of implementation details. Cerebral solves this with signals. A signal does not do anything by itself. A signal is a composition of functions. These functions are called actions. Let us build up the previous example step-by-step using a signal.

```javascript

signal('refreshButtonClicked',
  setLoadingMessages
);
```

A signal needs a name. I encourage you to express that name as: "What happened to trigger the signal". When you look at the signal definition you now know what happened to trigger it and what it does.

### Actions

*setLoadingMessages* is an action. It is just a function. Lets take a look at it:

```javascript

function setLoadingMessages (input, state) {
  state.set('isLoadingMessages', true);
}
```

All actions receives a set of arguments. The first argument is called *input*. The *input* is just an object that is owned by the signal. Any values passed when the signal is triggered is added to this *input*. Any actions outputting values will also be added to this *input*. That means all the actions share this object.

The *state* argument is you API to change the state of your application. It is imperative, meaning you call methods on it. You have different methods to do different mutations. The first argument is always the path. It can be a single string or an array for nested state. You can read more about that on the webpage.

### Async actions

Let us revisit our signal again and expand.

```javascript

signal('refreshButtonClicked',
  setLoadingMessages,
  [
    getMessages, {
      success: [],
      error: []
    }
  ],
  unsetLoadingMessages
);
```

The array in this signal indicates that the *getMessages* action is asynchronous. We do not define asynchronous behavior in the action itself, but in the signal. This increases your understanding of how the signal runs. We also define an object following *getMessages*. All actions can be followed by an object. The object represents paths. By default any action can choose a *success* or *error* path, but you can also define your own.

The arrays defined on **success** and **error** does not mean actions inside it runs asynchronous. Arrays are also required to express paths. So arrays inside an array means that it is asynchronous. So think of the arguments passed to the signal as an array... which they actually are.

Let us take a look at the *getMessages* action.

```javascript

function getMessages (input, state, output) {
  fetch('/messages')
    .then(function (response) {
      return response.toJSON();
    })
    .then(function (result) {
      output.success({result: result});
    })
    .catch(function (error) {
      output.error({error: error.message});
    });
}
```

The *getMessages* action is responsible for getting the messages and outputs the result with *success* or an error with *error*. To actually set the messages we need to create a new action for that.

```javascript

function setMessages (input, state) {
  state.set('messages', input.result);
}
```

As mentioned, any output from an action will be available on the *input* argument. And now our signal looks like this.

```javascript

signal('refreshButtonClicked',
  setLoadingMessages,
  [
    getMessages, {
      success: [setMessages],
      error: [setMessagesError]
    }
  ],
  unsetLoadingMessages
);
```

### Factories

There is a concept called factories. It just means "a function returning a function". Lets us see how we can make our code more reusable using a factory.

```javascript

signal('refreshButtonClicked',
  setLoading('messages', true),
  [
    get('/messages'), {
      success: [setMessages],
      error: [setMessagesError]
    }
  ],
  setLoading('messages', false)
);
```

Let us take a look at *setLoading* first.

```javascript

function setLoading (type, value) {

  function action (input, state) {
    state.set(['loading', type], value);
  }

  action.displayName = 'setLoading (' + type + ')';

  return action;

}
```

We have now created our custom tool for setting different loading states in our application. The *displayName* property of an action is used by the debugger. It lets you create dynamic names. This is how the loading state would look in our state tree:

```javascript

{
  loading: {
    messages: true,
    message: false,
    user: false
  }
}
```

This is just one example. You choose the state structure and the factories that best benefits your application. The *get* action would have a similar approach, but the url would be the dynamic part.

### Chains

The new ES6 spread operator is a very powerful tool when composing signals. We could express the signal above doing this:

```javascript

signal('refreshButtonClicked',
  ...getMessages
);
```

Where *getMessages* would just be an array.

```javascript

[
  setLoading('messages', true),
  [
    get('/messages'), {
      success: [setMessages],
      error: [setMessagesError]
    }
  ],
  setLoading('messages', false)
]
```

Now, you might say we are starting to hide important information. If you feel that way, do not abstract to this extent. But keep in mind that the debugger will always show you all actions in the chain, no matter how you compose it.

Lets take it a step further. What if we use a factory to return a chain?

```javascript

function getMessages (outputs) {

  outputs = outputs || {};

  return [
    setLoading('messages', true),
    [
      get('/messages'), {
        success: [setMessages].concat(outputs.success || []),
        error: [setMessagesError].concat(outputs.error || [])
      }
    ],
    setLoading('messages', false)
  ];

}
```

This allows us to do:

```javascript

signal('refreshButtonClicked',
  ...getMessages({
    success: [
      setLoading('message', true),
      [
        getLatestMessage, {
          success: [setMessage],
          error: [setMessageError]
        }
      ],
      setLoading('message', false)
    ]
  })
);
```

Or we could go all the way and just create a chain for getting the latest message.

```javascript

signal('refreshButtonClicked',
  ...getMessages({
    success: [...getLatestMessage]
  })
);
```

## The benefits

So this is all fine and dandy, but what benefits do you really get?

### Testing

First of all you get pure functions that are easy to test. None of the functions expressed here calls or references anything outside itself. That means you can fake all the arguments to verify that they run as intended.

```javascript

var setLoading = require('./factories/setLoading.js');

exports['should change loading state based on type'] = function (test) {
  var action = setLoading('messages', true);
  var input = {};
  var state = {
    set: function (path, value) {
      test.deepEquals(path, ['loading', 'messages']);
      test.equals(value, true);
    };
  };
  action(input, state);
  test.done();
};
```

Remember that testing is not only to verify that a logic runs as intended. It also protects your from other developers, and yourself, making changes that breaks the application.

### Reusability

All actions and chains can be reused across signals. An example of this would be loading the initial messages when opening the messages page.

```javascript

signal('messagesOpened',
  setTitle('Messages'),
  ...getMessages()
);

signal('refreshButtonClicked',
  ...getMessages({
    success: [...getLatestMessage]
  })
);
```

Think of actions like single pieces of lego blocks and chains as multiple lego blocks put together. They can be broken up and put together in any kind of way. This is why we say "composition over inheritance". It gives increadible flexibility.

### Debugger

The Cerebral debugger will always display all the actions of a signal. Their inputs, outputs, paths chosen etc. This makes it easy for you to understand what happens inside the application when you are playing around in the UI. You actually get a complete overview of the UI, state changing flow and the current application state. A complete mental image.

## Other benefits

### Type checking

Cerebral is able to type check inputs and outputs of actions. It also analyzes all signals and warns you if you are using them wrong. Type checking is important on larger apps and teams. Combine type checking with unit tests for actions and you can feel very safe scaling your app.

### Routing

The Cerebral Router has a different approach than most routers. It has nothing to do with your UI at all. You do not reference templates in the router or reference the router inside components. The router is just binding a url to a signal. This allows signals to update the url and urls to trigger signals. To understand how this works you can watch [this video](https://www.youtube.com/watch?v=PZjXPziD9Cw).

### Services

Often actions needs to use external tools. For example you want to use *superagent* as your ajax library. When you instantate the Cerebral controller you can pass it *services*. These services are the fourth argument in actions.

```javascript

function getSomething (input, state, output, services) {
  services.superagent('/something', function (err, result) {

  });
}
```

This allows you to easily mock any external library when you test your actions.

## Summary

I hope this gave you a good introduction to Cerebral. What it tries to solve, how it solves it and what benefits you get from it. If this was interesting to you I encourage you to go to the [Cerebral website](http://www.christianalfoni.com/cerebral) to read more on how to get going!
