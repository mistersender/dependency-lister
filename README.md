# Dependency Lister
This node util makes it easy to automate getting the file paths of common dependencies listed in `package.json`. Dependencies are listed in the order you specify, and can be easily filtered by file type and/or if the files are minified or not.

Common use cases:
* inject all js/css/etc assets into a website via a build process
* optimize unminified code for production builds
* Because it is intended to run off of a `package.json` file, when you add a new node package to your project as a dependency, dependency lister picks it up automatically and adds it to the list for building
* Cherry pick pre-built pieces of node packages to use in your own applications, IE: grab a sass file from bootstrap

## Quick Start
```js
const possible_files = require('possibe_files.json')
const pkg = require('package.json')
const dependencyLister = require('dependency-lister')(possible_files, pkg)

// returns all file paths in possible_files.json
dependencyLister.get()
```


## Slow Start
Now that we see how to use `dependencyLister`, let's dive in to some of the level 2 configurations

### Initializing Arguments
Each instance of `dependencyLister` should contain a master list of possible files to pick from (in order), and a list of dependencies our project actually has (in no particular order)

#### `possible_files` object
In order to make this bad boy work, it needs to know some information about any files you may potentially add. This is supplied via an object, which (let's be honest) makes the most sense to put in a json file. The file is structured very simply:

```json
{
  "files": [
    {
      "name": "angular",
      "files": [{
        "type": "js",
        "location": "node_modules/angular/angular.min.js",
        "is_minified": true
      }]
    }
  ]
}
```
The `name` field should match the dependency name in `package.json`

`dependencyLister` uses the `files` array to determine the order files should be listed. Ideally, you would have a master json file shared between projects.

#### `pkg` object
This argument, predictably, accepts a `package.json` object. However, it will also accept:

* a simple name/value pair object, where the `names` will be used to determine what files to load (IE: if you wanted to send in package.json's `devDependencies`, you could send it in and it would still work)
* an array of names that should be loaded, in any order.

```js
const possible_files = require('possibe_files.json')
const pkg = require('package.json')
const dependencyLister = require('dependency-lister')(possible_files, pkg)

// sending name/value pairs is valid
const dependencyLister = require('dependency-lister')(possible_files, {
  test: 'foo',
  something: ''
})

// sending an array of names is also valid
const dependencyLister = require('dependency-lister')(possible_files, ['test', 'something'])
```

### `get` Method & Options
The get method is what actually generates our array of file paths. All arguments in to `get` are `optional`.

```js
const assets = dependencyLister.get([type], [is_minified], [sort_override])
```

#### `type` Option
This argument filters results by a particular file type, as specified in the `possible_files` object.

```js
// get only js assets
const js_assets = dependencyLister.get('js')
```

#### `is_minified` Option
This argument filters results by whether the file is minified or not, as specified in the `possible_files` object.

```js
// get only minified assets
const js_assets = dependencyLister.get('', true)
```

#### `sort_override` Option
This argument allows you to override the sorting of assets on a case-by-case basis. It accepts an array of dependency names; any dependencies not listed will fall below overrides in the order they appear in the `possible_files` object.

```js
// get only minified assets
const js_assets = dependencyLister.get('', null, ['angular', 'lodash'])
```

todo: make these options, not arguments.

