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

var Baobab = new Baobab({
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

Let us imagine we have a list of projects. They are displayed in a table. When the user clicks one of the projects a modal should appear with the possibility to change the data of the project. So let us imagine that now. The user clicks the first project. This is the problem:

```javascript

var Baobab = new Baobab({

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

Now we have two instances of the same project. So if we change the selected project it will not be reflected in the projects list and vice versa. Now, you might say, can not *selectedProject* just reference the object in the array? Well, yes it can, but you will get into trouble. The technical reason you get into trouble is because any change to an object or array in a Baobab tree will effectively change its reference. The reason it does this is so that you can easily to a `prevObj === newObj` to know if something changed. You do not have to go into objects and arrays, traversing them to figure out if anything changed. Especially React takes advantage of this to determine the need to render a component.

Another part of this story is that "shared state is the root of all evil". If a change in one part of your state tree would uncontrollably affect other parts it would be difficult both for you as a developer and Baobab to keep track of those changes. It needs to behave in a predictable manner.

### Referencing in a list
In the example above we selected one single project. But what if you downloaded 1000 projects to the client and just wanted to show 10 of them in a table? We need to reference multiple of the projects. Lets look at the tree.

```javascript

var Baobab = new Baobab({

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

We get the exact same problem as described above. But let us make this even more exciting.

### Reference within reference
What if the projects we downloaded referenced some comments by id?

```javascript

var Baobab = new Baobab({

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
    title: 'foo'
  }, {
    id: 1, 
    title: 'bar'
  }...10]

});
```

My oh my, this is indeed complex stuff. I think it is time to find some solutions.

## Baobab-react
One clever change in the v1.0 of Baobab is that the React parts of the library is moved into its own repo. The reason is that there are many different ways you might want to handle moving state into your components. Baobab allows for different strategies which we are going to look at shortly. Even ES7 decorators is in here, really awesome stuff.

Another thing to notice is that Baobab now uses contexts to pass state into your components. This is a less intrusive and more isomorphic friendly way of doing it. In practice it means that none of your components will depend on the state tree itself, it is injected in your top component and you use mixins to extract the state. Let us have a look at that first to get used to the syntax:

*main.js*
```javascript

import tree from './tree.js';
import {root, branch} from 'baobab-react/mixins';

// We first set up our top component. This component will need
// the "root" mixin. The root mixin exposes the state tree on
// the context
let App = React.createClass({
  mixins: [root],
  render: function () {
    return (
      <div>
        <Header/>
      </div>
    );
  }
});

// Any child component in the application can attach the
// branch mixin. This mixin allows you to attach cursors
// that will extract state from the tree and attach it to
// the state object of the component
var Header = React.createClass({
  mixins: [branch],
  cursors: {
    foo: ['bar']
  },
  render: function () {
    return <div>{this.state.foo}</div>
  }
});

// When we render the application we attach a "tree" prop to it
// and pass our tree. Now you see how well this works on the server,
// where you would probably pass down different trees based on the user
// requesting a resource
React.render(<App tree={tree}/>, document.body);
```

But now, let us look at the one major API addition to Baobab.

## Facets
So the new term is **Facets**. If you think about how components are able to use cursors to compose a UI description, like in the example above, think of Facets using cursors to compose state. Nothing explains this better than an example though, so let us head straight to our first challenge and solve that.

### Solving direct reference

*tree.js*
```javascript

import Baobab from 'baobab';

// Defining a Facet
var selectedProject = {
  cursors: {
    id: ['selectedProjectId'],
    projects: ['projects']
  },
  get: function (state) {
    return state.projects[state.id];
  }
};

// Defining the tree and attaching facets
var tree = new Baobab({
  projects: {
    '0': {
      title: 'foo'
    },
    '1': {
      title: 'bar'
    }
  },
  selectedProjectId: null
}, {
  facets: {
    selectedProject: selectedProject
  }
});

export default tree;
```
So this is quite self explainatory I think. We first define our facet. It is just an object with two different properties. The cursors brings in the state you need to create a new state output. In this case we want to know about *selectedProjectId* and *projects*. This also ensures any changes to these two cursors will update the facet. The *get* method is the second property and that is where you produce the state you want this asset to return. In this case we just want to grab the project selected from the projects map. In the previous examples the projects were an array, but by using a map instead lookups are a lot easier and more performant.

Lets make use of our facet

*Project.js*
```javascript

import React from 'react';
import {branch} from 'baobab-react/mixins';

var Project = React.createClass({
  mixins: [branch],
  facets: {
    project: 'selectedProject'
  },
  render: function () {
    if (this.state.project) {
      return <div>{this.state.project.title}</div>
    } else {
      return null;
    }
  }  
});

export default Project;
```
As we can see a *facets* property is also available to our components using the mixin. It behaves exactly the same as a cursor. It grabs the value produced by the facet whenever any of its cursors update.

So if any component triggered an action defined something like this:

*actions.js*
```javascript

import tree from './tree.js';
export default {
  selectProject: function (projectId) {
    tree.set('selectedProjectId', projectId);
  }
};
```

The Project component would react to that and display the project. So this is quite nice. We have now solved the challenge with referencing data in the tree, but this was the least troublesome challenge we had. Let us move on to more complex state handling.

### Solving referencing in a list
Instead of displaying a single project, lets us imagine displaying a list of projects in a table. We use the exact same approach here.

*tree.js*
```javascript

import Baobab from 'baobab';

var projectsList = {
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

var tree = new Baobab({
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

*Project.js*
```javascript

import React from 'react';
import {branch} from 'baobab-react/mixins';

var ProjectsList = React.createClass({
  mixins: [branch],
  facets: {
    projects: 'projectsList'
  },
  renderRow: function (project) {
    return (
      <tr key={project.id}>
        <td>{project.title}</td>
      </tr>
    );
  },
  render: function () {
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
export default {
  displayProjects: function (projectIds) {
    tree.set('projectsListIds', projectIds);
  }
};
```
And thats it. We now have pretty complex state handling and everything will just update automatically when anything changes.

We are starting to see a pattern emerge here. We start to see a more clear separation of state. Our *projects* state is more a data source than state used in the UI. It is very typical that you want to keep any downloaded data, using projects as example here, in the client. This even though the projects are not being displayed right now. You would probably never want to display all 500. This means that the *projects* state is just a data source other state will reference using facets.

This is actually a really good thing as we will see a bit later. Let us move on to the last challenge presented in this article.

### Solving reference within reference
In this last example I will just show the code for the tree, as I hope you are getting the feel for how it is used in a component and changed using an action. Lets imagine our projects are created by users. The projects only store the ID of the user on a *authorId* property.

*tree.js*
```javascript

import Baobab from 'baobab';

var projectsList = {
  cursors: {
    ids: ['projectsListIds'],
    projects: ['sources', 'projects'],
    users: ['sources', 'users']
  },
  get: function (state) {
    return state.ids.map(function (id) {
      var project = Object.create(state.projects[id]);
      project.author = state.users[project.authorId];
      return project;
    });
  }
};

var tree = new Baobab({
  sources: {
    projects: {},
    users: {}
  },
  projectsListIds: []
}, {
  facets: {
    projectsList: projectsList
  }
});

export default tree;
```
Lets us go through this step by step.

1. I chose to move the data sources inside a **sources** domain in the tree. This just highlights their purpose
2. I added a users cursor to the facet as we need access to those users when using the **authorId**
3. I decide to add an **author** property to the project based on the **authorId**. To make sure that the project object in the tree does not mutate I simply create a new object with the project object in the tree as a prototype
4. When I now add a new author property to the project it does not affect the object in the tree, which it should not

The really important point to get here is that if any of the cursors of the facet updates, so will the facet. So if something from the server or other parts of the UI would cause a project or a user to update, the facet would update itself. This is an extremely important and powerful concept.

Now, you might say. What if I have 500 users that quite often updates, but the facet only shows 10 projects. Would it not update unnecessarily quite often? Yeah, you are perfectly right. But this is actually the same core concept that makes React work so well. You recalculate on changes. Be sure you also note that you will not go through the 500 users when something updates, just the 10 project ids you are currently displaying in the UI. So it is very efficient nevertheless.

## Bring state handling to a whole new level
So now we are going to look at a strategy I find extremely useful. As you probably have experienced you often need client specific state related to server specific state. What I mean is that when you load, create, optimistically create, update or have errors on a project you want to easily display that in the UI. An other concept is that you want to easily grab any state that is missing. An example of this is loading a project where the **authorId** is not currently available, you have to get it from the server. You want to indicate that somehow.

We are now going to keep working on our **projects** example and create a solution for handling the challenges explained. Let us imagine we have no data at all in the client, but we have hardcoded some project ids we want to load. Maybe these ids came from localstorage or something. I am not going to create a crazy magic abstraction, but rather create a readable example to show you how this can be solved. That way you are totally free to create an abstraction for your project the suits the needs.

*tree.js*
```javascript

import Baobab from 'baobab';
import ProjectsListFacet from './facets/ProjectsList';

var tree = new Baobab({
  sources: {
    projects: {},
    users: {}
  },
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

import actions from './../actions.js';

export default {
  cursors: {
    ids: ['projectsListIds'],
    projects: ['sources', 'projects'],
    users: ['sources', 'users']
  },
  get: function (state) {
    return state.ids.map(function (id) {

      var project = state.projects[id];
      if (project) {
        project = Object.create(project);
      } else {
        project = {
          $isLoading: true
        };
        actions.loadProject(id);
      }

      var author = state.users[project.authorId];
      if (author) {
        project.author = author; 
      } else {
        project.author = {
          $isLoading: true
        };
        actions.loadUser(project.authorId);
      }

      return project;
    });   
  }
};
```
Okay, so what are we doing here? Lets go through that step by step also:

1. First we try to get the project from our **sources**
2. If the project exists we hook it as a prototype on a new object to avoid mutation. If it does not exist we create a new object with a client specific property telling that we are trying to load the project. We then trigger an action which will do that job
3. Then we try to grab the author which is either set not using a prototype since we are not going to mutate it, or we again create an object with $isLoading and trigger an action that starts loading it

So what does this give us? Well, if we now have a component using the **ProjectsList** facet it is actually able to display three rows with a loading indication by checking the **$isLoading** property. As this is happening our **loadProject** action has fired three times, as we have three ids in the **projectsListIds**. Lets look at that code:

*actions.js*
```javascript

import tree from './tree';
import ajax from 'ajax'; // Some ajax lib
export default {
  loadProject: function (id) {

    if (!id) {
      return;
    }

    var path = ['sources', 'projects', id];
    ajax.get('/projects/' + id)
      .success(function (project) {
        tree.set(path, project);
      })
      .error(function (error) {
        if (error === 'NOT_FOUND') {
          tree.set(path, {
            $notFound: true
          });
        } else {
          tree.set(path, {
            $error: error
          });
        }
      });
  }
};
```
