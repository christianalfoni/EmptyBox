# The ultimate Webpack setup

I have already written [an article](http://christianalfoni.com/articles/2014_12_13_Webpack-and-react-is-awesome) on using Webpack for your React application. Now I have more experience and want to share a really awesome setup we use at my employer, **Gloppens EDB Lag**, that gives you a great workflow expanding beyond the concepts of Webpack and makes it easy to do continuous deployment. 

We will be talking about the following:

1. Create an express application
2. Launch our workflow with the express application
3. Proxy requests to Webpack-dev-server and other endpoints like firebase
4. Create a continuous deployment flow

So let us get started with creating our setup. If you want to follow a long on your own machine, please do, or just read through to get some inspiration. I will not be going through every single detail like installing the dependencies used etc., that is just basic Node and NPM stuff. You can head straight to the [webpack-express-boilerplate](https://github.com/christianalfoni/webpack-express-boilerplate) to check all the code or export the boilerplate to a directory of your choice with:

`svn export https://github.com/christianalfoni/webpack-express-boilerplate/trunk ./dir`

## File structure
Before we get started I think it is good to get an overview of the directory we are going to work with:

```javascript

- /app
- /app/main.js - Entry point for your app
- /public
- /public/index.html
- /server
- /server/bundle.js - Our workflow code
- server.js - Express and proxies
- webpack.config.js
- webpack.production.config.js
- package.json - Deployment and project configuration
```

## Project configuration file
First of all lets set up a basic configuration file for our project using NPM. In the project root run `npm init` and just type in what makes sense to you or just hit ENTER. When it is ready open it up and insert the following:

```javascript

{
  ...
  "scripts": {
    "start": "node server"
  },
  ...
}
```

This just tells NPM what command to run when we type `npm start` in our terminal. This will also be used by for example Nodejitsu or Heroku to run the application.

## Express server
If you are just going to use the Node server as a development tool for prototyping or actually run it in production you will need something to handle the requests from the browser. Express is great for that so lets go ahead and set up a server:

*server.js*
```javascript

var express = require('express');
var path = require('path');

var app = express();

var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? 8080 : 3000;
var publicPath = path.resolve(__dirname, 'public');

// We point to our static assets
app.use(express.static(publicPath));

// And run the server
app.listen(port, function () {
  console.log('Server running on port ' + port);
});

```

*/public/index.html*
```javascript

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
</head>
<body>
  <script src="/build/bundle.js"></script>
</body>
</html>
```

When we now run `npm start` we can go to `localhost:3000` in the browser and see a white screen and an error in our console related to not finding the *bundle.js* file. Great, that is actually what we expect!

## Workflow
Lets continue setting up the actual workflow. Lets first configure Webpack for our development workflow:

*webpack.config.js*
```javascript

var Webpack = require('webpack');
var path = require('path');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');
var mainPath = path.resolve(__dirname, 'app', 'main.js');

var config = {
  
  // Makes sure errors in console map to the correct file
  // and line number
  devtool: 'eval',
  entry: [

    // For hot style updates
    'webpack/hot/dev-server', 

    // The script refreshing the browser on none hot updates
    'webpack-dev-server/client?http://localhost:8080', 

    // Our application
    mainPath],
  output: {

    // We need to give Webpack a path. It does not actually need it,
    // because files are kept in memory in webpack-dev-server, but an 
    // error will occur if nothing is specified. We use the buildPath 
    // as that points to where the files will eventually be bundled
    // in production
    path: buildPath,
    filename: 'bundle.js',

    // Everything related to Webpack should go through a build path,
    // localhost:3000/build. That makes proxying easier to handle
    publicPath: '/build/'
  },
  module: {

    loaders: [

    // I highly recommend using the babel-loader as it gives you
    // ES6/7 syntax and JSX transpiling out of the box
    {
      test: /\.js$/,
      loader: 'babel',
      exclude: [nodeModulesPath]
    },
  
    // Let us also add the style-loader and css-loader, which you can
    // expand with less-loader etc.
    {
      test: /\.css$/,
      loader: 'style!css'
    }

    ]
  },

  // We have to manually add the Hot Replacement plugin when running
  // from Node
  plugins: [new Webpack.HotModuleReplacementPlugin()]
};

module.exports = config;
```

Note that we are not actually outputting any files when running the workflow, but we want these "in-memory" files to be fetched from the same path as in production, `localhost:3000/build/bundle.js`. That way we only need one index.html file.

So that is the configuration. Now we need to build the bundler.

*server/bundle.js*
```javascript

var Webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./../webpack.config.js');
var path = require('path');
var fs = require('fs');
var mainPath = path.resolve(__dirname, '..', 'app', 'main.js');

module.exports = function () {
  
  // First we fire up Webpack an pass in the configuration we
  // created
  var compiler = Webpack(webpackConfig, function () {

    // Due to a bug with the style-loader we have to "touch" a file
    // to force a rebundle after the initial one. Kudos to my colleague 
    // Stephan for this one
    fs.writeFileSync(mainPath, fs.readFileSync(mainPath).toString());
    console.log('Project is ready!');

  });

  var bundler = new WebpackDevServer(compiler, {

    // We need to tell Webpack to serve our bundled application
    // from the build path. When proxying:
    // http://localhost:3000/build -> http://localhost:8080/build
    publicPath: '/build/',

    // Configure hot replacement
    hot: true, 

    // The rest is terminal configurations
    quiet: false,
    noInfo: true,
    stats: {
      colors: true
    }
  });

  // We fire up the development server
  bundler.listen(8080, 'localhost', function () {
    console.log('Bundling project, please wait...');
  });

};

```
The style-loader bug has an issue set up at [the style-loader repo](https://github.com/webpack/style-loader/issues/47). It would be great if you gave the issue a comment, get it prioritized :-)

Finally we have to set up a proxy between our express server and the webpack-dev-server:

*server.js*
```javascript

var express = require('express');
var path = require('path');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer(); 
var app = express();

var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? 8080 : 3001;
var publicPath = path.resolve(__dirname, 'public');

app.use(express.static(publicPath));

// We only want to run the workflow when not in production
if (!isProduction) {

  // We require the bundler inside the if block because
  // it is only needed in a development environment. Later
  // you will see why this is a good idea
  var bundle = require('./server/bundle.js'); 
  bundle();

  // Any requests to localhost:3000/build is proxied
  // to webpack-dev-server
  app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
        target: 'http://localhost:8080'
    });
  });

}

// It is important to catch any errors from the proxy or the
// server will crash. An example of this is connecting to the
// server when webpack is bundling
proxy.on('error', function(e) {
  console.log('Could not connect to proxy, please try again...');
});

app.listen(port, function () {
  console.log('Server running on port ' + port);
});

```

## Part summary
Okay, now we have the actual workflow going. Just run `npm start` and you got automatic refresh, hot loading styles, source mapping and everything else you would want to add to Webpack. You are now also free to add any other public files or API endpoints to your express server. This is really great for prototyping.

## Adding other endpoints
As part of your prototype you might want to work with a real database, or maybe you already have an API that you want to use. I will give you an example of wiring up [Firebase](https://www.firebase.com/). We will not be setting up Firebase with websockets etc., we will use the traditional REST like endpoints as that is most likely what you will be using in the production version of the application. That said it is no problem for *http-proxy* to proxy websocket requests and messages.

Suppose you have set up your firebase at *glowing-carpet-4534.firebaseio.com*, let us create an endpoint for your application and proxy that.

*server.js*
```javascript

var express = require('express');
var path = require('path');
var httpProxy = require('http-proxy');

// We need to add a configuration to our proxy server,
// as we are now proxying outside localhost
var proxy = httpProxy.createProxyServer({
  changeOrigin: true
}); 
var app = express();

var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? 8080 : 3001;
var publicPath = path.resolve(__dirname, 'public');

app.use(express.static(publicPath));

// If you only want this for development, you would of course
// put it in the "if" block below
app.all('/db/*', function (req, res) {
  proxy.web(req, res, {
    target: 'https://glowing-carpet-4534.firebaseio.com'
  });
});

if (!isProduction) {

  var bundle = require('./server/bundle.js'); 
  bundle();
  app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
        target: 'http://localhost:8080'
    });
  });

}

proxy.on('error', function(e) {
  console.log('Could not connect to proxy, please try again...');
});

app.listen(port, function () {
  console.log('Server running on port ' + port);
});
```

Now your frontend can for example POST to **localhost:3000/db/items.json** and you can find those changes at **glowing-carpet-4534.firebaseio.com/db/items**. Read [Firebase REST api](https://www.firebase.com/docs/rest/api/) to learn more about the REST api.

## Production bundle
Before we actually deploy any code we want to produce a production bundle of the application. That said, what service you choose affects how you run this bundling. At its core, this is what we want to run:

`webpack -p --config webpack.production.config.js`

It is very important that the environment variable *NODE_ENV* is set to *production* or you inline it with the command like this:

`NODE_ENV=production webpack -p --config webpack.production.config.js`

What you decide to do depends on the service running the command.

Now lets take a look at the configuration file.

*webpack.production.config.js*
```javascript

var Webpack = require('webpack');
var path = require('path');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');
var mainPath = path.resolve(__dirname, 'app', 'main.js');

var config = {
  
  // We change to normal source mapping
  devtool: 'source-map',
  entry: mainPath,
  output: {
    path: buildPath,
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: [nodeModulesPath]
    },{
      test: /\.css$/,
      loader: 'style!css'
    }]
  }
};

module.exports = config;
```

If you want to test this you can run: 

`NODE_ENV=production webpack -p --config webpack.production.config.js` 

You will see a *bundle.js* file appear in the *public/build* directory, and a *bundle.js.map* file. But we are not going to be running this locally, let us get this running in the cloud.

## Continuous deployment
So ideally you want your application or prototype to find its place in the cloud. This will let your users access your application, but also if you are just creating a prototype it will allow colleagues and maybe other people interested in the project to try things out as you iterate. This makes it a lot easier to give feedback and it will be easier for you to make changes as you go.

We are going to look at two different solutions amongst many others, [Nodejitsu](https://www.nodejitsu.com/) and [Heroku](https://www.heroku.com/). I will not go into deep details in this article, but hopefully it is enough to get you going. Now, Nodejitsu is moving to GoDaddy and is currently not available for new accounts, but the two services has different approaches and its the approaches we are interested in.

### Nodejitsu
With Nodejitsu you have a CLI tool for deploying the application. The CLI tool actually bundles up the application and moves it to the Nodejitsu servers as a *snapshot*. This is great, because we can use a build service to run tests, prepare the application for production and run the CLI tool whenever we push to the application repo. [Codeship](https://codeship.com) is one of these services and it works very well. You hook your repo to Codeship in one end and your Nodejitsu account on the other end. In between you run your tests, run the deploy command above and Codeship automatically updates the application on Nodejitsu if everything worked out okay.

All you really have to do is inserting this command into the *Setup Commands*:

`NODE_ENV=production webpack -p --config webpack.production.config.js`

Here we specifically set the environment variable. The reason is that we want Codeship to run in a development environment, installing all the dependencies required for that, but when bundling the production bundle we want that to run in a production environment.

### Heroku
Heroku works a bit differently. It does not wrap up your application using a CLI tool so using a service like Codeship does not really make sense, because you have to run everything inside Heroku anyway. You might consider running your tests on Codeship though, but the production bundle has to be created on Heroku.

When you have your Heroku account up and running with a repo attached to an app, make sure you add a *NODE_ENV* variable and a *production* value in the Heroku App configuration. To make Heroku run our production bundle command we have to create our own script and run it as a NPM *postinstall* script. Let us configure that part first in our package.json file:

*package.json*
```javascript

  "scripts": {
    "start": "node server",
    "postinstall": "node deploy"
  }
```

And now we can create this deploy script:

*deploy.js*
```javascript

// Since postinstall will also run when you run npm install
// locally we make sure it only runs in production
if (process.env.NODE_ENV === 'production') {

  // We basically just create a child process that will run
  // the production bundle command
  var child_process = require('child_process');
  return child_process.exec("webpack -p --config webpack.production.config.js", function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}
```

And thats it. Whenever you push to the repo Heroku will install the dependencies and then run this deploy script before running `npm start`.

## Handling dependencies
Depending on what solution you choose the production environment might need different dependencies. So instead of listing what you need in the two examples introduced, let me explain how it works.

When you save a dependency to your *package.json* file using for example: `npm install underscore --save` that dependency will always be installed when `npm install` runs, regardless of the environment. If you save a dependency using: `npm install webpack --save-dev` that dependency will not be installed in an environment where *NODE_ENV* is *production*. So what you want is to only `--save` dependencies that you need in production, and `--save-dev` all other dependencies.

If you remember from our *server.js* file we required the *bundle.js* module inside our "development if block". 

```javascript

...
if (!isProduction) {

  var bundle = require('./server/bundle.js'); 
  bundle();
  app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
        target: 'http://localhost:8080'
    });
  });

}
...
```

That way, when *server.js* is loaded in a production environment, it will not load *bundle.js* with its Webpack and Webpack-dev-server dependencies. That said, a Heroku deployment will require Webpack since it runs the production bundle script. 

I hope this was not too confusing. You will get good errors if you did something wrong and it is not a problem if your production environment installs dependencies it does not need.

## Summary
Okay, I hope this was a good read. At our company we have just started using this strategy. We have a boilerplate project, much like the [webpack-express-boilerplate](https://github.com/christianalfoni/webpack-express-boilerplate), that proxies to our existing endpoints and firebase when working on new stuff. Every push we do to the prototype automatically goes to the cloud as production code and can be tested by project owners, testers and colleagues. We have of course also implemented authentication in this boilerplate.

So please feel free to fork out the repo and create your own boilerplate for prototyping and get that continuous deployment flowing!

Thanks for reading!
