# Nailing that validation with React JS

**Note!** This article is over a year old now. Though it still has valid points the implementation has changed quite a bit. Look at the repo of [Formsy-React](http://github.com/christianalfoni/formsy-react) for more information.

Validation is complex. Validation is extremely complex. I think it is right up there at the top of implementations we misjudge regarding complexity. So why is validation so difficult in general? How could we implement this with React JS? And do you get a prize for reading through this article? ... yep, you do! Look forward to a virtual cookie at the bottom of this article, you will definitely deserve it ;-)

At my employer, Gloppen EDB Lag, we are building a React JS component framework for application development. We have everything from grids and panels to calendars and forms. Think of it as [React Bootstrap](http://react-bootstrap.github.io/), but with bigger parts specific to our applications. So we have lots of forms in our applications and we needed a form that could handle both user input validation, server validation and be very flexible with the contents of the form.

This article will explain the challenges and the thought process of building such a form component. Forms and validation is complex no matter what framework you use, and even though we look at React JS here, the same principles goes for all frameworks.

As a result of writing this article I built an extension to React JS, [formsy-react](https://github.com/christianalfoni/formsy-react)... and the same concept implemented for Angular JS: [formsy-angular](https://github.com/christianalfoni/formsy-angular). This is a small extension that I think nails that "sweet spot" between flexibility and reuseability of building forms in your application and still get all the difficult wiring of validation for free.

### Validation in general
Validation is most often related to forms and that is what we are going to focus on here. First of all we have to divide our validation into two:

  1. Client side validation
  2. Server side validation

You should of course always have server side validation, but to improve user experience we validate on the client side also. Bringing client side validation into forms has seriously made them more complex. It is not just the concept of handling validation state in the form, but we also have many different ways of indicating the actual validation error.

  1. Red border on the input
  2. Tooltip
  3. Text to the right
  4. Text underneath
  5. Text on each form element or general text at the top... or bottom
  6. Lock submit button until form is valid

If that is not enough, we also have a choice of handling validation as we type/blur and not just when submitting the whole form. And even worse, the form should not validate the inputs initially, except if you pass initial values or you have set that input as required.

### A scaling related question
A form... is it view state or is it application state? Let me explain that in more detail. View state is handled in the controller of your UI. In Angular JS this would be the controller, in React JS it is the component and in Backbone JS it would be the View. Application state is handled further up in your application architecture. In Angular that would be a service, in React JS (with flux) it is a store and in Backbone JS it would have to be something you made up yourself. So, if nothing else in the application cares about the form we only need to care about view state. If some other part of the application cares about the state of the form, we have to implement application state.

So what is the case? View state or application state? In my experience a form is a completely isolated implementation, which means the only thing that cares about the form is the view (component). In Angular JS and Backbone JS that might not be such a hard choice, as you really do not have a strong concept of application state, but with React JS and FLUX it is a very important question to answer. Jump ahead to [**"Lets get an overview"**](#overview) if the FLUX part does not interest you.

#### React JS FLUX form validation
If you decided that the form was application state you would have to trigger an action to save the form, have a validation state in your store and you would have to grab that state when the request to the server was responded and the store emitted a change. This requires more implementation and most certainly more implementation than you really need. Another thing is that you would still have view state because the user input validation does not have anything to do with the store. Lets visualize just the server validation part:

```javascript

| FLUX - Application state |

                    |------------|
  |---------------> | DISPATCHER | // 3. Pass submit to store
  |                 |------------|
  |                       |
  |                   |-------|
  |                   | STORE | // 4. Save to server, update state and emit change
  |                   |-------|
  |                       |
  |                 |-----------|
  |                 | COMPONENT | // 1. Get server validation state
  | 2. submit form  |-----------|
  |-----------------------|

```

This is of course a bigger implementation than:

```javascript

| FLUX - Component state |

  |-----------|
  | COMPONENT | // Submit, update state based on server response and update component
  |-----------|

```

So I personally believe validation should be handled within the component, which of course is the simpler, but again least scalable solution. That said you can still notify your stores about the state of the form. You can add success and error handler to your form that triggers an action:

```javascript

| FLUX - Application state |

                 |------------|
  |------------> | DISPATCHER | // 3. Pass action to store
  |              |------------|
  |                    |
  |                |-------|
  |                | STORE | // 4. Toggle some state based on success/error
  |                |-------|
  |                    |
  |              |-----------|
  |              | COMPONENT | // 1. Send success/error action on server response when form submitted
  | 2. action    |-----------|
  |--------------------|

```

So to summarise. An isolated component is the way to go here.

### Lets get an overview

Okay, so what we want to do is create a generic form component for our application. The form itself should have a valid/invalid state and its inputs should also have individual valid/invalid states. We also want validation in both directions:

```javascript

| FORM - Validation |

|--------|
| SERVER |
|--------|
    |
    | // Is form valid?
    |
|------|
| FORM |
|------|
    |
    | // Is input valid?
    |
|--------|
| INPUTS |
|--------|

```

When we change our inputs we want to validate the inputs themselves. If they turn out to be invalid we want to go up to the form and make the form invalid also. But also posting the form to the server could cause invalid state of the form, and we want that to propagate down to the specific inputs. An example of this would be inserting a username in an input. The validation of the input itself could be that the value is required and on the server it checks if the username is actually available. Regardless of where it fails we need to tell both the form and the specific input about it.

And this is where things are really getting tricky. How you choose to design validation user experience is a matter of choice, but wiring up all the validation can be a daunting task.

### So how do we go about handling this?
Well, we want this to be generic. So first of all we need our own form component and then we need our own input components. We will only look at a typical input in this article, but you can use the same principal on any kind of component you want to build.

Let us take a quick look at how we want to use these two components:

```javascript

var MyApplicationForm = React.createClass({
  changeUrl: function () {
    location.href = '/success';
  },
  render: function () {
    return (
      <App.Form url="/emails" onSuccess={this.changeUrl}>
        <div className="form-group">
          <label>Email</label>
          <App.Input name="email" validations="isEmail" validationError="This is not a valid email"/>
        </div>
      </App.Form>
    );
  }
});
```

We create a generic form component that takes a url and an onSuccess handler. The children of the form can be anything, making it easier to implement different forms in your application. The input takes a name, that will result in the property/attribute passed to your server, and finally it has a validation description and validation error text. The validation error text is defined on the input itself because the validation rule does not translate directly to an error message. The same validation rule might give different validation error messages in different contexts and you might need to handle multiple languages.

Lets define our form as a component first:

```javascript

var Form = React.createClass({
  render: function () {
    return (
      <form>
        {this.props.children}
        <button type="submit">Submit</button>
      </form>
    );
  }
});
```

So our form currently wraps the children with a form element and adds a submit button at the bottom. What we want to do first is create a relationship between the form component and any input child components. We have to create this relationship because we want our form to validate when inputs change and we want inputs to validate when the form gets an error form the server. But we want it to be smart, we want it to be dynamic, because you can have any number of nested children in your form. So lets see how we can solve this.

#### Traversing children
What we want to do is traverse the children of the form and create a registry of inputs inside the App.Form component:

```javascript

var Form = React.createClass({
  componentWillMount: function () {
    this.inputs = {}; // We create a map of traversed inputs
    this.registerInputs(this.props.children); // We register inputs from the children
  },
  registerInputs: function (children) {

    // A React helper for traversing children
    React.Children.forEach(children, function (child) {

      // We do a simple check for "name" on the child, which indicates it is an input.
      // You might consider doing a better check though
      if (child.props.name) {

        // We attach a method for the input to register itself to the form
        child.props.attachToForm = this.attachToForm;

        // We attach a method for the input to detach itself from the form
        child.props.detachFromForm = this.detachFromForm;
      }

      // If the child has its own children, traverse through them also...
      // in the search for inputs
      if (child.props.children) {
        this.registerInputs(child.props.children);
      }
    }.bind(this));
  },

  // All methods defined are bound to the component by React JS, so it is safe to use "this"
  // even though we did not bind it. We add the input component to our inputs map
  attachToForm: function (component) {
    this.inputs[component.props.name] = component;
  },

  // We want to remove the input component from the inputs map
  detachFromForm: function (component) {
    delete this.inputs[component.props.name];
  },
  render: function () {
    return (
      <form>
        {this.props.children}
        <button type="submit">Submit</button>
      </form>
    );
  }
});
```

So now all input children will get two methods from the form. One to register and one to unregister. The next thing we want to implement is an internal model in the form. The model will keep track of all the values from the inputs, so that when the form is submitted it will submit it with the values of the inputs. The name of the inputs will be the key.

#### Adding a model

```javascript

var Form = React.createClass({
  componentWillMount: function () {
    this.model = {}; // We add a model to use when submitting the form
    this.inputs = {};
    this.registerInputs(this.props.children);
  },
  registerInputs: ...
  attachToForm: function (component) {
    this.inputs[component.props.name] = component;

    // We add the value from the component to our model, using the
    // name of the component as the key. This ensures that we
    // grab the initial value of the input
    this.model[component.props.name] = component.state.value;
  },
  detachFromForm: function (component) {
    delete this.inputs[component.props.name];

    // We of course have to delete the model property
    // if the component is removed
    delete this.model[component.props.name];
  },
  render: ...
});
```

Okay, I think it is a good idea to create our App.Input component now to see this first part in action. Then we will move on to communicating with the server and finish this whole thing up with validation.

#### The App.Input component
There is not really much to it. We create an input that will use our attachToForm and detachFromForm methods and update its value state when changing the value of the input.

```javascript

var Input = React.createClass({

  // Create an initial state with the value passed to the input
  // or an empty value
  getInitialState: function () {
    return {
      value: this.props.value || ''
    };
  },
  componentWillMount: function () {
    this.props.attachToForm(this); // Attaching the component to the form
  },
  componentWillUnmount: function () {
    this.props.detachFromForm(this); // Detaching if unmounting
  },

  // Whenever the input changes we update the value state
  // of this component
  setValue: function (event) {
    this.setState({
      value: event.currentTarget.value
    });
  },
  render: function () {
    return (
      <input type="text" name={this.props.name} onChange={this.setValue} value={this.state.value}/>
    );
  }
});
```

So now we have an input that works with our form. Let us create the submit method.

#### Submitting the form

```javascript

var Form = React.createClass({
  componentWillMount: ...
  registerInputs: ...
  attachToForm: ...
  detachFromForm: ...

  // We need a method to update the model when submitting the form.
  // We go through the inputs and update the model
  updateModel: function (component) {
    Object.keys(this.inputs).forEach(function (name) {
      this.model[name] = this.inputs[name].state.value;
    }.bind(this));
  },

  // We prevent the form from doing its native
  // behaviour, update the model and log out the value
  submit: function (event) {
    event.preventDefault();
    this.updateModel();
    console.log(this.model);
  },

  // And we add our submit method to onSubmit
  render: function () {
    return (
      <form onSubmit={this.submit}>
        {this.props.children}
        <button type="submit">Submit</button>
      </form>
    );
  }
});
```

And the syntax so far for building the form:

```javascript

var MyApplicationForm = React.createClass({
  render: function () {
    return (
      <App.Form>
        <div className="form-group">
          <label>Email</label>
          <App.Input name="email"/>
        </div>
      </App.Form>
    );
  }
});
```

When I type "some@email.com" in the input and submit the form we see: { email: "some@email.com" }, in our log. That is great! Lets move on to actually submitting this data to the server.

#### Sending the model to the server

```javascript

var Form = React.createClass({
  componentWillMount: ...
  registerInputs: ...
  attachToForm: ...
  detachFromForm: ...
  updateModel: ...

  // Just using some fake ajax service here to post the model to
  // the url set on the form. On sucess it wil run the onSuccess method.
  // Depending on your app you probably want to verify that the method actually exists
  submit: function (event) {
    event.preventDefault();
    this.updateModel();
    MyAjaxService.post(this.props.url, this.model)
      .then(this.props.onSuccess);
  },
  render: ...
});
```

Now I want to take a minute to make sure that we give a good user experience. When submitting this form it will probably take a little bit of time before we get a response. Let us make sure that the form does not allow you to click submit again. Lets create a isSubmitting state on our form.

#### Submitting
```javascript

var Form = React.createClass({
  getInitialState: function () {
    return {
      isSubmitting: false
    };
  },
  componentWillMount: ...
  registerInputs: ...
  attachToForm: ...
  detachFromForm: ...
  updateModel: ...

  // We change the state of the form before submitting
  submit: function (event) {
    event.preventDefault();
    this.setState({
      isSubmitting: true
    });
    this.updateModel();
    MyAjaxService.post(this.props.url, this.model)
      .then(this.props.onSuccess);
  },

  // We disable the button if the form is submitting
  render: function () {
    return (
      <form onSubmit={this.submit}>
        {this.props.children}
        <button type="submit" disabled={this.state.isSubmitting}>Submit</button>
      </form>
    );    
  }
});
```

And now our form supports:

```javascript

var MyApplicationForm = React.createClass({
  changeUrl: function () {
    location.href = '/success';
  },
  render: function () {
    return (
      <App.Form url="/emails" onSuccess={this.changeUrl}>
        <div className="form-group">
          <label>Email</label>
          <App.Input name="email"/>
        </div>
      </App.Form>
    );
  }
});
```

Now we are getting somewhere! Lets get going with validation.

### Adding validation

So there are a few things we need to do here:

  1. We need a valiation library
  2. We need a validate method that both runs the validation of a specific input and validates the form itself
  3. We need to handle errors from the server and set inputs and the form to invalid state

#### 1. Validation library
We initially chose [validator](https://www.npmjs.org/package/validator) as our validation library. It has lots of default rules and we wanted to use them by defining comma separated rules on a validations property. Validator made that easy. Have a look at what we wanted:

```javascript

var MyApplicationForm = React.createClass({
  render: function () {
    return (
      <App.Form>
        <div className="form-group">
          <label>Email</label>
          <App.Input name="email" validations="isEmail"/>
          <label>Number</label>
          <App.Input name="number" validations="isNumeric,isLength:4:12"/>
        </div>
      </App.Form>
    );
  }
});
```

What we realized though is that running a validation rule on some value is a very small percentage of the whole issue we are trying to solve, and as this code moved into the [formsy-react](https://github.com/christianalfoni/formsy-react) extension, there was no reason to add a dependency to "Validator". We just implemented our own validation rule handling.

#### 2. Implementing the validate method
As stated above we need a validate method that will handle our input validation and after that validate the actual form. We also want to use the same validator no matter what type of input it is. This means that the form needs to have this method, but at the same time let the inputs use it.

An other thing here is empty values. Should they be validated? Does "no value" actually mean "wrong value"? In this context requiring an input and giving an input is two different things. There might be an input you do not require, but if you put something in there you want to validate it. So we have to handle this with a **required** property. This is the syntax:

```javascript

var MyApplicationForm = React.createClass({
  render: function () {
    return (
      <App.Form>
        <div className="form-group">
          <label>Email</label>
          <App.Input name="email" validations="isEmail" required/>
          <label>Number</label>
          <App.Input name="number" validations="isNumeric, isLength:4:12"/>
        </div>
      </App.Form>
    );
  }
});
```

Let us look at the implementation:

```javascript

var Form = React.createClass({
  getInitialState: function () {
    return {
      isSubmitting: false,

      // We add a new state here, isValid, which will be true initially.
      // When inputs are attached they will be validated, in turn
      // changing this value to false if any inputs are invalid
      isValid: true
    };
  },
  componentWillMount: ...

  // When the form loads we validate it
  componentDidMount: function () {
    this.validateForm();
  },
  registerInputs: function (children) {
    React.Children.forEach(children, function (child) {

      if (child.props.name) {
        child.props.attachToForm = this.attachToForm;
        child.props.detachFromForm = this.detachFromForm;

        // We also attach a validate method to the props of the input so
        // whenever the value is upated, the input will run this validate method
        child.props.validate = this.validate;
      }

      if (child.props.children) {
        this.registerInputs(child.props.children);
      }

    }.bind(this));
  },

  // The validate method grabs what it needs from the component,
  // validates the component and then validates the form
  validate: function (component) {

    // If no validations property, do not validate
    if (!component.props.validations) {
      return;
    }

    // We initially set isValid to true and then flip it if we
    // run a validator that invalidates the input
    var isValid = true;

    // We only validate if the input has value or if it is required
    if (component.props.value || component.props.required) {

      // We split on comma to iterate the list of validation rules
      component.props.validations.split(',').forEach(function (validation) {

        // By splitting on ":"" we get an array of arguments that we pass
        // to the validator. ex.: isLength:5 -> ['isLength', '5']
        var args = validation.split(':');

        // We remove the top item and are left with the method to
        // call the validator with ['isLength', '5'] -> 'isLength'
        var validateMethod = args.shift();

        // We use JSON.parse to convert the string values passed to the
        // correct type. Ex. 'isLength:1' will make '1' actually a number
        args = args.map(function (arg) { return JSON.parse(arg); });

        // We then merge two arrays, ending up with the value
        // to pass first, then options, if any. ['valueFromInput', 5]
        args = [component.state.value].concat(args);

        // So the next line of code is actually:
        // validator.isLength('valueFromInput', 5)
        if (!validator[validateMethod].apply(validator, args)) {
          isValid = false;
        }
      });

    }

    // Now we set the state of the input based on the validation
    component.setState({
      isValid: isValid,

      // We use the callback of setState to wait for the state
      // change being propagated, then we validate the form itself
    }, this.validateForm);

  },
  validateForm: function () {

    // We set allIsValid to true and flip it if we find any
    // invalid input components
    var allIsValid = true;

    // Now we run through the inputs registered and flip our state
    // if we find an invalid input component
    var inputs = this.inputs;
    Object.keys(inputs).forEach(function (name) {
      if (!inputs[name].state.isValid) {
        allIsValid = false;
      }
    });

    // And last, but not least, we set the valid state of the
    // form itself
    this.setState({
      isValid: allIsValid
    });
  },
  attachToForm: function (component) {
    this.inputs[component.props.name] = component;
    this.model[component .props.name] = component.state.value;

    // We have to validate the input when it is attached to put the
    // form in its correct state
    this.validate(component);

  },
  detachFromForm: ...
  updateModel: ...
  submit: ...
  render: ...
});
```

Lets jump over to the input component and make sure everything there is handled correctly:

```javascript

var Input = React.createClass({

  getInitialState: ...
  componentWillMount: function () {

    // If we use the required prop we add a validation rule
    // that ensures there is a value. The input
    // should not be valid with empty value
    if (this.props.required) {
      this.props.validations = this.props.validations ? this.props.validations + ',' : '';
      this.props.validations += 'isValue';
    }

    this.props.attachToForm(this);
  },
  componentWillUnmount: ...
  setValue: function (event) {
    this.setState({
      value: event.currentTarget.value

      // When the value changes, wait for it to propagate and
      // then validate the input
    }, function () {
      this.props.validate(this);
    }.bind(this));
  },
  render: function () {
    return (
      <input type="text" name={this.props.name} onChange={this.setValue} value={this.state.value}/>
    );
  }
});
```

Wow, that was a lot of code! Well, this is somewhat the hidden message of this article. Validation is freakin' complex! There are so many ways to create a user experience, you need validation both from user input and from server and you have two concepts of validation, form validation and input validation. On top of that we have this total headspin of "Should an empty value be validated?". But lets finish this up and I will give you a couple of advices when it comes to building validation for your application.

#### 3. Server error response
If the form itself is valid that does not mean the backend is happy. We have to make sure that we display error messages from the server. In this implementation we have a requirement. If the backend gives validation errors it has to return an object where the key maps to the name of the inputs and the value is the error message itself. F.ex. { email: 'Email already exists' }. Lets dive into our FORM code again and add an error handler.

```javascript

var Form = React.createClass({
  getInitialState: ...
  componentWillMount: ...
  componentDidMount: ...
  registerInputs: ...
  validate: function (component) {

    if (!component.props.validations) {
      return;
    }

    var isValid = true;
    if (component.props.value || component.props.required) {
      component.props.validations.split(',').forEach(function (validation) {
        var args = validation.split(':');
        var validateMethod = args.shift();
        args = args.map(function (arg) { return JSON.parse(arg); });
        args = [component.state.value].concat(args);
        if (!validator[validateMethod].apply(validator, args)) {
          isValid = false;
        }
      });
    }

    component.setState({
      isValid: isValid,

      // Our new server error state on a component needs to be reset when
      // new validations occur
      serverError: null
    }, this.validateForm);

  },
  validateForm: ...
  attachToForm: ...
  detachFromForm: ...
  updateModel: ...
  submit: function (event) {
    event.preventDefault();
    this.setState({
      isSubmitting: true
    });
    this.updateModel();
    MyAjaxService.post(this.props.url, this.model)
      .then(this.props.onSuccess)
      .catch(this.setErrorsOnInputs); // We catch the error from the post
  },
  setErrorsOnInputs: function (errors) {

     // We go through the errors
     Object.keys(errors).forEach(function (name, index) {

      // We grab the component by using the key from errors
      var component = this.inputs[name];

      // We change the state
      component.setState({
        isValid: false,
        serverError: errors[name] // We use a new state here to indicate a server error
      });

      // And after changing the state of the form,
      // we validate it
      this.setState({
        isSubmitting: false
      }, this.validateForm);

    }.bind(this));
  },
  render: ...
});
```

Almost there! The only thing remaining now is making sure that our input validates and displays validation errors correctly.

```javascript

var Input = React.createClass({

  getInitialState: function () {
    return {
      value: this.props.value || '',
      serverErrors: null // No initial server errors
    };
  },
  componentWillMount: ...
  componentWillUnmount: ...
  setValue: ...

  // We have to wrap our input to display error messages
  render: function () {

    // We create variables that states how the input should be marked.
    // Should it be marked as valid? Should it be marked as required?
    var markAsValid = this.state.isValid;
    var markAsRequired = this.props.required && !this.state.value;

    var className = '';

    // We prioritize marking it as required over marking it
    // as not valid
    if (markAsRequired) {
      className = 'required';
    } else if (!markAsValid) {
      className = 'error';
    }

    // If it is valid or marked as required, we show no error.
    // If not valid we either show the server error or the validation error
    return (
      <div className={className}>
        <input type="text" name={this.props.name} onChange={this.setValue} value={this.state.value}/>
        <span>{markAsValid || markAsRequired ? null : this.state.serverError || this.state.validationError}</span>
      </div>
    );
  }
});
```

Sweet! We got through it! And while we sum this up, enjoy your virtual cookie:

![Cookie](http://www.chick-fil-a.com/Media/Img/catalog/Food/XLarge/Cookie.png)

As stated this article was written to point out the insane complexity we confront when building good user experiences in forms. The big takeaway here is that a form is an isolated implementation, just like a live search, autocomplete, calendar etc. I do not recommend implementing it as a "part of your application logic". The other takeaway here is that you will need a dynamic, but tight relationship between your form and the inputs. The reason is that user inputs will be validated on the input itself, but also needs to notify the form. And the same when the form receives an error from the server. It needs to invalidate itself and the related inputs. It is also worth mentioning that "empty value" should only be validated if you have a "required" flag on your input.

As stated above this article resulted in an extension for React JS, [formsy-react](https://github.com/christianalfoni/formsy-react), and for Angular JS, [formsy-angular](https://github.com/christianalfoni/formsy-angular). This will essentially just give a form and a toolbox to build whatever inputs you want in your application, even non-traditional form inputs and you still get the validation for free.

Thanks for taking the time to read through this article and I hope it will help you handle forms and validation with React JS.
