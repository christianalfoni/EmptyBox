# Relational Data

Very often your data is structured in such a way that you need to do lookups. An example of this would be messages having authors. You do not store all the authors on the messages, because the same author might appear on many messages. Now we are talking about relational data. We store the *id* of the user on the message and use a lookup.

Let us look at a complex example:

```javascript

{
  messages: {
    '123': {
      title: 'foo',
      comments: ['789']
    }
  },
  comments: {
    '789': {
      content: 'Whatap!',
      user: '456'
    }
  },
  users: {
    '456': {
      name: 'John'
    }
  }
}
```

This is what we call *source data*. It is data contained in your application state, but not necessarily what is displayed in the UI at this point. Using objects to define source data is really great because it makes it very easy to do lookups. Let us look at how we would display a list of messages with all this data using Baobab Monkeys.

```javascript

{
  data: {
    messages: {
      '123': {
        title: 'foo',
        comments: ['789']
      }
    },
    comments: {
      '789': {
        content: 'Whatap!',
        user: '456'
      }
    },
    users: {
      '456': {
        name: 'John'
      }
    }
  },
  messages: {
    ids: ['123'],
    list: Model.monkey({
      cursors: {
        ids: ['messages', 'ids'],
        messages: ['data', 'messages'],
        comments: ['data', 'comments'],
        users: ['data', 'users']
      },
      get(data) {
        return data.ids.map((messageId) => {

          const message = messages[id];
          return {
            ...message,
            comments: message.comments.map((commentId) => {
              const comment = data.comments[commentId];
              return {
                ...comment,
                user: data.users[comment.user]
              };

            })
          }

        });
      }
    })
  }
}
```
Now you can safely update any comments, messages and users in the source data and anything displayed related to those will automatically update because of the monkey. You can also just replace the *ids* used to display the messages or create other lists mapping the data in different ways. Maybe one list only shows the number of comments and an other shows the comments with authors.

This is how a component could now display this list:

```javascript

import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react';

@Cerebral({
  messages: ['messages', 'list']
})
class Messages extends React.Component {
  renderComment(comment, index) {
    return (
      <div key={index}>
        <h6>{comment.user.name}</h6>
        <p>{comment.content}</p>
      </div>
    );  
  }
  renderMessage(message, index) {
    return (
      <li key={index}>
        <h4>{message.title}</h4>
        {message.comments.map((comment, index) => this.renderComment(comment, index))}
      </li>
    );
  }
  render() {
    return (
      <ul>
        {this.props.messages.map((message, index) => this.renderMessage(message, index)))}
      </ul>
    );
  }
}
```

You might say that this is quite verbose, but again, this is very complex relational state. It gives you complete flexibility in what you want to display in the UI.

I would suggest you think about your state store as a database if you have relational data. Objects represent tables and arrays in combination with monkeys are what you would call views.
