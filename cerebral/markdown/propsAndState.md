# Props and State

Let us just dive right into an example. You have a list of messages. Inside your state store there are 500 messages and you want to display 50 of them in a list. Would you do this:

```javascript

@Cerebral({
  messages: ['messagesList']
})
class MessagesList extends React.Component {
  renderMessage(message, index) {
    return (
      <Message id={message.id}/>
    );
  }
  render() {
    return (
      <ul>
        {this.messages.map(this.renderMessage)}
      </ul>
    );
  }
}

@Cerebral((id) => ({
  message: ['messages', props.id]
}))
class Message extends React.Component {
  render() {
    return (
      <li>{this.props.message.title}</li>
    );
  }
}
```

Or would you:

```javascript

@Cerebral({
  messages: ['messagesList']
})
class MessagesList extends React.Component {
  renderMessage(message, index) {
    return (
      <Message message={message}/>
    );
  }
  render() {
    return (
      <ul>
        {this.messages.map(this.renderMessage)}
      </ul>
    );
  }
}

class Message extends React.Component {
  render() {
    return (
      <li>{this.props.message.title}</li>
    );    
  }
}
```

Whenever you register state from Cerebral to a component a callback is registered inside Cerebral. This callback is called on all signal updates to verify if its related component needs to update. The less callbacks that are registered, that faster your app will run from a Cerebral standpoint. That said, in the second example all messages will rerender on any "messages" change. A convention in React is to check the need for a render using `shouldComponentUpdate`:

```javascript

@Cerebral({
  messages: ['messagesList']
})
class MessagesList extends React.Component {
  renderMessage(message, index) {
    return (
      <Message message={message}/>
    );
  }
  render() {
    return (
      <ul>
        {this.messages.map(this.renderMessage)}
      </ul>
    );
  }
}

class Message extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.message !== this.props.message;
  }
  render() {
    return (
      <li>{this.props.message.title}</li>
    );    
  }
}
```

This will ensure that only messages that actually needs to rerender will do so. Now, you might say. Have we not just moved the callbacks from Cerebral into each component? Kind of :-) The callbacks in Cerebral will run on ANY state change. Meaning that if you did a change to the "users" state it would run a check on all messages using the first example. Using this last example it will only run a check on all messages when the specific "messages" state has actually changed.

So favor props over bringing in Cerebral state.
