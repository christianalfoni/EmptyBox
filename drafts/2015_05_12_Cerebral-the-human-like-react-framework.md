# Cerebral, the human like React framework

I have been writing about React, Webpack, Flux and Flux like architectures for quite some time now. All these ideas and thoughts have been churning around in my head and after watching [this video](https://youtu.be/2HK4ENBPcWA) on how [Elm](http://elm-lang.org/) is able to control the state flow of your application everything just came together. I wanted to take what I have learned so far and build something that tries to solve all the challenges I have been writing about and at the same time bring something new to the table.

## Meet Cerebral
Cerebral is a framework. I call it a framework because it depends on React and brings in the missing piece, application state handling. Routing, http requests etc. are separate tools you choose based on what the project needs. What it always will need is a UI and application state handling. So that is the core of the framework.

**So why would you even consider Cerebral?** Before going into the thoughts behind Cerebral I want to point out that this is not another "FLUX framework" with its own take on actions, dispatchers and stores. It is a new take on how to handle application state alltogether, but of course inspired by Flux and later solutions like [Baobab](https://github.com/Yomguithereal/baobab). So big thanks to all the brilliant people working new solutions to help web application development be more fun than frustrating!

### Thinking Cerebral

> If your application was a person, Cerebral would be the brain and the nervous system of that person

I want to give you an analogy for building web applications. Think of your application as different people having different responsibilities. Maybe you have one person responsible for a form, an other for the main menu and a third person is responsible for a list. Now, this translates to **views** in an application. So a **view** is basically a person with a brain (the state) and a nervous system (events), and the body would be the UI. The user interacts with the **view** in different ways and events are processed to new state which changes the UI. We can go all the way back to Backbone for this type of behaviour.

Now, though this seems like a good way to manage interaction and state think of a team you have been working with or you are currently working with. It is very difficult to keep everyone in complete sync. You might say something to one team member and later you realize that other team members should also be notified... but that is probably after something went wrong. This is the exact same problem with having multiple persons with their own brain and nervous system representing your application, or multiple views with their own state and event processing. This is why standups are so beneficial, it is an "event hub" to keep everybody in sync.

When FLUX and React JS came a long it basically said, it is too complicated to have multiple persons representing your application, it should only be one person, with one brain and one nervous system. This translates to the brain being your stores and actions being your nervous system. Indeed it is a lot easier to keep in control of everything when you work on your own project. The challenge with FLUX though is that this person now responsible for your application has a split personality. Though it is a single brain, that brain is divided into different sections... different stores. And these stores face the same problem as they depend on each other and requires complex logic to share and update state.

**So what makes Cerebral different?** Cerebral is truly "one person" in this analogy. It has one brain (one object) with the state of the application, but it is even more inspired by our anatomy. Lets keep using the analogy with an example. When you burn your finger, what happens? Does your finger tell your brain to move your arm? No, your finger sends an "fingerHeated" impulse to your brain and your brain processes this impulse and when it reaches a certain level it will put your brain in "move arm state" and the arm moves.

But let us now imagine that you burn your finger badly and it hurts, you do not just move your arm, you also scream. If your finger told your brain to move the arm, the finger would also tell the brain to scream. But you do not have just one finger, you have probably 10 fingers and all of them would have to "implement this logic" and in the correct order. Or else you might scream before removing your arm burning your right hand fingers, but the opposite burning your left hand fingers. This is of course not how it works. The fingers just send an impulse and the brain processes these impulses.

Cerebral has an implementation called **signals**. A signal is just like an impulse. It lets your components signal an interaction. This signal can have multiple actions, but they all happen one after the other. So with our burned finger example you would always move your arm before screaming, or the opposite. The point is that it is consistent. A typical name for a signal in Cerebral is "inputChanged" or "formSubmitted". A good feature with signals is that they are functional. You can add, remove and reuse actions very easily.

### What makes Cerebral so special
When writing a Cerebral app you should ideally not have any state at all in your components. Everything should be defined in **the cerebral**. This keeps Cerebral in complete control of your application state flow and this is an extremely powerful concept. First of all you as a developer has a strong concept of how to store and mutate state. Any mutation of state has to be happen inside a signal or Cerebral will throw an error. And all state should be stored in one object. 

Secondly Cerebral is able to analyze the state flow and exposes an API to use that information. An example of using this information is the **Cerebral Debugger**. When developing an application with Cerebral you are able to use a debugger that displays signals sent and mutations done to the application cerebral. But not only that, you can remember! Using a slider you are able to basically move back in time, always seeing what signal and mutations caused the current state. That is extremely powerful stuff. You can imagine this information could be used for a lot of different things. Like user support, user tracking, notifications etc. It will be exciting to see what developers come up with!

## Lets get into some code
All examples will be in ES6 syntax and componentes use class syntax. It just looks nicer. But now, first of all we need to define a cerebral for our application.

```javascript

import Cerebral from 'cerebral';

let cerebral = Cerebral({
  inputValue: '',
  list: []
});

export default cerebral;
```