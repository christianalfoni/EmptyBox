# Combining React with industrial design

In the world of web applications it is not enough to just write code. We also need a well thought out interface for our users to interact with the application. The web has changed a lot the last few years as we have moved from building static websites to full fledged complex applications. The workflow of writing code, collaborating with designers and push great products out the door is still changing as we explore this brave new world. In this article I am going to tell you about a collaboration where the designer treats the developer as a manufacturer of components, and how this idea can make very happy developers and designers.

### Meet Arne
When you meet Arne the first time, looking at his style in clothing and that huge keychain he drags around, you kinda get this impression of a punk rocker who works as a janitor. Though Arne is indeed a practical guy he does all his work on and on top of a small laptop. I kid you not, he has a tiny external mouse using the hand resting point of his laptop as the scroll surface. Consider this in addition to him always being late, impossible to get his attention due to always listening to loud music and last but not least, his workspace of choice, you can safely state that Arne is an original.

### Industrial design
But before we get into React we need to talk about industrial design. So Arne has a  master in physical product design, including studies in interactive and digital design. His master thesis was designing an oil vacuum cleaner. Pretty cool stuff. It cleans up oil spills in the ocean. What makes traditional digital web design different from practical industrial design is that you often have multiple manufacturers, where each manufacturer builds specific components for your creation. It is your responsibility as the designer to make sure that all the pieces fits together at the end.

The way Arne approached this workflow is that he would visit the manufacturers to understand how their manufacturing process works. This research makes his designs more manufacturer friendly. As Arne says: "To describe the expected product you have to understand how it will be built". This process often starts with "the big picture", not even pointing out the different components. It is all about functionality which can be based on different criteria. In the case of the oil spill vacuum cleaner it was mostly a matter of size.

As the process moves a long the components are identified and their details are defined. Details like measurements, materials etc. are extracted into their own isolated concepts. Some components composes into bigger components. And now we are starting to see how this relates to React.

### Ducky
So Arne and I are working together on a project for a little startup in Norway called [Ducky](http://www.ducky.no). They are environmental consultants and are working on a platform to socialize, gameify and educate around how companies and people like you and me can make a difference for the environment.

The platform is completely web based and there are often changes and new features as the startup is still researching how they can affect their users. To handle all these changes and reuse as much as possible it was decided to divide the project into two:

1. A component project with only stateless React components. No other dependencies related to state
2. A main project which has all the business logic and state handling, running on [Cerebral](http://www.cerebraljs.com)

The workflow up to this point was creating specific components for each new concept and they were all implemented with the business logic. Jumping back and forth between business logic, UI structure and styling is a messy process for a developer. But not only the developers was happy about this change to focus on UI and styling separately from business logic, also Arne got excited about this. The pure focus on well defined and reusable components gave strong relations to his previous work.

### The workflow
Arne still designs the "big idea" which is discussed with the whole team, but as a concept is decided upon the real practical work starts. This is a picture of a github issue created by Arne:

![stateful component](/images/ducky/1.png)

They are divided into five parts:

1. The expected result
2. Composition blueprint
3. Optionally properties and/or style deviation
4. Example sequence
5. Links to components composing this component

Now, this issue is related to building a component inside the main project. It is an application specific component, a stateful React component. But it is composed by multiple stateless components. A stateless component usually only consists of point 1. and 3.

#### The expected result

![expected result](/images/ducky/2.png)

The expected result is very often what designers gives to developers as an implementation specification. The problem with this approach is:

1. The developer will probably write a lot of duplicate styling and UI structure
2. Margins, paddings, colors etc. is very hard for a developer to extract from a design mockup, missing out on the importance of these smaller details
3. The end result and impression of the application as a whole will not be coherent
4. Developer takes a lot of shortcuts, especially with CSS, risking a messy codebase

With an industrial design mindset we can solve these issues. The reason is that this mindset has more focus on **how** something is going to be manufactured (implemented), rather than just the expected end result.

#### Composition blueprint

![blueprint](/images/ducky/3.png)

This is the real specification. This is what tells the developer what components that composes an application specific component. And this is where the magic happens. Instead of the developer being concerned with producing multiple components, implementing their UI structure and styling, the developer can focus only on the business logic. So either you build small stateless components defining UI structure and styling on one project, or you sit on an other project composing them together and hooking them up to stateful components and the business logic.

#### Properties and deviations

![properties](/images/ducky/4.png)

In design there are always small deviations, often related to colors. In these situations Arne defines what these properties and deviations are. A typical example would be that a `Wrapper` component should have a specific background color.

### Example sequence

![sequence](/images/ducky/5.png)

Users interacts with the interface and it can have many different states. This is what makes application design different from web design. You have to imagine all the states and ideally also design them. You have hover states, disabled states, loading states, dynamic lists etc. And this is where it gets tricky. Often these states are related to waiting on data from server, but the designer usually has no idea about that. In Ducky we just keep a fast feedback loop to identify when a description is missing a state related to data fetching or something else.

#### Links to components
All components, being in the main project or the components project, has their own github issue. Application components in the main project has links to the components they are composed by. This makes it easy for us to identify that the base components are implemented and ready to be composed into our main project.

![links](/images/ducky/6.png)

Github also links the other way around, so when we click a base component in our components project we can see what application components composes it.

![parentlinks](/images/ducky/7.png)

### Scoping components
So on one side we have these large application components and on the other side we have these small base components. What about abstractions in between? Let me give an example.

One stateless component can be an icon, `<Icon type="favorite"/>`. But now we want to use that icon in a button. How do we handle that?

1. We can create an `<IconButton type="favorite">My button</IconButton>`
2. We can configure a button `<Button icon="favorite">My button</Button>`
3. We can compose it `<Button><Icon type="favorite"/>My button</Button>`

So what is the right answer? There is really no right answer, there is only consequences.

The first suggestion will increase the number of components and give very subtle differences that can be hard to reason about. Like: `<IconButton/>`, `<IconTooltipButton/>` etc.

The second example risks getting a lot of props, causing multiple `if (someProp) {}` in their implementation. `<Button icon="favorite" tooltip="some text">My button</Button>`. Also its behaviour has to be implemented in multiple components: `<Hyperlink tooltip="some tooltip"/>`

Here at Ducky we favor composition over abstraction any day. In other words, we prefer example 3. :) And this is why:

- It is safe to build small basic components as they are very unlikely to change. And if they do it is highly likely that you want the same change wherever the component is used
- Very few props are passed to each component
- We rarely pass a prop from our application component to a stateless component which just passes that prop down to another component. That way we keep the UI structure less rigid
- We can easily introduce new compositions. For example maybe we wanted to wrap our `<Icon/>` in a `<Tooltip text="wheeee"><Icon/></Tooltip>`. With the two other approaches we would have to move back to the components project and implement new components or props with `if (tooltip) {}`.

But some components should be abstracted? Well, ideally not. I think we need to move ourselves from traditional thinking where we imagine the *tabs* actually has something to do with the *tab content*. They really do not, let me explain.

Your application is in a state where the current tab index is `1`.

```javascript

<Wrapper>
  <TabButton active={currentIndex === 0}>Overview</TabButton>
  <TabButton active={currentIndex === 1}>Something else</TabButton>
</Wrapper>
<Wrapper>
  {currentIndex === 0 ? 'Some awesome content' : null}
  {currentIndex === 1 ? 'Some other awesome content' : null}
</Wrapper>
```

This is a much more flexible approach than going all "abstracty":

```javascript

<Tabs
  buttons=['Overview', 'Something else']
  contents=['Some awesome content', 'Some other awesome content']
  activeIndex={currentIndex}/>
```

What if our buttons suddenly needs an icon? We move over to components project to implement and refactor our existing tabs and our new tab to:

```javascript

<Tabs
  buttons=[{icon: 'favorite', label: 'Overview'}]...]
  contents=['Some awesome content', 'Some other awesome content']
  activeIndex={currentIndex}/>
```

But our content should not only be text, it should support any kind of content. We move over to components project to implement and then move back:

```javascript

<Tabs
  buttons=[{icon: 'favorite', label: 'Overview'}, ...]
  contents=[<p><a href="">Link</a></p>, ...]
  activeIndex={currentIndex}/>
```

This is a really annoying workflow that constantly gets you into issues. To make these changes to our initial approach we could just:

```javascript

<Wrapper>
  <TabButton active={currentIndex === 0}>
    <Icon type="favorite"> Overview
  </TabButton>
</Wrapper>
<Wrapper>
  {currentIndex === 0 ? <p><a href="">Link</a></p> : null}
</Wrapper>
```

You are completely free to create variables and iterators to more effectively produce these components of course, but they are all built by completely basic stateless components.

### Design spec vs. implementation
These application components can get pretty big with lots of composition. So this is a key difference from design spec and implementation. Even though Arne creates abstractions in his design specification it does not necessarily mean we are going to implement the same abstractions in our code. Lets look at an example, the "activity modal":

![activity](/images/ducky/8.png)

Here we see that Arne has composed the "activity modal" into two main components. But these components contains many sub components. So what we do is dive into these components and locate their smallest pieces which will be implemented in our components project.

![activity](/images/ducky/9.png)

When we reach the "bottom" we start composing by "walking up the design spec" until we reach the issue that is the "activity modal". Everything happening in our main application project. We are completely free to make small abstractions, extra render methods etc. to make our code clean and dry, but we do not pass a lot of props into isolated magical components. Everything can be changed around inside our main application project.

### Summary
This workflow has been a game changer for us. It builds a great foundation for moving faster and faster as the project grows, even with a lot of changes. It has also made us realize the complexity of the applications we try to build. This inspires us to look into other tools to help us define and build our components. Hopefully we can share that with you later :-)

If you have questions, or maybe you have similar experiences, please share in the comments below. And thanks so much for reading!
