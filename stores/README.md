## Store Examples

I wrote this simple CRUD class in ES6 to be used as a dependency-free* data store for a React app. We were not using Redux/Flux for it, or I would not have implemented it from scratch.

Implementers will subclass `LocalStore`, as in `UserStore`. LocalStore works fine by itself, but also assumes there is a RESTful backing store that it will PUT/DELETE/POST to after changes are made locally.

There's also a test file, which would be difficult to run, but hopefully is easily readable.

* It does require `fetch`, but that's included in most modern browsers (notably, not in MobileSafari!)
