# Webpack and React is awesome

Previously I have written a couple of articles about how to set up a workflow with React JS. The solution provided was [browserify](http://browserify.org) with [gulp](http://gulpjs.com). If React JS is not your thing I think you still will get a lot of value out of this article, so please read on. 

To build a workflow for React JS with browserify and gulp you need a lot of dependencies and you have to write quite a bit of code. You might appreciate the flexibility gulp brings, but as the requirements of bundling your project grows, your workflow implementation becomes very complex. Nevertheless there are some core concepts you want to bring in to your React JS workflow:

1. Bundle JavaScript with Common JS (to use components in Node JS)
2. Sourcemapping
3. Transform JSX (Coffe, TypeScript etc.)
4. Split your vendor dependencies and app specific dependencies (fast rebundling)
5. Bundle stylesheets (css, sass, less etc.)
6. Handle images and fonts
7. Make your code production ready

Depending on your project you will of course have less or more requirements, but this is what I believe to be the core of it. What we are going to talk about in this article is how WebPack can help you very easily set up a workflow to handle these core concepts and some pretty amazing stuff on top of that. How does lazy loading your code sound? Or hot swapping React JS components without refreshing the browser? Loading CSS, less and sass with *require*? What about loading images that automatically inlines below a specific file size? These are some of the things we are going to talk about. If you want to get your hands dirty as you read, please do so, but it is definitely not required. You can also find an example workflow over at [this repo](https://github.com/christianalfoni/webpack-example).

### WebPack
Maybe like me you have also heard about WebPack. What motivated me to write this article was not my discovery of WebPack, but the [presentation by Pete Hunt](https://www.youtube.com/watch?v=VkTCL6Nqm6Y). He goes straight to the point of how WebPack differs and what makes it awesome. This is not the impression you get from looking at the WebPack site or reading its documentation. There is a [webpack-howto](https://github.com/petehunt/webpack-howto) that gives you a very simple and easy introduction to WebPack and we are actually going to go through the concepts mentioned there, though in more detail. We are also going to take it a bit further. We are going to use [webpack-dev-server](http://webpack.github.io/docs/webpack-dev-server.html) to introduce hot swapping of not only css, but also your JavaScript. That is pretty cool. Okay, so lets get going.

### Installing and setting up webpack and webpack-dev-server
First of all you will need to install both **webpack** and **webpack-dev-server**, using NPM. `npm install webpack` and `npm install webpack-dev-server`. This will allow you to run the command `webpack` and `webpack-dev-server` directly in your terminal. You will be using **webpack** to deploy your code and **webpack-dev-server** to run your workflow. We will first look at the workflow.

### Creating a basic workflow
Our project structure is:

```javascript

/project
- /app
-- main.js
-- AppComponent.js
- /build
-- index.html
-- bundle.js (automatically built by webpack)
- webpack.config.js
```

Just like **grunt** and **gulp** you will need a file defining your setup. This file should by default be called `webpack.config.js` and looks something like this:

```javascript

module.exports = {
  entry: ['./app/main.js'],
  output: {
    path: './build',
    filename: 'bundle.js'
  }
};
```

We just point to our application entry file and where we want our bundle to exist when it is produced. We will be looking more into this file later.

I also recommend using a `package.json` file to configure a script that will run **webpack-dev-server** with some options. This is how a basic package.json would look like:

```javascript

{
  "name": "my-project",
  "version": "0.0.0",
  "main": "app/main.js",
  "scripts": {
    "dev": "webpack-dev-server --devtool eval --progress --colors --content-base build"
  },
  "author": "",
  "license": "ISC"
}
```

Let us just briefly talk about the script we have added here: `"webpack-dev-server --devtool eval --progress --colors"`. When you run `npm run dev` in your terminal this is what will be executed. It runs **webpack-dev-server** with some arguments. *--devtool eval* will add source urls to your code, which will make sure that any errors point to the right file and line. It is really important that you do it like this. Sourcemapping can be achieved with *--d*, but that is a lot slower. Use that for production if you want sourcemapping. *--progress* and *--colors* will just improve the feedback you get in the terminal when running your workflow. **--content-base build** points to where you have your custom *index.html* located.


### Running the workflow
Let us create an HTML file that our **webpack-dev-server** can serve when we fire up the workflow. Add an *index.html* file to the build folder and put something like this in it:

```javascript

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My project</title>
</head>
<body>
  <script src="bundle.js"></script>
</body>
</html>
```

We of course also have to create our */app/main.js* file. It will require an *AppComponent* so that we have some **Common JS** in action:

```javascript

var AppComponent = require('./AppComponent.js');
console.log('Loaded the app component');
```

And the *AppComponent.js* file just looks like this for now:

```javascript

module.exports = {};
```

When we now run the following in our terminal, `npm run dev`, and go to *localhost:8080* we will of course not see anything, but our console logs out: *"Loaded the app component"*. If you do any changes to the files WebPack will rebundle your app automatically. So making a change and refreshing the browser will show your changes. Okay, so now we have the basics down. Let us install React JS and see how we would implement a transformer from JSX to JavaScript.


### WebPack loaders
You will have to install the loaders we need for the workflow, and the first one is **jsx-loader**. Run `npm install jsx-loader --save` in your terminal and head into the *webpack.config.js* file and we will do a small configuration:

```javascript

module.exports = {
  entry: ['./app/main.js'],
  output: {
    path: './build',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'jsx-loader' }
    ]
  }
};
```

What we are basically doing here is telling WebPack that whenever we try to **require** something that ends with *.js* it should run the contents of that file through the **jsx-loader**. Thats it! No need for the JSX comment at top of file or the *jsx* extension. If you prefer creating *.jsx* files you just change to */\.jsx$/*. Now lets install React JS and create our first component, `npm install react`.  And in our *AppComponent.js* file we insert:

```javascript

var React = require('react');
module.exports = React.createClass({
  render: function () {
    return (
      <h1>Hello world!</h1>
    );
  }
});
```

We also want to render this component to the page, so in our *main.js* file we insert:

```javascript

var React = require('react');
var AppComponent = require('./AppComponent.js');
React.render(<AppComponent/>, document.body);
```

Since we changed the configuration we need to stop the **webpack-dev-server** and start it again with `npm run dev`. When you refresh the browser, you see "Hello world!" on the screen. But we have met an issue here. When we do a change to a file it takes up to 300 ms to rebundle our application, and that with only two application files. In my book that is way too slow for a workflow.


### Handling vendors
When you create a bundling process in your workflow you want it to be as fast as possible. In Browserify you would solve this by creating two different bundles, one for vendors and one for your application. The vendors bundle is only bundled once and your application bundle is being watched for changes and rebundled when that occurs. This strategy does not work with WebPack though, because WebPack can not have two completely separate bundles and allow one of them to require from the other. That does not mean there is no solution. It took me some time to figure this one out, but the solution is quite simple.

We are going to change things around a bit. Instead of depending on **npm** for our browser vendors, we are going to use [bower](http://bower.io). So go ahead and install bower, `npm install bower -g` and then React JS, `bower install react --save`. Now we have react installed in a *bower_components* folder instead. To add this file to your project, create the following configuration:

```javascript

// For conveniance we create variable that holds the directory to bower_components
var bower_dir = __dirname + '/bower_components';

module.exports = {
  entry: ['./app/main.js'],
  
  // The resolve.alias object takes require expressions 
  // (require('react')) as keys and filepath to actual
  // module as values
  resolve: {
    alias: {
      'react': bower_dir + '/react/react.min.js'
    }
  },
  output: {
    path: './build',
    filename: 'bundle.js'
  },
  module: {
  
    // There is no reason for WebPack to parse this file
    noParse: [bower_dir + '/react/react.min.js'],
    loaders: [
      { test: /\.js$/, loader: 'jsx-loader' }
    ]
  }
};
```

So what we did here was bascially tell WebPack when *require('react')* is resolved in the code, it will use the *react.min.js* file located in *bower_components*. We also made sure that WebPack does not parse the file, because it is not necessary. You will actually get a warning if not using **noParse**. The reason is that WebPack more effectively compress a vendor by source, then a preminified file. We are talking about a few kilobytes, so it is up to you what is more important. Fast rebundling or an absolute minimum file size. The rebundle speed has now  dropped from 250-300 ms to 50-100 ms. That is a huge difference and when working with UI it will be the difference of "instant browser reload" and "waiting for reload".

A small pro tip here is to create a method to add vendors. This makes it very easy to add, change and remove vendors:

```javascript

// For conveniance we create variable that holds the directory to bower_components
var bower_dir = __dirname + '/bower_components';

var config = {
  addVendor: function (name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(new RegExp(path));
  },
  entry: ['./app/main.js'],
  resolve: { alias: {} },
  output: {
    path: './build',
    filename: 'bundle.js'
  },
  module: {
    noParse: [],
    loaders: [
      { test: /\.js$/, loader: 'jsx-loader' }
    ]
  }
};

config.addVendor('react', bower_dir + '/react/react.min.js');

module.exports = config;
```

This will also make it easy for you to use for example bootstrap:

```javascript

var bower_dir = __dirname + '/bower_components';

var config = {
  addVendor: function (name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(new RegExp(path));
  },
  entry: ['./app/main.js'],
  resolve: { alias: {} },
  output: {
    path: './build',
    filename: 'bundle.js'
  },
  module: {
    noParse: [],
    loaders: [
      { test: /\.js$/, loader: 'jsx-loader' }
    ]
  }
};

config.addVendor('bootstrap', bower_dir + '/bootstrap/bootstrap.min.js');
config.addVendor('bootstrap.css', bower_dir + '/bootstrap/bootstrap.min.css')

module.exports = config;
```

So in your *main.js* file you can just require these two deps:

```javascript

require('bootstrap');
require('bootstrap.css');

var React = require('react');
var AppComponent = require('./AppComponent.js');
React.render(<AppComponent/>, document.body);
```


### Specifying chunks
Currently we have one chunk in our WebPack bundle that includes our application and react. The chunk is loaded with the javascript file *bundle.js*. Larger applications will probably need to split the bundle into more chunks, which means more files. WebPack has a fantastic feature we are going to look at shortly, but for now, let us put all our vendors into a specific vendors chunk.

```javascript

// Add WebPack to use the included CommonsChunkPlugin
var webpack = require('webpack');
var bower_dir = __dirname + '/bower_components';

var config = {
   addVendor: function (name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(new RegExp('^' + name + '$'));
  },
  
  // We split the entry into two specific chunks. Our app and vendors. Vendors
  // specify that react should be part of that chunk
  entry: {
    app: ['./app/main.js'],
    vendors: ['react']
  },
  resolve: { alias: {} },
  
  // We add a plugin called CommonsChunkPlugin that will take the vendors chunk
  // and create a vendors.js file. As you can see the first argument matches the key
  // of the entry, "vendors"
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ],
  output: {
    path: './build',
    filename: 'bundle.js'
  },
  module: {
    noParse: [],
    loaders: [
      { test: /\.js$/, loader: 'jsx-loader' }
    ]
  }
};

config.addVendor('react', bower_dir + '/react/react.min.js');

module.exports = config;
```

Now we have to add the new *vendors.js* file to our html:

```javascript

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My project</title>
</head>
<body>
  <script src="vendors.js"></script>
  <script src="bundle.js"></script>
</body>
</html>
```

Restart the workflow and everything works as expected. So why would you want to do this? It is very unlikely that your vendors will change, but you will probably do bug fixes etc. on your application. So when a user visits the application the first time both *vendors.js* and *bundle.js* will be cached. If *bundle.js* is updated due to a bug fix, *vendors.js* will still be cached  and only *bundle.js* will be downloaded again.


### Multiple lazy loaded entries
Okay, lets dive into one of the really cool parts of WebPack. Lets say you are building a single page application that has a home-page and an admin-page. When users arrive at the home-page you do not want to download all the JavaScript and CSS of the admin-page. That is very easy to achieve. Let me show you with a minimal configuration:

```javascript

module.exports = {
  entry: ['./app/main.js'],
  output: {
    path: './build',
    filename: 'bundle.js'
  }
};
```

Our *main.js* file could look something like this:

```javascript

var React = require('react');

// We create a function that will lazy load modules based on the current hash
var resolveRoute = function () {
  
  // If no hash or hash is '#' we lazy load the Home component
  if (!location.hash || location.hash.length === 1) {
    require.ensure([], function () {
      var Home = require('./Home.js');
      React.render(Home(), document.getElementById('app'));
    });
    
  // Or if route is #admin we lazy load that
  } else if (location.hash === '#admin') {
    require.ensure([], function () {
      var Admin = require('./Admin.js');
      React.render(Admin(), document.getElementById('app'));
    });
  }

};

// Resolve route on hash change
window.onhashchange = resolveRoute;

// Resolve current route
resolveRoute();
```

The index.html file looks like:

```javascript

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My project</title>
</head>
<body>
  <div>
    
    
  </div>
  <div id="app"></div>
  <script src="bundle.js"></script>
</body>
</html>
```

If you follow along on the network tab of the web console you will see network requests fire when clicking the hyperlinks. So now we have optimized our project by not downloading admin specific code if you only visit the home page. If you would go to admin and then back to home it would not trigger a new download, as the chunk is already downloaded. WebPack by default loads the chunks from the root url ('/'), but you can define the public path in your config where the bundles should be loaded.

```javascript

module.exports = {
  entry: ['./app/main.js'],
  output: {
    path: './build',
    filename: 'bundle.js',
    publicPath: '/public/'
  }
};
```

In this configuration React JS was included in the *bundle.js* file, but you could have created a specific vendors chunk like we did earlier. It all depends on how you want to load the files. 


### Optimizing with a common chunk
So what if both our *Home.js* file and our *Admin.js* required a third file, *Shared.js*. That would actually result in the contents of *Shared.js* to appear in both *Home.js* and *Admin.js*, which is definitely not what we want. We want WebPack to put modules used by multiple entry points into a common chunk. So let us do that:

```javascript

var webpack = require('webpack');
module.exports = {
  entry: ['./app/main.js'],
  output: {
    path: './build',
    filename: 'bundle.js'
  },
  plugins: [new webpack.optimize.CommonsChunkPlugin('main', null, false)]
};
```

We create a **CommonsChunkPlugin** and pass three arguments. The first argument refers to what entry point we want to put the shared code. The default entry point name is "main", which points to ['./app/main.js']. The second argument would be the name of the file, that holds the shared code, but since we already have an output for our main entry point (bundle.js) we leave it at null. The third argument tells webpack to look for common modules in our lazely required modules. There is actually a fourth argument here too which is a number. The number states how many of these lazy modules that needs to share a module before it is put into our main bundle.

An important note here is that the modules (main.js, Home.js or Admin.js) themselves does not have to require the common module, any dependency within a dependency will count. An example of this would be if *Home.js* required a module named *InnerHome.js* and *InnerHome.js* required our *Shared.js* module. The *Shared.js* module would still be included in main bundle.


### Live reload
Live reload is a common thing in a workflow, but we are going to take it a step further with WebPack. But lets first setup a normal live reload. **webpack-dev-server** supports this out of the box, all we have to do is put it in our config, fire it up in the right mode and add another script tag. Let us continue on the multiple entry point example:

```javascript

var webpack = require('webpack');
module.exports = {

  // We add webpack/hot/dev-server to our main entry point
  entry: {
    app: ['webpack/hot/dev-server', './app/main.js'],
    Home: ['./app/Home.js'],
    Admin: ['./app/Admin.js']
  },
  output: {
    path: './build',
    filename: 'bundle.js'
  },
  plugins: [new webpack.optimize.CommonsChunkPlugin('common.js', 2)]
};
```

We also need to fire up the server in the "hot" mode simply by adding the "--hot" parameter in our package.json file:

```javascript

{
  "name": "my-project",
  "version": "0.0.0",
  "main": "app/main.js",
  "scripts": {
    "dev": "webpack-dev-server --devtool eval --hot --progress --colors"
  },
  "author": "",
  "license": "ISC"
}
```

And finally we add a script tag to the index.html file:

```javascript

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My project</title>
</head>
<body>
  <div>
    
    
  </div>
  <div id="app"></div>
  <script src="http://localhost:8080/webpack-dev-server.js"></script>
  <script src="common.js"></script>
  <script src="bundle.js"></script>
</body>
</html>
```

Fire up the server again with `npm run dev` and whenever you do a file change the browser will refresh. Now, you could actually omit this script insertion in the index.html file and go to `localhost:8080/webpack-dev-server` instead. At the top of the browser you will see a rebundle status and your application is put into an iframe. Personally I do not like this as it changes the environment of the application (iframe), but also visually breaks your app with the bundle indication at the top. But is very cool indeed :-)


### Lets do the hot swap!
I will not go into detail about the general hot swapping in WebPack, but I will show you something quite awesome with React JS. Let us use the current example and update the *main.js* file:

```javascript

var React = require('react');

var resolveRoute = function () {
  
  if (!location.hash || location.hash.length === 1) {
    require.ensure([], function () {
      var Home = require('./Home.js');
      React.render(Home(), document.getElementById('app'));
    });
    
  } else if (location.hash === '#admin') {
    require.ensure([], function () {
      var Admin = require('./Admin.js');
      React.render(Admin(), document.getElementById('app'));
    });
  }

};

window.onhashchange = resolveRoute;
resolveRoute();

// If hot swapping can be done, do it by resolving the current route
// and render the application again
if (module.hot) {
  module.hot.accept(resolveRoute);
}
```

So as stated in the comment whenever we now do a change to a component the application will actually rerender itself without refreshing the page. There are lots of possibilities with this hot swapping and you have to create your own strategy for it. This is an example of using routing and rerendering with React JS whenever any module has changed.


### Loading CSS
So another very cool thing about WebPack is how you can require CSS files directly in your javascript. To allow for this we simply need to install a *style-loader* and a *css-loader*, `npm install style-loader --save` and `npm install css-loader --save`. We insert the loaders into our config:


```javascript

var bower_dir = __dirname + '/bower_components';

module.exports = {
    entry: {
    app: ['./app/main.js']
  },
  output: {
    path: './build',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
    
      // Adding a loader for css. To do this with less you download the 
      // less-loader and add it to the end of the load string here, and 
      // of course test for less files, not css
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  }
};
```

Out of the box any changes to the css/less will update without refreshing the page. But the really cool thing is something that happens "under the hood". All *url()* and *@import* statements will be handled as a *require expression*. So how does that benefit us? Lets look at images and fonts.


### Images and fonts
A typical css file that uses fonts and images. Now, webfonts is a science in itself and heavily depends on your target browsers. In font loading examples we normally see 4 different formats added. woff, ttf, svg and eot. But that is hard to optimize, because only one of those formats will actually be used. Converting the font files to inline base64 string would cause all 4 to be included, increasing the file size unnecessarily. 

Looking at [caniuse.com](http://caniuse.com) we see that modern browsers support woff and svg. So depending on your project I would suggest sticking to only one of those two formats. Doing so will let us optimize it. Let us look at the code so that you see what I mean:

```javascript

@font-face {
  font-family: 'myFont';
  font-style: normal;
  src: url(./myFont.woff) format('woff');
}

body {
  font-family: 'myFont',
  background-image: url(./bg.png);
}
```

What WebPack does in this case is actually resolving the url paths and runs them through the matching loaders. Let us download the url loader, `npm install url-loader --save`, and change the config:

```javascript

var bower_dir = __dirname + '/bower_components';

module.exports = {
  entry: {
    app: ['./app/main.js']
  },
  output: {
    path: './build',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      
      // Any png-image or woff-font below or equal to 100K will be converted 
      // to inline base64 instead
      { test: /\.(png|woff)$/, loader: 'url-loader?limit=100000' }
    ]
  }
};
```

The result of the file will be something like this, shortening the base64 string:

```javascript

@font-face {
  font-family: 'myFont';
  font-style: normal;
  src: url(data:application/font-woff;base64...) format('woff');
}

body {
  font-family: 'myFont',
  background-image: url(data:image/png;base64...);
}
```

So now you see why multiple fonts would be a bad idea as you would inline content that would never be used. No matter, it is important to be careful with inlining as it will take longer to download the CSS and if changes to the CSS is made it will need to bring down also your inlined images and fonts, which would not be necessary if they were external files.

### Deploying your application
To produce a production ready application we have to add a new script to our package.json file:

```javascript

{
  "name": "my-project",
  "version": "0.0.0",
  "main": "app/main.js",
  "scripts": {
    "dev": "webpack-dev-server --devtool eval --progress --colors",
    "deploy": "NODE_ENV=production webpack -p"
  },
  "author": "",
  "license": "ISC"
}
```

This script runs node in production mode and runs the production packaging of WebPack. It will uglify, minify and so on. To specify where to put the result we have to update the config:

```javascript

var bower_dir = __dirname + '/bower_components';

var config = {
  addVendor: function (name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(new RegExp('^' + name + '$'));
  },
  entry: ['./app/main.js'],
  resolve: { alias: {} },
  output: {
  
    // If in production mode we put the files into the dist folder instead
    path: process.env.NODE_ENV === 'production' ? './dist' : './build',
    filename: 'bundle.js'
  },
  module: {
    noParse: [],
    loaders: [
      { test: /\.js$/, loader: 'jsx-loader' }
    ]
  }
};

config.addVendor('react', bower_dir + '/react/react.min.js');

module.exports = config;
```

And thats it. Your application is ready!

### Summary
WebPack is just an awesome tool. It takes application bundling to a whole new level. It is really too bad that documentation is lacking. Hopefully this article gave you some insight into what makes WebPack great. Have a look at [this simple example](https://github.com/christianalfoni/webpack-example) that lets you enjoy all the functionality mentioned in this article. Also take a look at this webpack react cookbook @bebraw and I am working on: [webpack-react-cookbook](https://github.com/christianalfoni/react-webpack-cookbook).
