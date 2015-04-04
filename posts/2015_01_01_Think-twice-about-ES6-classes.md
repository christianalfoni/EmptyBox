# Think twice about ES6 classes

I got into JavaScript about 5 years ago and I have no to very little experience with other languages. That can sometimes be a bad thing, but it can also be a very good thing. In this article I am going to talk about classes, which is coming to the next version of JavaScript. I am going to talk about why I do not understand developers simulating classes and class inheritance in JavaScript and why I think it is not a very good idea to bring the concept into JavaScript at all.

> "When asked what he might do differently if he had to rewrite Java from scratch, James Gosling suggested that he might [do away with class inheritance](http://www.javaworld.com/article/2073649/core-java/why-extends-is-evil.html) and write a [delegation only](http://www.artima.com/intv/gosling34.html) language." [delegation vs inheritance](http://javascriptweblog.wordpress.com/2010/12/22/delegation-vs-inheritance-in-javascript/)

If you want to know more on this topic please head over to Kyle Simpsons article on [http://davidwalsh.name/javascript-objects](http://davidwalsh.name/javascript-objects) and Eric Elliotts talk on Fluent 2013 [https://www.youtube.com/watch?v=lKCCZTUx0sI](https://www.youtube.com/watch?v=lKCCZTUx0sI). The first part of this article will bring up different concepts related to objects in JavaScript, the second part will show how you can use composition and delegation, instead of class inheritance to build objects with JavaScript.

### Creating an object
In any application you would probably like to have more than one instance of an object. You need some kind of construct to create instances of objects that looks and behaves the same. In traditional JavaScript you do that with either a constructor or you can do it with a normal function. With ES6 you get the ability to define a class:

```javascript

// With a constructor
function MyObjectA () {};
new MyObjectA(); // {}

// With a function
function MyObjectB () {
  return {};
};
MyObjectB(); // {}

// ES6 class
class MyObjectC {}
new MyObjectC(); // {}
```

### The constructor
So why do we use a constructor? As stated above it is a construct to instantiate multiple instances of objects that looks and behaves the same. An object instantiated by a constructor, a normal function or ES6 class does not differ in that sense. Where it differs though is a property on the constructor function called "prototype". Now, you have probably heard about "prototypal inheritance" and we will take a look into that now. Let us compare again by adding a method to the object:

```javascript

// With a constructor
function MyObjectA () {
  this.myMethod = function () {};
};
new MyObjectA(); // {myMethod: function () {}}

// With a function
function MyObjectB () {
  return {
    myMethod: function () {}
  };
};
MyObjectB(); // {myMethod: function () {}}

// With ES6 class
class MyObjectC {
  constructor () {
    this.myMethod = function () {};
  }
}
new MyObjectC(); // {myMethod: function () {}}
```

Now, these instantiators will create a new myMethod method for each object instance. Unless you have to create hundreds of thousands of objects, adding a new version of the method for each instance will **not** get you into performance issues. I believe you should stick with describing your object as it will look like when instantiated, not create less comprehensable code for performance sake. That said, there are situations where you want to use **delegation**.

When I say delegation I specifically mean that we link one object to an other. The object linked to the object you are instantiating will be able to act on behalf of it. You do this by adding an object on the prototype property of a constructor function. When using the normal function pattern we use the `Object.create` method. With ES6 you just add methods. It has the same effect:

```javascript

// With a constructor
function MyObjectA () {}
MyObjectA.prototype = {
  myMethod: function () {}
};

var obj = new MyObjectA(); // {}
obj.myMethod(); // Prototype object acts on behalf of obj

// With a function
var proto = {
  myMethod: function () {}
};
function MyObjectB () {
  return Object.create(proto);
}

var obj = MyObjectB(); // {}
obj.myMethod(); // proto object acts on behalf of obj

// ES6 class
class MyObjectC {
  myMethod () {
  
  }
}
var obj = new MyObjectC(); // {}
obj.myMethod(); // Prototype object acts on behalf of obj
```

The term **prototypal inheritance** is a bit misleading. Inheritance suggests that it is the instantiated object the somehow receives the look and behavior of parent objects on the prototype chain, but actually it is the other way around. A prototype object acts as a delegate, an object that can act on behalf of the instantiated object. 

Try to think of this like event delegation in the DOM. Lets say you have a list with items. Instead of registering a click on each item in the list, you register the click on the list itself. When a click occurs on an item it will try to trigger click listeners, but there are none, so the click moves up to the list element. Now it tries to trigger click listeners on the list element and there it is.

```javascript

DOM delegation

|----------------|
| |------------| |
| |   Item 1   | | 1. Clicking on item
| |------------| |
|                | 2. The list acts upon the click on behalf of the item (delegation)
| |------------| |
| |   Item 2   | |  
| |------------| |
|----------------|

```

Now think about an instance of our MyObjectA here. When you run the method like this `new MyObjectA().myMethod()`, it will try to find the method on the instance, but it will not find it. Then it checks the object linked to the instance and there it finds it. The linked object will run that function in the context of the object that called the method. There you go, delegation, not inheritance.
 
```javascript

var objectA = Object.create(); // Object.create() creates a plain object
objectA // {}

var proto = {doSomething: function () {}};
var objectB = Object.create(proto);
var objectC = Object.create(proto);

objectB // {}
objectC // {}
objectB === objectC // false

// The proto object acts on the method call on behalf of objectB (delegation)
objectB.doSomething();

// The same proto object acts on the method call on behalf of objectC (delegation)
objectC.doSomething();

```

So this is quite powerful. Lets say we wanted to use the methods from EventEmitter in combination with our own. We could do this:

```javascript

// With a constructor
function MyObjectA () {
  this.myMethod = function () {};
}
MyObjectA.prototype = EventEmitter.prototype;

// With a function
function MyObjectB () {
  var object = Object.create(EventEmitter.prototype);
  object.myMethod = function () {};
  return object;
}

// ES6 class
class MyObjectC extends EventEmitter {
  constructor () {
    this.myMethod = function () {};
  }
}
```

Every instance is linked to the EventEmitter.prototype object. It is a delegate, an object acting on the behalf of the instantiated object. At the same time we create a new myMethod method for each instance. We could actually have made everything unique to each instance by doing this:

```javascript

// With a constructor
function MyObjectA () {
   Object.assign(this, EventEmitter.prototype, {myMethod: function () {}}); 
}

// With a function
function MyObjectB () {
  return Object.assign({}, EventEmitter.prototype, {myMethod: function () {}});
}

// With ES6 class
class MyObjectC {
  constructor () {
    Object.assign(this, EventEmitter.prototype, {myMethod: function () {}});
  }
}
```

In this case we are not using delegation, because we actually do create new properties on each instance. Though this increases memory usage and takes a performance hit in its instantiation (copying all properties) it is not as bad as you might think. Every function, object and array are copied by reference. So even though each instance will have their own "on" and "off" property, the actual function they reference is the same on all instances. What is very powerful here though is that we are starting to see composition in action. You could keep adding objects as arguments to Object.assign.

So now we have been playing around with the concept of delegation, and pointed out that it is not really inheritance. You should also have a good idea of why we use the constructor and the power of delegation and that we can achieve the same effect with just a simple function.

### ES6 classes vs object factory
Lets us now go through the class syntax in ES6 and see how it compares to this simple function that creates objects. I will call the simple function pattern an "Object factory".

#### Instantiate an object
```javascript

// ES6 Class
class MyObjectA {}
new MyObjectA(); // {}

// Object factory
function MyObjectB (obj = {}) {
  return obj; // Return passed object or a new object
}
MyObjectB() // {}
MyObjectB({foo: 'bar'}) // {foo: "bar"}
```

So we already see the advantages of the object factory. First of all we do not have to worry about the "new" keyword. We also see that we can pass an existing object if we want to, or just let it create a clean instance.

#### Instantiation function (constructor)
```javascript

// ES6 Class
class MyObjectA {
  constructor () {
    this.list = [];
  }
}
new MyObjectA().list === new MyObjectA().list; // false

// Object factory
function MyObjectB (obj = {}) {
  obj.list = [];
  return obj;
}
MyObjectB().list === MyObjectB().list // false
```

As you can see in the object factory pattern the function itself is the instantiating function, there is no constructor function that implicitely gets called whenever you use the new keyword in front of the class, calling it as a function.

#### Privates
A fantastic feature in JavaScript is closures and you can use those to hide implementation details in your objects. In ES6 you would have to do that in the constructor definition:

```javascript

// Class
class MyObjectA {
  constructor () {
    let myPrivate = 'foo';
    this.getPrivate = function () {
      return myPrivate;
    }
  }
}
new MyObjectA().getPrivate(); // "foo"

// Object factory
function MyObjectB (obj = {}) {
  let myPrivate = 'foo';
  obj.getPrivate = function () {
    return myPrivate;
  };
  return obj;
}
MyObjectB().getPrivate(); // "foo"
```

Sorry about the bad example, but I hope you see that I am just making a point :-) Hiding details in ES6 classes requires you to move methods accessing privates to the inside of the constructor. If not you would have to wrap the class in its own scope, with an IIFE or a module.

#### Adding methods
```javascript

// ES6 Class
class MyObjectA () {
  constructor () {
    this.list = ['foo'];
  }
  getFirstInList () {
    return this.list[0];
  }
}
new MyObjectA().getFirstInList() // "foo"

// Object factory
function MyObjectB (obj = {}) {
  obj.list = ['foo'];
  obj.getFirstInList = function () {
    return this.list[0];
  };
  return obj;
}
MyObjectB().getFirstInList() // "foo"
```

There is not much difference in syntax, but the methods added in ES6 classes will not be attached to the instance, but a prototype object created "under the hood", causing delegation. That is initially a good thing, but might also surprise you. The object you are describing will not look like this when console logging it in the browser. There is also a hidden feature of the object factory pattern. When using `this` you actually make methods dynamic. What I mean is that you can change the context of the method when it runs:

```javascript

function MyObjectB (obj = {}) {
  obj.list = ['foo'];
  obj.getFirstInList = function () {
    return this.list[0];
  };
  return obj;
}
var someObj = {list: ['bar']};
MyObjectB().getFirstInList.call(someObj); // "bar"
```

Extending a function call with `call` or `apply` will set the `this` of the function to whatever you pass as the first argument, in this case `someObj`. But we can actually lock the context of the methods using the object factory, making them more predictable:

```javascript

function MyObjectB (obj = {}) {
  obj.list = ['foo'];
  obj.getFirstInList = function () {
    return obj.list[0];
  };
  return obj;
}
var someObj = {list: ['bar']};
MyObjectB().getFirstInList.call(someObj); // "foo"
```

Since we point to the actual object being built it is not possible to change the context of which it is run.

#### Inheritance
So a class in ES6 has the possibility to extend from an other class, but not only a specific "class" definition, but actually any constructor and its prototype. It also takes JavaScript to a new level of abstraction. A function, called **super**. It can be used inside the constructor function to call the extended constructor, which is bound to the object. You can also use **super.someMethod** to call methods on the extended class, that are also bound to the object. "It just works that way, accept it" is not something you are used to in JavaScript.

The challenge with thinking inheritance is that you have to compose in your head how an object actually looks like by looking into different classes AND follow the usage of super, it can get very complex. The classes also become completely dependant on each other because you do not compose smaller parts, only build on top of existing functionality. [inheritance is evil and must be destroyed](http://berniesumption.com/software/inheritance-is-evil-and-must-be-destroyed/).

With an object factory it is not encouraged to think inheritance at all, but composing. Think that you already have an object and you add behavior to it, rather than describing behavior that produces an object. Let us create an example with a Backbone Model.

```javascript

// Class
class MyModel extends Backbone.Model {
  constructor (options) {
    super(options.attributes);
  }
}

// Object factory
function MyModel (model = {}) {
  model = Object.assign(Object.create(Backbone.Model.prototype), model);
  Backbone.Model.call(model, model.attributes);
  return model;
}
```

So in this example the ES6 syntax of course wins the prize. What worries me a great deal though is that with such simple, but restricted syntax, you risk loosing some of the best features of JavaScript. So to compensate for the syntax I created a tiny lib that will give you more than enough sugar to see the full benefit of composing and delegation. Syntax should really not be the winning argument anyways, but of course it is important.

### Objectory (Object + factory)
So objectory allows you to compose objects while still taking advantage of delegation. Please let me show you with some examples:

#### Instantiating
```javascript

var MyObject = objectory(function (obj) {
  obj.foo = 'bar';
  obj.getFoo = function () {
    return obj.foo; // Forced usage of obj
  };
});

MyObject(); // {foo: 'bar', getFoo: function () {...}}
MyObject({name: 'Roger'}); {name: "Roger", foo: "bar", getFoo: function () {...}}
```

So as you might expect this looks much like a normal constructor, but it has some benefits:

1. You can pass your own object to extend, instead of the default
2. You can use forced context on the methods
3. You do not have to use the "new" keyword or return the object created form the constructor

#### Composing objects
So lets dive in to the power of objectory and JavaScript. In the example above everything added to "obj" would become instance properties. But lets see what happens when we start to compose.

```javascript

var DEFAULTS = {
  name: 'no name',
  age: 18
};
var Person = objectory(function (person) {
  person.compose(DEFAULTS);
});

var personA = Person(); // {}
personA.name; // "no name"
personA.age; // 18

var personB = Person({name: 'Roger', age: 30}); // {name: "Roger", age: 30}
```

As you can see, by composing a normal object with a person object we created a delegate. We link the DEFAULTS object to instantiated person objects.

#### Composing constructors and their prototypes
Most libraries are based on constructors with prototypes. An example of that would be Backbone.Model or EventEmitter. Let us turn our Person into a Backbone Model.

```javascript

var Person = objectory(function (person) {
  person.compose(Backbone.Model, {
    name: 'no name',
    age: 18
  });
});

var personA = Person(); // {_events: {...}, attributes: {...}...}
personA.get('name'); // "no name"
```

In this example the prototype property from "Backbone.Model" (Backbone.Model.prototype) will be linked to the "Person" objects created. When the Person constructor runs it will run the "Backbone.Model" constructor and pass in an object representing attributes of the model. 

This example also shows an advantage over Backbones own "extend" method. If any attributes passed was objects or arrays they would all be unique for each instance of Person. That would not be the case and is often confusing with Backbone.

But we can also take advantage of our defaults and do this:

```javascript

var DEFAULTS = {
  attributes: {
    name: 'no name'
  }
};
var Person = objectory(function (person) {
  person.compose(DEFAULTS);
  person.compose(Backbone.Model, person.attributes);
});

var personA = Person(); // {attributes: {name: "no name"}...}
personA.get('name'); // "no name"

var personB = Person({attributes: {name: 'Roger'}}); // {attributes: {name: "Roger"}...}
personB.get('name'); // "Roger"
```

In this example the delegate for Person will consist of the "DEFAULTS" object AND the prototype of "Backbone.Model" (Backbone.Model.prototype). When the "Person" constructor runs it will call the "Backbone.Model" constructor and pass in the attributes. Either by delegation from DEFAULTS or any passed attributes.

And now lets take a look at something really awesome. Lets say we wanted to use EventEmitter instead of the default event system in Backbone.

```javascript

var Person = objectory(function (person) {
  person.compose(Backbone.Model, person.attributes);
  person.compose(EventEmitter);
});

var personA = Person(); // {attributes: {name: "no name"}...}
personA.on('change', function () {}); // works
```

This of course requires that the API of EventEmitter works the same way as Backbone, but you start to see what is available to you.

#### Composing other factories
You can of course also compose other factories.

```javascript

var Person = objectory(function (person) {
  person.age = 18;
});
var Student = objectory(function (student) {
  student.compose(Person);
  student.grade = 'A';
});

var student = Student(); // {grade: "A", age: 18}
```

In this case Person does not have any compositions, which means there is no delegation either. Lets do something about that:

```javascript

var DEFAULTS = {
  name: 'no name',
  age: 18
};
var Person = objectory(function (person) {
  person.compose(DEFAULTS);
});
var Student = objectory(function (student) {
  student.compose(Person);
  student.grade = 'A';
});

var student = Student(); // {grade: "A"}
student.name; // "no name"
student.age; // 18
```

### Summary
I hope this gave you enough input to see how it is possible to use vanilla JavaScript with delegation and composition to create a construct more powerful than a class could ever hope to be. I must say I do worry that the ES6 class syntax hides too much implementation details about JavaScript and locks developers in a pattern that has its challenges, but worse it locks them out of using patterns available in JavaScript. Closure for private values and methods and composing. If you liked objectory, go to [objectory repo](https://github.com/christianalfoni/objectory). There are more examples and some perfomance and compatability info.

Thanks for hearing me out!
