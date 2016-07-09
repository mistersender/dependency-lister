'use strict';

// todo: make these options, not arguments
module.exports = function (files, package_json){

  // allows users to pass in other name/value pairs or just their package.json, whichever
  var dependency_names = (function(){
    // convert name/value pairs to array of names
    var parsePackageJSON = function(items) {
      var dependencies = [];
      for(var i in items){
        dependencies.push(i);
      }
      return dependencies;
    }

    // if package_json is an array, assume its an array of names
    if(package_json.length){
      return package_json
    }
    // if package.json is actually package.json, do something with it, otherwise assume it's name/value pairs
    return parsePackageJSON(package_json.dependencies ? package_json.dependencies : package_json)
  })()

  var possible_files = files || []


  return {
    // type = [] or '' (list of file types, like 'css', or ['js'])
    // is_minified = boolean OR undefined (undefined if we don't care if it's minified or not)
    // sort_override = [] or undefined (list of module names for overrides to sort order. if not specified, will fall back to original order)
    get: function (type, is_minified, sort_override) {
      var narrowed_items = [];
      var narrow_by_minified = is_minified === undefined ? false : true;
      var narrow_by_type = type === undefined ? false : true;
      var sort_order = [];
      var items = {};

      function init() {
        // make sure our arguments have been correctly defaulted
        defaultArguments();
        // build out the internal variables we need for this module to work correctly
        build();
        // now make sure we have our files correctly ordered
        sort(sort_order);
        sort(sort_override);

        // actually run the function this module was intended for.
        buildNarrowedPaths();
      }

      function build(){
        var current;
        // build the master sort order and items for use in the rest of the application.
        for(var i in possible_files.files) {
          current = possible_files.files[i];
          sort_order.push(current.name);
          items[current.name] = current.files;
        }
      }

      function check_type(item){
        if(narrow_by_type && (type.indexOf(item.type) === -1)){
          return false;
        }
        return true;
      }

      function check_minified(item){
        if(narrow_by_minified && item.is_minified !== is_minified){
          return false;
        }
        return true;
      }

      function sort(sort_by){
        var item;
        // loop from end to beginning over the sort order,
        // and if found in the list of files sent in,
        // move that file name to the beginning of the list.
        for(var i = sort_by.length - 1; i >= 0; i--){
          var idx = dependency_names.indexOf(sort_by[i]);
          // if the item was passed in, reorder it.
          if(idx > -1){
            // first, save the item passed (and simultaneously remove from the original list)
            item = dependency_names.splice(idx, 1);
            // next, add the item to the *beginning* of the list.
            // Note: because we are looping backwards through the list, this will end up building to
            //   the highest priority being the first in the list.
            dependency_names.splice(0, 0, item[0]);
          }
        }
      }

      function defaultArguments(){
        // make sure optional variables are defined (because es6 is only partially supported currently =( )
        dependency_names = dependency_names === undefined ? '' : dependency_names;
        type = type === undefined ? '' : type;
        sort_override = sort_override === undefined ? [] : sort_override;

        // if single-values were passed for dependency_names or type, convert to array
        if(typeof dependency_names === 'string'){
          dependency_names = [dependency_names];
        }
        if(typeof type === 'string'){
          type = [type];
        }
      }

      function buildNarrowedPaths(){
        for(var i in dependency_names){
          var current = items[dependency_names[i]];
          for(var j in current){
            if(current[j] && check_type(current[j]) && check_minified(current[j])) {
              narrowed_items.push(current[j].location);
            }
          }
        }
      }

      // kick off the module... and subsequently also end the module...
      init();

      return narrowed_items;
    }
  }
}