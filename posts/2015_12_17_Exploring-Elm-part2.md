# Exploring Elm - Part 2

In the previous article we took a look at Elm and how we can structure Elm applications. It is important to divide logic into different files and allow views to share state and trigger any actions to change the state in the application. This is based on ideas from Flux, which allows us to structure and scale applications without causing a lot of pain.

We also compared Elm to a popular Flux library called [Redux](https://github.com/rackt/redux) and we see there are a lot of similar ideas. In this article we are continuing our exploration. We are going to look at side effects, like doing an HTTP request. These are called *Effects* in Elm.

We will build upon our boilerplate from the previous article, so please [have a look at that]() if you want to play around with Elm.

### Effects
"Put your side effects at the edge of your application" is a statement I have often heard in the context of Elm. What this basically means is that when you trigger a change in your application the end result of that can create a side effect. Normally the end result is changing the state, but with Elm you can also trigger a side effect.

Let us compare this to Redux:

```javascript

import ajax from 'ajax';

export const GET_ITEMS = 'GET_ITEMS';
export const SET_ITEMS = 'SET_ITEMS';

export function getItems() {
  return (dispatch) => {
    dispatch({type: GET_ITEMS});
    ajax.get('/items')
      .then(() => {
        dispatch({type: SET_ITEMS});
      });
  };
}
```

With Redux we express the side effect as part of our action. This is not the case with Elm:

```elm

type Action =
    NoOp
    | GetItems
    | SetItems (Maybe (List String))

update : Action -> Model -> (Model, Effects Action)
update action model =
  case action of
    GetItems ->
      (model, getItems)
    SetItems maybeList ->
      ({ model | items = (Maybe.withDefault model.items maybeList) }, Effects.none)
    NoOp ->
      (model, Effects.none)
```

The signature of our update function has changed. Now we are returning a *tuple*, instead of just the model. On *GetItems* the second item in the tuple is an *Effect*, called *getItems*. The second Action, *SetItems*, returns an update of our model, but no effect. You are now probably wondering about this Maybe stuff... hang on :-)

### HTTP Request
First lets look at how this *getItems* function is defined.

```elm

type Action =
    NoOp
    | GetItems
    | SetItems (Maybe (List String))

getItems : Effects Action
getItems =
  Http.get decodeResponse "/items"
    |> Task.toMaybe
    |> Task.map SetItems
    |> Effects.task

decodeResponse : Json.Decoder (List String)
decodeResponse =
  Json.list Json.string
```

So there are a few things happening here. First of all we have our action that might receive a list of items, *SetItems*. The items are just strings in an array, so we say `(Maybe (List String))`. Maybe a list of strings. In the *getItems* function we perform a get request and pass it a function to run on the response, *decodeResponse*. We also pass the url. This get request is a *Task*. Tasks are basically something that can fail and they are commonly asynchronous. *Http.get* is a task.

And now we can see a feature of Elm called piping. It really is just a way to reduce using parenthesis. This is initially a bit confusing, at least it was for me. The pipes above can be expressed as: `Effects.task (Task.map SetItems (Task.toMaybe (Http.get decodeResponse "/items")))`. So reading it like this tells us more about how the code runs and in turn what it returns, which is a a Task converted to an Effect (Effect.task). In the pipe version it looks like we are returning the Http task itself, which we are not. That said, it is more human readable:

1. We run a get request
2. When it responds we convert the Task value to a Maybe
3. We map over the Task and trigger *SetItems*, passing the tasks Maybe value
4. The map returns a transformed Task which we convert to an Effect

Okay, now we are talking about a lot of new stuff. I am having a hard time finding an analogy for this in JavaScript. Maybe it is just because I do not quite understand it yet. What are actually Tasks and why do I need Effects? How would I handle error responses? I have honestly no idea, but hopefully as this expedition moves on I will get a better understanding and can tell you about it!

Last but not least we also have a function related to getting the data. The *decodeResponse* function describes the data you want to extract from the response. In this case we have an array of strings responded so we state that using `Json.list Json.string`. You also have functions that will let you dive into nested properties etc. for other kinds of Json structures responded.

### Wire it all together
In the last article I talked a lot about scalability. We want to divide our logic into different files and we want our views to access any state and trigger any state change. But also at that point you can get into trouble with structuring your files. A very common pattern in file structure is the "module pattern", so lets look at that:

```javascript

/Items
  /Actions.elm
  /Model.elm
  /Views
    /List.elm
    /Title.elm
App.elm
Model.elm
```

So now we have a way to separate state, state changes and views into different modules. But all of them can look at all the state of the app and change state related to any other view. The way we achieve this is in our *App.elm* file:

```elm

module App where

import Html exposing (..)
import Html.Attributes exposing (..)
import Task
import Effects exposing (..)
import StartApp

import Items.Views.Title as Title
import Items.Views.List as List
import Items.Actions as ItemsActions
import Model exposing (model)

-- VIEW
view address model =
  div [ class "App" ]
    [
      Title.view,
      List.view address model
    ]

app =
  StartApp.start {
    init = (model, ItemsActions.getItems),
    view = view,
    update = updates [ItemsActions.update],
    inputs = [ ]
  }

main =
  app.html

-- WIRING
update action update (oldModel, accumulatedEffects) =
  let
      (newModel, additionalEffects) = update action oldModel
  in
      (newModel, Effects.batch [accumulatedEffects, additionalEffects])

updates updaters =
  \action model ->
    List.foldr (update action) (model, Effects.none) updaters

port tasks : Signal (Task.Task Effects.Never ())
port tasks =
  app.tasks
```

The *update* and *updates* functions here are custom. These allow you to pass in an array of update functions from different Action files, as you can see on the record passed to the *StartApp.start* function. That means it requires a bit of boilerplate, but this is nothing compared to most JavaScript libraries using Flux like patterns.

### Structuring tasks
You might have noticed that we trigger *ItemsActions.getIems* on the init of our application. That means we can create an effect as we start up the application. Lets look at how I structured that part. Looking into the */Items/Actions.elm* file from the boilerplate:

```elm

module Items.Actions where

import Effects exposing (..)
import Model
import Tasks.Ajax as Ajax
import Json.Decode as Json

type Action =
    NoOp
    | SetItems (Maybe (List String))

update : Action -> Model.Model -> (Model.Model, Effects Action)
update action model =
  case action of
    SetItems maybeItems ->
      let
        items = model.items
        newItems = { items | list = (Maybe.withDefault items.list maybeItems), isLoading = False }
      in
        ({ model | items = newItems }, Effects.none)
    NoOp ->
      (model, Effects.none)

getItems =
  Ajax.get "/api/items" (Json.list Json.string) SetItems
```

As we can see here the *getItems* function will call a function on an Ajax task I created. It passes a url, how to decode the response and what action to run when the response is received. That means when we get a response here the *SetItems* action will run.

Lets look at the Ajax task located at */Tasks/Ajax.elm*:

```elm

module Tasks.Ajax where

import Effects exposing (..)
import Http
import Task

get url decoder action =
  Http.get decoder url
    |> Task.toMaybe
    |> Task.map action
    |> Effects.task
```

As you can see it just create the task running the passed decoder and url. On the response it triggers the passed action and returns the Task as an Effect.

### Maybe
Related to Ajax requests we have a Maybe value. Maybe ensures that we handle missing values correctly. The `Maybe.withDefault someDefault theMaybe` function takes a default value as its first argument and the Maybe value is the second. This ensure that we will not get invalid values on our state.

### Summary
Sorry if I was jumping a bit around here, but I think you will get a good overview looking at the [boilerplate](https://github.com/christianalfoni/exploring-elm-boilerplate) this is based on. There is no doubt that going from creating actions, a model and a view to doing Tasks and Effects is a huge jump. I spent a lot of time on this, and I still have no idea what I am doing. I do not know what a Task really is, how it works and why we need Effects wrapped over Tasks. If I want to handle different error responses I do not really know where to start either. But this is in no way saying that Elm is bad at this, it just requires a lot more mental power to overcome the concepts.

I am getting more positive to my initial concerns on Elm. I see now that I can nicely split up my application and even the Tasks I trigger fits nicely inside my Action files, giving a good overview of what is happening on state changes.

In the next section I thought it would be good to go a bit further. Create the TodoMVC example with a backend and splitting up the files in modules. There we need to look at optimistic updates and error handling. Also we need to handle a lot more interaction from the user.

I hope this gave you some more understanding of Elm and please comment below if you know something related to this subject, but not mentioned. Thanks for reading!
