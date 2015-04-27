# Handling complex state with Baobab

So Baobab is here in version 1.0. Let us quickly recap why Baobab is such a great tool for your application and then we will see what version 1.0 addresses in regards of complex state handling. I encourage you to read the [initial article on Baobab](http://christianalfoni.com/articles/2015_02_06_Plant-a-Baobab-tree-in-your-flux-application) first as it introduces why you would consider Baobab at all.

## A recap
Baobab gives you the same "one way flow" of state in FLUX, only it reduces a lot of the complexity. A simple view on this "one way flow" is:

```javascript

Architecture using Baobab
  
            |------------|
        |-> | State tree | --|           
        |   |------------|   |
        |                    v
  |---------|         |------------|
  | Actions | <------ | Components |
  |---------|         |------------|

```

Note that the **Actions** layer is whatever you want it to be. Personally I just expose a module with methods that operates on the state tree. The point is that your components never mutate the tree and the actions never return state from the tree. Any change to state is done through an action which changes the tree, which notifies about the change to any components listening to that part of the tree. Baobab handles this very well and it integrates very well with React.

## What is complex state?
First of all we have to get a notion of what we are trying to solve. Even though Baobab up until version 1.0 gave us a great concept for handling state it was challenging to handle "shared data". Let me explain.

### Direct reference
```javascript

let Baobab = new Baobab({

  projects: [{
    id: 0, 
    title: 'foo'
  }, {
    id: 1, 
    title: 'bar'
  }],

  selectedProject: null

});
```

Let us imagine we have a list of projects. They are displayed in a table. When the user clicks one of the projects a modal should appear with the possibility to change the data of the project. So let us imagine that now. The user clicks the first project and triggers an action:

```javascript

import tree from './tree.js';

let actions = {
  selectProject(index) {
    tree.set('selectedProject', tree.get('projects')[index]);
  }
};

export default actions;
```

The problem we face here is that we reference the first project in the projects array. This will get us into trouble. The technical reason you get into trouble is because any change to an object or array in a Baobab tree will effectively change its reference. Baobab does this is so that you can easily do a `prevObj === newObj` to know if something changed. You do not have to go into objects and arrays, traversing them to figure out if anything changed. Especially React takes advantage of this to determine the need to render a component.

Another part of this story is that "shared state is the root of all evil". If a change in one part of your state tree would uncontrollably affect other parts it would be difficult both for you as a developer and Baobab to keep track of those changes. It needs to behave in a predictable manner.

So the only way to really fix this is to create a clone.

```javascript

let Baobab = new Baobab({

  projects: [{
    id: 0, 
    title: 'foo'
  }, {
    id: 1, 
    title: 'bar'
  }],

  selectedProject: {
    id: 0, 
    title: 'foo'  
  }

});
```

But now we have two instances of the same project. One on **selectedProject** and one inside **projects**. So if we change the selected project it will not be reflected in the projects list and vice versa. We would have to create pretty complex logic to make sure everything is up to date in our tree.


### Referencing in a list
In the example above we selected one single project. But what if you downloaded 1000 projects to the client and just wanted to show 10 of them in a table? We need to clone multiple of the projects.

```javascript

let Baobab = new Baobab({

  projects: [{
    id: 0, 
    title: 'foo'
  }, {
    id: 1, 
    title: 'bar'
  }...1000],

  projectRows: [{
    id: 0, 
    title: 'foo'
  }, {
    id: 1, 
    title: 'bar'
  }...10]

});
```

And we run into the exact same problem as above, though it requires even more logic to keep in sync.

### Reference within reference
Very typically in relational databases everything is referenced with an ID. So let us imagine our projects can have comments. These comments are referenced by ID. Let us add that to the state tree:

```javascript

let Baobab = new Baobab({

  comments: [{
    id: 0, 
    comment: 'foo'
  }, {
    id: 1, 
    comment: 'bar'
  }],

  projects: [{
    id: 0, 
    title: 'foo', 
    comments: [0]
  }, {
    id: 1, 
    title: 'bar', 
    comments: [1]
  }...1000],

  projectRows: [{
    id: 0, 
    title: 'foo',
    comments: [{
      id: 0, 
      comment: 'foo'
    }]
  }, {
    id: 1, 
    title: 'bar',
    comments: [{
      id: 1, 
      comment: 'bar'
    }]
  }...10]

});
```

Now we need even more complex logic, because we do not really want just the ID of the comments, we want the comments themselves. We have to handle that while cloning. But what if a comment is deleted? We have to traverse all projectRows, check the project comments if it exists there and remove it also. But even worse, what if we did not have the data for the comment yet? We have to grab it from the server. How would we handle that?

## Baobab-react
One clever change in the v1.0 of Baobab is that the React parts of the library is moved into its own repo. The reason is that there are many different ways you might want to handle moving state into your components. Baobab allows for different strategies, even ES7 decorators, which we are going to look at shortly.

Another thing to notice is that Baobab now uses the context to pass state into your components. This is a less intrusive and more isomorphic friendly way of doing it. In practice it means that none of your components will depend on the state tree itself, it is injected in your top component and you use mixins to extract the state. Let us have a look at that first to get used to the syntax:

*main.js*
```javascript

import tree from './tree.js';
import {root, branch} from 'baobab-react/mixins';

/* We first set up our top component. This component will need
   the "root" mixin. The root mixin exposes the state tree on
   the context */

let App = React.createClass({
  mixins: [root],
  render() {
    return (
      <div>
        <Header/>
      </div>
    );
  }
});

/* Any child component in the application can attach the
   branch mixin. This mixin allows you to attach cursors
   that will extract state from the tree and attach it to
   the state object of the component */

let Header = React.createClass({
  mixins: [branch],
  cursors: {
    foo: ['bar']
  },
  render() {
    return (
      <div>{this.state.foo}</div>
    );
  }
});


/* When we render the application we attach a "tree" prop to it
   and pass our tree. Now you see how well this works on the server,
   where you would probably pass down different trees based on the user
   requesting a resource */

React.render(<App tree={tree}/>, document.getElementById('app'));
```

But now, let us look at the one major API addition to Baobab.

## Facets
So the new term is **Facets**. If you think about how components are able to use cursors to compose a UI description in the example above, think of Facets using cursors to compose state. Nothing explains this better than an example though, so let us head straight to our first challenge and solve that.

### Solving direct reference

*tree.js*
```javascript

import Baobab from 'baobab';

/* We define a Facet simply as an object with two special properties, 
   "cursors" and "get" */

let selectedProject = {
  cursors: {
    id: ['selectedProjectId'],
    projects: ['projects']
  },
  get: function (state) {
    return state.projects[state.id];
  }
};

/* We define our tree with some initial data and attach the facet */

let tree = new Baobab({
  projects: {
    '0': {
      title: 'foo'
    },
    '1': {
      title: 'bar'
    }
  },
  selectedProjectId: '0'
}, {
  facets: {
    selectedProject: selectedProject
  }
});

export default tree;
```
So this is quite self explainatory I think. We first define our facet. It is just an object with two properties. The **cursors** property brings in the state you need to create a new state output. In this case we want to know about **selectedProjectId** and **projects**. This also ensures any changes to these two cursors will update the facet. The **get** method is the second property and that is where you produce the state you want this facet to return. In this case we just want to grab the project from the projects map by using the ID in **selectedProjectId**. In the previous examples the projects were an array, but by using a map lookups are a lot easier and more performant.

Lets make use of our facet:

*Project.js*
```javascript

import React from 'react';
import {branch} from 'baobab-react/mixins';

let Project = React.createClass({
  mixins: [branch],
  facets: {
    project: 'selectedProject'
  },
  render() {
    if (this.state.project) {
      return (
        <div>{this.state.project.title}</div>
      );
    } else {
      return null;
    }
  }  
});

export default Project;
```
As we can see a **facets** property is also available to our components using the mixin. It behaves exactly the same as a cursor. It grabs the value produced by the facet whenever any of its cursors update.

So if any component triggered an action defined something like this:

*actions.js*
```javascript

import tree from './tree.js';

let actions = {
  selectProject(projectId) {
    tree.set('selectedProjectId', projectId);
  }
};

export default actions;
```

The facet would first react and in turn notify the Project component which would then grab the new state from the facet. So this is quite nice. We have now solved the challenge with referencing data in the tree, but this was the least troublesome challenge we had. Let us move on to more complex state handling.

### Solving referencing in a list
Instead of displaying a single project, lets us imagine displaying a list of projects in a table. We actually use the exact same approach here, but I think it is worth looking at.

*tree.js*
```javascript

import Baobab from 'baobab';

let projectsList = {
  cursors: {
    ids: ['projectsListIds'],
    projects: ['projects']
  },
  get: function (state) {
    return state.ids.map(function (id) {
      return state.projects[id];
    });
  }
};

let tree = new Baobab({
  projects: {
    '0': {
      title: 'foo'
    },
    '1': {
      title: 'bar'
    }
  },
  projectsListIds: []
}, {
  facets: {
    projectsList: projectsList
  }
});

export default tree;
```

And our component could use the facet something like this:

*ProjectsList.js*
```javascript

import React from 'react';
import {branch} from 'baobab-react/mixins';

let ProjectsList = React.createClass({
  mixins: [branch],
  facets: {
    projects: 'projectsList'
  },
  renderRow(project) {
    return (
      <tr key={project.id}>
        <td>{project.title}</td>
      </tr>
    );
  },
  render() {
    return (
      <table>
        <tbody>
          {this.state.projects.map(this.renderRow)}
        </tbody>
      </table>
    );
  }  
});

export default ProjectsList;
```

And finally an action could look something like this:

*actions.js*
```javascript

import tree from './tree.js';

let actions = {
  displayProjects(projectIds) {
    tree.set('projectsListIds', projectIds);
  }
};

export default actions;
```
And that's it. We now have pretty complex state handling and everything will just update automatically when anything changes. Either it being in the state defining what to display in the UI or the state containing the source data.

We are starting to see a pattern emerge here. We start to see a more clear separation of state. Our **projects** state is more a data source than state used in the UI. It is very typical that you want to keep downloaded data in the client for optimization reason. That way the next time you want to use the data you do not need a roundtrip to the server.

### Solving reference within reference
In this last example I will just show the code for the tree, as I hope you are getting the feel for how it is used in a component and changed using an action. Lets imagine our projects are created by users. The projects only store the ID of the user on an **authorId** property.

*tree.js*
```javascript

import Baobab from 'baobab';

let projectsList = {
  cursors: {
    ids: ['projectsListIds'],
    projects: ['projects'],
    users: ['users']
  },
  get(state) {
    return state.ids.map(function (id) {

      /* We are going to add a new property to the project. The "author"
         property will contain the user from the users map. We do not want
         to mutate the project object inside the tree, so we create a new
         object and hook the project object as a prototype to it. Any
         properties added will be part of the new object, not the actual
         project inside the tree, but we can still reference any property
         from the original project object */

      let project = Object.create(state.projects[id]);
      project.author = state.users[project.authorId];
      return project;
    });
  }
};

let tree = new Baobab({
  projects: {},
  users: {},
  projectsListIds: []
}, {
  facets: {
    projectsList: projectsList
  }
});

export default tree;
```
Lets us go through this step by step.

1. I added a users cursor to the facet as we need access to those users as a lookup with the **authorId**
2. I decide to add an **author** property to the project based on the **authorId**. This will be the actual user. To make sure that the project object in the tree does not mutate I simply create a new object with the project object in the tree as a prototype
3. When I now add a new author property to the project it does not affect the object in the tree, but I can still reference all the properties from the original project object

The really important point to get here is that if any of the cursors of the facet updates, so will the facet. So if something from the server or other parts of the UI would cause a project or a user to update, the facet would update itself. This is an extremely important and powerful concept. If you have worked with Ember "computed properties" might come to mind. This is very much the same concept, but it is more about solving the challenge of referencing data in the tree, not computing counters etc. as that can more easily be done when an action changes state in the tree.

Now, you might say. What if I have 500 users that quite often updates, but the facet only shows 10 projects. Would it not update unnecessarily quite often? Yeah, you are perfectly right. But this is actually the same core concept that makes React work so well. You recalculate on changes. Be sure you also note that you will not go through the 500 users when something updates, just the 10 project ids you are currently displaying in the UI. So it is very efficient nevertheless.

## Bring state handling to a whole new level
The really good thing about facets is that it keeps state handling away from your components. Components should just get data and produce UI. They should ideally not have any logic related to computing state. But this is not all to facets. They open up for something completely new and that is reacting to missing data.

In our example with **projectsListIds** and the projects themselves pointing to **authorId** you will quickly get into situations where some of this data is missing and you need to get it from the server. What if this could happen completely automatically?

Facebook has introduced their [Relay and GraphQL](https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) concept which is really exciting. The challenge with that solution though is that you have to refactor your backend to support a single endpoint and it does not seem to address relational data like in the examples above. A lot of solutions out there today has this relational data structure and it would be great to have a flexible enough concept to handle that in a way that makes sense for each application.

I am going to show you an example of how you can create this automatic loading of data by using facets and something I just call **loaders**. Loaders are just like **actions** in the way that they are a concept, not a specific part of Baobab or React, but they do have a specific purpose. 

```javascript

Facets and loaders
  
            |------------|
        |-> | State tree | -------------      
        |   |------------|     |       |
        |        ^             |       |
        |        |             |       |
        |   |---------|   |--------|   |
        |   | Loaders | <-| Facets |   |
        |   |---------|   |--------|   |
        |                      |       |
        |                      v       v
  |---------|         |-------------------|
  | Actions | <------ |     Components    |
  |---------|         |-------------------|

```

Like actions are methods that have access to the state tree, so are loaders. But unlike actions that are typically called from components, loaders are only called from facets. This keeps the one way flow that we need to keep our minds sane. I just want to point out again that this is not an official Baobab concept, it is an example to inspire use of facets. So let us see this concept in action.

### The challenge
You have probably experienced the need for client specific state related to server specific state, or data if you will. What I mean is that when you load, create, optimistically create, update or have errors on some data you want to easily display that in the UI. An other thing is that you want to easily grab any data that is missing. An example of this is loading a project where the **authorId** is not currently available, you have to get it from the server, and you want to indicate that somehow.

### The solution
We are now going to keep working on our **projects** example and create a solution for handling the challenges explained. Let us imagine we have no data at all in the client, but we have hardcoded some project ids we want to load. Maybe these ids came from localstorage or something. I am not going to create a crazy magic abstraction, but rather create a readable example to show you how this can be solved. That way you are totally free to create an abstraction for your project the suits the needs.

*tree.js*
```javascript

import Baobab from 'baobab';
import ProjectsListFacet from './facets/ProjectsList';

let tree = new Baobab({
  projects: {},
  users: {}
  projectsListIds: ['123', '456', '789']
}, {
  facets: {
    projectsList: ProjectsListFacet
  }
});

export default tree;
```

And let us define the facet:

*facets/ProjectsList.js*
```javascript

import loaders from './../loaders.js';

let ProjectsList = {
  cursors: {
    ids: ['projectsListIds'],
    projects: ['projects'],
    users: ['users']
  },
  get(state) {
    return state.ids.map(function (id) {

      let project = state.projects[id];
      if (project) {
        project = Object.create(project);
      } else {
        return loaders.project(id);
      }

      let author = state.users[project.authorId];
      if (author) {
        project.author = author; 
      } else {
        project.author = loaders.user(project.author);
      }

      return project;
    });   
  }
};

export default ProjectsList;
```
Okay, so what are we doing here? Lets go through that step by step before looking at the loaders:

1. First we try to get the project from our **projects** map
2. If the project exists we hook it as a prototype on a new object to avoid mutation. If it does not exist we pass the id to a loader and return what the loader returns
3. If the project exists we try to grab the author from the **users** map, but if it does not exist we pass the author id to a user loader and put whatever it returns as the author

So what are these loaders actually doing? Lets look at an example:

*loaders.js*
```javascript

import tree from './tree.js';
import ajax from 'ajax'; // Some ajax lib

let loaders = {
  project(id) {
  
    /* First we define at what path in our state tree the project should
       be available. Then we check if there is some data there already 
       or prepare a new object */

    let path = ['projects', id];
    let project = tree.get(path) || {};

    /* We now attach the id and a UI property we call $isLoading. It is
       prefixed with $ to indicate that this is only a client property.
       We do not insert this into the state tree as it is temporary facet
       data */

    project.id = id;
    project.$isLoading = true;

    /* Now we try to grab the project from the server and update the
       project in the state tree on either success or error response */

    ajax.get('/projects/' + project.id)
      .success(function (project) {
        tree.set(path, project);
      })
      .error(function (error) {
        project.$isLoading = false;
        project.$error = error;
        tree.set(path, project);
      });

    return project;
    
  }
};

export default loaders;
```

So what does this give us? Well, lets first create a component using the facet and then we will summarize.

*Projects.js*
```javascript

import React from 'react';
import {branch} from 'baobab-react/mixins';

let Projects = React.createClass({
  mixins: [branch],
  facets: {
    projects: 'projectsList'
  },

  /* When we render a project we can now use our UI states to display what 
     is happening to the data. Is it being loaded, was there an error etc.
     You may also expand on these states with $notFound, $noAccess etc. */

  renderProject(project) {
    if (project.$error) {
      return (
        <li key={project.id}>
          Could not load project - {project.$error}
        </li>
      );
    } else if (project.$isLoading) {
      return (
        <li key={project.id}>Loading project...</li>
      );
    } else {
      return (
        <li key={project.id}>
          {project.id + ' - ' + project.title}
          {this.renderAuthor(project.author)}
        </li>
      );
    }
  },

  /* And we use the exact same approach with the author */

  renderAuthor(author) {
    if (author.$error) {
      return (
        <small>Could not load author - {author.$error}</small>
      );
    } else if (author.$isLoading) {
      return (
        <small>Loading author...</small>
      );
    } else {
      return (
        <small>{author.name}</small>
      );
    }
  },
  render() {
    return (
      <ul>
        {this.state.projects.map(this.renderProject)}
      </ul>
    );
  }
});

export default Projects;
```

### Summarizing

So this is whats happening:

1. Our **ProjectsList** component tries to get some state using the **projectsList** facet
2. There are no data on the projects map and the facet uses a **project loader** to grab that data. The loader returns and object with the ID of the project and a UI state called **$isLoading**
3. When the ajax request reponds we insert either a project or an object indicating error with a project in the tree. This causes the **projects** cursor to update and the facet will run again
4. In a situation where a project was successfully responded the facet will now attach an **author** property to the project using the **user loader**. The exact same thing happens again
5. On every update of the facet the component will also update, displaying in detail what is happening to the data being loaded

This is really some of the most complex state handling you meet in applications, especially where the data is in a relational database. I think facets gives you that perfect balance of freedom to compose the state exactly how you need it, but still has a very strong concept of where to put it. I think we have to realize that handling state is not about creating one simple abstraction like "Models" and "Collections". We need something a lot more flexible and lower level so that we can create a custom abstraction that suits the project. Facets does exactly that.

## Going ES6 and ES7
One last thing I want to share with you is how the **baobab-react** project allows you to use ES6 classes and ES7 decorators to allow your components to grab state. You of course need to use a transpiler for this, where I highly recommend [Babel](https://babeljs.io/). React, Babel and Webpack are close friends. You can read more about setting that up in my previous article [The ultimate webpack setup](http://christianalfoni.com/articles/2015_04_19_The-ultimate-webpack-setup).

Note that with classes and decorators the state is not exposed on the components **state** object, but the **props** object. This is due to implementation details. Personally I think it is better as it indicates external state, not internal component state.

### ES6 classes
*App.js*
```javascript

import {Component} from 'react';
import tree from './tree.js';
import Projects from './Projects.js';
import {root} from 'baobab-react/higher-order';

class Application extends Component {
  render() {
    return (
      <div>
        <Projects/>
      </div>
    );
  }
}

export default root(Application, tree);
```

*Projects.js*
```javascript

import {Component} from 'react';
import {branch} from 'baobab-react/higher-order';

class Projects extends Component {
  renderProject(project) {
    return (
      <li key={project.id}>{project.title}</li>
    );
  }
  render() {
    return (
      <ul>
        {this.props.projects.map(this.renderProject)}
      </ul>
    );
  }
}

export default branch(Projects, {
  facets: {
    projects: 'projectsList'
  }
});
```

### ES7 decorators
*App.js*
```javascript

import {Component} from 'react';
import tree from './tree.js';
import Projects from './Projects.js';
import {root} from 'baobab-react/decorators';

@root(tree)
class Application extends Component {
  render() {
    return (
      <div>
        <Projects/>
      </div>
    );
  }
}

export default Application;
```

*Projects.js*
```javascript

import {Component} from 'react';
import {branch} from 'baobab-react/decorators';

@branch({
  facets: {
    projects: 'projectsList'
  }
})
class Projects extends Component {
  renderProject(project) {
    return (
      <li key={project.id}>{project.title}</li>
    );
  }
  render() {
    return (
      <ul>
        {this.props.projects.map(this.renderProject)}
      </ul>
    );
  }
}

export default Projects;
```

## Summary
I hope this gave you some good insight into how Baobab keeps evolving to handle application state. What makes Baobab really great is that it is "low level" compared to other solutions. It does not create abstractions that assumes anything about how you want to structure your state or how your data is structured on the server. This is something you need to create an abstraction for yourself as it differs just as much as user interfaces.

Facets is a brand new thing and there will probably be many strategies taking advantage of it. I just wanted show you my thoughts on how you can use them.

[Baobab](https://github.com/Yomguithereal/baobab) v1.0 is relased and [Baobab-React](https://github.com/Yomguithereal/baobab-react) is also released. Please check out the repo for more information and please share your ideas and thoughts on using facets to handle the state complexity of your application.
