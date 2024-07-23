import Ce from "react";
var Q = { exports: {} },
  D = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Se;
function cr() {
  if (Se) return D;
  Se = 1;
  var V = Ce,
    C = Symbol.for("react.element"),
    U = Symbol.for("react.fragment"),
    m = Object.prototype.hasOwnProperty,
    A = V.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    I = { key: !0, ref: !0, __self: !0, __source: !0 };
  function P(b, c, T) {
    var p,
      h = {},
      E = null,
      W = null;
    T !== void 0 && (E = "" + T),
      c.key !== void 0 && (E = "" + c.key),
      c.ref !== void 0 && (W = c.ref);
    for (p in c) m.call(c, p) && !I.hasOwnProperty(p) && (h[p] = c[p]);
    if (b && b.defaultProps)
      for (p in ((c = b.defaultProps), c)) h[p] === void 0 && (h[p] = c[p]);
    return {
      $$typeof: C,
      type: b,
      key: E,
      ref: W,
      props: h,
      _owner: A.current,
    };
  }
  return (D.Fragment = U), (D.jsx = P), (D.jsxs = P), D;
}
var F = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var we;
function dr() {
  return (
    we ||
      ((we = 1),
      process.env.NODE_ENV !== "production" &&
        (function () {
          var V = Ce,
            C = Symbol.for("react.element"),
            U = Symbol.for("react.portal"),
            m = Symbol.for("react.fragment"),
            A = Symbol.for("react.strict_mode"),
            I = Symbol.for("react.profiler"),
            P = Symbol.for("react.provider"),
            b = Symbol.for("react.context"),
            c = Symbol.for("react.forward_ref"),
            T = Symbol.for("react.suspense"),
            p = Symbol.for("react.suspense_list"),
            h = Symbol.for("react.memo"),
            E = Symbol.for("react.lazy"),
            W = Symbol.for("react.offscreen"),
            ee = Symbol.iterator,
            Pe = "@@iterator";
          function je(e) {
            if (e === null || typeof e != "object") return null;
            var r = (ee && e[ee]) || e[Pe];
            return typeof r == "function" ? r : null;
          }
          var O = V.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
          function f(e) {
            {
              for (
                var r = arguments.length,
                  t = new Array(r > 1 ? r - 1 : 0),
                  n = 1;
                n < r;
                n++
              )
                t[n - 1] = arguments[n];
              xe("error", e, t);
            }
          }
          function xe(e, r, t) {
            {
              var n = O.ReactDebugCurrentFrame,
                i = n.getStackAddendum();
              i !== "" && ((r += "%s"), (t = t.concat([i])));
              var u = t.map(function (o) {
                return String(o);
              });
              u.unshift("Warning: " + r),
                Function.prototype.apply.call(console[e], console, u);
            }
          }
          var ke = !1,
            De = !1,
            Fe = !1,
            Ae = !1,
            Ie = !1,
            re;
          re = Symbol.for("react.module.reference");
          function We(e) {
            return !!(
              typeof e == "string" ||
              typeof e == "function" ||
              e === m ||
              e === I ||
              Ie ||
              e === A ||
              e === T ||
              e === p ||
              Ae ||
              e === W ||
              ke ||
              De ||
              Fe ||
              (typeof e == "object" &&
                e !== null &&
                (e.$$typeof === E ||
                  e.$$typeof === h ||
                  e.$$typeof === P ||
                  e.$$typeof === b ||
                  e.$$typeof === c || // This needs to include all possible module reference object
                  // types supported by any Flight configuration anywhere since
                  // we don't know which Flight build this will end up being used
                  // with.
                  e.$$typeof === re ||
                  e.getModuleId !== void 0))
            );
          }
          function $e(e, r, t) {
            var n = e.displayName;
            if (n) return n;
            var i = r.displayName || r.name || "";
            return i !== "" ? t + "(" + i + ")" : t;
          }
          function te(e) {
            return e.displayName || "Context";
          }
          function y(e) {
            if (e == null) return null;
            if (
              (typeof e.tag == "number" &&
                f(
                  "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
                ),
              typeof e == "function")
            )
              return e.displayName || e.name || null;
            if (typeof e == "string") return e;
            switch (e) {
              case m:
                return "Fragment";
              case U:
                return "Portal";
              case I:
                return "Profiler";
              case A:
                return "StrictMode";
              case T:
                return "Suspense";
              case p:
                return "SuspenseList";
            }
            if (typeof e == "object")
              switch (e.$$typeof) {
                case b:
                  var r = e;
                  return te(r) + ".Consumer";
                case P:
                  var t = e;
                  return te(t._context) + ".Provider";
                case c:
                  return $e(e, e.render, "ForwardRef");
                case h:
                  var n = e.displayName || null;
                  return n !== null ? n : y(e.type) || "Memo";
                case E: {
                  var i = e,
                    u = i._payload,
                    o = i._init;
                  try {
                    return y(o(u));
                  } catch {
                    return null;
                  }
                }
              }
            return null;
          }
          var R = Object.assign,
            j = 0,
            ne,
            ae,
            oe,
            ie,
            ue,
            se,
            le;
          function fe() {}
          fe.__reactDisabledLog = !0;
          function Ye() {
            {
              if (j === 0) {
                (ne = console.log),
                  (ae = console.info),
                  (oe = console.warn),
                  (ie = console.error),
                  (ue = console.group),
                  (se = console.groupCollapsed),
                  (le = console.groupEnd);
                var e = {
                  configurable: !0,
                  enumerable: !0,
                  value: fe,
                  writable: !0,
                };
                Object.defineProperties(console, {
                  info: e,
                  log: e,
                  warn: e,
                  error: e,
                  group: e,
                  groupCollapsed: e,
                  groupEnd: e,
                });
              }
              j++;
            }
          }
          function Le() {
            {
              if ((j--, j === 0)) {
                var e = {
                  configurable: !0,
                  enumerable: !0,
                  writable: !0,
                };
                Object.defineProperties(console, {
                  log: R({}, e, {
                    value: ne,
                  }),
                  info: R({}, e, {
                    value: ae,
                  }),
                  warn: R({}, e, {
                    value: oe,
                  }),
                  error: R({}, e, {
                    value: ie,
                  }),
                  group: R({}, e, {
                    value: ue,
                  }),
                  groupCollapsed: R({}, e, {
                    value: se,
                  }),
                  groupEnd: R({}, e, {
                    value: le,
                  }),
                });
              }
              j < 0 &&
                f(
                  "disabledDepth fell below zero. This is a bug in React. Please file an issue."
                );
            }
          }
          var N = O.ReactCurrentDispatcher,
            B;
          function $(e, r, t) {
            {
              if (B === void 0)
                try {
                  throw Error();
                } catch (i) {
                  var n = i.stack.trim().match(/\n( *(at )?)/);
                  B = (n && n[1]) || "";
                }
              return (
                `
` +
                B +
                e
              );
            }
          }
          var J = !1,
            Y;
          {
            var Me = typeof WeakMap == "function" ? WeakMap : Map;
            Y = new Me();
          }
          function ce(e, r) {
            if (!e || J) return "";
            {
              var t = Y.get(e);
              if (t !== void 0) return t;
            }
            var n;
            J = !0;
            var i = Error.prepareStackTrace;
            Error.prepareStackTrace = void 0;
            var u;
            (u = N.current), (N.current = null), Ye();
            try {
              if (r) {
                var o = function () {
                  throw Error();
                };
                if (
                  (Object.defineProperty(o.prototype, "props", {
                    set: function () {
                      throw Error();
                    },
                  }),
                  typeof Reflect == "object" && Reflect.construct)
                ) {
                  try {
                    Reflect.construct(o, []);
                  } catch (v) {
                    n = v;
                  }
                  Reflect.construct(e, [], o);
                } else {
                  try {
                    o.call();
                  } catch (v) {
                    n = v;
                  }
                  e.call(o.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (v) {
                  n = v;
                }
                e();
              }
            } catch (v) {
              if (v && n && typeof v.stack == "string") {
                for (
                  var a = v.stack.split(`
`),
                    d = n.stack.split(`
`),
                    s = a.length - 1,
                    l = d.length - 1;
                  s >= 1 && l >= 0 && a[s] !== d[l];

                )
                  l--;
                for (; s >= 1 && l >= 0; s--, l--)
                  if (a[s] !== d[l]) {
                    if (s !== 1 || l !== 1)
                      do
                        if ((s--, l--, l < 0 || a[s] !== d[l])) {
                          var g =
                            `
` + a[s].replace(" at new ", " at ");
                          return (
                            e.displayName &&
                              g.includes("<anonymous>") &&
                              (g = g.replace("<anonymous>", e.displayName)),
                            typeof e == "function" && Y.set(e, g),
                            g
                          );
                        }
                      while (s >= 1 && l >= 0);
                    break;
                  }
              }
            } finally {
              (J = !1), (N.current = u), Le(), (Error.prepareStackTrace = i);
            }
            var w = e ? e.displayName || e.name : "",
              _ = w ? $(w) : "";
            return typeof e == "function" && Y.set(e, _), _;
          }
          function Ve(e, r, t) {
            return ce(e, !1);
          }
          function Ue(e) {
            var r = e.prototype;
            return !!(r && r.isReactComponent);
          }
          function L(e, r, t) {
            if (e == null) return "";
            if (typeof e == "function") return ce(e, Ue(e));
            if (typeof e == "string") return $(e);
            switch (e) {
              case T:
                return $("Suspense");
              case p:
                return $("SuspenseList");
            }
            if (typeof e == "object")
              switch (e.$$typeof) {
                case c:
                  return Ve(e.render);
                case h:
                  return L(e.type, r, t);
                case E: {
                  var n = e,
                    i = n._payload,
                    u = n._init;
                  try {
                    return L(u(i), r, t);
                  } catch {}
                }
              }
            return "";
          }
          var x = Object.prototype.hasOwnProperty,
            de = {},
            ve = O.ReactDebugCurrentFrame;
          function M(e) {
            if (e) {
              var r = e._owner,
                t = L(e.type, e._source, r ? r.type : null);
              ve.setExtraStackFrame(t);
            } else ve.setExtraStackFrame(null);
          }
          function Ne(e, r, t, n, i) {
            {
              var u = Function.call.bind(x);
              for (var o in e)
                if (u(e, o)) {
                  var a = void 0;
                  try {
                    if (typeof e[o] != "function") {
                      var d = Error(
                        (n || "React class") +
                          ": " +
                          t +
                          " type `" +
                          o +
                          "` is invalid; it must be a function, usually from the `prop-types` package, but received `" +
                          typeof e[o] +
                          "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
                      );
                      throw ((d.name = "Invariant Violation"), d);
                    }
                    a = e[o](
                      r,
                      o,
                      n,
                      t,
                      null,
                      "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"
                    );
                  } catch (s) {
                    a = s;
                  }
                  a &&
                    !(a instanceof Error) &&
                    (M(i),
                    f(
                      "%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).",
                      n || "React class",
                      t,
                      o,
                      typeof a
                    ),
                    M(null)),
                    a instanceof Error &&
                      !(a.message in de) &&
                      ((de[a.message] = !0),
                      M(i),
                      f("Failed %s type: %s", t, a.message),
                      M(null));
                }
            }
          }
          var Be = Array.isArray;
          function q(e) {
            return Be(e);
          }
          function Je(e) {
            {
              var r = typeof Symbol == "function" && Symbol.toStringTag,
                t =
                  (r && e[Symbol.toStringTag]) ||
                  e.constructor.name ||
                  "Object";
              return t;
            }
          }
          function qe(e) {
            try {
              return pe(e), !1;
            } catch {
              return !0;
            }
          }
          function pe(e) {
            return "" + e;
          }
          function ge(e) {
            if (qe(e))
              return (
                f(
                  "The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.",
                  Je(e)
                ),
                pe(e)
              );
          }
          var k = O.ReactCurrentOwner,
            Ke = {
              key: !0,
              ref: !0,
              __self: !0,
              __source: !0,
            },
            ye,
            he,
            K;
          K = {};
          function Ge(e) {
            if (x.call(e, "ref")) {
              var r = Object.getOwnPropertyDescriptor(e, "ref").get;
              if (r && r.isReactWarning) return !1;
            }
            return e.ref !== void 0;
          }
          function ze(e) {
            if (x.call(e, "key")) {
              var r = Object.getOwnPropertyDescriptor(e, "key").get;
              if (r && r.isReactWarning) return !1;
            }
            return e.key !== void 0;
          }
          function Xe(e, r) {
            if (
              typeof e.ref == "string" &&
              k.current &&
              r &&
              k.current.stateNode !== r
            ) {
              var t = y(k.current.type);
              K[t] ||
                (f(
                  'Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref',
                  y(k.current.type),
                  e.ref
                ),
                (K[t] = !0));
            }
          }
          function He(e, r) {
            {
              var t = function () {
                ye ||
                  ((ye = !0),
                  f(
                    "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)",
                    r
                  ));
              };
              (t.isReactWarning = !0),
                Object.defineProperty(e, "key", {
                  get: t,
                  configurable: !0,
                });
            }
          }
          function Ze(e, r) {
            {
              var t = function () {
                he ||
                  ((he = !0),
                  f(
                    "%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)",
                    r
                  ));
              };
              (t.isReactWarning = !0),
                Object.defineProperty(e, "ref", {
                  get: t,
                  configurable: !0,
                });
            }
          }
          var Qe = function (e, r, t, n, i, u, o) {
            var a = {
              // This tag allows us to uniquely identify this as a React Element
              $$typeof: C,
              // Built-in properties that belong on the element
              type: e,
              key: r,
              ref: t,
              props: o,
              // Record the component responsible for creating this element.
              _owner: u,
            };
            return (
              (a._store = {}),
              Object.defineProperty(a._store, "validated", {
                configurable: !1,
                enumerable: !1,
                writable: !0,
                value: !1,
              }),
              Object.defineProperty(a, "_self", {
                configurable: !1,
                enumerable: !1,
                writable: !1,
                value: n,
              }),
              Object.defineProperty(a, "_source", {
                configurable: !1,
                enumerable: !1,
                writable: !1,
                value: i,
              }),
              Object.freeze && (Object.freeze(a.props), Object.freeze(a)),
              a
            );
          };
          function er(e, r, t, n, i) {
            {
              var u,
                o = {},
                a = null,
                d = null;
              t !== void 0 && (ge(t), (a = "" + t)),
                ze(r) && (ge(r.key), (a = "" + r.key)),
                Ge(r) && ((d = r.ref), Xe(r, i));
              for (u in r)
                x.call(r, u) && !Ke.hasOwnProperty(u) && (o[u] = r[u]);
              if (e && e.defaultProps) {
                var s = e.defaultProps;
                for (u in s) o[u] === void 0 && (o[u] = s[u]);
              }
              if (a || d) {
                var l =
                  typeof e == "function"
                    ? e.displayName || e.name || "Unknown"
                    : e;
                a && He(o, l), d && Ze(o, l);
              }
              return Qe(e, a, d, i, n, k.current, o);
            }
          }
          var G = O.ReactCurrentOwner,
            be = O.ReactDebugCurrentFrame;
          function S(e) {
            if (e) {
              var r = e._owner,
                t = L(e.type, e._source, r ? r.type : null);
              be.setExtraStackFrame(t);
            } else be.setExtraStackFrame(null);
          }
          var z;
          z = !1;
          function X(e) {
            return typeof e == "object" && e !== null && e.$$typeof === C;
          }
          function Ee() {
            {
              if (G.current) {
                var e = y(G.current.type);
                if (e)
                  return (
                    `

Check the render method of \`` +
                    e +
                    "`."
                  );
              }
              return "";
            }
          }
          function rr(e) {
            return "";
          }
          var Re = {};
          function tr(e) {
            {
              var r = Ee();
              if (!r) {
                var t = typeof e == "string" ? e : e.displayName || e.name;
                t &&
                  (r =
                    `

Check the top-level render call using <` +
                    t +
                    ">.");
              }
              return r;
            }
          }
          function _e(e, r) {
            {
              if (!e._store || e._store.validated || e.key != null) return;
              e._store.validated = !0;
              var t = tr(r);
              if (Re[t]) return;
              Re[t] = !0;
              var n = "";
              e &&
                e._owner &&
                e._owner !== G.current &&
                (n = " It was passed a child from " + y(e._owner.type) + "."),
                S(e),
                f(
                  'Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.',
                  t,
                  n
                ),
                S(null);
            }
          }
          function me(e, r) {
            {
              if (typeof e != "object") return;
              if (q(e))
                for (var t = 0; t < e.length; t++) {
                  var n = e[t];
                  X(n) && _e(n, r);
                }
              else if (X(e)) e._store && (e._store.validated = !0);
              else if (e) {
                var i = je(e);
                if (typeof i == "function" && i !== e.entries)
                  for (var u = i.call(e), o; !(o = u.next()).done; )
                    X(o.value) && _e(o.value, r);
              }
            }
          }
          function nr(e) {
            {
              var r = e.type;
              if (r == null || typeof r == "string") return;
              var t;
              if (typeof r == "function") t = r.propTypes;
              else if (
                typeof r == "object" &&
                (r.$$typeof === c || // Note: Memo only checks outer props here.
                  // Inner props are checked in the reconciler.
                  r.$$typeof === h)
              )
                t = r.propTypes;
              else return;
              if (t) {
                var n = y(r);
                Ne(t, e.props, "prop", n, e);
              } else if (r.PropTypes !== void 0 && !z) {
                z = !0;
                var i = y(r);
                f(
                  "Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?",
                  i || "Unknown"
                );
              }
              typeof r.getDefaultProps == "function" &&
                !r.getDefaultProps.isReactClassApproved &&
                f(
                  "getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead."
                );
            }
          }
          function ar(e) {
            {
              for (var r = Object.keys(e.props), t = 0; t < r.length; t++) {
                var n = r[t];
                if (n !== "children" && n !== "key") {
                  S(e),
                    f(
                      "Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.",
                      n
                    ),
                    S(null);
                  break;
                }
              }
              e.ref !== null &&
                (S(e),
                f("Invalid attribute `ref` supplied to `React.Fragment`."),
                S(null));
            }
          }
          var Te = {};
          function Oe(e, r, t, n, i, u) {
            {
              var o = We(e);
              if (!o) {
                var a = "";
                (e === void 0 ||
                  (typeof e == "object" &&
                    e !== null &&
                    Object.keys(e).length === 0)) &&
                  (a +=
                    " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
                var d = rr();
                d ? (a += d) : (a += Ee());
                var s;
                e === null
                  ? (s = "null")
                  : q(e)
                    ? (s = "array")
                    : e !== void 0 && e.$$typeof === C
                      ? ((s = "<" + (y(e.type) || "Unknown") + " />"),
                        (a =
                          " Did you accidentally export a JSX literal instead of a component?"))
                      : (s = typeof e),
                  f(
                    "React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s",
                    s,
                    a
                  );
              }
              var l = er(e, r, t, i, u);
              if (l == null) return l;
              if (o) {
                var g = r.children;
                if (g !== void 0)
                  if (n)
                    if (q(g)) {
                      for (var w = 0; w < g.length; w++) me(g[w], e);
                      Object.freeze && Object.freeze(g);
                    } else
                      f(
                        "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
                      );
                  else me(g, e);
              }
              if (x.call(r, "key")) {
                var _ = y(e),
                  v = Object.keys(r).filter(function (fr) {
                    return fr !== "key";
                  }),
                  H =
                    v.length > 0
                      ? "{key: someKey, " + v.join(": ..., ") + ": ...}"
                      : "{key: someKey}";
                if (!Te[_ + H]) {
                  var lr =
                    v.length > 0 ? "{" + v.join(": ..., ") + ": ...}" : "{}";
                  f(
                    `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
                    H,
                    _,
                    lr,
                    _
                  ),
                    (Te[_ + H] = !0);
                }
              }
              return e === m ? ar(l) : nr(l), l;
            }
          }
          function or(e, r, t) {
            return Oe(e, r, t, !0);
          }
          function ir(e, r, t) {
            return Oe(e, r, t, !1);
          }
          var ur = ir,
            sr = or;
          (F.Fragment = m), (F.jsx = ur), (F.jsxs = sr);
        })()),
    F
  );
}
process.env.NODE_ENV === "production" ? (Q.exports = cr()) : (Q.exports = dr());
var Z = Q.exports;
const pr = () =>
  /* @__PURE__ */ Z.jsx(Z.Fragment, {
    children: /* @__PURE__ */ Z.jsx("h1", { children: "hello world" }),
  });
export { pr as MyComponent };
