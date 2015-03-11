# Sending JSON

```javascript

$.ajax({
  type: 'post',
  url: '/contacts/123',
  data: {
    firstName: 'Ola',
    lastName: 'Nordmann',
    age: 23,
    isAwesome: true
  }
});

```

Is it JSON? It sure looks like it, but it is not, it is a JavaScript object. JSON
looks like JavaScript objects, but there is one main difference. JSON is a **string** and looks something like this:

```javascript

'{"firstName":"Ola","lastName":"Nordmann","age": 23,"isAwesome": true}'

```


Transferring data over HTTP does not support JavaScript objects as content, actually the body only supports a single string. So what happens when
for example jQuery handles your data object and how is it actually transferred over HTTP? Is it transferred as JSON?

If this is obvious to you there might still be a couple of things to pick up if you read on. If this is not obvious to you, you should definitely
read on!

### How does HTTP work?

HTTP (HyperText Transfer Protocol) started out as a protocol to transfer text (string). You would hit an address (url) on the client and a server responds with a string.
The string could contain information about other addresses (urls) and there you have it... a webpage.

When it comes down to it, HTTP is just a way of transferring data between two applications, normally a browser and a server application, but
it can also be used between two different server applications. It is a request/response protocol, meaning that you open a connection,
 ask for something, get something back and close the connection. The type of data transferred is just a string. HTTP has no understanding of integers, booleans etc.

### What data is transferred over the HTTP protocol?

A HTTP **request** has the following content:

- **Method** (GET, POST, PUT, DELETE etc.)
- **URL**
    - http://localhost:9000/contacts
- **Query**
    - http://localhost:9000/contacts**?type=private&limit=20**
    - The query begins with a question character (?)
    - Are key/value pairs seperated by **&**, e.q.: limit=20&filter=abc
- **Headers**
    - User-agent
    - Content-type
    - X-requested-with
    - Cache-control
    - Cookie
        - Can be multiple cookies
        - Also key/value pairs, only separated by **;**
    - And lots more...
- **Body**

A HTTP **response** has the following content:

- **Status code**
- **Headers**
    - Access-Control-Allow-Origin
    - Content-length
    - Content-Encoding
    - Content-type
    - Cache-control
    - Set-Cookie
        - E.g.: UserId=CrazyPants;Max-Age=3600;
        - Newline is the delimiter
        - Whatever cookie is set will be included on all following requests
    - And lots more...
- **Body**

As a developer you have definitely heard of the HTTP methods GET, POST, PUT and DELETE, but did you know that they are technically the same? The method is just a property
of the HTTP request. This means that you can put a body on your GET request and handle it as if it was a POST, but that is not the conventional way of doing it... and you
should keep to the general convention.

### So what does the server do when it gets an HTTP request?

A request is sent from a browser to the server. As a developer you depend on a library that is built to handle the request.
Many libraries does a lot of the work for you and basically the following is happening:

- Parses the URL to match any defined routes
- Parses any cookies passed in on the request
- Parses the query of the request
- Parses the content of the body, based on the **content-type** passed in
- And lots more

When the request is handled it will be responded with the following:

- A status code
- Headers defined by the library you are using and any headers you have set yourself
- Among the headers, the **content-type** which tells the client how to parse the content of the body
- The body, which is just a string

### Getting to the point

The data-structures of our requests and responses has become more complex, as more complex applications are being built on the web.
When the web first started out it was all about **forms**. Inputs, dropdowns, checkboxes, radiobuttons and textareas. Basically they
could handle the following data:

- strings
- numbers
- booleans
- string lists (comma-separated)

But as the web has evolved, the need to send more complex data has too. Looking at JavaScript:

```javascript

    // Typical form data where everything is handled as a string
    data: {
      myString: 'string',
      myNumber: '20',
      myBoolean: 'true',
      myList: ['string', 'string']
    }

    // Typical complex data where we want to pass objects and arrays of objects
    // Also due to javascript being a popular backend, we want to pass more than strings,
    // also numbers, booleans and null. More on that statement soon...
    data: {
        myObject: {
            myString: 'string',
            myNumber: 20,
            myBoolean: true,
        },
        myObjectList: [{
            myString: 'string',
            myNumber: 20,
            myBoolean: true,
        }]
    }

```

### application/x-www-form-urlencoded

By default any data sent to the server is **application/x-www-form-urlencoded**. When passing **application/x-www-form-urlencoded** as content-type,
the server expects the following structure in the body:

```javascript

    // Typical data and expected syntax for
    // application/x-www-form-urlencoded, churned by jQuery
    data: {
        myString: 'string', // myString=string
        myNumber: 20, // myNumber=20
        myBoolean: true, // myBoolean=true
        myList: ['string', 'string'], // myList[0]=string&myList[1]=string
        myObject: {
            myString: 'string',
            myNumber: 20,
            myBoolean: true,
        }, // myObject[myString]=string&myObject[myNumber]=20&myObject[myBoolean]=true
        myObjectList: [{
            myString: 'string',
            myNumber: 20,
            myBoolean: true,
        }] // myObjectList[0][myString]=string&myObjectList[0][myNumber]=20&myObjectList[0][myBoolean]=true
    }

    // And putting it all together
    'myString=string&myNumber=20&myBoolean=true&myList[0]=string&myList[1]=string&myObject[myString]=string&myObject[myNumber]=20&myObject[myBoolean]=true&myObjectList[0][myString]=string&myObjectList[0][myNumber]=20&myObjectList[0][myBoolean]=true'

```

So already here we see two problems.

**1:** The body of the request is a big string, it is **243** characters!

**2:** If you look at the values there is nothing indicating if it is a string, number or boolean

#### Let me go into that second statement

In other languages than JavaScript you define expected type on property values, arguments etc. Take Java:

```java

    // Each argument knows what type it is
    public void (String myString, Integer myNumber, Boolean myBoolean) {

    }

    // So based on the type defined on the arguments,
    // each value would be converted to the correct type
    "myString=string&myNumber=20&myBoolean=true"

```

In JavaScript that is not the case:

```javascript

    function (myString, myNumber, myBoolean) {
        console.log(myString); // => 'string'
        console.log(myNumber); // => '20'
        console.log(myBoolean); // => 'true'
    }

    // Everything will become a string
    'myString=string&myNumber=20&myBoolean=true'

```

### XML

A popular data structure, XML, can also be used to pass data over HTTP. Lets look at how it handles our data object:

```javascript

    // Typical data and expected syntax for application/xml or text/xml
    data: {
        myString: 'string', // <myString>string</myString>
        myNumber: 20, // <myNumber>20</myNumber>
        myBoolean: true, // <myBoolean>true</myBoolean>
        myList: ['string', 'string'], // <myList>string</myList><myList>string</myList>
        myObject: {
            myString: 'string',
            myNumber: 20,
            myBoolean: true,
        }, // <myObject><myString>string</myString><myNumber>20</myNumber><myBoolean>true</myBoolean></myObject>
        myObjectList: [{
            myString: 'string',
            myNumber: 20,
            myBoolean: true,
        }] // <myObjectList><myObject><myString>string</myString><myNumber>20</myNumber><myBoolean>true</myBoolean></myObject></myObjectList>
    }

    // And putting it all together
    '<?xml version=“1.0”?><myString>string</myString><myNumber>20</myNumber><myBoolean>true</myBoolean><myList>string</myList><myList>string</myList><myObject><myString>string</myString><myNumber>20</myNumber><myBoolean>true</myBoolean></myObject><myObjectList><myObject><myString>string</myString><myNumber>20</myNumber><myBoolean>true</myBoolean></myObject></myObjectList>'

```

Again we see the two problems, only it has gotten worse.

**1:** The body of the request is a big string, it is **369** characters!

**2:** If you look at the values there is nothing indicating if it is a string, number or boolean

Note that you could probably do some optimization here, but it would still be the worst result character length wise.

### JSON

```javascript

    // Typical data and expected syntax for application/json
    data: {
        myString: 'string', // "myString": "string"
        myNumber: 20, // "myNumber": 20
        myBoolean: true, // "myBoolean": true
        myList: ['string', 'string'], // "myList": ["string", "string"]
        myObject: {
            myString: 'string',
            myNumber: 20,
            myBoolean: true,
        }, // {"myString": "string", "myNumber": 20, "myBoolean": true}
        myObjectList: [{
            myString: 'string',
            myNumber: 20,
            myBoolean: true,
        }] // [{"myString": "string", "myNumber": 20, "myBoolean": true}]
    }

    // And putting it all together
    '{"myString":"string","myNumber":20,"myBoolean":true,"myList":["string", "string"],{"myString":"string","myNumber":20,"myBoolean":true},[{"myString":"string","myNumber":20,"myBoolean":true}]}'

```

**1:** The body of the request now contains the smallest string, it is **190** characters

**2:** The values now have a type indicator that JavaScript will understand

### Getting it right

So how do you ensure that your client passes data as JSON? Doing it natively with JavaScript would be quite obvious, but jQuery and also using Backbone can actually make
things quite confusing:

```javascript

    /*
        With XMLHttpRequest
    */
    var myDataObject = {
        myString: 'string',
        myNumber: 20,
        myBoolean: true
    },
    xhr = new XMLHttpRequest();

    // Tell the server how to parse the body
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.open('POST', '/contacts', false);

    // Stringify the content to JSON
    xhr.send(JSON.stringify(myDataObject));

    /*
        With jQuery and/or Backbone
    */
    $.ajaxSetup({

        // Tell the server how to parse the body
        contentType: 'application/json',

        // Automatically parses JSON responses from server back to JavaScript
        dataType: 'json',

        // Prevents jQuery from doing what it normally does with the data object
        processData: false,
        beforeSend: function (jXhr, options) {

            if (
                    // If it is POST, PUT or DELETE.
                    // GET converts data properties to a query
                    options.type !== 'GET' &&

                    // If you are passing data
                    options.data &&

                    // If it is not already a string, which Backbone
                    // would already have done for you
                    typeof options.data !== 'string'
                ) {

                // Stringify the data to JSON
                options.data = JSON.stringify(options.data);
            }

        }
    });

```

Take note of the jQuery configuration here. Doing this lets you keep your normal request syntax with Jquery, passing a JavaScript object as data, but your body
will always be a JSON.

### What about queries?

Okay, there is one last thing regarding Node JS. We have been talking about the body this far, but you can also pass data in the URL, as part of a query.
Node JS has the same issues here regarding types.

*http://localhost:3000/?myString=string&myNumber=20&myBoolean=true*

There is no way for JavaScript to understand the types of the parameters in the query. You simply have to handle it yourself.

```javascript

    function myRequestHandler (req, res) {

        req.query.myString = String(req.query.myString);
        req.query.myNumber = Number(req.query.myNumber);
        req.query.myBoolean = Boolean(req.query.myBoolean);

    }

```

An alternative to this is passing your query as a JSON string also. So:

*http://localhost:3000/?myString=string&myNumber=20&myBoolean=true*

Becomes:

*http://localhost:3000/?json={"myString":"string","myNumber":20,"myBoolean":true}*

By using a middleware on your javascript server side, you could do something like this:

```javascript

    function myRequestHandler (req, res, next) {

        if (req.query) {
            req.query = JSON.parse(req.query.json);
        }

        next();
    }

```

This would effectively give you the correct representation of the JavaScript query object passed by the client.
