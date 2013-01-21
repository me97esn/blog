(function() {
  var _Batman;

  Batman._Batman = _Batman = (function() {

    function _Batman(object) {
      this.object = object;
    }

    _Batman.prototype.check = function(object) {
      if (object !== this.object) {
        object._batman = new Batman._Batman(object);
        return false;
      }
      return true;
    };

    _Batman.prototype.get = function(key) {
      var reduction, results;
      results = this.getAll(key);
      switch (results.length) {
        case 0:
          return void 0;
        case 1:
          return results[0];
        default:
          reduction = results[0].concat != null ? function(a, b) {
            return a.concat(b);
          } : results[0].merge != null ? function(a, b) {
            return a.merge(b);
          } : results.every(function(x) {
            return typeof x === 'object';
          }) ? (results.unshift({}), function(a, b) {
            return Batman.extend(a, b);
          }) : void 0;
          if (reduction) {
            return results.reduceRight(reduction);
          } else {
            return results;
          }
      }
    };

    _Batman.prototype.getFirst = function(key) {
      var results;
      results = this.getAll(key);
      return results[0];
    };

    _Batman.prototype.getAll = function(keyOrGetter) {
      var getter, results, val;
      if (typeof keyOrGetter === 'function') {
        getter = keyOrGetter;
      } else {
        getter = function(ancestor) {
          var _ref;
          return (_ref = ancestor._batman) != null ? _ref[keyOrGetter] : void 0;
        };
      }
      results = this.ancestors(getter);
      if (val = getter(this.object)) {
        results.unshift(val);
      }
      return results;
    };

    _Batman.prototype.ancestors = function(getter) {
      var ancestor, results, val, _i, _len, _ref;
      this._allAncestors || (this._allAncestors = this.allAncestors());
      if (getter) {
        results = [];
        _ref = this._allAncestors;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ancestor = _ref[_i];
          val = getter(ancestor);
          if (val != null) {
            results.push(val);
          }
        }
        return results;
      } else {
        return this._allAncestors;
      }
    };

    _Batman.prototype.allAncestors = function() {
      var isClass, parent, proto, results, _ref, _ref1;
      results = [];
      isClass = !!this.object.prototype;
      parent = isClass ? (_ref = this.object.__super__) != null ? _ref.constructor : void 0 : (proto = Object.getPrototypeOf(this.object)) === this.object ? this.object.constructor.__super__ : proto;
      if (parent != null) {
        if ((_ref1 = parent._batman) != null) {
          _ref1.check(parent);
        }
        results.push(parent);
        if (parent._batman != null) {
          results = results.concat(parent._batman.allAncestors());
        }
      }
      return results;
    };

    _Batman.prototype.set = function(key, value) {
      return this[key] = value;
    };

    return _Batman;

  })();

}).call(this);

(function() {

  Batman.Event = (function() {

    Event.forBaseAndKey = function(base, key) {
      if (base.isEventEmitter) {
        return base.event(key);
      } else {
        return new Batman.Event(base, key);
      }
    };

    function Event(base, key) {
      this.base = base;
      this.key = key;
      this._preventCount = 0;
    }

    Event.prototype.isEvent = true;

    Event.prototype.isEqual = function(other) {
      return this.constructor === other.constructor && this.base === other.base && this.key === other.key;
    };

    Event.prototype.hashKey = function() {
      var key;
      this.hashKey = function() {
        return key;
      };
      return key = "<Batman.Event base: " + (Batman.Hash.prototype.hashKeyFor(this.base)) + ", key: \"" + (Batman.Hash.prototype.hashKeyFor(this.key)) + "\">";
    };

    Event.prototype.addHandler = function(handler) {
      this.handlers || (this.handlers = []);
      if (this.handlers.indexOf(handler) === -1) {
        this.handlers.push(handler);
      }
      if (this.oneShot) {
        this.autofireHandler(handler);
      }
      return this;
    };

    Event.prototype.removeHandler = function(handler) {
      var index;
      if (this.handlers && (index = this.handlers.indexOf(handler)) !== -1) {
        this.handlers.splice(index, 1);
      }
      return this;
    };

    Event.prototype.eachHandler = function(iterator) {
      var ancestor, key, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _results;
      if ((_ref = this.handlers) != null) {
        _ref.slice().forEach(iterator);
      }
      if ((_ref1 = this.base) != null ? _ref1.isEventEmitter : void 0) {
        key = this.key;
        _ref3 = (_ref2 = this.base._batman) != null ? _ref2.ancestors() : void 0;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          ancestor = _ref3[_i];
          if (ancestor.isEventEmitter && ((_ref4 = ancestor._batman) != null ? (_ref5 = _ref4.events) != null ? _ref5.hasOwnProperty(key) : void 0 : void 0)) {
            _results.push((_ref6 = ancestor.event(key, false)) != null ? (_ref7 = _ref6.handlers) != null ? _ref7.slice().forEach(iterator) : void 0 : void 0);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    Event.prototype.clearHandlers = function() {
      return this.handlers = void 0;
    };

    Event.prototype.handlerContext = function() {
      return this.base;
    };

    Event.prototype.prevent = function() {
      return ++this._preventCount;
    };

    Event.prototype.allow = function() {
      if (this._preventCount) {
        --this._preventCount;
      }
      return this._preventCount;
    };

    Event.prototype.isPrevented = function() {
      return this._preventCount > 0;
    };

    Event.prototype.autofireHandler = function(handler) {
      if (this._oneShotFired && (this._oneShotArgs != null)) {
        return handler.apply(this.handlerContext(), this._oneShotArgs);
      }
    };

    Event.prototype.resetOneShot = function() {
      this._oneShotFired = false;
      return this._oneShotArgs = null;
    };

    Event.prototype.fire = function() {
      return this.fireWithContext(this.handlerContext(), arguments);
    };

    Event.prototype.fireWithContext = function(context, args) {
      if (this.isPrevented() || this._oneShotFired) {
        return false;
      }
      if (this.oneShot) {
        this._oneShotFired = true;
        this._oneShotArgs = args;
      }
      return this.eachHandler(function(handler) {
        return handler.apply(context, args);
      });
    };

    Event.prototype.allowAndFire = function() {
      return this.allowAndFireWithContext(this.handlerContext, arguments);
    };

    Event.prototype.allowAndFireWithContext = function(context, args) {
      this.allow();
      return this.fireWithContext(context, args);
    };

    return Event;

  })();

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Batman.PropertyEvent = (function(_super) {

    __extends(PropertyEvent, _super);

    function PropertyEvent() {
      return PropertyEvent.__super__.constructor.apply(this, arguments);
    }

    PropertyEvent.prototype.eachHandler = function(iterator) {
      return this.base.eachObserver(iterator);
    };

    PropertyEvent.prototype.handlerContext = function() {
      return this.base.base;
    };

    return PropertyEvent;

  })(Batman.Event);

}).call(this);

(function() {
  var __slice = [].slice;

  Batman.EventEmitter = {
    isEventEmitter: true,
    hasEvent: function(key) {
      var _ref, _ref1;
      return (_ref = this._batman) != null ? typeof _ref.get === "function" ? (_ref1 = _ref.get('events')) != null ? _ref1.hasOwnProperty(key) : void 0 : void 0 : void 0;
    },
    event: function(key, createEvent) {
      var ancestor, eventClass, events, existingEvent, newEvent, _base, _i, _len, _ref, _ref1, _ref2, _ref3;
      if (createEvent == null) {
        createEvent = true;
      }
      Batman.initializeObject(this);
      eventClass = this.eventClass || Batman.Event;
      if ((_ref = this._batman.events) != null ? _ref.hasOwnProperty(key) : void 0) {
        return existingEvent = this._batman.events[key];
      } else {
        _ref1 = this._batman.ancestors();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          ancestor = _ref1[_i];
          existingEvent = (_ref2 = ancestor._batman) != null ? (_ref3 = _ref2.events) != null ? _ref3[key] : void 0 : void 0;
          if (existingEvent) {
            break;
          }
        }
        if (createEvent || (existingEvent != null ? existingEvent.oneShot : void 0)) {
          events = (_base = this._batman).events || (_base.events = {});
          newEvent = events[key] = new eventClass(this, key);
          newEvent.oneShot = existingEvent != null ? existingEvent.oneShot : void 0;
          return newEvent;
        } else {
          return existingEvent;
        }
      }
    },
    on: function() {
      var handler, key, keys, _i, _j, _len, _results;
      keys = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), handler = arguments[_i++];
      _results = [];
      for (_j = 0, _len = keys.length; _j < _len; _j++) {
        key = keys[_j];
        _results.push(this.event(key).addHandler(handler));
      }
      return _results;
    },
    once: function(key, handler) {
      var event, handlerWrapper;
      event = this.event(key);
      handlerWrapper = function() {
        handler.apply(this, arguments);
        return event.removeHandler(handlerWrapper);
      };
      return event.addHandler(handlerWrapper);
    },
    registerAsMutableSource: function() {
      return Batman.Property.registerSource(this);
    },
    mutation: function(wrappedFunction) {
      return function() {
        var result, _ref;
        result = wrappedFunction.apply(this, arguments);
        if ((_ref = this.event('change', false)) != null) {
          _ref.fire(this, this);
        }
        return result;
      };
    },
    prevent: function(key) {
      this.event(key).prevent();
      return this;
    },
    allow: function(key) {
      this.event(key).allow();
      return this;
    },
    isPrevented: function(key) {
      var _ref;
      return (_ref = this.event(key, false)) != null ? _ref.isPrevented() : void 0;
    },
    fire: function() {
      var args, key, _ref;
      key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return (_ref = this.event(key, false)) != null ? _ref.fireWithContext(this, args) : void 0;
    },
    allowAndFire: function() {
      var args, key, _ref;
      key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return (_ref = this.event(key, false)) != null ? _ref.allowAndFireWithContext(this, args) : void 0;
    }
  };

}).call(this);

(function() {
  var __slice = [].slice;

  Batman.Enumerable = {
    isEnumerable: true,
    map: function(f, ctx) {
      var r;
      if (ctx == null) {
        ctx = Batman.container;
      }
      r = [];
      this.forEach(function() {
        return r.push(f.apply(ctx, arguments));
      });
      return r;
    },
    mapToProperty: function(key) {
      var r;
      r = [];
      this.forEach(function(item) {
        return r.push(item.get(key));
      });
      return r;
    },
    every: function(f, ctx) {
      var r;
      if (ctx == null) {
        ctx = Batman.container;
      }
      r = true;
      this.forEach(function() {
        return r = r && f.apply(ctx, arguments);
      });
      return r;
    },
    some: function(f, ctx) {
      var r;
      if (ctx == null) {
        ctx = Batman.container;
      }
      r = false;
      this.forEach(function() {
        return r = r || f.apply(ctx, arguments);
      });
      return r;
    },
    reduce: function(f, r) {
      var count, self;
      count = 0;
      self = this;
      this.forEach(function() {
        if (r != null) {
          return r = f.apply(null, [r].concat(__slice.call(arguments), [count], [self]));
        } else {
          return r = arguments[0];
        }
      });
      return r;
    },
    filter: function(f) {
      var r, wrap;
      r = new this.constructor;
      if (r.add) {
        wrap = function(r, e) {
          if (f(e)) {
            r.add(e);
          }
          return r;
        };
      } else if (r.set) {
        wrap = function(r, k, v) {
          if (f(k, v)) {
            r.set(k, v);
          }
          return r;
        };
      } else {
        if (!r.push) {
          r = [];
        }
        wrap = function(r, e) {
          if (f(e)) {
            r.push(e);
          }
          return r;
        };
      }
      return this.reduce(wrap, r);
    },
    inGroupsOf: function(n) {
      var current, i, r;
      r = [];
      current = false;
      i = 0;
      this.forEach(function(x) {
        if (i++ % n === 0) {
          current = [];
          r.push(current);
        }
        return current.push(x);
      });
      return r;
    }
  };

}).call(this);

(function() {
  var __slice = [].slice;

  Batman.SimpleHash = (function() {

    function SimpleHash(obj) {
      this._storage = {};
      this.length = 0;
      if (obj != null) {
        this.update(obj);
      }
    }

    Batman.extend(SimpleHash.prototype, Batman.Enumerable);

    SimpleHash.prototype.propertyClass = Batman.Property;

    SimpleHash.prototype.hasKey = function(key) {
      var pair, pairs, _i, _len;
      if (this.objectKey(key)) {
        if (!this._objectStorage) {
          return false;
        }
        if (pairs = this._objectStorage[this.hashKeyFor(key)]) {
          for (_i = 0, _len = pairs.length; _i < _len; _i++) {
            pair = pairs[_i];
            if (this.equality(pair[0], key)) {
              return true;
            }
          }
        }
        return false;
      } else {
        key = this.prefixedKey(key);
        return this._storage.hasOwnProperty(key);
      }
    };

    SimpleHash.prototype.get = function(key) {
      var pair, pairs, _i, _len;
      if (this.objectKey(key)) {
        if (!this._objectStorage) {
          return void 0;
        }
        if (pairs = this._objectStorage[this.hashKeyFor(key)]) {
          for (_i = 0, _len = pairs.length; _i < _len; _i++) {
            pair = pairs[_i];
            if (this.equality(pair[0], key)) {
              return pair[1];
            }
          }
        }
      } else {
        return this._storage[this.prefixedKey(key)];
      }
    };

    SimpleHash.prototype.set = function(key, val) {
      var pair, pairs, _base, _i, _len, _name;
      if (this.objectKey(key)) {
        this._objectStorage || (this._objectStorage = {});
        pairs = (_base = this._objectStorage)[_name = this.hashKeyFor(key)] || (_base[_name] = []);
        for (_i = 0, _len = pairs.length; _i < _len; _i++) {
          pair = pairs[_i];
          if (this.equality(pair[0], key)) {
            return pair[1] = val;
          }
        }
        this.length++;
        pairs.push([key, val]);
        return val;
      } else {
        key = this.prefixedKey(key);
        if (this._storage[key] == null) {
          this.length++;
        }
        return this._storage[key] = val;
      }
    };

    SimpleHash.prototype.unset = function(key) {
      var hashKey, index, obj, pair, pairs, val, value, _i, _len, _ref;
      if (this.objectKey(key)) {
        if (!this._objectStorage) {
          return void 0;
        }
        hashKey = this.hashKeyFor(key);
        if (pairs = this._objectStorage[hashKey]) {
          for (index = _i = 0, _len = pairs.length; _i < _len; index = ++_i) {
            _ref = pairs[index], obj = _ref[0], value = _ref[1];
            if (this.equality(obj, key)) {
              pair = pairs.splice(index, 1);
              if (!pairs.length) {
                delete this._objectStorage[hashKey];
              }
              this.length--;
              return pair[0][1];
            }
          }
        }
      } else {
        key = this.prefixedKey(key);
        val = this._storage[key];
        if (this._storage[key] != null) {
          this.length--;
          delete this._storage[key];
        }
        return val;
      }
    };

    SimpleHash.prototype.getOrSet = function(key, valueFunction) {
      var currentValue;
      currentValue = this.get(key);
      if (!currentValue) {
        currentValue = valueFunction();
        this.set(key, currentValue);
      }
      return currentValue;
    };

    SimpleHash.prototype.prefixedKey = function(key) {
      return "_" + key;
    };

    SimpleHash.prototype.unprefixedKey = function(key) {
      return key.slice(1);
    };

    SimpleHash.prototype.hashKeyFor = function(obj) {
      return (obj != null ? typeof obj.hashKey === "function" ? obj.hashKey() : void 0 : void 0) || obj;
    };

    SimpleHash.prototype.equality = function(lhs, rhs) {
      if (lhs === rhs) {
        return true;
      }
      if (lhs !== lhs && rhs !== rhs) {
        return true;
      }
      if ((lhs != null ? typeof lhs.isEqual === "function" ? lhs.isEqual(rhs) : void 0 : void 0) && (rhs != null ? typeof rhs.isEqual === "function" ? rhs.isEqual(lhs) : void 0 : void 0)) {
        return true;
      }
      return false;
    };

    SimpleHash.prototype.objectKey = function(key) {
      return typeof key !== 'string';
    };

    SimpleHash.prototype.forEach = function(iterator, ctx) {
      var key, obj, results, value, values, _i, _len, _ref, _ref1, _ref2, _ref3;
      results = [];
      if (this._objectStorage) {
        _ref = this._objectStorage;
        for (key in _ref) {
          values = _ref[key];
          _ref1 = values.slice();
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            _ref2 = _ref1[_i], obj = _ref2[0], value = _ref2[1];
            results.push(iterator.call(ctx, obj, value, this));
          }
        }
      }
      _ref3 = this._storage;
      for (key in _ref3) {
        value = _ref3[key];
        results.push(iterator.call(ctx, this.unprefixedKey(key), value, this));
      }
      return results;
    };

    SimpleHash.prototype.keys = function() {
      var result;
      result = [];
      Batman.SimpleHash.prototype.forEach.call(this, function(key) {
        return result.push(key);
      });
      return result;
    };

    SimpleHash.prototype.toArray = SimpleHash.prototype.keys;

    SimpleHash.prototype.clear = function() {
      this._storage = {};
      delete this._objectStorage;
      return this.length = 0;
    };

    SimpleHash.prototype.isEmpty = function() {
      return this.length === 0;
    };

    SimpleHash.prototype.merge = function() {
      var hash, merged, others, _i, _len;
      others = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      merged = new this.constructor;
      others.unshift(this);
      for (_i = 0, _len = others.length; _i < _len; _i++) {
        hash = others[_i];
        hash.forEach(function(obj, value) {
          return merged.set(obj, value);
        });
      }
      return merged;
    };

    SimpleHash.prototype.update = function(object) {
      var k, v, _results;
      _results = [];
      for (k in object) {
        v = object[k];
        _results.push(this.set(k, v));
      }
      return _results;
    };

    SimpleHash.prototype.replace = function(object) {
      var _this = this;
      this.forEach(function(key, value) {
        if (!(key in object)) {
          return _this.unset(key);
        }
      });
      return this.update(object);
    };

    SimpleHash.prototype.toObject = function() {
      var key, obj, pair, value, _ref, _ref1;
      obj = {};
      _ref = this._storage;
      for (key in _ref) {
        value = _ref[key];
        obj[this.unprefixedKey(key)] = value;
      }
      if (this._objectStorage) {
        _ref1 = this._objectStorage;
        for (key in _ref1) {
          pair = _ref1[key];
          obj[key] = pair[0][1];
        }
      }
      return obj;
    };

    SimpleHash.prototype.toJSON = SimpleHash.prototype.toObject;

    return SimpleHash;

  })();

}).call(this);

(function() {
  var __slice = [].slice;

  Batman.SimpleSet = (function() {

    function SimpleSet() {
      this._storage = [];
      this.length = 0;
      if (arguments.length > 0) {
        this.add.apply(this, arguments);
      }
    }

    Batman.extend(SimpleSet.prototype, Batman.Enumerable);

    SimpleSet.prototype.has = function(item) {
      return !!(~this._indexOfItem(item));
    };

    SimpleSet.prototype.add = function() {
      var addedItems, item, items, _i, _len;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      addedItems = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        if (!(!~this._indexOfItem(item))) {
          continue;
        }
        this._storage.push(item);
        addedItems.push(item);
      }
      this.length = this._storage.length;
      if (this.fire && addedItems.length !== 0) {
        this.fire('change', this, this);
        this.fire.apply(this, ['itemsWereAdded'].concat(__slice.call(addedItems)));
      }
      return addedItems;
    };

    SimpleSet.prototype.remove = function() {
      var index, item, items, removedItems, _i, _len;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      removedItems = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        if (!(~(index = this._indexOfItem(item)))) {
          continue;
        }
        this._storage.splice(index, 1);
        removedItems.push(item);
      }
      this.length = this._storage.length;
      if (this.fire && removedItems.length !== 0) {
        this.fire('change', this, this);
        this.fire.apply(this, ['itemsWereRemoved'].concat(__slice.call(removedItems)));
      }
      return removedItems;
    };

    SimpleSet.prototype.find = function(f) {
      var item, _i, _len, _ref;
      _ref = this._storage;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (f(item)) {
          return item;
        }
      }
    };

    SimpleSet.prototype.forEach = function(iterator, ctx) {
      var key, _i, _len, _ref, _results;
      _ref = this._storage;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        _results.push(iterator.call(ctx, key, null, this));
      }
      return _results;
    };

    SimpleSet.prototype.isEmpty = function() {
      return this.length === 0;
    };

    SimpleSet.prototype.clear = function() {
      var items;
      items = this._storage;
      this._storage = [];
      this.length = 0;
      if (this.fire && items.length !== 0) {
        this.fire('change', this, this);
        this.fire.apply(this, ['itemsWereRemoved'].concat(__slice.call(items)));
      }
      return items;
    };

    SimpleSet.prototype.replace = function(other) {
      try {
        if (typeof this.prevent === "function") {
          this.prevent('change');
        }
        this.clear();
        return this.add.apply(this, other.toArray());
      } finally {
        if (typeof this.allowAndFire === "function") {
          this.allowAndFire('change', this, this);
        }
      }
    };

    SimpleSet.prototype.toArray = function() {
      return this._storage.slice();
    };

    SimpleSet.prototype.merge = function() {
      var merged, others, set, _i, _len;
      others = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      merged = new this.constructor;
      others.unshift(this);
      for (_i = 0, _len = others.length; _i < _len; _i++) {
        set = others[_i];
        set.forEach(function(v) {
          return merged.add(v);
        });
      }
      return merged;
    };

    SimpleSet.prototype.indexedBy = function(key) {
      this._indexes || (this._indexes = new Batman.SimpleHash);
      return this._indexes.get(key) || this._indexes.set(key, new Batman.SetIndex(this, key));
    };

    SimpleSet.prototype.indexedByUnique = function(key) {
      this._uniqueIndexes || (this._uniqueIndexes = new Batman.SimpleHash);
      return this._uniqueIndexes.get(key) || this._uniqueIndexes.set(key, new Batman.UniqueSetIndex(this, key));
    };

    SimpleSet.prototype.sortedBy = function(key, order) {
      var sortsForKey;
      if (order == null) {
        order = "asc";
      }
      order = order.toLowerCase() === "desc" ? "desc" : "asc";
      this._sorts || (this._sorts = new Batman.SimpleHash);
      sortsForKey = this._sorts.get(key) || this._sorts.set(key, new Batman.Object);
      return sortsForKey.get(order) || sortsForKey.set(order, new Batman.SetSort(this, key, order));
    };

    SimpleSet.prototype.equality = Batman.SimpleHash.prototype.equality;

    SimpleSet.prototype._indexOfItem = function(givenItem) {
      var index, item, _i, _len, _ref;
      _ref = this._storage;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        item = _ref[index];
        if (this.equality(givenItem, item)) {
          return index;
        }
      }
      return -1;
    };

    return SimpleSet;

  })();

}).call(this);

(function() {
  var SOURCE_TRACKER_STACK, SOURCE_TRACKER_STACK_VALID,
    __slice = [].slice;

  SOURCE_TRACKER_STACK = [];

  SOURCE_TRACKER_STACK_VALID = true;

  Batman.Property = (function() {

    Batman.mixin(Property.prototype, Batman.EventEmitter);

    Property._sourceTrackerStack = SOURCE_TRACKER_STACK;

    Property.defaultAccessor = {
      get: function(key) {
        return this[key];
      },
      set: function(key, val) {
        return this[key] = val;
      },
      unset: function(key) {
        var x;
        x = this[key];
        delete this[key];
        return x;
      },
      cache: false
    };

    Property.defaultAccessorForBase = function(base) {
      var _ref;
      return ((_ref = base._batman) != null ? _ref.getFirst('defaultAccessor') : void 0) || Batman.Property.defaultAccessor;
    };

    Property.accessorForBaseAndKey = function(base, key) {
      var accessor, ancestor, _bm, _i, _len, _ref, _ref1, _ref2, _ref3;
      if ((_bm = base._batman) != null) {
        accessor = (_ref = _bm.keyAccessors) != null ? _ref.get(key) : void 0;
        if (!accessor) {
          _ref1 = _bm.ancestors();
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            ancestor = _ref1[_i];
            accessor = (_ref2 = ancestor._batman) != null ? (_ref3 = _ref2.keyAccessors) != null ? _ref3.get(key) : void 0 : void 0;
            if (accessor) {
              break;
            }
          }
        }
      }
      return accessor || this.defaultAccessorForBase(base);
    };

    Property.forBaseAndKey = function(base, key) {
      if (base.isObservable) {
        return base.property(key);
      } else {
        return new Batman.Keypath(base, key);
      }
    };

    Property.withoutTracking = function(block) {
      return this.wrapTrackingPrevention(block)();
    };

    Property.wrapTrackingPrevention = function(block) {
      return function() {
        Batman.Property.pushDummySourceTracker();
        try {
          return block.apply(this, arguments);
        } finally {
          Batman.Property.popSourceTracker();
        }
      };
    };

    Property.registerSource = function(obj) {
      var set;
      if (!obj.isEventEmitter) {
        return;
      }
      if (!SOURCE_TRACKER_STACK_VALID) {
        set = [];
        SOURCE_TRACKER_STACK.push(set);
        SOURCE_TRACKER_STACK_VALID = true;
      } else {
        set = SOURCE_TRACKER_STACK[SOURCE_TRACKER_STACK.length - 1];
      }
      if (set != null) {
        set.push(obj);
      }
      return void 0;
    };

    Property.pushSourceTracker = function() {
      if (!SOURCE_TRACKER_STACK_VALID) {
        return SOURCE_TRACKER_STACK.push([]);
      } else {
        return SOURCE_TRACKER_STACK_VALID = false;
      }
    };

    Property.popSourceTracker = function() {
      if (!SOURCE_TRACKER_STACK_VALID) {
        SOURCE_TRACKER_STACK_VALID = true;
        return void 0;
      } else {
        return SOURCE_TRACKER_STACK.pop();
      }
    };

    Property.pushDummySourceTracker = function() {
      return SOURCE_TRACKER_STACK.push(null);
    };

    function Property(base, key) {
      this.base = base;
      this.key = key;
    }

    Property.prototype._isolationCount = 0;

    Property.prototype.cached = false;

    Property.prototype.value = null;

    Property.prototype.sources = null;

    Property.prototype.isProperty = true;

    Property.prototype.isDead = false;

    Property.prototype.eventClass = Batman.PropertyEvent;

    Property.prototype.isEqual = function(other) {
      return this.constructor === other.constructor && this.base === other.base && this.key === other.key;
    };

    Property.prototype.hashKey = function() {
      return this._hashKey || (this._hashKey = "<Batman.Property base: " + (Batman.Hash.prototype.hashKeyFor(this.base)) + ", key: \"" + (Batman.Hash.prototype.hashKeyFor(this.key)) + "\">");
    };

    Property.prototype.event = function(key) {
      var eventClass, _base;
      eventClass = this.eventClass || Batman.Event;
      this.events || (this.events = {});
      (_base = this.events)[key] || (_base[key] = new eventClass(this, key));
      return this.events[key];
    };

    Property.prototype.changeEvent = function() {
      return this._changeEvent || (this._changeEvent = this.event('change'));
    };

    Property.prototype.accessor = function() {
      return this._accessor || (this._accessor = this.constructor.accessorForBaseAndKey(this.base, this.key));
    };

    Property.prototype.eachObserver = function(iterator) {
      var ancestor, handlers, key, object, property, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;
      key = this.key;
      handlers = (_ref = this.changeEvent().handlers) != null ? _ref.slice() : void 0;
      if (handlers) {
        for (_i = 0, _len = handlers.length; _i < _len; _i++) {
          object = handlers[_i];
          iterator(object);
        }
      }
      if (this.base.isObservable) {
        _ref1 = this.base._batman.ancestors();
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          ancestor = _ref1[_j];
          if (ancestor.isObservable && ancestor.hasProperty(key)) {
            property = ancestor.property(key);
            handlers = (_ref2 = property.changeEvent().handlers) != null ? _ref2.slice() : void 0;
            if (handlers) {
              _results.push((function() {
                var _k, _len2, _results1;
                _results1 = [];
                for (_k = 0, _len2 = handlers.length; _k < _len2; _k++) {
                  object = handlers[_k];
                  _results1.push(iterator(object));
                }
                return _results1;
              })());
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    Property.prototype.observers = function() {
      var results;
      results = [];
      this.eachObserver(function(observer) {
        return results.push(observer);
      });
      return results;
    };

    Property.prototype.hasObservers = function() {
      return this.observers().length > 0;
    };

    Property.prototype.updateSourcesFromTracker = function() {
      var handler, newSources, source, _i, _j, _len, _len1, _ref, _ref1, _results;
      newSources = this.constructor.popSourceTracker();
      handler = this.sourceChangeHandler();
      if (this.sources) {
        _ref = this.sources;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          source = _ref[_i];
          if (source != null) {
            source.event('change').removeHandler(handler);
          }
        }
      }
      this.sources = newSources;
      if (this.sources) {
        _ref1 = this.sources;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          source = _ref1[_j];
          _results.push(source != null ? source.event('change').addHandler(handler) : void 0);
        }
        return _results;
      }
    };

    Property.prototype.getValue = function() {
      this.registerAsMutableSource();
      if (!this.isCached()) {
        this.constructor.pushSourceTracker();
        try {
          this.value = this.valueFromAccessor();
          this.cached = true;
        } finally {
          this.updateSourcesFromTracker();
        }
      }
      return this.value;
    };

    Property.prototype.isCachable = function() {
      var cacheable;
      if (this.isFinal()) {
        return true;
      }
      cacheable = this.accessor().cache;
      if (cacheable != null) {
        return !!cacheable;
      } else {
        return true;
      }
    };

    Property.prototype.isCached = function() {
      return this.isCachable() && this.cached;
    };

    Property.prototype.isFinal = function() {
      return !!this.accessor()['final'];
    };

    Property.prototype.refresh = function() {
      var previousValue, value;
      this.cached = false;
      previousValue = this.value;
      value = this.getValue();
      if (value !== previousValue && !this.isIsolated()) {
        this.fire(value, previousValue);
      }
      if (this.value !== void 0 && this.isFinal()) {
        return this.lockValue();
      }
    };

    Property.prototype.sourceChangeHandler = function() {
      var _this = this;
      this._sourceChangeHandler || (this._sourceChangeHandler = this._handleSourceChange.bind(this));
      Batman.developer["do"](function() {
        return _this._sourceChangeHandler.property = _this;
      });
      return this._sourceChangeHandler;
    };

    Property.prototype._handleSourceChange = function() {
      if (this.isIsolated()) {
        return this._needsRefresh = true;
      } else if (!this.isFinal() && !this.hasObservers()) {
        return this.cached = false;
      } else {
        return this.refresh();
      }
    };

    Property.prototype.valueFromAccessor = function() {
      var _ref;
      return (_ref = this.accessor().get) != null ? _ref.call(this.base, this.key) : void 0;
    };

    Property.prototype.setValue = function(val) {
      var set;
      if (!(set = this.accessor().set)) {
        return;
      }
      return this._changeValue(function() {
        return set.call(this.base, this.key, val);
      });
    };

    Property.prototype.unsetValue = function() {
      var unset;
      if (!(unset = this.accessor().unset)) {
        return;
      }
      return this._changeValue(function() {
        return unset.call(this.base, this.key);
      });
    };

    Property.prototype._changeValue = function(block) {
      var result;
      this.cached = false;
      this.constructor.pushDummySourceTracker();
      try {
        result = block.apply(this);
        this.refresh();
      } finally {
        this.constructor.popSourceTracker();
      }
      if (!(this.isCached() || this.hasObservers())) {
        this.die();
      }
      return result;
    };

    Property.prototype.forget = function(handler) {
      if (handler != null) {
        return this.changeEvent().removeHandler(handler);
      } else {
        return this.changeEvent().clearHandlers();
      }
    };

    Property.prototype.observeAndFire = function(handler) {
      this.observe(handler);
      return handler.call(this.base, this.value, this.value, this.key);
    };

    Property.prototype.observe = function(handler) {
      this.changeEvent().addHandler(handler);
      if (this.sources == null) {
        this.getValue();
      }
      return this;
    };

    Property.prototype.observeOnce = function(originalHandler) {
      var event, handler;
      event = this.changeEvent();
      handler = function() {
        originalHandler.apply(this, arguments);
        return event.removeHandler(handler);
      };
      event.addHandler(handler);
      if (this.sources == null) {
        this.getValue();
      }
      return this;
    };

    Property.prototype._removeHandlers = function() {
      var handler, source, _i, _len, _ref;
      handler = this.sourceChangeHandler();
      if (this.sources) {
        _ref = this.sources;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          source = _ref[_i];
          source.event('change').removeHandler(handler);
        }
      }
      delete this.sources;
      return this.changeEvent().clearHandlers();
    };

    Property.prototype.lockValue = function() {
      this._removeHandlers();
      this.getValue = function() {
        return this.value;
      };
      return this.setValue = this.unsetValue = this.refresh = this.observe = function() {};
    };

    Property.prototype.die = function() {
      var _ref, _ref1;
      this._removeHandlers();
      if ((_ref = this.base._batman) != null) {
        if ((_ref1 = _ref.properties) != null) {
          _ref1.unset(this.key);
        }
      }
      return this.isDead = true;
    };

    Property.prototype.fire = function() {
      var _ref;
      return (_ref = this.changeEvent()).fire.apply(_ref, __slice.call(arguments).concat([this.key]));
    };

    Property.prototype.isolate = function() {
      if (this._isolationCount === 0) {
        this._preIsolationValue = this.getValue();
      }
      return this._isolationCount++;
    };

    Property.prototype.expose = function() {
      if (this._isolationCount === 1) {
        this._isolationCount--;
        if (this._needsRefresh) {
          this.value = this._preIsolationValue;
          this.refresh();
        } else if (this.value !== this._preIsolationValue) {
          this.fire(this.value, this._preIsolationValue);
        }
        return this._preIsolationValue = null;
      } else if (this._isolationCount > 0) {
        return this._isolationCount--;
      }
    };

    Property.prototype.isIsolated = function() {
      return this._isolationCount > 0;
    };

    return Property;

  })();

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Batman.Keypath = (function(_super) {

    __extends(Keypath, _super);

    function Keypath(base, key) {
      if (typeof key === 'string') {
        this.segments = key.split('.');
        this.depth = this.segments.length;
      } else {
        this.segments = [key];
        this.depth = 1;
      }
      Keypath.__super__.constructor.apply(this, arguments);
    }

    Keypath.prototype.isCachable = function() {
      if (this.depth === 1) {
        return Keypath.__super__.isCachable.apply(this, arguments);
      } else {
        return true;
      }
    };

    Keypath.prototype.terminalProperty = function() {
      var base;
      base = Batman.getPath(this.base, this.segments.slice(0, -1));
      if (base == null) {
        return;
      }
      return Batman.Keypath.forBaseAndKey(base, this.segments[this.depth - 1]);
    };

    Keypath.prototype.valueFromAccessor = function() {
      if (this.depth === 1) {
        return Keypath.__super__.valueFromAccessor.apply(this, arguments);
      } else {
        return Batman.getPath(this.base, this.segments);
      }
    };

    Keypath.prototype.setValue = function(val) {
      var _ref;
      if (this.depth === 1) {
        return Keypath.__super__.setValue.apply(this, arguments);
      } else {
        return (_ref = this.terminalProperty()) != null ? _ref.setValue(val) : void 0;
      }
    };

    Keypath.prototype.unsetValue = function() {
      var _ref;
      if (this.depth === 1) {
        return Keypath.__super__.unsetValue.apply(this, arguments);
      } else {
        return (_ref = this.terminalProperty()) != null ? _ref.unsetValue() : void 0;
      }
    };

    return Keypath;

  })(Batman.Property);

}).call(this);

(function() {
  var __slice = [].slice;

  Batman.Observable = {
    isObservable: true,
    hasProperty: function(key) {
      var _ref, _ref1;
      return (_ref = this._batman) != null ? (_ref1 = _ref.properties) != null ? typeof _ref1.hasKey === "function" ? _ref1.hasKey(key) : void 0 : void 0 : void 0;
    },
    property: function(key) {
      var properties, propertyClass, _base;
      Batman.initializeObject(this);
      propertyClass = this.propertyClass || Batman.Keypath;
      properties = (_base = this._batman).properties || (_base.properties = new Batman.SimpleHash);
      return properties.get(key) || properties.set(key, new propertyClass(this, key));
    },
    get: function(key) {
      return this.property(key).getValue();
    },
    set: function(key, val) {
      return this.property(key).setValue(val);
    },
    unset: function(key) {
      return this.property(key).unsetValue();
    },
    getOrSet: Batman.SimpleHash.prototype.getOrSet,
    forget: function(key, observer) {
      var _ref;
      if (key) {
        this.property(key).forget(observer);
      } else {
        if ((_ref = this._batman.properties) != null) {
          _ref.forEach(function(key, property) {
            return property.forget();
          });
        }
      }
      return this;
    },
    observe: function() {
      var args, key, _ref;
      key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      (_ref = this.property(key)).observe.apply(_ref, args);
      return this;
    },
    observeAndFire: function() {
      var args, key, _ref;
      key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      (_ref = this.property(key)).observeAndFire.apply(_ref, args);
      return this;
    },
    observeOnce: function() {
      var args, key, _ref;
      key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      (_ref = this.property(key)).observeOnce.apply(_ref, args);
      return this;
    }
  };

}).call(this);

(function() {
  var BatmanObject, ObjectFunctions, getAccessorObject, promiseWrapper, wrapSingleAccessor,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  getAccessorObject = function(base, accessor) {
    var deprecated, _i, _len, _ref;
    if (typeof accessor === 'function') {
      accessor = {
        get: accessor
      };
    }
    _ref = ['cachable', 'cacheable'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      deprecated = _ref[_i];
      if (deprecated in accessor) {
        Batman.developer.warn("Property accessor option \"" + deprecated + "\" is deprecated. Use \"cache\" instead.");
        if (!('cache' in accessor)) {
          accessor.cache = accessor[deprecated];
        }
      }
    }
    return accessor;
  };

  promiseWrapper = function(fetcher) {
    return function(defaultAccessor) {
      return {
        get: function(key) {
          var asyncDeliver, existingValue, newValue, _base, _base1, _ref, _ref1,
            _this = this;
          if ((existingValue = defaultAccessor.get.apply(this, arguments)) != null) {
            return existingValue;
          }
          asyncDeliver = false;
          newValue = void 0;
          if ((_ref = (_base = this._batman).promises) == null) {
            _base.promises = {};
          }
          if ((_ref1 = (_base1 = this._batman.promises)[key]) == null) {
            _base1[key] = (function() {
              var deliver, returnValue;
              deliver = function(err, result) {
                if (asyncDeliver) {
                  _this.set(key, result);
                }
                return newValue = result;
              };
              returnValue = fetcher.call(_this, deliver, key);
              if (newValue == null) {
                newValue = returnValue;
              }
              return true;
            })();
          }
          asyncDeliver = true;
          return newValue;
        },
        cache: true
      };
    };
  };

  wrapSingleAccessor = function(core, wrapper) {
    var k, v;
    wrapper = (typeof wrapper === "function" ? wrapper(core) : void 0) || wrapper;
    for (k in core) {
      v = core[k];
      if (!(k in wrapper)) {
        wrapper[k] = v;
      }
    }
    return wrapper;
  };

  ObjectFunctions = {
    _defineAccessor: function() {
      var accessor, key, keys, _base, _i, _j, _len, _ref, _results;
      keys = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), accessor = arguments[_i++];
      if (!(accessor != null)) {
        return Batman.Property.defaultAccessorForBase(this);
      } else if (keys.length === 0 && ((_ref = Batman.typeOf(accessor)) !== 'Object' && _ref !== 'Function')) {
        return Batman.Property.accessorForBaseAndKey(this, accessor);
      } else if (typeof accessor.promise === 'function') {
        return this._defineWrapAccessor.apply(this, __slice.call(keys).concat([promiseWrapper(accessor.promise)]));
      }
      Batman.initializeObject(this);
      if (keys.length === 0) {
        return this._batman.defaultAccessor = getAccessorObject(this, accessor);
      } else {
        (_base = this._batman).keyAccessors || (_base.keyAccessors = new Batman.SimpleHash);
        _results = [];
        for (_j = 0, _len = keys.length; _j < _len; _j++) {
          key = keys[_j];
          _results.push(this._batman.keyAccessors.set(key, getAccessorObject(this, accessor)));
        }
        return _results;
      }
    },
    _defineWrapAccessor: function() {
      var key, keys, wrapper, _i, _j, _len, _results;
      keys = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), wrapper = arguments[_i++];
      Batman.initializeObject(this);
      if (keys.length === 0) {
        return this._defineAccessor(wrapSingleAccessor(this._defineAccessor(), wrapper));
      } else {
        _results = [];
        for (_j = 0, _len = keys.length; _j < _len; _j++) {
          key = keys[_j];
          _results.push(this._defineAccessor(key, wrapSingleAccessor(this._defineAccessor(key), wrapper)));
        }
        return _results;
      }
    },
    _resetPromises: function() {
      var key;
      if (this._batman.promises == null) {
        return;
      }
      for (key in this._batman.promises) {
        this._resetPromise(key);
      }
    },
    _resetPromise: function(key) {
      this.unset(key);
      this.property(key).cached = false;
      delete this._batman.promises[key];
    }
  };

  BatmanObject = (function(_super) {
    var counter;

    __extends(BatmanObject, _super);

    Batman.initializeObject(BatmanObject);

    Batman.initializeObject(BatmanObject.prototype);

    Batman.mixin(BatmanObject.prototype, ObjectFunctions, Batman.EventEmitter, Batman.Observable);

    Batman.mixin(BatmanObject, ObjectFunctions, Batman.EventEmitter, Batman.Observable);

    BatmanObject.classMixin = function() {
      return Batman.mixin.apply(Batman, [this].concat(__slice.call(arguments)));
    };

    BatmanObject.mixin = function() {
      return this.classMixin.apply(this.prototype, arguments);
    };

    BatmanObject.prototype.mixin = BatmanObject.classMixin;

    BatmanObject.classAccessor = BatmanObject._defineAccessor;

    BatmanObject.accessor = function() {
      var _ref;
      return (_ref = this.prototype)._defineAccessor.apply(_ref, arguments);
    };

    BatmanObject.prototype.accessor = BatmanObject._defineAccessor;

    BatmanObject.wrapClassAccessor = BatmanObject._defineWrapAccessor;

    BatmanObject.wrapAccessor = function() {
      var _ref;
      return (_ref = this.prototype)._defineWrapAccessor.apply(_ref, arguments);
    };

    BatmanObject.prototype.wrapAccessor = BatmanObject._defineWrapAccessor;

    BatmanObject.observeAll = function() {
      return this.prototype.observe.apply(this.prototype, arguments);
    };

    BatmanObject.singleton = function(singletonMethodName) {
      if (singletonMethodName == null) {
        singletonMethodName = "sharedInstance";
      }
      return this.classAccessor(singletonMethodName, {
        get: function() {
          var _name;
          return this[_name = "_" + singletonMethodName] || (this[_name] = new this);
        }
      });
    };

    BatmanObject.accessor('_batmanID', function() {
      return this._batmanID();
    });

    function BatmanObject() {
      var mixins;
      mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._batman = new Batman._Batman(this);
      this.mixin.apply(this, mixins);
    }

    counter = 0;

    BatmanObject.prototype._batmanID = function() {
      var _base, _ref;
      this._batman.check(this);
      if ((_ref = (_base = this._batman).id) == null) {
        _base.id = counter++;
      }
      return this._batman.id;
    };

    BatmanObject.prototype.hashKey = function() {
      var _base;
      if (typeof this.isEqual === 'function') {
        return;
      }
      return (_base = this._batman).hashKey || (_base.hashKey = "<Batman.Object " + (this._batmanID()) + ">");
    };

    BatmanObject.prototype.toJSON = function() {
      var key, obj, value;
      obj = {};
      for (key in this) {
        if (!__hasProp.call(this, key)) continue;
        value = this[key];
        if (key !== "_batman" && key !== "hashKey" && key !== "_batmanID") {
          obj[key] = (value != null ? value.toJSON : void 0) ? value.toJSON() : value;
        }
      }
      return obj;
    };

    return BatmanObject;

  })(Object);

  Batman.Object = BatmanObject;

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Batman.StateMachine = (function(_super) {

    __extends(StateMachine, _super);

    StateMachine.InvalidTransitionError = function(message) {
      this.message = message != null ? message : "";
    };

    StateMachine.InvalidTransitionError.prototype = new Error;

    StateMachine.transitions = function(table) {
      var definePredicate, fromState, k, object, predicateKeys, toState, transitions, v, _fn, _ref,
        _this = this;
      for (k in table) {
        v = table[k];
        if (!(v.from && v.to)) {
          continue;
        }
        object = {};
        if (v.from.forEach) {
          v.from.forEach(function(fromKey) {
            return object[fromKey] = v.to;
          });
        } else {
          object[v.from] = v.to;
        }
        table[k] = object;
      }
      this.prototype.transitionTable = Batman.extend({}, this.prototype.transitionTable, table);
      predicateKeys = [];
      definePredicate = function(state) {
        var key;
        key = "is" + (Batman.helpers.capitalize(state));
        if (_this.prototype[key] != null) {
          return;
        }
        predicateKeys.push(key);
        return _this.prototype[key] = function() {
          return this.get('state') === state;
        };
      };
      _ref = this.prototype.transitionTable;
      _fn = function(k) {
        return _this.prototype[k] = function() {
          return this.startTransition(k);
        };
      };
      for (k in _ref) {
        transitions = _ref[k];
        if (!(!this.prototype[k])) {
          continue;
        }
        _fn(k);
        for (fromState in transitions) {
          toState = transitions[fromState];
          definePredicate(fromState);
          definePredicate(toState);
        }
      }
      if (predicateKeys.length) {
        this.accessor.apply(this, __slice.call(predicateKeys).concat([function(key) {
          return this[key]();
        }]));
      }
      return this;
    };

    function StateMachine(startState) {
      this.nextEvents = [];
      this.set('_state', startState);
    }

    StateMachine.accessor('state', function() {
      return this.get('_state');
    });

    StateMachine.prototype.isTransitioning = false;

    StateMachine.prototype.transitionTable = {};

    StateMachine.prototype.onTransition = function(from, into, callback) {
      return this.on("" + from + "->" + into, callback);
    };

    StateMachine.prototype.onEnter = function(into, callback) {
      return this.on("enter " + into, callback);
    };

    StateMachine.prototype.onExit = function(from, callback) {
      return this.on("exit " + from, callback);
    };

    StateMachine.prototype.startTransition = Batman.Property.wrapTrackingPrevention(function(event) {
      var nextState, previousState;
      if (this.isTransitioning) {
        this.nextEvents.push(event);
        return;
      }
      previousState = this.get('state');
      nextState = this.nextStateForEvent(event);
      if (!nextState) {
        return false;
      }
      this.isTransitioning = true;
      this.fire("exit " + previousState);
      this.set('_state', nextState);
      this.fire("" + previousState + "->" + nextState);
      this.fire("enter " + nextState);
      this.fire(event);
      this.isTransitioning = false;
      if (this.nextEvents.length > 0) {
        this.startTransition(this.nextEvents.shift());
      }
      return true;
    });

    StateMachine.prototype.canStartTransition = function(event, fromState) {
      if (fromState == null) {
        fromState = this.get('state');
      }
      return !!this.nextStateForEvent(event, fromState);
    };

    StateMachine.prototype.nextStateForEvent = function(event, fromState) {
      var _ref;
      if (fromState == null) {
        fromState = this.get('state');
      }
      return (_ref = this.transitionTable[event]) != null ? _ref[fromState] : void 0;
    };

    return StateMachine;

  })(Batman.Object);

  Batman.DelegatingStateMachine = (function(_super) {

    __extends(DelegatingStateMachine, _super);

    function DelegatingStateMachine(startState, base) {
      this.base = base;
      DelegatingStateMachine.__super__.constructor.call(this, startState);
    }

    DelegatingStateMachine.prototype.fire = function() {
      var result, _ref;
      result = DelegatingStateMachine.__super__.fire.apply(this, arguments);
      (_ref = this.base).fire.apply(_ref, arguments);
      return result;
    };

    return DelegatingStateMachine;

  })(Batman.StateMachine);

}).call(this);
