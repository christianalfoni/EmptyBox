# Responsibilities

A Cerebral application has three layers:

1. UI and interaction
2. Produce state
3. Store state

These layers pass data between them, so lets talk about that.

### UI and interaction
The UI is interacted with and based on this interaction you pass data to a signal. This data is used to produce a new state. The job of the UI is to pass any interaction data needed to produce a state. Sometimes that is just signaling that an interaction occurred, like a click. Other times you pass text from an input. The idea is to not have state producing logic inside the UI at all.

### Produce state
In Cerebral it is signals and their actions that has the logic for producing state. The signal has the optional interaction data that is passed into each action. Each action has a specific job and can output data to other actions a long with any interaction data passed. Sometimes existing state is needed to produce new state. All actions has access to the state store with all the current state. The produced state is put into the state store by the actions.

### Store state
One big object containing all the state of the application. The state API used in the actions dives into this object and changes the state of the application.
