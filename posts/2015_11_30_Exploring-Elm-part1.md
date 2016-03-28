# Exploring Elm - Part 1

So there is a new language that is catching interest these days. [Elm](http://elm-lang.org/), by Evan Czaplicki, is a language that is based on the theories and concepts of FRP (functional reactive programming). In the world of JavaScript we quickly think about tools like [rxjs](http://reactivex.io/), [baconjs](https://baconjs.github.io/) and frameworks like [cyclejs](http://cycle.js.org/). In JavaScript FRP is more of an approach, while in Elm it is just how it works.

The reason I want to explore Elm is that FRP concepts are very interesting, though can be hard to understand in the context of creating an actual application. Examples with events, mapping over data etc. does not really explain how you would use this approach to create an application. But Elm is all about creating applications and FRP is an important part of it.

Since Elm is its own language you express yourself differently in regards of syntax, but it is also enforced how you define state, change that state and define your UI. So in this first article, which I hope to become more articles, we are going to take a small step into Elm. I am no Elm expert at all, but I have built lots of JavaScript applications and tools to help me solve the problems we face when building large applications.

I will compare Elm to JavaScript and specifically [React](https://facebook.github.io/react/) and [Redux](https://github.com/rackt/redux), as they have many similarities.

### Are you a designer or a programmer?
Our approaches to building applications has matured a lot the last year. Much because of React and Flux. And there is a big shift happening. Frameworks using templates has made sure that HTML/CSS developers (designers) has an approachable tool to do their job, but still introduce some new syntax that makes it easier to express business logic inside the templates. But with tools like React we are moving towards a world where you have to be a programmer to express the UI. I actually think this is a good thing. I think HTML/CSS is this thing between design and programming which nobody really likes to do. A designer wants to do design and a programmer wants to do programming. Okay, getting a bit philosophical here, but my point is to place Elm in this world. Elm is taking a step even deeper into the programming world when talking about expressing the UI. Actually pretty much like [hyperscript](https://github.com/dominictarr/hyperscript).

### Get going with Elm
Though Elm is really easy to get going with, you need more. Just like you can easily load up a script tag, you need something around it when you want to create applications. The first challenge is CSS. You need CSS in your application, but Elm can not express that currently. So we need a workflow to handle this. We also need a workflow that will build our application and bring the compiled Elm application into an HTML file along with the CSS. I was a bit surprised that there really is not much information about this. But after some digging I built [my own workflow](https://github.com/christianalfoni/exploring-elm-boilerplate) using Gulp. If you want to play with Elm I suggest you use that to get going.

The workflow lets you use LESS for css and it will automatically compile on file changes. It will also live reload the page on any changes. I am a big fan of webpack, but it does not make any sense to use that with Elm. The reason being that the Elm code can not require any other assets than Elm files.

### Taming CSS with Elm
One of the latest and greatest is [CSS-Modules](http://glenmaddern.com/articles/css-modules). It lets you scope your CSS with your components/views. This is not possible with Elm, as Elm can not import CSS files. So we need a different strategy. The strategy I suggest is splitting your Elm application up into different views where the top node of each view has its name as class name. An example:

*Title.elm*
```elm

view =
  div [ class = "Title"] [ ]
```

This way you can separate styling and still scope it to specific parts of your application. That said, any subviews are in risk of being affected by parent view CSS.

### The challenges Elm needs to cover
So I am no Elm missionary. I am just a programmer who is always looking for tools to solve my problems and I think Elm has some very good ideas. That said, I am very unsure how Elm works in a larger scale. Counters and a TodoMVC where all the code is in the same file does not really help me. So lets create a list of things I am specifically going to explore in this article:

- All examples of Elm applications I have seen is expressed as one single file. That does not work in bigger applications. How does splitting my app in different files affect how Elm works?
- All examples of Elm applications I have seen does not have much state and the state is defined in the same file as the view. That does not scale. You need to have a global state store to be able to share state across views. So how does Elm handle this?
- All examples of Elm applications I have seen defines their state changing logic inside the same file as the view. This does not scale. You need a global state changing layer to allow multiple views to trigger the same state changes. Is that possible with Elm?

There are many other things to explore, but these are the basics of building a scalable application. Lets dive in!

### Creating an application
Given that you have used [this boilerplate](https://github.com/christianalfoni/exploring-elm-boilerplate) you can just fire up the server and the workflow. I will go step by step through how you build the app and compare it to normal JavaScript.

What is really great about Elm is that you get all the tools you need right out of the box.

```elm

module App where

import Html exposing (..)

main =
  text "Hello world!"  
```

This piece of code creates a module. The module exposes all the methods of the Html module on the scope and defines the special *main* function. That function is just like the *render* function of React. So lets see this in JavaScript

```javascript

import {Text, Div, Span...} from 'Html';

render(<Text>Hello world</Text>, document.body);
```

The difference here is that we automatically expose everything from the *Html* module.

### Defining state
I come from the world of single state trees and Flux. I do not want state in my components/views because it too often gets me into problems. The reason being that some other component/view needs access to the same state. The great thing about Elm is that everything is immutable and the syntax makes it easy to handle this, unlike JavaScript where it can look quite ugly.

*Model.elm*
```elm

module Model where

items : List String
items =
  [ "foo", "bar" ]
```

In JavaScript this would look like:

```javascript

export const items = ["foo", "bar"];
```

So basically everything you define on a module is exposed by default, though you can control that. In the Elm code we define that our items is a list of strings, which is great. That helps Elm understand when we might do something wrong with the list somewhere else in the code. This looks great when exposing a list, but what about a record/object?

```elm

module Model where

type alias Items =
  {
    isLoading : Bool,
    list : List String,
    hasError : Bool
  }

items : Items
items =
  {
    isLoading = False,
    list = [ ],
    hasError = False
  }
```

Okay, so this is possible. But what if a piece of my state is a List of objects.

```elm

module Model where

type alias Item =
  {
    title : String,
    solved: Bool
  }
type alias Items =
  {
    isLoading : Bool,
    list : List Item,
    hasError : Bool
  }

items : Items
items =
  {
    isLoading = False,
    list = [ ],
    hasError = False
  }
```

Okay, so this certainly scales, though this file will get huge as I add lots of state. Maybe it is a better idea to split this up into multiple files. That would allow me to do:

*Model/Items.elm*
```elm

module Model.Items where

isLoading : Bool
isLoading = False

hasError : Bool
hasError = False

type alias Item =
  {
    title : String
    solved : Bool
  }
list : List Item
list = [ ]
```

This certainly looks more scalable, though it will require a lot of work to wire it into our model. The reason is that each of these exposed values has to be accessed specifically. We can not use the module like a normal object, like in JavaScript. That means we have to change it a bit:

*Model/Items.elm*
```elm

module Model.Items where

type alias Item =
  {
    title : String
    solved : Bool
  }

model : { isLoading : Bool, hasError : Bool, list : List Item}
model =
  {
    isLoading = False,
    list = [ ],
    hasError = False
  }
```

Okay, so now we have a single exposed value, which is some state and we have types on them. Nice! Lets bring it into our app:

```elm

module App where

import Html exposing (..)
import Model.Items

main =
  text "Hello world!"  
```

As you can imagine you will have many model files, much like reducers in Redux. Though they just describe initial state, not how that state is changed. We will get to that.

### Exposing state to the application
Now we need a way to expose our model to the app. Elm comes with a small package, called *StartApp*, that lets you expose state and a messaging concept for doing state changes. This is part of the boilerplate and you just:


```elm

module App where

import Html exposing (..)
import Model.Items
import StartApp.Simple as StartApp

-- Model
initialState =
  {
    items = Model.Items.model
  }

-- View
view address model =
  text "Hello world!"

main =
  StartApp.start
    {
      model = initialState,
      view = view
    }
```

Okay, when we start our application we pass in some initial state and the top level view. As you can see we have access to the model in our view, but also something called *address*. This has to do with changing the state of your application. Lets dive into that.

### Changing the state of your application
As stated in the introduction we need a way to let any view change any part of our state. In most examples this is defined within the view, but that coupling is something that gets you into problems in larger applications. So I have been researching a bit. But first, lets talk about how we actually express a state change in Elm.

*Actions/Items.elm*
```elm

module Actions.Items where

type Action =
  NoOp
  | Add

update action model =
  case action of
    Add text ->
      let
        items = model.items
        changedItems = { items | list = List.append items.list [ text ] }
      in
        { model | items = changedItems }

    NoOp ->
      model
```

If you have used Redux this will look familiar to you:

```javascript

import {
  NO_OP,
  ADD
} from './actions';

export default function (state, action) {
    switch (action.type) {
      case ADD:
        const items = state.items;
        const changedItems = {...items, list: items.list.concat(action.text)};
        return {...state, items: changedItems};
      case NO_OP:
        return state;
    }
}

// Or maybe you use object assign
export default function (state, action) {
    switch (action.type) {
      case ADD:
        const items = state.items;
        const changedItems = Object.assign({}, items, {list: items.list.concat(action.text)});
        return Object.assign({}, state, {items: changedItems});
      case NO_OP:
        return state;
    }
}
```

As you can see the difference from Redux is that you have access to all your state, and you have different syntax for changing the state. It certainly is shorter and sweeter. But as I said, Elm examples defines their actions within the views. What I want is to globally define them so that any view can use them.

Lets get back to our application and see what we can do to fix that:

```elm

module App where

import StartApp.Simple as StartApp
import Html exposing (..)
import Model.Items
import Actions.Items

-- Model
initialState =
  {
    items: Model.Items.model
  }

-- View
view address model =
  text "Hello world!"

-- Update
update update data =
  {data | model = update data.action data.model}

updates updaters =
  \action model ->
    .model (List.foldr (update) {action = action, model = model} updaters)

main =
  StartApp.start
    {
      model = initialState,
      view = view
      update = updates [Actions.Items.update]
    }
```

So what I am basically doing here is making the update function of my application to run through multiple update functions from different action files. When I add new actions I just add them to the list passed to *updates* and any views is able to trigger a change in any part of my application. In my experience that will never get you into any scaling problems.

### Trigger a state change
So now we just have to solve the last part. That is nesting views and trigger state changes. Let us create a new file that will list our items and also add new items to the list.

*View/Items.elm*
```elm

module View.Items where

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Actions.Items as Items

item item =
  li [ ] [ text item ]

view address model =
  div [ class = "Items"]
    [
      button [ onClick address (Items.Add "Foo") ] [ text "Add" ],
      ul [ ]
        List.map item model.items.list
    ]
```

As we can see our nested view will receive *address* and all the state of our app through *model*. In our div we have a button that will use *address* to trigger an *Add* action and pass the text *Foo* when it is clicked. Then our ul elements children will be built by mapping over the items list and producing li elements. Much like JavaScript, using React and Redux approach:

```javascript

import actions from './actions';

export default function (props) {
  const renderItem(item) {
    return <li>{item}</li>;
  }
  return (
    <div className="Items">
      <button onClick={() => actions.addItem("foo")}>Add</button>
      <ul>
        {props.items.list.map(renderItem)}
      </ul>
    </div>
  );
}
```

So now let us move over to our main application file and use our view.

```elm

module App where

import StartApp.Simple as StartApp
import Html exposing (..)
import Model.Items
import Actions.Items
import Views.Items as Items

-- Model
initialState =
  {
    items: Model.Items.model
  }

-- View
view address model =
  div [ class = "App" ]
    [
      h1 [ ] [ text "Hello world!" ],
      Items.view address model
    ]

-- Update
update update data =
  {data | model = update data.action data.model}

updates updaters =
  \action model ->
    .model (List.foldr (update) {action = action, model = model} updaters)

main =
  StartApp.start
    {
      model = initialState,
      view = view
      update = updates [Actions.Items.update]
    }
```

### Summary
As stated I am no expert in Elm. I am a JavaScript developer and have spent a lot of time with different Flux implementations and tried to solve some challenges myself, like the [cerebral project](http://www.cerebraljs.com). Diving into Elm I was surprised how quickly I got around the new syntax and how very familiar it really is to our world. That said, Elm is its own language and has lots of great "built in" features like rarely having runtime errors as Elm understands how everything is connected in your app at compile time. It also has immutability built in which is really great. Last but not least it allows you to express state and state changes with really nice syntax and less verbosity than in JavaScript.

My initial concerns with Elm I believe to be solvable. This was just my initial approach though and maybe there are lots better ways of doing it. That said, I still have more concerns. Like expressing complex state changes, getting into side effects like ajax requests and building bigger nested structures of views. Passing *address* and *model* everywhere feels a bit off. Also performance is a concern as I do not quite understand how Elm decides upon what views needs to be rendered or not.

Hopefully this gave you some insight into Elm and please do try it out using [this boilerplate](https://github.com/christianalfoni/exploring-elm-boilerplate). It is a fantastic piece of work and there is so much more to Elm than what I have gone through here. Thanks for reading!
