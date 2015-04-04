# Choosing the correct packaging tool for React JS

When new frameworks are released they rarely have a workflow suggestion included and maybe with good reason. There are lots of tools out there to set up a workflow and what you end up with probably differs based on the project your are working on. In this post I am going to try to give you an overview of how you can set up workflows with React JS using different packaging tools.

I have a set up a github project you can take a look at here: [react-packaging](https://github.com/christianalfoni/react-packaging). It has a small setup for each packaging tool mentioned below. The requirements for each project is:

1. **Rebundling speed:** Should rebundle on file change (if needed) in under 200 ms. Note that I am not benchmarking the packaging tools. The combination of tools in this post are "first and best" combination below 200 ms
2. **A good feel for it:** Should not give me any bad feelings
3. **JSX transform:** Should transform files with JSX content
4. **Node support:** Should use `renderComponentToString` to render the App component on page load
5. **Sourcemapping:** Should use sourcemapping to give correct file and line errors

The projects should also run a simple web server, pointing to your development files in `development` mode and your distributed files in `production` mode.

### 1. RequireJS
Great work has been done on the following plugin: [jsx-requirejs-plugin](https://github.com/philix/jsx-requirejs-plugin). It does *hack* the JSXTransformer, but I have not find any other solution that covers the requirements above. What you basically do is:

1. Download a changed JSXTransformer to support the R-Optimizer. Download RequireJS text and jsx plugin. You also need RequireJS both for the client and for node. In addition to that you need grunt-contrib-requirejs and grunt-contrib-copy
2. Set up your Grunt task to run the R-Optimizer with your options
3. Use RequireJS for Node to require your main React JS component and render it to a string, combining it with you other html

You can check out the project structure here: [requirejs-project](https://github.com/christianalfoni/react-packaging/tree/master/requirejs-project). There is no need to have a continuous rebundling of the project because RequireJS is able to transform the JSX on the fly. The example code here is the options for making the code production ready with `grunt deploy`. Notice the R-Optimizer will actually require the dependencies, run our transformer and inline the code. Then it will "put JSX to sleep" with stubbing and exclusion. Since our build includes all files we will copy the finished product, main.js, to our `dist` folder. Have a look at the configuration:

```javascript

grunt.initConfig({
  requirejs: {
    compile: {
      options: {
      
        // The main file contains our configuration
        mainConfigFile: "./dev/app/main.js",
        baseUrl: "./dev/app",
        preserveLicenseComments: false, // Remove any comments
        
        // JSX plugin will be stubbed  due to our files with JSX are already transformed
        stubModules: ['jsx'], 
        modules: [{
          name: "main",
          
          // We do not need the transformer or the text plugin anymore
          exclude: ["JSXTransformer", "text"] 
        }],
        dir: './build' // Put in build folder
      } 
    }
  },
  copy: {
    main: {
      files: [{
        expand: true,
        flatten: true,
        
        // Copy the main file and the RequireJS lib, the only requirements for production
        src: ['build/main.js', 'dev/libs/requirejs.js'], 
        dest: 'dist/', 
        filter: 'isFile'
      }]
    }
  }
});
```

#### Result
- **Rebundling speed:** Its the fastest one because you do not need to bundle your files
- **A good feel for it:** It does not feel good to download a modified JSXTransformer file. Using .jsx does not feel good either due to RequireJS having a problem using .js
- **JSX transform:** RequireJS transforms JSX content on the fly when the file is required. The deployed bundle has the transformed version included
- **Node support:** You will have to install RequireJS for node and use that specifically for loading the component you want to render to a string
- **Sourcemapping:** There is no need for sourcemapping as RequireJS does not bundle the files together during development

#### Summary
The really good thing about the RequireJS setup is that you do not need to compile your project on every file change. Since RequireJS fetches your files over HTTP and compiles them with the JSX plugin you can safely just add new files, change them and refresh your browser. No waiting for a rebundle of the project.

The not so good here is all the stuff you have to do to get it up and running. It does not feel right that the R-Optimizer has to put all files in the build folder, because you will only use the single bundle file anyways. I could not get the R-Optimizer to handle the bundling straight to a single file and handle the JSX stuff correctly. I could not get the Node `renderComponentToString` working while developing either, due to RequireJS caching the file. So that is only available in production, where the file will not update anyways.

### 2. Browserify
Browserify lets you write your frontend javascript code like you would write Node code. The great thing about this, in the context of React JS, is that React JS runs both on the client and the server. To get up and running with this workflow you need quite a bit actually, but if you take a look at [React JS and a browserify workflow, PART 2](http://christianalfoni.github.io/javascript/2014/10/30/react-js-workflow-part2.html) you can grab an updated boilerplate which also has jasmine testing.

1. Install the following npm modules: gulp, react, browserify, watchify, reactify, vinyl-source-stream, gulp-if, gulp-uglify, node-jsx and gulp-streamify
2. Set up Gulp to handle the bundling and watching of your project
3. Use the React npm module and the node-jsx module on your server to require the main component, render it to a string and combine it with the rest of the html result

You can check out the project structure here: [browserify-project](https://github.com/christianalfoni/react-packaging/tree/master/browserify-project) and here you have a glimpse at the configuration:
```javascript

var runBrowserifyTask = function (options) {
  
  // Create a separate vendor bundler that will only run when starting gulp
  var vendorBundler = browserify({
    debug: true // Sourcemapping
  })
  .require('react'); // Project only depends on react

  // Create the application bundler
  var bundler = browserify({
    debug: true, // Sourcemapping
    
    // watchify requires these options
    cache: {}, packageCache: {}, fullPaths: true
  })
  .require(require.resolve('./dev/app/main.js'), { entry: true })
  .transform(reactify) // Use reactify to transform JSX content

  // Do not bundle react as it will be available in the
  // vendor bundle
  .external('react'); 
  
  // The actual bundling process
  var rebundle = function() {
    var start = Date.now();
    bundler.bundle()
    .pipe(source('main.js'))
    .pipe(gulpif(options.uglify, streamify(uglify())))
    .pipe(gulp.dest(options.dest))
    .pipe(notify(function () {
      console.log('Built in ' + (Date.now() - start) + 'ms');
    }));
  };
  
  // Add watchify
  if (options.watch) {
    bundler = watchify(bundler);
    bundler.on('update', rebundle);
  }

  // Run the vendor bundler
  vendorBundler.bundle()
  .pipe(source('vendors.js'))
  .pipe(streamify(uglify()))
  .pipe(gulp.dest(options.dest));

  return rebundle();

};
```

#### Result
- **Rebundling speed:** Browserify with Watchify is blazingly fast, though you have to configure it correctly or it will be unblazingly slow
- **A good feel for it:** After having lots of bad feelings about rebundle duration, everything went away when it came down to 25ms
- **JSX transform:** Browserify does this in its bundling process
- **Node support:** This is the beauity of it. You just require any component like any other dependency
- **Sourcemapping:** The `debug` option adds sourcemapping for you

#### Summary
Browserify works extremely well with React JS, mostly because you can require any component on your server directly from your client codebase. It might feel strange writing Node syntax in client code, but requirejs syntax actually feels bloated in comparison. You should consider getting used to it.

The big issue with Browserify/Watchify is the lack of documentation on how you should optimize. I have spent hours on hours searching the web, trying to get my rebundling to go below 600ms. The solution was as simple as making a separate bundle for my vendor dependencies and only watching changes on my actual project files. This is done by using "externals". Now it rebundles in 25ms.

### Webpack
Webpack and Browserify have much in common. They both let you write Node syntax in your frontend code. As stated earlier, this is a good thing with React JS. I do not have a lot of experienced with Webpack, but I enjoyed figuring out how to set up a workflow for this post. This is basically what you have to do:

1. Install the following npm modules: grunt, grunt-webpack, node-jsx and react
2. Set up Grunt to run webpack with your options
3. Use React and the node-jsx module on your server to require the main component, render it to a string and combine it with the rest of the html result

You can check out the project structure here: [webpack-project](https://github.com/christianalfoni/react-packaging/tree/master/webpack-project) and this is the configuration for your development and deployment:

```javascript

var webpack = require('webpack');

// We define two entries. One for our application and one for vendors
var entry = { main: './dev/app/main.js', vendors: ['react'] };

// The module options takes loaders, in this case transforming JSX to normal
// javascript
var module = { loaders: [{ test: /\.js$/, loader: 'jsx' }] };
grunt.initConfig({
  webpack: {
    dev: {
      entry: entry,
      
      // The CommonsChunkPlugin creates a file that other bundles can require from
      // based on an entry (vendors) and the output filename
      plugins: [new webpack.optimize.CommonsChunkPlugin("vendors", "vendors.js")],
      watch: true,
      keepalive: true,
      stats: {
        timings: true
      },
      devtool: "#inline-source-map", // Jup, sourcemaps
      output: {
        filename: 'main.js',
        path: './build'
      },
      module: module;
    },
    deploy: {
      entry: entry
      
      // We add a uglify plugin here to uglify our code
      plugins: [
        new webpack.optimize.CommonsChunkPlugin("vendors", "vendors.js"),
        new webpack.optimize.UglifyJsPlugin()
      ],
      output: {
        filename: 'main.js',
        path: './dist'
      },
      module: module
    }
  }
});
```

#### Result
- **Rebundling speed:** Webpack is a little bit slower, at least with my setup. It rebundles in 150ms, where browserify is at 25ms. The reason I believe is that you have to include your vendor dependencies with your general application bundling
- **A good feel for it:** Actually this made me all fuzzy inside
- **JSX transform:** The loaders concept in Webpack handles that, much like Browserify
- **Node support:** Again, just require any component directly from Node
- **Sourcemapping:** The `devtool: "#inline-source-map"` option takes care of that

#### Summary
Webpack is a bit slower, but there is most certainly some way to isolate the vendor bundle and only run your application bundle on file updates. But again, you really do not need to. In my book, 150ms is good enough, and it should not increase as your project size increases due to the caching. The really good thing about Webpack is the small amount of configuration your have to do and there are very few dependencies. I chose Grunt in this case due to Gulp not quite fitting in with its streams. Webpack is just a configuration away and does everything by itself (oink oink).

Webpack works very well and the 150ms tested here is on a 5 year old Macbook Air. Documentation on making it work with React JS is of course lacking, but that is why I am writing this post.

### Duo
Duo is a new packaging tool that makes dependencies a breeze. You do not have to install dependencies with NPM, or download them manually. Do a normal require and add some Duo fairy dust and it works. It is a really awesome concept and I would expect everyone thinks this is going in the right direction. Duo being so new it lacks a lot of examples on how to set it up, but I got it up and running with some trial and error:

1. Install the following npm modules: gulp, uglify-js, duo, duo-watch and react-tools
2. Set up a Gulpfile where you configure Duos bundling process and watching of project changes

You can check out the project structure here: [duo-project](https://github.com/christianalfoni/react-packaging/tree/master/duo-project) and here is some configuration to give you an idea:

```javascript

var root = __dirname + '/dev/app';

// Our main bundling, setting the entry and output (assets),
// and adds our jsx transform
var bundle = function (entry, assets) {
  return duo(root)
  .entry(entry)
  .assets(assets)
  
  // We actually have to define our own jsx plugin,
  // look at it in the repo
  .use(jsx)
};

// Dev task
gulp.task('default', function () {
  bundle('main.js', '../../build')
  
  // Write the file, then start watching
  .write(function () {
    console.log('Ready to work!');
    watcher(root).watch(function(file) {
      var start = Date.now();
      bundle(file, '../../build')
      .development() // sourcemaps
      .write(function(err) {
        err && console.error(err);
        console.log('rebuilt in ' + (Date.now() - start) + 'ms');
      });
    });
  });
});

// Deploy task
gulp.task('deploy', function () {
  bundle('main.js', '../../dist')
  
  // Write the file, then overwrite the file
  // with the minified version
  .write(function () {  
    fs.writeFileSync('./dist/main.js', uglifyjs.minify('dist/main.js').code);
  });
});
```

#### Result
- **Rebundling speed:** Duo seems to be the slowest rebundler. There is a 200 ms difference between "development" and "default" mode, which basically differs on adding sourcemaps. That seems a bit strange, and hopefully it will be optimized at a later point
- **A good feel for it:** I was not able to uglify the bundle during its bundling, but use FileSystem to uglify it after. Did not feel right
- **JSX transform:** I could not get the duo-gulp module to work, so I ended up creating my own Duo plugins for this. It was not a big issue, though gave me some extra work
- **Node support:** This is the biggest problem related to React JS. Since you require dependencies with a Duo format Node does not understand it. You can not require a Duo javascript file into Node
- **Sourcemapping:** Adding `development()` to the stream adds sourcemaps, though if affects rebundle speed heavily

#### Summary
Though Duo is a very exciting project it did not meet the requirements. After my initial testing I believe the biggest problem is how sourcemapping is handled in "development" mode. Going from 30ms to 250ms when rebundling is a huge jump. That said, I might be doing something wrong. But the biggest problem is, in the context of React JS, that you can not require the same files in Node because they use "Duo require format".

Now, I want to state again that Duo JS looks amazing and it is early in development. I just wanted to point out that it does not seem to be ready for a React JS workflow just yet.

> If you try it out, notice that the caching gain is seen from second watch rebundle, not the first one.

### Who wins?
Well, as with everything, it depends. In this case I think it is more important to point out the similarities, than the differences. I will take Duo out of the consideration here as I believe it is not ready for React JS workflow just yet. RequireJS, Browserify and Webpack rebundle in under 200 ms, which should feel instant when switching over to the browser and refreshing. They all support sourcemapping and they transform JSX content like it was nothing. They are all able to require components on the server side too. So I would recommend going for what you feel most comfortable with and have most experience with. That being RequireJS, Browserify or Webpack.

I hope this post cleared the air a bit on how you get going with React JS in your workflow, happy coding!
