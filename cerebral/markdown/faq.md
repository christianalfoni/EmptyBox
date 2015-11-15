# Frequently Asked Questions

### Why is not the debugger working?
Cerebral depends on multiple projects and it is important the you update to the latest version of all of them. NPM can be a bit problematic when changing to a new 0.x.x version, rather than 0.1.x, so please be sure you have the very latest versions.

### How do I handle non-serializable state?
Normally you will only use plain objects, arrays, strings etc., but sometimes you also need to handle files or other non-serializable state. Currently you will need to handle these inside components. For example uploading some files will have to be done inside the component handling it. That said, you can still use signals to notify your application about files being dropped, being uploaded and successfully uploaded.
