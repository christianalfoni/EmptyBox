# Being a developer in the cloud
About a year ago I checked out the Chromebook and thought to myself, "Would it not be great to do all my work in the browser?". Google has done fantastic work on their Docs, Spreadsheets, Hangouts etc. services. Spotify has a web player, I can see movies on netflix and just about everything else I do is related to the web and the browser. But what about developing in the browser?

So I got my Chromebook and registered to a service called [nitrous.io](http://www.nitrous.io). Nitrous is a service that allows you to easily setup a development environment in the browser. So what does that actually mean?

## An IDE
You need to type your code somewhere and as frightening as it may seem, you can do this in the browser. You are probably familiar with services like [jsfiddle](), [jsbin]() and the likes. Though the editors works quite well, they can not compare at all to a complete IDE. The nitrous IDE comes very close.

![IDE](/images/nitrous/IDE.png)

As you can see you have your file tree on the left and editor on the right. At the bottom you have your terminal, which I will come back to shortly. There are a few things you have come accostumed to using an IDE. Things like code completion, automatic indenting, syntax highlighting etc. So the nitrous IDE has syntax highlighting in place, with support for ES6 and even JSX works. It also automatically indents your code and fills in brackets as you type. If you are completely dependent on code completion you might be frustrated, as that is lacking. That said, since the nitrous IDE uses web technology it is able to do one amazing thing... collaboration.

### Collaborating
You are probably familiar with Google Docs collaboration. You can invite people to your document and as you are making changes, those changes can be seen live by your collaborators and you can of course see theirs. The nitrous IDE has this exact same functionality. As remote collaboration becomes more common, pair programming is an amazing experience using the nitrous IDE.

*Picture of that*

## The terminal
To develop web applications you need to set up a workflow. Personally I like to run an express server proxying to a webpack dev server. I have a repo for that [here]() here and we will use that as an example in this article. The great thing about nitrous as that you have your own complete linux environment. Especially if you are used to working on a MAC you will feel right at home.

When you set up your nitrous account you will set up a **container**. A container is like a template for your environment. There are many different containers, but the one really interesting for us web developers is the Node container. When the environment is up and running you have everything set up to start using Node and Node Package Manager (npm).

It is also worth mentioning that the terminal is running with a [zsh]() shell. This gives you a lot of neat features like indicating the git branch directly on the command line.

![IDE](/images/nitrous/terminal.png)

## Handling files
Often you need to move some files around or maybe you need to upload some images or fonts from a local folder. In terms of moving files around you can of course use the terminal, but simply by renaming a file you can move it to a different location.

![IDE](/images/nitrous/renaming.png)

To upload a file you simple choose a folder and drop files to the uploader. 

![IDE](/images/nitrous/upload.png)

## Previews
To preview your application as you develop you just fire up a new tab. But before doing so you need to configure the ports. My convention is to run my development server on port 3000.

![IDE](/images/nitrous/ports.png)

When the port is ready for preview you can launch the preview from the toolbar and a new tab opens up.

## Addons

> Linting for keeping code practices