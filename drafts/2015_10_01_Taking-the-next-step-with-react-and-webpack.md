# Taking the next step with React and Webpack

It has been a year since I first got into React and Webpack. I have many times expressed that Webpack is amazing, but hard to configure. That being truthy I think there is a different reason why developers does not adopt it. So I want to go head first and say; "Webpack is amazing, but it is hard to understand why". In this article I will try to convey the core of what makes Webpack great. Then we are going to look at the very latest contributions to the Webpack/React ecosystem.

## The core idea of Webpack
To understand Webpack it can often be a good idea to talk about Grunt and Gulp first. The input to a Grunt task or a Gulp pipeline is filepaths (globs). The matching files can be run through different processes. Typically transpile, concat, minify etc. This is a really great concept, but neither Grunt or Gulp understands the structure of your project. When we compare this to Webpack you could say that Gulp and Grunt handles files, while Webpack handles projects.

With Webpack you give a single path. The path to your entry point. This is typically *index.js* or *main.js*. Webpack will now investigate your application. It will figure out how everything is connected through *require*, *import* etc. statements, *url* properties in your CSS, image tags etc. It creates a complete dependency graph of all the assets your application needs to run. All of this just pointing to one single file.

An asset is a file. It being an image, css, less, json, js, jsx etc. And this file is a node in the dependency graph created by Webpack.

```javascript

|---------|         |------------|       |--------|
| main.js | ------- | styles.css | ----- | bg.png |
|---------|    |    |------------|       |--------|
               |
               |    |--------|       |-------------|
               |--- | app.js | ----- | config.json |
                    |--------|       |-------------|

```

When Webpack investigates your app it will hook on new nodes to the dependency graph. When a new node is found it will check the file extension. If the extension matches your configuration it will run a process on it. This process is called a **loader**. An example of this would be to transform the content of a *.js* file from ES6 to ES5. Babel is a project that does this and it has a Webpack loader. Install it with `npm install babel-loader`.

```js

import path from 'path';

const config = {

  // Gives you sourcemaps without slowing down rebundling
  devtool: 'eval-source-map',
  entry: path.join(__dirname, 'app/main.js'),
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel'
    }]
  }
};
```
We basically tell Webpack that whenever it finds a *.js* file it should be passed to the Babel loader.

This is really great, but it is just the beginning. With Webpack a loader is not just an input/output. You can do some pretty amazing stuff which we are going to look at now. The funny thing about Webpack is that it has been out for quite some time and also the additions I am going to talk about here. For some reason it just does not reach out... anyways, hopefully this will at least reach you now :-)

## Express middleware
Using Node as a development server is really great. Maybe you run Node in production, but even if you do not you should have a Node development server. Why you ask? Well, what web application does not talk to the server? Instead of faking requests and responses in your client application, why not do that on the Node server? Now you can implement your application with a fully working backend and the transition to production is easier.

To make Webpack work with a Node backend you just have to `npm install webpack-dev-middleware` and bippeti-bappeti....

```javascript

import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import config from './webpack.config.js';

const app = express();
const compiler = webpack(config);

app.use(express.static(__dirname + '/dist'));
app.use(webpackMiddleware(compiler);
app.get('*', function response(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(3000);
```

...bo! A Node development server with Webpack running behind it.

## ES6 on Node
As you can see I am using ES6 code on Node. There is really no reason why the JavaScript on the client should look different than the JavaScript on the server. Since you have already installed `babel-loader`, which includes `babel-core`, you have what you need. In your *package.json* change the following line:

```javascript

{
  "scripts": {
    "start": "node server.js"
  }
}
```

to:

```javascript

{
  "scripts": {
    "start": "babel-node server.js"
  }
}
```

Easy peasy. You can now even use JSX on the server.

## Hot loading code
Hot loading code is a great concept. It makes your workflow a lot smoother. Normally you have to refresh the application and sometimes click your way back to the same state. We spend a lot of time on this and we should not do that. As I mentioned Webpack can do some pretty amazing things with its loaders. Hot loading styles is the first we will look at, but before that we have to make our Webpack workflow allow hot loading:

`npm install webpack-hot-middleware`

```javascript

import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware'; // This line
import config from './webpack.config.js';

const app = express();
const compiler = webpack(config);

app.use(express.static(__dirname + '/dist'));
app.use(webpackMiddleware(compiler);
app.use(webpackHotMiddleware(compiler)); // And this line
app.get('*', function response(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(3000);
```

### Hot loading styles
First we add a new loader to our project. This makes Webpack understand what CSS is. Specifically it will understand what a *url* means. It will treat this as any other *require*, *import* etc. statement. But we do not just want to understand CSS, we also want to add it to our page. With `npm install style-loader` we can add behavior to our CSS loading.

```js

import path from 'path';

const config = {

  devtool: 'eval-source-map',

  // We add an entry to connect to the hot loading middleware from
  // the page
  entry: [
    'webpack-hot-middleware/client',
    path.join(__dirname, 'app/main.js')
  ],
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: '[name].js',
    publicPath: '/'
  },

  // This plugin activates hot loading
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel'
    }, {
      test: /\.css?$/,
      loader: 'style!css' // This are the loaders
    }]
  }
};
```

In our config we tell Webpack to first run the *css-loader* and then the *style-loader*, it reads right to left. The css-loader makes any urls within it part of our dependency graph and the style-loader puts a style tag for the CSS in our HTML.

So now you see that we do not only process files with Webpack, we can create side effects like creating style tags. With the HOT middleware we can even run these side effects as we change the code of the app. That means every time you change some CSS Webpack will just update the existing style tag on the page, without a refresh.

### Hot loading components
I got a developer crush on Dan Abramov after he released *react-hot-loader*, now called *react-transform*. Hot loading CSS is pretty neat, but you can do the same with React components. The react-transform project is not a Webpack loader, which actually react-hot-loader was. React-transform is a Babel transform. To configure a Babel transform you first need to `npm install react-transform`. Then you add a file to your project called *.babelrc*.

```js

{
  "stage": 2,
  "env": {
    "development": {
      "plugins": ["react-transform"],
      "extra": {
        "react-transform": {
          "transforms": [{
            "transform": "react-transform-hmr",
            "imports": ["react"],
            "locals": ["module"]
          }]
        }
      }
    }
  }
}
```

I have not asked why Dan decided to make it a Babel transform instead of a Webpack loader, but probably it allows other projects than Webpack to use it. Anyways, there you have it. Now you can actually make changes to the code of your components and without any refresh they will just change in the browser, right in front of your eyes. Combining this with CSS hot loading and you will be a very happy developer.

## CSS Modules
When I think about Tobias Koppler (Creator of Webpack) I imagine him sitting at his desk with 6 monitors, like the guy in the movie Swordfish. No mouse, but a titanium alloyed keyboard to keep up with the stress of his fingers pounding on it 24/7. Webpack has an increadible codebase and he manages to keep up with all advancements that fits in with Webpack. One of these advancements is CSS Modules and of course Webpack supports it.

A short description of CSS Modules is that each CSS file you create has a local scope. Just like a JavaScript module has its local scope. The way it works is:

```javascript

import styles from './App.css';

export default function (props) {

  return <h1 className={styles.header}>Hello world!</h1>;

};
```

```css

.header {
  color: red;
}
```

You also have to update the config:

```js

import path from 'path';

const config = {
  ...
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel'
    }, {
      test: /\.css?$/,
      loader: 'style!css?modules&localIdentName=[name]---[local]---[hash:base64:5]'
    }]
  }
};
```

So you only use classes and those classes can be referenced by name when you import the css file. The thing here now is that this *.header* class is not global. It will only work on JavaScript modules importing the file. This is fantastic news because now you get the power of CSS. :hover, [disabled], media queries etc. but you reference the rules with JavaScript.

There are more to these CSS Modules which you can look at [here](http://glenmaddern.com/articles/css-modules). Composition being one of the most important parts. But the core concept here is that you get the power of CSS with the scoping of JavaScript modules. Fantastic!

## Summary
To play around with this setup you can use [this boilerplate](https://github.com/christianalfoni/webpack-express-boilerplate). It is basically works like the examples shown here. Expressing project structure is difficult. Yes, we have our files and folders, but how those files are a part of your project is often not obvious. With Webpack you can stop thinking files and start thinking modules. A module is a folder with the React component, images, fonts, css and any child components. The files and folders now reflects how they are used in your project and that is a powerful concept.
