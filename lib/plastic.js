var plastic = exports;

/**
 * Takes a collection of methods and props and associates them with a constructor,
 * allowing {@code becomeType} to use the constructor to make an object of this type.
 *
 * @param {Function} constructor The constructor function that will mark this type
 * @param {Array} named_funcs An array of named functions (i.e. defined with an identifier,
 * such that they have a .name property) to add to every instance of this type.
 * @param {Array} prop_names An array of the names of any instance associated with objects
 * of this type (stored so they can be systematically removed by {@code renounceType}).
 * @param {Object} renamed_funcs Functions are stored as values; keys designate the name 
 * each function will take on instances when objects of this type are instantiated.
 */
plastic.defineType = function(constructor, named_funcs, prop_names, renamed_funcs) {
  var func;
  
  if(!isPlainObject(constructor._typeMethods)) { constructor._typeMethods = {}; }
  if(!isPlainObject(constructor._typeProps))   { constructor._typeProps   = {}; }

  for(var i = 0, len = named_funcs.length; i < len; i++) {
    func = named_funcs[i];

    if(typeof func !== 'function' || !func.name) {
      throw new Error("All provided elements in named_functions must be functions with a name");
    }
    
    constructor._typeMethods[func.name] = func;
  }

  for(var method_name in renamed_funcs) {
    constructor._typeMethods[method_name] = renamed_funcs[method_name];
  }

  for(i=0, len = prop_names.length; i < len; i++) {
    constructor._typeProps[prop_names[i]] = true;
  }
}

/**
 * Turns the provided object (base) into an "instance" of the constructor parasitically,
 * attaching to it all the functions stored on the constructor as being part of its "type". 
 *
 * Also sets base's 'constructor' to the one provided.
 *
 * @param {Object} base The base object to extend.
 * @param {Function} constructor The constructor function of the "type" you want to instantiate.
 * @returns {Object} The modified base.
 */ 
plastic.becomeType = function(base, constructor) {
  var func, methods = constructor._typeMethods;
  
  for(func in methods) {
    base[func] = methods[func];
  }
  
  base.constuctor = constructor;
  return base;
}

/**
 * Checks whether an object is of a given type based on its constructor or
 * whether it has the methods from {@code becomeType}.
 *
 * @param {Object} obj The object to test
 * @param {Function} constructor The constructor representing the type you're checking for
 * @returns {Boolean} Whether {@code obj} is of type {@code constructor}.
 */ 
plastic.isType = function(obj, constructor) {
  if(obj.constructor === constructor) { 
    return true;
  }

  //not as robust as object.keys, but simpler
  for(var method in constructor._typeMethods) {
    if(typeof obj[method] !== "function") {
      return false;
    }
  }

  return true;
}

/**
 * Removes any methods/properties added to the instance by {@code becomeType}
 * and tries to reset the constructor property.
 * @param {Object} obj The object to "de-extend" (i.e. that wants to give up its methods/props).
 * @param {Function} constructor The constructor function whose properties/methods to remove.
 * @param {Function} new_constructor (Optional) What to set the constructor property to; guessed if omitted.
 * @return {Object} The modified object.
 */ 
plastic.renounceType = function(obj, constructor, new_constructor) {
  for(var method in constructor._typeMethods) {
    delete obj[method];
  }

  for(var prop in constructor._typeProps) {
    delete obj[prop];
  }

  obj.constructor = new_constructor ? new_constructor : (isArray(obj) ? Array : Object);
  
  return obj;
}

function isArray(arg) {
  return Object.prototype.toString.call(arg) === "[object Array]";
}

function isPlainObject(arg) {
  return Object.prototype.toString.call(arg) === "[object Object]" && !arg.nodeType;
}
