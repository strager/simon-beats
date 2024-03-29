// XXX Lines between comments with @{{{ and @}}} are removed when building

//@{{{
(function () {
//@}}}

    //@{{{

    // Logging support
    var LOGGING = false;

    // Aliases support
    var ENABLE_ALIASES = true;

    // Packages support
    var ENABLE_PACKAGES = true;

    // Web browser support
    var ENABLE_BROWSER = true;

    // Web browser should make synchronous requests
    var BROWSER_SYNC = true;

    // Node.JS support
    var ENABLE_NODEJS = true;

    // Spaceport support
    var ENABLE_SPACEPORT = true;

    // CommonJS compatibility
    var COMMONJS_COMPAT = true;

    //@}}}

    // Utility functions {{{
    var hasOwnProperty = ({ }).hasOwnProperty;
    var toString = ({ }).toString;

    // For minification
    var dot = '.';
    var dotdot = '..';

    function hasOwn(obj, name) {
        return obj && hasOwnProperty.call(obj, name);
    }

    function isArray(x) {
        return toString.call(x) === '[object Array]';
    }

    function isPlainOldObject(x) {
        return toString.call(x) === '[object Object]';
    }

    function map(array, fn, context) {
        // TODO Fallback if Function.prototype.map is missing
        return array.map(fn, context);
    }

    var forEach = map;

    function extend(base, extension) {
        var key;

        for (key in extension) {
            if (hasOwn(extension, key)) {
                base[key] = extension[key];
            }
        }

        return base;
    }

    function clone(object, extension) {
        return extend(extend({ }, object), extension || { });
    }
    // Utility functions }}}

    // Path functions {{{
    function stringToPath(parts) {
        parts = isArray(parts) ? parts : [ parts ];

        var splitParts = [ ];
        var i;

        for (i = 0; i < parts.length; ++i) {
            splitParts = splitParts.concat(parts[i].split(/\//g));
        }

        return splitParts;
    }

    function pathToString(path) {
        var s = path
            .join('/')
            .replace(/\/+/g, '/');

        if (path.length === 0 && path[0] === '') {
            s = '/' + s;
        }

        return s;
    }

    function normalizePath(path) {
        var newPath = [ ];
        var i;

        for (i = 0; i < path.length; ++i) {
            if (!path[i]) {
                // Root
                newPath = [ '' ];
            } else if (path[i] === dotdot) {
                // Go back
                if (!newPath.length) {
                    newPath = [ dotdot ];
                } else if (newPath.length === 1) {
                    if (newPath[0] === dot || !newPath[0]) {
                        newPath = [ dotdot ];
                    } else {
                        newPath.pop();
                    }
                } else {
                    newPath.pop();
                }
            } else if (path[i] === dot) {
                // Go here
                if (!newPath.length) {
                    newPath = [ dot ];
                }
            } else {
                // Everything else
                newPath.push(path[i]);
            }
        }

        return newPath;
    }

    function resolveUrl(cwd, baseUrl, path) {
        var cwdPath = normalizePath(stringToPath(cwd));
        var basePath = normalizePath(stringToPath(baseUrl || dot));
        var npath = normalizePath(stringToPath(path));

        if (npath[0] === dotdot || npath[0] === dot) {
            // Relative paths are based on cwd
            return pathToString(normalizePath(cwdPath.concat(npath)));
        } else if (npath[0] === '') {
            // Absolute path stays absolute
            return pathToString(npath);
        } else {
            // Implicit relative paths are based on baseUrl
            return pathToString(basePath.concat(npath));
        }
    }

    function resolveCwd(baseUrl, cwd) {
        var basePath = normalizePath(stringToPath(baseUrl || dot));
        var npath = normalizePath(stringToPath(cwd));

        if (npath[0] === dotdot || npath[0] === dot) {
            // Relative paths are absolute
            return pathToString(npath);
        } else if (npath[0] === '') {
            // Absolute path stays absolute
            return pathToString(npath);
        } else {
            // Implicit relative paths are based on baseUrl
            return pathToString(basePath.concat(npath));
        }
    }

    function dirname(url) {
        var path = stringToPath(url);
        path = path.slice(0, path.length - 1);
        return pathToString(path);
    }
    // Path functions }}}

    // Argument extraction functions {{{
    function defArgs(name, config, deps, callback) {
        if (typeof name !== 'string') {
            // Name omitted
            callback = deps;
            deps = config;
            config = name;
            name = null;
        }

        if (!isPlainOldObject(config)) {
            // Config omitted
            callback = deps;
            deps = config;
            config = { };
        }

        if (!isArray(deps)) {
            // Dependencies omitted
            callback = deps;
            deps = [ ];
        }

        return {
            name: name,
            config: config,
            deps: deps,
            callback: callback
        };
    }

    function reqArgs(config, deps, callback) {
        // TODO require(string)
        if (typeof config === 'string') {
            throw new Error('Not supported');
        }

        if (!isPlainOldObject(config)) {
            // Config omitted
            callback = deps;
            deps = config;
            config = { };
        }

        if (!isArray(deps)) {
            // Dependencies omitted
            callback = deps;
            deps = [ ];
        }

        return {
            config: config,
            deps: deps,
            callback: callback
        };
    }
    // Argument extraction functions }}}

    function getScriptName(moduleName, config) {
        if (ENABLE_ALIASES) {
            if (hasOwn(config._aliases, moduleName)) {
                return config._aliases[moduleName];
            }
        }

        var scriptName = resolveUrl(config.cwd, config.baseUrl, moduleName);
        scriptName = scriptName + (/\.js$/i.test(scriptName) ? '' : '.js');
        return scriptName;
    }

    function mergeConfigInto(base, augmentation) {
        // The order of these checks are important, because changes cascade

        if (hasOwn(augmentation, 'baseUrl')) {
            base.baseUrl = resolveUrl(base.cwd, base.baseUrl, augmentation.baseUrl);
        }

        if (hasOwn(augmentation, 'cwd')) {
            base.cwd = augmentation.cwd;
            //base.cwd = resolveCwd(base.baseUrl, augmentation.cwd);
        }

        if (ENABLE_ALIASES) {
            if (hasOwn(base, '_aliases')) {
                base._aliases = clone(base._aliases);
            } else {
                base._aliases = { };
            }

            if (hasOwn(augmentation, '_aliases')) {
                extend(base._aliases, augmentation._aliases);
            }

            if (hasOwn(augmentation, 'aliases')) {
                var aliasName;
                for (aliasName in augmentation.aliases) {
                    if (!hasOwn(augmentation.aliases, aliasName)) {
                        continue;
                    }

                    var aliasTarget = augmentation.aliases[aliasName];

                    // Aliases are stored as their full script name
                    base._aliases[aliasName] = getScriptName(aliasTarget, base);
                }
            }
        }

        if (ENABLE_PACKAGES) {
            if (hasOwn(base, '_packageOwners')) {
                base._packageOwners = clone(base._packageOwners);
            } else {
                base._packageOwners = { };
            }

            if (hasOwn(augmentation, '_packageOwners')) {
                extend(base._packageOwners, augmentation._packageOwners);
            }

            if (hasOwn(augmentation, 'packages')) {
                var packageName;
                for (packageName in augmentation.packages) {
                    if (!hasOwn(augmentation.packages, packageName)) {
                        continue;
                    }

                    var packageOwner = getScriptName(packageName, base);
                    forEach(augmentation.packages[packageName], function (moduleName) {
                        base._packageOwners[getScriptName(moduleName, base)] = packageOwner;
                    });
                }
            }
        }
    }

    function mergeConfigs(first, second) {
        var base = clone(first);
        mergeConfigInto(base, second);
        return base;
    }

    // requestedScripts :: Map String Bool
    var requestedScripts = { };

    // requestingScriptCount :: Int
    var requestingScriptCount = 0;

    // We have two queues here.
    //
    // The script complete queue is built up while executing scripts.  A define
    // call adds to this queue.  The queue is flushed when the script completes
    // execution.  This allows us to determine which script was executed
    // exactly for asynchronous loads.
    //
    // A load callback queue is built up after a define call knows its complete
    // name configuration.  It is executed when that defined module is
    // requested.  This allows for lazy loading of defiend modules, and also
    // allows for asynchronous module definitions.  There is a mapping of
    // script name to load callback queue, thus this queue is a hash and not an
    // array.

    // scriptCompleteQueue :: [Maybe Error -> Configuration -> IO ()]
    var scriptCompleteQueue = [ ];

    // loadCallbackQueues :: Map String [IO ()]
    var loadCallbackQueues = { };

    // The push-pull mechanism decouples requesters of a module from definers
    // of a module.  When a module is defined, it is "pushed"; when a module is
    // requested, it is "pulled".  If a pull is made on an already-pushed
    // module name, the pull callback is executed immediately.  Else, the pull
    // callback is executed immediately when the appropriate push is made.

    // pushed :: Map String a
    var pushed = { };

    // pulling :: Map String [Maybe Error -> a -> IO ()]
    var pulling = { };

    // defining :: Map String Boolean
    // (Used for circular dependency checking)
    var defining = { };

    function checkPullForLoadCallback(scriptName) {
        if (hasOwn(pulling, scriptName) && hasOwn(loadCallbackQueues, scriptName)) {
            var callbacks = loadCallbackQueues[scriptName];
            delete loadCallbackQueues[scriptName];

            forEach(callbacks, function (callback) {
                callback();
            });
        }
    }

    function checkPullForPush(scriptName, value) {
        if (hasOwn(pulling, scriptName) && hasOwn(pushed, scriptName)) {
            var callbacks = pulling[scriptName];
            delete pulling[scriptName];

            forEach(callbacks, function (callback) {
                callback(null, pushed[scriptName]);
            });
        }
    }

    function enqueueLoadCallback(scriptName, callback) {
        if (hasOwn(loadCallbackQueues, scriptName)) {
            loadCallbackQueues[scriptName].push(callback);
        } else {
            loadCallbackQueues[scriptName] = [ callback ];
        }

        checkPullForLoadCallback(scriptName);
    }

    function enqueueScriptCompleteCallback(callback) {
        if (requestingScriptCount > 0) {
            scriptCompleteQueue.push(callback);
        } else {
            callback(null, { });
        }
    }

    function push(scriptName, value) {
        if (hasOwn(pushed, scriptName)) {
            throw new Error('Should not push value for ' + scriptName + ' again');
        }

        pushed[scriptName] = value;

        checkPullForPush(scriptName);
    }

    function pull(scriptName, callback) {
        if (hasOwn(pulling, scriptName)) {
            pulling[scriptName].push(callback);
        } else {
            pulling[scriptName] = [ callback ];
        }

        checkPullForLoadCallback(scriptName);
        checkPullForPush(scriptName);
    }

    function needsRequest(scriptName) {
        return !hasOwn(requestedScripts, scriptName) && !hasOwn(pushed, scriptName) && !hasOwn(loadCallbackQueues, scriptName);
    }

    // Entry points {{{
    function create(configuration) {
        var context = extend({
            'require': req,
            'define': def,
            'reconfigure': reconfigure,
            'userCallback': defaultUserCallback
        }, configuration);

        var baseConfig = {
            cwd: '.',
            baseUrl: '.'
        };

        context.configuration = configuration;
        req.config = config;
        req.debug = debug;

        return context;

        function config(config) {
            mergeConfigInto(baseConfig, config);
        }

        function defaultUserCallback(scriptName, data, moduleValues, moduleScripts, moduleNames, callback) {
            if (LOGGING) {
                console.log('Executing', scriptName);
            }

            var moduleValue;
            if (typeof data === 'function') {
                if (COMMONJS_COMPAT && data.length === 3 && moduleNames.length === 0) {
                    moduleValues = [
                        // require
                        function () {
                            throw new Error('Not supported');
                        },

                        // exports
                        { },

                        // module
                        { } // TODO
                    ];
                }

                moduleValue = data.apply(null, moduleValues);

                if (COMMONJS_COMPAT && data.length === 3 && moduleNames.length === 0) {
                    if (typeof moduleValue === 'undefined') {
                        moduleValue = moduleValues[1]; // exports
                    }
                }
            } else {
                moduleValue = data;
            }

            callback(null, moduleValue);
        }

        function reconfigure(configuration) {
            extend(context, configuration);
        }

        function getRequestScriptName(scriptName, config) {
            if (ENABLE_PACKAGES) {
                if (hasOwn(config._packageOwners, scriptName)) {
                    return config._packageOwners[scriptName];
                }
            }

            return scriptName;
        }

        function request(scriptName, config, callback) {
            if (!needsRequest(scriptName)) {
                throw new Error('Should not request ' + scriptName + ' again');
            }

            if (LOGGING) {
                console.log('Requesting script ' + scriptName);
            }

            requestedScripts[scriptName] = true;
            ++requestingScriptCount;

            function done(err) {
                --requestingScriptCount;

                var scriptCompleteCallbacks = scriptCompleteQueue;
                scriptCompleteQueue = [ ];

                if (!err) {
                    if (scriptCompleteCallbacks.length === 0) {
                        console.warn('Possibly missing define for script ' + scriptName);
                    }
                }

                callback(err, scriptCompleteCallbacks);
            }

            // Try a sync load first
            if (context.loadScriptSync && context.loadScriptSync(scriptName, config)) {
                done(null);
            } else if (context.loadScriptAsync) {
                context.loadScriptAsync(scriptName, done, config);
            } else {
                done(new Error('Failed to load script'));
            }
        }

        function requestAndPullMany(scriptNames, config, callback) {
            var loaded = [ ];
            var values = [ ];
            var i;
            var called = false;

            function checkValues() {
                if (called) return;

                var i;

                for (i = 0; i < scriptNames.length; ++i) {
                    if (!loaded[i]) return;
                }

                called = true;
                callback(null, values, scriptNames);
            }

            forEach(scriptNames, function (scriptName, i) {
                if (hasOwn(defining, scriptName)) {
                    // TODO
                    //throw new Error('Circular dependency detected (involving ' + scriptName + ')');
                }

                var requestScriptName = getRequestScriptName(scriptName, config);

                if (needsRequest(requestScriptName)) {
                    request(requestScriptName, config, function (err, callbacks) {
                        var neoConfig = mergeConfigs(config, { });
                        neoConfig.cwd = dirname(requestScriptName);
                        neoConfig.scriptName = scriptName;

                        forEach(callbacks, function (callback) {
                            callback(err, neoConfig);
                        });

                        if (err) throw err;
                    });
                }

                pull(scriptName, function (err, value) {
                    if (err) throw err;

                    loaded[i] = true;
                    values[i] = value;
                    checkValues();
                });
            });

            // In case we have no scripts to load
            checkValues();
        }

        function req() {
            // TODO require(string)

            var args = reqArgs.apply(null, arguments);
            var config = args.config;
            var deps = args.deps;
            var callback = args.callback;

            if (LOGGING) {
                console.log('Requiring [ ' + (deps || [ ]).join(', ') + ' ]');
            }

            var effectiveConfig = mergeConfigs(baseConfig, config);

            enqueueScriptCompleteCallback(function (err, config) {
                if (err) throw err;

                mergeConfigInto(effectiveConfig, config);

                var scriptNames = map(deps, function (dep) {
                    return getScriptName(dep, effectiveConfig);
                });

                requestAndPullMany(scriptNames, effectiveConfig, function (err, values) {
                    if (err) throw err;

                    context.userCallback(null, callback, values, scriptNames, deps.slice(), function (err, value) {
                        if (err) throw err;

                        // Ignore value
                    });
                });
            });
        }

        function def() {
            var args = defArgs.apply(null, arguments);
            var name = args.name;
            var config = args.config;
            var deps = args.deps;
            var callback = args.callback;

            if (LOGGING) {
                console.log('Defining ' + (name || 'unnamed package') + ' with dependencies [ ' + (deps || [ ]).join(', ') + ' ]');
            }

            var effectiveConfig = mergeConfigs(baseConfig, config);

            enqueueScriptCompleteCallback(function (err, config) {
                if (err) throw err;

                var oldEffectiveConfig = clone(effectiveConfig);

                // Script name resolution should occur *before* merging config into
                // effectiveConfig
                mergeConfigInto(effectiveConfig, config);

                var scriptName;
                if (name) {
                    scriptName = getScriptName(name, effectiveConfig);
                } else {
                    scriptName = config.scriptName;
                }

                enqueueLoadCallback(scriptName, function () {
                    var scriptNames = map(deps, function (dep) {
                        return getScriptName(dep, effectiveConfig);
                    });

                    defining[scriptName] = true;

                    requestAndPullMany(scriptNames, effectiveConfig, function (err, values) {
                        delete defining[scriptName];

                        if (err) throw err;

                        context.userCallback(scriptName, callback, values, scriptNames, deps.slice(), function (err, value) {
                            if (err) throw err;

                            push(scriptName, value);
                        });
                    });
                });
            });
        }

        function debug() {
            console.log('Pulling:', pulling);
        }
    }
    // Entry points }}}

    (function () {
        var un;

        if (ENABLE_SPACEPORT && typeof loadScript === 'function') {
            // Must be first, because Spaceport has the window object, too.
            un = create({
                'loadScriptAsync': function (scriptName, callback) {
                    loadScript(scriptName, function () {
                        callback(null);
                    });
                },
                'loadScriptSync': function (scriptName) {
                    return false;
                }
            });

            // Set globals
            require = un['require'];
            define = un['define'];
        } else if (ENABLE_BROWSER && typeof window !== 'undefined') {
            var goodResponseCodes = [ 200, 204, 206, 301, 302, 303, 304, 307 ];
            var doc = window.document;

            var onreadystatechange = 'onreadystatechange';
            var onload = 'onload';
            var onerror = 'onerror';

            function isCleanPath(scriptName) {
                // If the path is "back" too much, it's not clean.
                var x = stringToPath(dirname(window.location.pathname))
                    .concat(stringToPath(scriptName));
                x = normalizePath(x);
                return x[0] !== '..';
            }

            un = create({
                'loadScriptAsync': function loadScriptAsync(scriptName, callback) {
                    if (!isCleanPath(scriptName)) {
                        setTimeout(function () {
                            callback(new Error('Path ' + scriptName + ' is not clean'));
                        }, 0);
                        return;
                    }

                    var script = doc.createElement('script');
                    script.async = true;

                    // Modelled after jQuery (src/ajax/script.js)
                    script[onload] = script[onreadystatechange] = function () {
                        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                            // Remove from DOM
                            var parent = script.parentNode;
                            if (parent) {
                                parent.removeChild(script);
                            }

                            // IE likes memleaks
                            script[onload] = script[onreadystatechange] = script[onerror] = null;
                            script = null;

                            callback(null);
                        }
                    };

                    script[onerror] = function () {
                        callback(new Error());
                    };

                    // Remember: we need to attach event handlers before
                    // assigning `src`.  Events may be fired as soon as we set
                    // `src`.
                    script.src = scriptName;

                    doc['head'].appendChild(script);
                },
                'loadScriptSync': function loadScriptSync(scriptName) {
                    if (!BROWSER_SYNC) {
                        return false;
                    }

                    if (!isCleanPath(scriptName)) {
                        return false;
                    }

                    var scriptSource;

                    try {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', scriptName, false);
                        xhr.send(null);

                        if (goodResponseCodes.indexOf(xhr.status) < 0) {
                            return false;
                        }

                        scriptSource = xhr.responseText;
                        scriptSource += '\n\n//*/\n//@ sourceURL=' + scriptName;
                    } catch (e) {
                        return false;
                    }

                    // Don't wrap user code in try/catch
                    eval(scriptSource);

                    return true;
                }
            });

            window['require'] = un['require'];
            window['define'] = un['define'];
        } else if (ENABLE_NODEJS && typeof module !== 'undefined') {
            un = module.exports = create({
                'context': { },
                'loadScriptAsync': function loadScriptAsync(scriptName, callback) {
                    callback(new Error('Error loading module ' + scriptName + ': not supported'));
                },
                'loadScriptSync': function (scriptName) {
                    // require here is the Node.JS-provided require

                    var code;
                    try {
                        code = require('fs')['readFileSync'](scriptName);
                    } catch (e) {
                        // TODO Detect file-not-found errors only
                        return false;
                    }

                    require('vm')['runInNewContext'](code, un['context'] || { }, scriptName);

                    return true;
                }
            });
        } else {
            throw new Error('Unsupported environment');
        }
    }());

//@{{{
}());
//@}}}
