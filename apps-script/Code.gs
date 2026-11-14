/**
 * TECHNOPRENEURSHIP FINAL ASSESSMENT MANAGEMENT SYSTEM — Google Apps Script edition
 * Generated file: do not edit by hand. Rebuild with "node apps-script/build.mjs".
 * Paste the whole file into Extensions → Apps Script of your Google Sheet, then
 * run setup() once and deploy as a Web App (Execute as: Me, Access: Anyone).
 */
var TFA = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // apps-script/src/main.js
  var main_exports = {};
  __export(main_exports, {
    doGet: () => doGet,
    doPost: () => doPost,
    handle: () => handle,
    seedDemoData: () => seedDemoData,
    setup: () => setup
  });

  // server/node_modules/zod/v3/external.js
  var external_exports = {};
  __export(external_exports, {
    BRAND: () => BRAND,
    DIRTY: () => DIRTY,
    EMPTY_PATH: () => EMPTY_PATH,
    INVALID: () => INVALID,
    NEVER: () => NEVER,
    OK: () => OK,
    ParseStatus: () => ParseStatus,
    Schema: () => ZodType,
    ZodAny: () => ZodAny,
    ZodArray: () => ZodArray,
    ZodBigInt: () => ZodBigInt,
    ZodBoolean: () => ZodBoolean,
    ZodBranded: () => ZodBranded,
    ZodCatch: () => ZodCatch,
    ZodDate: () => ZodDate,
    ZodDefault: () => ZodDefault,
    ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
    ZodEffects: () => ZodEffects,
    ZodEnum: () => ZodEnum,
    ZodError: () => ZodError,
    ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
    ZodFunction: () => ZodFunction,
    ZodIntersection: () => ZodIntersection,
    ZodIssueCode: () => ZodIssueCode,
    ZodLazy: () => ZodLazy,
    ZodLiteral: () => ZodLiteral,
    ZodMap: () => ZodMap,
    ZodNaN: () => ZodNaN,
    ZodNativeEnum: () => ZodNativeEnum,
    ZodNever: () => ZodNever,
    ZodNull: () => ZodNull,
    ZodNullable: () => ZodNullable,
    ZodNumber: () => ZodNumber,
    ZodObject: () => ZodObject,
    ZodOptional: () => ZodOptional,
    ZodParsedType: () => ZodParsedType,
    ZodPipeline: () => ZodPipeline,
    ZodPromise: () => ZodPromise,
    ZodReadonly: () => ZodReadonly,
    ZodRecord: () => ZodRecord,
    ZodSchema: () => ZodType,
    ZodSet: () => ZodSet,
    ZodString: () => ZodString,
    ZodSymbol: () => ZodSymbol,
    ZodTransformer: () => ZodEffects,
    ZodTuple: () => ZodTuple,
    ZodType: () => ZodType,
    ZodUndefined: () => ZodUndefined,
    ZodUnion: () => ZodUnion,
    ZodUnknown: () => ZodUnknown,
    ZodVoid: () => ZodVoid,
    addIssueToContext: () => addIssueToContext,
    any: () => anyType,
    array: () => arrayType,
    bigint: () => bigIntType,
    boolean: () => booleanType,
    coerce: () => coerce,
    custom: () => custom,
    date: () => dateType,
    datetimeRegex: () => datetimeRegex,
    defaultErrorMap: () => en_default,
    discriminatedUnion: () => discriminatedUnionType,
    effect: () => effectsType,
    enum: () => enumType,
    function: () => functionType,
    getErrorMap: () => getErrorMap,
    getParsedType: () => getParsedType,
    instanceof: () => instanceOfType,
    intersection: () => intersectionType,
    isAborted: () => isAborted,
    isAsync: () => isAsync,
    isDirty: () => isDirty,
    isValid: () => isValid,
    late: () => late,
    lazy: () => lazyType,
    literal: () => literalType,
    makeIssue: () => makeIssue,
    map: () => mapType,
    nan: () => nanType,
    nativeEnum: () => nativeEnumType,
    never: () => neverType,
    null: () => nullType,
    nullable: () => nullableType,
    number: () => numberType,
    object: () => objectType,
    objectUtil: () => objectUtil,
    oboolean: () => oboolean,
    onumber: () => onumber,
    optional: () => optionalType,
    ostring: () => ostring,
    pipeline: () => pipelineType,
    preprocess: () => preprocessType,
    promise: () => promiseType,
    quotelessJson: () => quotelessJson,
    record: () => recordType,
    set: () => setType,
    setErrorMap: () => setErrorMap,
    strictObject: () => strictObjectType,
    string: () => stringType,
    symbol: () => symbolType,
    transformer: () => effectsType,
    tuple: () => tupleType,
    undefined: () => undefinedType,
    union: () => unionType,
    unknown: () => unknownType,
    util: () => util,
    void: () => voidType
  });

  // server/node_modules/zod/v3/helpers/util.js
  var util;
  (function(util2) {
    util2.assertEqual = (_) => {
    };
    function assertIs(_arg) {
    }
    util2.assertIs = assertIs;
    function assertNever(_x) {
      throw new Error();
    }
    util2.assertNever = assertNever;
    util2.arrayToEnum = (items) => {
      const obj = {};
      for (const item of items) {
        obj[item] = item;
      }
      return obj;
    };
    util2.getValidEnumValues = (obj) => {
      const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
      const filtered = {};
      for (const k of validKeys) {
        filtered[k] = obj[k];
      }
      return util2.objectValues(filtered);
    };
    util2.objectValues = (obj) => {
      return util2.objectKeys(obj).map(function(e) {
        return obj[e];
      });
    };
    util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
      const keys = [];
      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          keys.push(key);
        }
      }
      return keys;
    };
    util2.find = (arr, checker) => {
      for (const item of arr) {
        if (checker(item))
          return item;
      }
      return void 0;
    };
    util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
    function joinValues(array, separator = " | ") {
      return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
    }
    util2.joinValues = joinValues;
    util2.jsonStringifyReplacer = (_, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return value;
    };
  })(util || (util = {}));
  var objectUtil;
  (function(objectUtil2) {
    objectUtil2.mergeShapes = (first, second) => {
      return {
        ...first,
        ...second
        // second overwrites first
      };
    };
  })(objectUtil || (objectUtil = {}));
  var ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set"
  ]);
  var getParsedType = (data) => {
    const t = typeof data;
    switch (t) {
      case "undefined":
        return ZodParsedType.undefined;
      case "string":
        return ZodParsedType.string;
      case "number":
        return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
      case "boolean":
        return ZodParsedType.boolean;
      case "function":
        return ZodParsedType.function;
      case "bigint":
        return ZodParsedType.bigint;
      case "symbol":
        return ZodParsedType.symbol;
      case "object":
        if (Array.isArray(data)) {
          return ZodParsedType.array;
        }
        if (data === null) {
          return ZodParsedType.null;
        }
        if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
          return ZodParsedType.promise;
        }
        if (typeof Map !== "undefined" && data instanceof Map) {
          return ZodParsedType.map;
        }
        if (typeof Set !== "undefined" && data instanceof Set) {
          return ZodParsedType.set;
        }
        if (typeof Date !== "undefined" && data instanceof Date) {
          return ZodParsedType.date;
        }
        return ZodParsedType.object;
      default:
        return ZodParsedType.unknown;
    }
  };

  // server/node_modules/zod/v3/ZodError.js
  var ZodIssueCode = util.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
    "not_finite"
  ]);
  var quotelessJson = (obj) => {
    const json2 = JSON.stringify(obj, null, 2);
    return json2.replace(/"([^"]+)":/g, "$1:");
  };
  var ZodError = class _ZodError extends Error {
    get errors() {
      return this.issues;
    }
    constructor(issues) {
      super();
      this.issues = [];
      this.addIssue = (sub) => {
        this.issues = [...this.issues, sub];
      };
      this.addIssues = (subs = []) => {
        this.issues = [...this.issues, ...subs];
      };
      const actualProto = new.target.prototype;
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(this, actualProto);
      } else {
        this.__proto__ = actualProto;
      }
      this.name = "ZodError";
      this.issues = issues;
    }
    format(_mapper) {
      const mapper = _mapper || function(issue) {
        return issue.message;
      };
      const fieldErrors = { _errors: [] };
      const processError = (error) => {
        for (const issue of error.issues) {
          if (issue.code === "invalid_union") {
            issue.unionErrors.map(processError);
          } else if (issue.code === "invalid_return_type") {
            processError(issue.returnTypeError);
          } else if (issue.code === "invalid_arguments") {
            processError(issue.argumentsError);
          } else if (issue.path.length === 0) {
            fieldErrors._errors.push(mapper(issue));
          } else {
            let curr = fieldErrors;
            let i = 0;
            while (i < issue.path.length) {
              const el = issue.path[i];
              const terminal = i === issue.path.length - 1;
              if (!terminal) {
                curr[el] = curr[el] || { _errors: [] };
              } else {
                curr[el] = curr[el] || { _errors: [] };
                curr[el]._errors.push(mapper(issue));
              }
              curr = curr[el];
              i++;
            }
          }
        }
      };
      processError(this);
      return fieldErrors;
    }
    static assert(value) {
      if (!(value instanceof _ZodError)) {
        throw new Error(`Not a ZodError: ${value}`);
      }
    }
    toString() {
      return this.message;
    }
    get message() {
      return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
      return this.issues.length === 0;
    }
    flatten(mapper = (issue) => issue.message) {
      const fieldErrors = {};
      const formErrors = [];
      for (const sub of this.issues) {
        if (sub.path.length > 0) {
          const firstEl = sub.path[0];
          fieldErrors[firstEl] = fieldErrors[firstEl] || [];
          fieldErrors[firstEl].push(mapper(sub));
        } else {
          formErrors.push(mapper(sub));
        }
      }
      return { formErrors, fieldErrors };
    }
    get formErrors() {
      return this.flatten();
    }
  };
  ZodError.create = (issues) => {
    const error = new ZodError(issues);
    return error;
  };

  // server/node_modules/zod/v3/locales/en.js
  var errorMap = (issue, _ctx) => {
    let message;
    switch (issue.code) {
      case ZodIssueCode.invalid_type:
        if (issue.received === ZodParsedType.undefined) {
          message = "Required";
        } else {
          message = `Expected ${issue.expected}, received ${issue.received}`;
        }
        break;
      case ZodIssueCode.invalid_literal:
        message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
        break;
      case ZodIssueCode.unrecognized_keys:
        message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
        break;
      case ZodIssueCode.invalid_union:
        message = `Invalid input`;
        break;
      case ZodIssueCode.invalid_union_discriminator:
        message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
        break;
      case ZodIssueCode.invalid_enum_value:
        message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
        break;
      case ZodIssueCode.invalid_arguments:
        message = `Invalid function arguments`;
        break;
      case ZodIssueCode.invalid_return_type:
        message = `Invalid function return type`;
        break;
      case ZodIssueCode.invalid_date:
        message = `Invalid date`;
        break;
      case ZodIssueCode.invalid_string:
        if (typeof issue.validation === "object") {
          if ("includes" in issue.validation) {
            message = `Invalid input: must include "${issue.validation.includes}"`;
            if (typeof issue.validation.position === "number") {
              message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
            }
          } else if ("startsWith" in issue.validation) {
            message = `Invalid input: must start with "${issue.validation.startsWith}"`;
          } else if ("endsWith" in issue.validation) {
            message = `Invalid input: must end with "${issue.validation.endsWith}"`;
          } else {
            util.assertNever(issue.validation);
          }
        } else if (issue.validation !== "regex") {
          message = `Invalid ${issue.validation}`;
        } else {
          message = "Invalid";
        }
        break;
      case ZodIssueCode.too_small:
        if (issue.type === "array")
          message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
        else if (issue.type === "string")
          message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
        else if (issue.type === "number")
          message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
        else if (issue.type === "bigint")
          message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
        else if (issue.type === "date")
          message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
        else
          message = "Invalid input";
        break;
      case ZodIssueCode.too_big:
        if (issue.type === "array")
          message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
        else if (issue.type === "string")
          message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
        else if (issue.type === "number")
          message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
        else if (issue.type === "bigint")
          message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
        else if (issue.type === "date")
          message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
        else
          message = "Invalid input";
        break;
      case ZodIssueCode.custom:
        message = `Invalid input`;
        break;
      case ZodIssueCode.invalid_intersection_types:
        message = `Intersection results could not be merged`;
        break;
      case ZodIssueCode.not_multiple_of:
        message = `Number must be a multiple of ${issue.multipleOf}`;
        break;
      case ZodIssueCode.not_finite:
        message = "Number must be finite";
        break;
      default:
        message = _ctx.defaultError;
        util.assertNever(issue);
    }
    return { message };
  };
  var en_default = errorMap;

  // server/node_modules/zod/v3/errors.js
  var overrideErrorMap = en_default;
  function setErrorMap(map) {
    overrideErrorMap = map;
  }
  function getErrorMap() {
    return overrideErrorMap;
  }

  // server/node_modules/zod/v3/helpers/parseUtil.js
  var makeIssue = (params) => {
    const { data, path, errorMaps, issueData } = params;
    const fullPath = [...path, ...issueData.path || []];
    const fullIssue = {
      ...issueData,
      path: fullPath
    };
    if (issueData.message !== void 0) {
      return {
        ...issueData,
        path: fullPath,
        message: issueData.message
      };
    }
    let errorMessage = "";
    const maps = errorMaps.filter((m) => !!m).slice().reverse();
    for (const map of maps) {
      errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
    }
    return {
      ...issueData,
      path: fullPath,
      message: errorMessage
    };
  };
  var EMPTY_PATH = [];
  function addIssueToContext(ctx, issueData) {
    const overrideMap = getErrorMap();
    const issue = makeIssue({
      issueData,
      data: ctx.data,
      path: ctx.path,
      errorMaps: [
        ctx.common.contextualErrorMap,
        // contextual error map is first priority
        ctx.schemaErrorMap,
        // then schema-bound map if available
        overrideMap,
        // then global override map
        overrideMap === en_default ? void 0 : en_default
        // then global default map
      ].filter((x) => !!x)
    });
    ctx.common.issues.push(issue);
  }
  var ParseStatus = class _ParseStatus {
    constructor() {
      this.value = "valid";
    }
    dirty() {
      if (this.value === "valid")
        this.value = "dirty";
    }
    abort() {
      if (this.value !== "aborted")
        this.value = "aborted";
    }
    static mergeArray(status, results) {
      const arrayValue = [];
      for (const s of results) {
        if (s.status === "aborted")
          return INVALID;
        if (s.status === "dirty")
          status.dirty();
        arrayValue.push(s.value);
      }
      return { status: status.value, value: arrayValue };
    }
    static async mergeObjectAsync(status, pairs) {
      const syncPairs = [];
      for (const pair of pairs) {
        const key = await pair.key;
        const value = await pair.value;
        syncPairs.push({
          key,
          value
        });
      }
      return _ParseStatus.mergeObjectSync(status, syncPairs);
    }
    static mergeObjectSync(status, pairs) {
      const finalObject = {};
      for (const pair of pairs) {
        const { key, value } = pair;
        if (key.status === "aborted")
          return INVALID;
        if (value.status === "aborted")
          return INVALID;
        if (key.status === "dirty")
          status.dirty();
        if (value.status === "dirty")
          status.dirty();
        if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
          finalObject[key.value] = value.value;
        }
      }
      return { status: status.value, value: finalObject };
    }
  };
  var INVALID = Object.freeze({
    status: "aborted"
  });
  var DIRTY = (value) => ({ status: "dirty", value });
  var OK = (value) => ({ status: "valid", value });
  var isAborted = (x) => x.status === "aborted";
  var isDirty = (x) => x.status === "dirty";
  var isValid = (x) => x.status === "valid";
  var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

  // server/node_modules/zod/v3/helpers/errorUtil.js
  var errorUtil;
  (function(errorUtil2) {
    errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
    errorUtil2.toString = (message) => typeof message === "string" ? message : message == null ? void 0 : message.message;
  })(errorUtil || (errorUtil = {}));

  // server/node_modules/zod/v3/types.js
  var ParseInputLazyPath = class {
    constructor(parent, value, path, key) {
      this._cachedPath = [];
      this.parent = parent;
      this.data = value;
      this._path = path;
      this._key = key;
    }
    get path() {
      if (!this._cachedPath.length) {
        if (Array.isArray(this._key)) {
          this._cachedPath.push(...this._path, ...this._key);
        } else {
          this._cachedPath.push(...this._path, this._key);
        }
      }
      return this._cachedPath;
    }
  };
  var handleResult = (ctx, result) => {
    if (isValid(result)) {
      return { success: true, data: result.value };
    } else {
      if (!ctx.common.issues.length) {
        throw new Error("Validation failed but no issues detected.");
      }
      return {
        success: false,
        get error() {
          if (this._error)
            return this._error;
          const error = new ZodError(ctx.common.issues);
          this._error = error;
          return this._error;
        }
      };
    }
  };
  function processCreateParams(params) {
    if (!params)
      return {};
    const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
    if (errorMap2 && (invalid_type_error || required_error)) {
      throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap2)
      return { errorMap: errorMap2, description };
    const customMap = (iss, ctx) => {
      var _a, _b;
      const { message } = params;
      if (iss.code === "invalid_enum_value") {
        return { message: message != null ? message : ctx.defaultError };
      }
      if (typeof ctx.data === "undefined") {
        return { message: (_a = message != null ? message : required_error) != null ? _a : ctx.defaultError };
      }
      if (iss.code !== "invalid_type")
        return { message: ctx.defaultError };
      return { message: (_b = message != null ? message : invalid_type_error) != null ? _b : ctx.defaultError };
    };
    return { errorMap: customMap, description };
  }
  var ZodType = class {
    get description() {
      return this._def.description;
    }
    _getType(input) {
      return getParsedType(input.data);
    }
    _getOrReturnCtx(input, ctx) {
      return ctx || {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      };
    }
    _processInputParams(input) {
      return {
        status: new ParseStatus(),
        ctx: {
          common: input.parent.common,
          data: input.data,
          parsedType: getParsedType(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        }
      };
    }
    _parseSync(input) {
      const result = this._parse(input);
      if (isAsync(result)) {
        throw new Error("Synchronous parse encountered promise.");
      }
      return result;
    }
    _parseAsync(input) {
      const result = this._parse(input);
      return Promise.resolve(result);
    }
    parse(data, params) {
      const result = this.safeParse(data, params);
      if (result.success)
        return result.data;
      throw result.error;
    }
    safeParse(data, params) {
      var _a;
      const ctx = {
        common: {
          issues: [],
          async: (_a = params == null ? void 0 : params.async) != null ? _a : false,
          contextualErrorMap: params == null ? void 0 : params.errorMap
        },
        path: (params == null ? void 0 : params.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data,
        parsedType: getParsedType(data)
      };
      const result = this._parseSync({ data, path: ctx.path, parent: ctx });
      return handleResult(ctx, result);
    }
    "~validate"(data) {
      var _a, _b;
      const ctx = {
        common: {
          issues: [],
          async: !!this["~standard"].async
        },
        path: [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data,
        parsedType: getParsedType(data)
      };
      if (!this["~standard"].async) {
        try {
          const result = this._parseSync({ data, path: [], parent: ctx });
          return isValid(result) ? {
            value: result.value
          } : {
            issues: ctx.common.issues
          };
        } catch (err) {
          if ((_b = (_a = err == null ? void 0 : err.message) == null ? void 0 : _a.toLowerCase()) == null ? void 0 : _b.includes("encountered")) {
            this["~standard"].async = true;
          }
          ctx.common = {
            issues: [],
            async: true
          };
        }
      }
      return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
        value: result.value
      } : {
        issues: ctx.common.issues
      });
    }
    async parseAsync(data, params) {
      const result = await this.safeParseAsync(data, params);
      if (result.success)
        return result.data;
      throw result.error;
    }
    async safeParseAsync(data, params) {
      const ctx = {
        common: {
          issues: [],
          contextualErrorMap: params == null ? void 0 : params.errorMap,
          async: true
        },
        path: (params == null ? void 0 : params.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data,
        parsedType: getParsedType(data)
      };
      const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
      const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
      return handleResult(ctx, result);
    }
    refine(check, message) {
      const getIssueProperties = (val) => {
        if (typeof message === "string" || typeof message === "undefined") {
          return { message };
        } else if (typeof message === "function") {
          return message(val);
        } else {
          return message;
        }
      };
      return this._refinement((val, ctx) => {
        const result = check(val);
        const setError = () => ctx.addIssue({
          code: ZodIssueCode.custom,
          ...getIssueProperties(val)
        });
        if (typeof Promise !== "undefined" && result instanceof Promise) {
          return result.then((data) => {
            if (!data) {
              setError();
              return false;
            } else {
              return true;
            }
          });
        }
        if (!result) {
          setError();
          return false;
        } else {
          return true;
        }
      });
    }
    refinement(check, refinementData) {
      return this._refinement((val, ctx) => {
        if (!check(val)) {
          ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
          return false;
        } else {
          return true;
        }
      });
    }
    _refinement(refinement) {
      return new ZodEffects({
        schema: this,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: { type: "refinement", refinement }
      });
    }
    superRefine(refinement) {
      return this._refinement(refinement);
    }
    constructor(def) {
      this.spa = this.safeParseAsync;
      this._def = def;
      this.parse = this.parse.bind(this);
      this.safeParse = this.safeParse.bind(this);
      this.parseAsync = this.parseAsync.bind(this);
      this.safeParseAsync = this.safeParseAsync.bind(this);
      this.spa = this.spa.bind(this);
      this.refine = this.refine.bind(this);
      this.refinement = this.refinement.bind(this);
      this.superRefine = this.superRefine.bind(this);
      this.optional = this.optional.bind(this);
      this.nullable = this.nullable.bind(this);
      this.nullish = this.nullish.bind(this);
      this.array = this.array.bind(this);
      this.promise = this.promise.bind(this);
      this.or = this.or.bind(this);
      this.and = this.and.bind(this);
      this.transform = this.transform.bind(this);
      this.brand = this.brand.bind(this);
      this.default = this.default.bind(this);
      this.catch = this.catch.bind(this);
      this.describe = this.describe.bind(this);
      this.pipe = this.pipe.bind(this);
      this.readonly = this.readonly.bind(this);
      this.isNullable = this.isNullable.bind(this);
      this.isOptional = this.isOptional.bind(this);
      this["~standard"] = {
        version: 1,
        vendor: "zod",
        validate: (data) => this["~validate"](data)
      };
    }
    optional() {
      return ZodOptional.create(this, this._def);
    }
    nullable() {
      return ZodNullable.create(this, this._def);
    }
    nullish() {
      return this.nullable().optional();
    }
    array() {
      return ZodArray.create(this);
    }
    promise() {
      return ZodPromise.create(this, this._def);
    }
    or(option) {
      return ZodUnion.create([this, option], this._def);
    }
    and(incoming) {
      return ZodIntersection.create(this, incoming, this._def);
    }
    transform(transform) {
      return new ZodEffects({
        ...processCreateParams(this._def),
        schema: this,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: { type: "transform", transform }
      });
    }
    default(def) {
      const defaultValueFunc = typeof def === "function" ? def : () => def;
      return new ZodDefault({
        ...processCreateParams(this._def),
        innerType: this,
        defaultValue: defaultValueFunc,
        typeName: ZodFirstPartyTypeKind.ZodDefault
      });
    }
    brand() {
      return new ZodBranded({
        typeName: ZodFirstPartyTypeKind.ZodBranded,
        type: this,
        ...processCreateParams(this._def)
      });
    }
    catch(def) {
      const catchValueFunc = typeof def === "function" ? def : () => def;
      return new ZodCatch({
        ...processCreateParams(this._def),
        innerType: this,
        catchValue: catchValueFunc,
        typeName: ZodFirstPartyTypeKind.ZodCatch
      });
    }
    describe(description) {
      const This = this.constructor;
      return new This({
        ...this._def,
        description
      });
    }
    pipe(target) {
      return ZodPipeline.create(this, target);
    }
    readonly() {
      return ZodReadonly.create(this);
    }
    isOptional() {
      return this.safeParse(void 0).success;
    }
    isNullable() {
      return this.safeParse(null).success;
    }
  };
  var cuidRegex = /^c[^\s-]{8,}$/i;
  var cuid2Regex = /^[0-9a-z]+$/;
  var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
  var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
  var nanoidRegex = /^[a-z0-9_-]{21}$/i;
  var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
  var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
  var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
  var emojiRegex;
  var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
  var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
  var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
  var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
  var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
  var dateRegex = new RegExp(`^${dateRegexSource}$`);
  function timeRegexSource(args) {
    let secondsRegexSource = `[0-5]\\d`;
    if (args.precision) {
      secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
    } else if (args.precision == null) {
      secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
    }
    const secondsQuantifier = args.precision ? "+" : "?";
    return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
  }
  function timeRegex(args) {
    return new RegExp(`^${timeRegexSource(args)}$`);
  }
  function datetimeRegex(args) {
    let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
    const opts = [];
    opts.push(args.local ? `Z?` : `Z`);
    if (args.offset)
      opts.push(`([+-]\\d{2}:?\\d{2})`);
    regex = `${regex}(${opts.join("|")})`;
    return new RegExp(`^${regex}$`);
  }
  function isValidIP(ip, version) {
    if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
      return true;
    }
    if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
      return true;
    }
    return false;
  }
  function isValidJWT(jwt, alg) {
    if (!jwtRegex.test(jwt))
      return false;
    try {
      const [header] = jwt.split(".");
      if (!header)
        return false;
      const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
      const decoded = JSON.parse(atob(base64));
      if (typeof decoded !== "object" || decoded === null)
        return false;
      if ("typ" in decoded && (decoded == null ? void 0 : decoded.typ) !== "JWT")
        return false;
      if (!decoded.alg)
        return false;
      if (alg && decoded.alg !== alg)
        return false;
      return true;
    } catch {
      return false;
    }
  }
  function isValidCidr(ip, version) {
    if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
      return true;
    }
    if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
      return true;
    }
    return false;
  }
  var ZodString = class _ZodString extends ZodType {
    _parse(input) {
      if (this._def.coerce) {
        input.data = String(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.string) {
        const ctx2 = this._getOrReturnCtx(input);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.string,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      const status = new ParseStatus();
      let ctx = void 0;
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          if (input.data.length < check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          if (input.data.length > check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "length") {
          const tooBig = input.data.length > check.value;
          const tooSmall = input.data.length < check.value;
          if (tooBig || tooSmall) {
            ctx = this._getOrReturnCtx(input, ctx);
            if (tooBig) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: true,
                message: check.message
              });
            } else if (tooSmall) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: true,
                message: check.message
              });
            }
            status.dirty();
          }
        } else if (check.kind === "email") {
          if (!emailRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "email",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "emoji") {
          if (!emojiRegex) {
            emojiRegex = new RegExp(_emojiRegex, "u");
          }
          if (!emojiRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "emoji",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "uuid") {
          if (!uuidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "uuid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "nanoid") {
          if (!nanoidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "nanoid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cuid") {
          if (!cuidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "cuid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cuid2") {
          if (!cuid2Regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "cuid2",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "ulid") {
          if (!ulidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "ulid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "url") {
          try {
            new URL(input.data);
          } catch {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "url",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "regex") {
          check.regex.lastIndex = 0;
          const testResult = check.regex.test(input.data);
          if (!testResult) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "regex",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "trim") {
          input.data = input.data.trim();
        } else if (check.kind === "includes") {
          if (!input.data.includes(check.value, check.position)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: { includes: check.value, position: check.position },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "toLowerCase") {
          input.data = input.data.toLowerCase();
        } else if (check.kind === "toUpperCase") {
          input.data = input.data.toUpperCase();
        } else if (check.kind === "startsWith") {
          if (!input.data.startsWith(check.value)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: { startsWith: check.value },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "endsWith") {
          if (!input.data.endsWith(check.value)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: { endsWith: check.value },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "datetime") {
          const regex = datetimeRegex(check);
          if (!regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: "datetime",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "date") {
          const regex = dateRegex;
          if (!regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: "date",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "time") {
          const regex = timeRegex(check);
          if (!regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: "time",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "duration") {
          if (!durationRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "duration",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "ip") {
          if (!isValidIP(input.data, check.version)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "ip",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "jwt") {
          if (!isValidJWT(input.data, check.alg)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "jwt",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cidr") {
          if (!isValidCidr(input.data, check.version)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "cidr",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "base64") {
          if (!base64Regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "base64",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "base64url") {
          if (!base64urlRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "base64url",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else {
          util.assertNever(check);
        }
      }
      return { status: status.value, value: input.data };
    }
    _regex(regex, validation, message) {
      return this.refinement((data) => regex.test(data), {
        validation,
        code: ZodIssueCode.invalid_string,
        ...errorUtil.errToObj(message)
      });
    }
    _addCheck(check) {
      return new _ZodString({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    email(message) {
      return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
    }
    url(message) {
      return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
    }
    emoji(message) {
      return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
    }
    uuid(message) {
      return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
    }
    nanoid(message) {
      return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
    }
    cuid(message) {
      return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
    }
    cuid2(message) {
      return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
    }
    ulid(message) {
      return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
    }
    base64(message) {
      return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
    }
    base64url(message) {
      return this._addCheck({
        kind: "base64url",
        ...errorUtil.errToObj(message)
      });
    }
    jwt(options) {
      return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
    }
    ip(options) {
      return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
    }
    cidr(options) {
      return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
    }
    datetime(options) {
      var _a, _b;
      if (typeof options === "string") {
        return this._addCheck({
          kind: "datetime",
          precision: null,
          offset: false,
          local: false,
          message: options
        });
      }
      return this._addCheck({
        kind: "datetime",
        precision: typeof (options == null ? void 0 : options.precision) === "undefined" ? null : options == null ? void 0 : options.precision,
        offset: (_a = options == null ? void 0 : options.offset) != null ? _a : false,
        local: (_b = options == null ? void 0 : options.local) != null ? _b : false,
        ...errorUtil.errToObj(options == null ? void 0 : options.message)
      });
    }
    date(message) {
      return this._addCheck({ kind: "date", message });
    }
    time(options) {
      if (typeof options === "string") {
        return this._addCheck({
          kind: "time",
          precision: null,
          message: options
        });
      }
      return this._addCheck({
        kind: "time",
        precision: typeof (options == null ? void 0 : options.precision) === "undefined" ? null : options == null ? void 0 : options.precision,
        ...errorUtil.errToObj(options == null ? void 0 : options.message)
      });
    }
    duration(message) {
      return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
    }
    regex(regex, message) {
      return this._addCheck({
        kind: "regex",
        regex,
        ...errorUtil.errToObj(message)
      });
    }
    includes(value, options) {
      return this._addCheck({
        kind: "includes",
        value,
        position: options == null ? void 0 : options.position,
        ...errorUtil.errToObj(options == null ? void 0 : options.message)
      });
    }
    startsWith(value, message) {
      return this._addCheck({
        kind: "startsWith",
        value,
        ...errorUtil.errToObj(message)
      });
    }
    endsWith(value, message) {
      return this._addCheck({
        kind: "endsWith",
        value,
        ...errorUtil.errToObj(message)
      });
    }
    min(minLength, message) {
      return this._addCheck({
        kind: "min",
        value: minLength,
        ...errorUtil.errToObj(message)
      });
    }
    max(maxLength, message) {
      return this._addCheck({
        kind: "max",
        value: maxLength,
        ...errorUtil.errToObj(message)
      });
    }
    length(len, message) {
      return this._addCheck({
        kind: "length",
        value: len,
        ...errorUtil.errToObj(message)
      });
    }
    /**
     * Equivalent to `.min(1)`
     */
    nonempty(message) {
      return this.min(1, errorUtil.errToObj(message));
    }
    trim() {
      return new _ZodString({
        ...this._def,
        checks: [...this._def.checks, { kind: "trim" }]
      });
    }
    toLowerCase() {
      return new _ZodString({
        ...this._def,
        checks: [...this._def.checks, { kind: "toLowerCase" }]
      });
    }
    toUpperCase() {
      return new _ZodString({
        ...this._def,
        checks: [...this._def.checks, { kind: "toUpperCase" }]
      });
    }
    get isDatetime() {
      return !!this._def.checks.find((ch) => ch.kind === "datetime");
    }
    get isDate() {
      return !!this._def.checks.find((ch) => ch.kind === "date");
    }
    get isTime() {
      return !!this._def.checks.find((ch) => ch.kind === "time");
    }
    get isDuration() {
      return !!this._def.checks.find((ch) => ch.kind === "duration");
    }
    get isEmail() {
      return !!this._def.checks.find((ch) => ch.kind === "email");
    }
    get isURL() {
      return !!this._def.checks.find((ch) => ch.kind === "url");
    }
    get isEmoji() {
      return !!this._def.checks.find((ch) => ch.kind === "emoji");
    }
    get isUUID() {
      return !!this._def.checks.find((ch) => ch.kind === "uuid");
    }
    get isNANOID() {
      return !!this._def.checks.find((ch) => ch.kind === "nanoid");
    }
    get isCUID() {
      return !!this._def.checks.find((ch) => ch.kind === "cuid");
    }
    get isCUID2() {
      return !!this._def.checks.find((ch) => ch.kind === "cuid2");
    }
    get isULID() {
      return !!this._def.checks.find((ch) => ch.kind === "ulid");
    }
    get isIP() {
      return !!this._def.checks.find((ch) => ch.kind === "ip");
    }
    get isCIDR() {
      return !!this._def.checks.find((ch) => ch.kind === "cidr");
    }
    get isBase64() {
      return !!this._def.checks.find((ch) => ch.kind === "base64");
    }
    get isBase64url() {
      return !!this._def.checks.find((ch) => ch.kind === "base64url");
    }
    get minLength() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxLength() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
  };
  ZodString.create = (params) => {
    var _a;
    return new ZodString({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodString,
      coerce: (_a = params == null ? void 0 : params.coerce) != null ? _a : false,
      ...processCreateParams(params)
    });
  };
  function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
    return valInt % stepInt / 10 ** decCount;
  }
  var ZodNumber = class _ZodNumber extends ZodType {
    constructor() {
      super(...arguments);
      this.min = this.gte;
      this.max = this.lte;
      this.step = this.multipleOf;
    }
    _parse(input) {
      if (this._def.coerce) {
        input.data = Number(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.number) {
        const ctx2 = this._getOrReturnCtx(input);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.number,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      let ctx = void 0;
      const status = new ParseStatus();
      for (const check of this._def.checks) {
        if (check.kind === "int") {
          if (!util.isInteger(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: "integer",
              received: "float",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "min") {
          const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
          if (tooSmall) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "number",
              inclusive: check.inclusive,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
          if (tooBig) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "number",
              inclusive: check.inclusive,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "multipleOf") {
          if (floatSafeRemainder(input.data, check.value) !== 0) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.not_multiple_of,
              multipleOf: check.value,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "finite") {
          if (!Number.isFinite(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.not_finite,
              message: check.message
            });
            status.dirty();
          }
        } else {
          util.assertNever(check);
        }
      }
      return { status: status.value, value: input.data };
    }
    gte(value, message) {
      return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
      return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
      return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
      return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
      return new _ZodNumber({
        ...this._def,
        checks: [
          ...this._def.checks,
          {
            kind,
            value,
            inclusive,
            message: errorUtil.toString(message)
          }
        ]
      });
    }
    _addCheck(check) {
      return new _ZodNumber({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    int(message) {
      return this._addCheck({
        kind: "int",
        message: errorUtil.toString(message)
      });
    }
    positive(message) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    negative(message) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    nonpositive(message) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    nonnegative(message) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    multipleOf(value, message) {
      return this._addCheck({
        kind: "multipleOf",
        value,
        message: errorUtil.toString(message)
      });
    }
    finite(message) {
      return this._addCheck({
        kind: "finite",
        message: errorUtil.toString(message)
      });
    }
    safe(message) {
      return this._addCheck({
        kind: "min",
        inclusive: true,
        value: Number.MIN_SAFE_INTEGER,
        message: errorUtil.toString(message)
      })._addCheck({
        kind: "max",
        inclusive: true,
        value: Number.MAX_SAFE_INTEGER,
        message: errorUtil.toString(message)
      });
    }
    get minValue() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxValue() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
    get isInt() {
      return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
    }
    get isFinite() {
      let max = null;
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
          return true;
        } else if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        } else if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return Number.isFinite(min) && Number.isFinite(max);
    }
  };
  ZodNumber.create = (params) => {
    return new ZodNumber({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodNumber,
      coerce: (params == null ? void 0 : params.coerce) || false,
      ...processCreateParams(params)
    });
  };
  var ZodBigInt = class _ZodBigInt extends ZodType {
    constructor() {
      super(...arguments);
      this.min = this.gte;
      this.max = this.lte;
    }
    _parse(input) {
      if (this._def.coerce) {
        try {
          input.data = BigInt(input.data);
        } catch {
          return this._getInvalidInput(input);
        }
      }
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.bigint) {
        return this._getInvalidInput(input);
      }
      let ctx = void 0;
      const status = new ParseStatus();
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
          if (tooSmall) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              type: "bigint",
              minimum: check.value,
              inclusive: check.inclusive,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
          if (tooBig) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              type: "bigint",
              maximum: check.value,
              inclusive: check.inclusive,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "multipleOf") {
          if (input.data % check.value !== BigInt(0)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.not_multiple_of,
              multipleOf: check.value,
              message: check.message
            });
            status.dirty();
          }
        } else {
          util.assertNever(check);
        }
      }
      return { status: status.value, value: input.data };
    }
    _getInvalidInput(input) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.bigint,
        received: ctx.parsedType
      });
      return INVALID;
    }
    gte(value, message) {
      return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
      return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
      return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
      return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
      return new _ZodBigInt({
        ...this._def,
        checks: [
          ...this._def.checks,
          {
            kind,
            value,
            inclusive,
            message: errorUtil.toString(message)
          }
        ]
      });
    }
    _addCheck(check) {
      return new _ZodBigInt({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    positive(message) {
      return this._addCheck({
        kind: "min",
        value: BigInt(0),
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    negative(message) {
      return this._addCheck({
        kind: "max",
        value: BigInt(0),
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    nonpositive(message) {
      return this._addCheck({
        kind: "max",
        value: BigInt(0),
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    nonnegative(message) {
      return this._addCheck({
        kind: "min",
        value: BigInt(0),
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    multipleOf(value, message) {
      return this._addCheck({
        kind: "multipleOf",
        value,
        message: errorUtil.toString(message)
      });
    }
    get minValue() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxValue() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
  };
  ZodBigInt.create = (params) => {
    var _a;
    return new ZodBigInt({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodBigInt,
      coerce: (_a = params == null ? void 0 : params.coerce) != null ? _a : false,
      ...processCreateParams(params)
    });
  };
  var ZodBoolean = class extends ZodType {
    _parse(input) {
      if (this._def.coerce) {
        input.data = Boolean(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.boolean) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.boolean,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  };
  ZodBoolean.create = (params) => {
    return new ZodBoolean({
      typeName: ZodFirstPartyTypeKind.ZodBoolean,
      coerce: (params == null ? void 0 : params.coerce) || false,
      ...processCreateParams(params)
    });
  };
  var ZodDate = class _ZodDate extends ZodType {
    _parse(input) {
      if (this._def.coerce) {
        input.data = new Date(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.date) {
        const ctx2 = this._getOrReturnCtx(input);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.date,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      if (Number.isNaN(input.data.getTime())) {
        const ctx2 = this._getOrReturnCtx(input);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_date
        });
        return INVALID;
      }
      const status = new ParseStatus();
      let ctx = void 0;
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          if (input.data.getTime() < check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              message: check.message,
              inclusive: true,
              exact: false,
              minimum: check.value,
              type: "date"
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          if (input.data.getTime() > check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              message: check.message,
              inclusive: true,
              exact: false,
              maximum: check.value,
              type: "date"
            });
            status.dirty();
          }
        } else {
          util.assertNever(check);
        }
      }
      return {
        status: status.value,
        value: new Date(input.data.getTime())
      };
    }
    _addCheck(check) {
      return new _ZodDate({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    min(minDate, message) {
      return this._addCheck({
        kind: "min",
        value: minDate.getTime(),
        message: errorUtil.toString(message)
      });
    }
    max(maxDate, message) {
      return this._addCheck({
        kind: "max",
        value: maxDate.getTime(),
        message: errorUtil.toString(message)
      });
    }
    get minDate() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min != null ? new Date(min) : null;
    }
    get maxDate() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max != null ? new Date(max) : null;
    }
  };
  ZodDate.create = (params) => {
    return new ZodDate({
      checks: [],
      coerce: (params == null ? void 0 : params.coerce) || false,
      typeName: ZodFirstPartyTypeKind.ZodDate,
      ...processCreateParams(params)
    });
  };
  var ZodSymbol = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.symbol) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.symbol,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  };
  ZodSymbol.create = (params) => {
    return new ZodSymbol({
      typeName: ZodFirstPartyTypeKind.ZodSymbol,
      ...processCreateParams(params)
    });
  };
  var ZodUndefined = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.undefined,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  };
  ZodUndefined.create = (params) => {
    return new ZodUndefined({
      typeName: ZodFirstPartyTypeKind.ZodUndefined,
      ...processCreateParams(params)
    });
  };
  var ZodNull = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.null) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.null,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  };
  ZodNull.create = (params) => {
    return new ZodNull({
      typeName: ZodFirstPartyTypeKind.ZodNull,
      ...processCreateParams(params)
    });
  };
  var ZodAny = class extends ZodType {
    constructor() {
      super(...arguments);
      this._any = true;
    }
    _parse(input) {
      return OK(input.data);
    }
  };
  ZodAny.create = (params) => {
    return new ZodAny({
      typeName: ZodFirstPartyTypeKind.ZodAny,
      ...processCreateParams(params)
    });
  };
  var ZodUnknown = class extends ZodType {
    constructor() {
      super(...arguments);
      this._unknown = true;
    }
    _parse(input) {
      return OK(input.data);
    }
  };
  ZodUnknown.create = (params) => {
    return new ZodUnknown({
      typeName: ZodFirstPartyTypeKind.ZodUnknown,
      ...processCreateParams(params)
    });
  };
  var ZodNever = class extends ZodType {
    _parse(input) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.never,
        received: ctx.parsedType
      });
      return INVALID;
    }
  };
  ZodNever.create = (params) => {
    return new ZodNever({
      typeName: ZodFirstPartyTypeKind.ZodNever,
      ...processCreateParams(params)
    });
  };
  var ZodVoid = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.void,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  };
  ZodVoid.create = (params) => {
    return new ZodVoid({
      typeName: ZodFirstPartyTypeKind.ZodVoid,
      ...processCreateParams(params)
    });
  };
  var ZodArray = class _ZodArray extends ZodType {
    _parse(input) {
      const { ctx, status } = this._processInputParams(input);
      const def = this._def;
      if (ctx.parsedType !== ZodParsedType.array) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: ctx.parsedType
        });
        return INVALID;
      }
      if (def.exactLength !== null) {
        const tooBig = ctx.data.length > def.exactLength.value;
        const tooSmall = ctx.data.length < def.exactLength.value;
        if (tooBig || tooSmall) {
          addIssueToContext(ctx, {
            code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
            minimum: tooSmall ? def.exactLength.value : void 0,
            maximum: tooBig ? def.exactLength.value : void 0,
            type: "array",
            inclusive: true,
            exact: true,
            message: def.exactLength.message
          });
          status.dirty();
        }
      }
      if (def.minLength !== null) {
        if (ctx.data.length < def.minLength.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: def.minLength.value,
            type: "array",
            inclusive: true,
            exact: false,
            message: def.minLength.message
          });
          status.dirty();
        }
      }
      if (def.maxLength !== null) {
        if (ctx.data.length > def.maxLength.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: def.maxLength.value,
            type: "array",
            inclusive: true,
            exact: false,
            message: def.maxLength.message
          });
          status.dirty();
        }
      }
      if (ctx.common.async) {
        return Promise.all([...ctx.data].map((item, i) => {
          return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        })).then((result2) => {
          return ParseStatus.mergeArray(status, result2);
        });
      }
      const result = [...ctx.data].map((item, i) => {
        return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      });
      return ParseStatus.mergeArray(status, result);
    }
    get element() {
      return this._def.type;
    }
    min(minLength, message) {
      return new _ZodArray({
        ...this._def,
        minLength: { value: minLength, message: errorUtil.toString(message) }
      });
    }
    max(maxLength, message) {
      return new _ZodArray({
        ...this._def,
        maxLength: { value: maxLength, message: errorUtil.toString(message) }
      });
    }
    length(len, message) {
      return new _ZodArray({
        ...this._def,
        exactLength: { value: len, message: errorUtil.toString(message) }
      });
    }
    nonempty(message) {
      return this.min(1, message);
    }
  };
  ZodArray.create = (schema, params) => {
    return new ZodArray({
      type: schema,
      minLength: null,
      maxLength: null,
      exactLength: null,
      typeName: ZodFirstPartyTypeKind.ZodArray,
      ...processCreateParams(params)
    });
  };
  function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
      const newShape = {};
      for (const key in schema.shape) {
        const fieldSchema = schema.shape[key];
        newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
      }
      return new ZodObject({
        ...schema._def,
        shape: () => newShape
      });
    } else if (schema instanceof ZodArray) {
      return new ZodArray({
        ...schema._def,
        type: deepPartialify(schema.element)
      });
    } else if (schema instanceof ZodOptional) {
      return ZodOptional.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodNullable) {
      return ZodNullable.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodTuple) {
      return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
    } else {
      return schema;
    }
  }
  var ZodObject = class _ZodObject extends ZodType {
    constructor() {
      super(...arguments);
      this._cached = null;
      this.nonstrict = this.passthrough;
      this.augment = this.extend;
    }
    _getCached() {
      if (this._cached !== null)
        return this._cached;
      const shape = this._def.shape();
      const keys = util.objectKeys(shape);
      this._cached = { shape, keys };
      return this._cached;
    }
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.object) {
        const ctx2 = this._getOrReturnCtx(input);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      const { status, ctx } = this._processInputParams(input);
      const { shape, keys: shapeKeys } = this._getCached();
      const extraKeys = [];
      if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
        for (const key in ctx.data) {
          if (!shapeKeys.includes(key)) {
            extraKeys.push(key);
          }
        }
      }
      const pairs = [];
      for (const key of shapeKeys) {
        const keyValidator = shape[key];
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
      if (this._def.catchall instanceof ZodNever) {
        const unknownKeys = this._def.unknownKeys;
        if (unknownKeys === "passthrough") {
          for (const key of extraKeys) {
            pairs.push({
              key: { status: "valid", value: key },
              value: { status: "valid", value: ctx.data[key] }
            });
          }
        } else if (unknownKeys === "strict") {
          if (extraKeys.length > 0) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.unrecognized_keys,
              keys: extraKeys
            });
            status.dirty();
          }
        } else if (unknownKeys === "strip") {
        } else {
          throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
        }
      } else {
        const catchall = this._def.catchall;
        for (const key of extraKeys) {
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: catchall._parse(
              new ParseInputLazyPath(ctx, value, ctx.path, key)
              //, ctx.child(key), value, getParsedType(value)
            ),
            alwaysSet: key in ctx.data
          });
        }
      }
      if (ctx.common.async) {
        return Promise.resolve().then(async () => {
          const syncPairs = [];
          for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            syncPairs.push({
              key,
              value,
              alwaysSet: pair.alwaysSet
            });
          }
          return syncPairs;
        }).then((syncPairs) => {
          return ParseStatus.mergeObjectSync(status, syncPairs);
        });
      } else {
        return ParseStatus.mergeObjectSync(status, pairs);
      }
    }
    get shape() {
      return this._def.shape();
    }
    strict(message) {
      errorUtil.errToObj;
      return new _ZodObject({
        ...this._def,
        unknownKeys: "strict",
        ...message !== void 0 ? {
          errorMap: (issue, ctx) => {
            var _a, _b, _c, _d;
            const defaultError = (_c = (_b = (_a = this._def).errorMap) == null ? void 0 : _b.call(_a, issue, ctx).message) != null ? _c : ctx.defaultError;
            if (issue.code === "unrecognized_keys")
              return {
                message: (_d = errorUtil.errToObj(message).message) != null ? _d : defaultError
              };
            return {
              message: defaultError
            };
          }
        } : {}
      });
    }
    strip() {
      return new _ZodObject({
        ...this._def,
        unknownKeys: "strip"
      });
    }
    passthrough() {
      return new _ZodObject({
        ...this._def,
        unknownKeys: "passthrough"
      });
    }
    // const AugmentFactory =
    //   <Def extends ZodObjectDef>(def: Def) =>
    //   <Augmentation extends ZodRawShape>(
    //     augmentation: Augmentation
    //   ): ZodObject<
    //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
    //     Def["unknownKeys"],
    //     Def["catchall"]
    //   > => {
    //     return new ZodObject({
    //       ...def,
    //       shape: () => ({
    //         ...def.shape(),
    //         ...augmentation,
    //       }),
    //     }) as any;
    //   };
    extend(augmentation) {
      return new _ZodObject({
        ...this._def,
        shape: () => ({
          ...this._def.shape(),
          ...augmentation
        })
      });
    }
    /**
     * Prior to zod@1.0.12 there was a bug in the
     * inferred type of merged objects. Please
     * upgrade if you are experiencing issues.
     */
    merge(merging) {
      const merged = new _ZodObject({
        unknownKeys: merging._def.unknownKeys,
        catchall: merging._def.catchall,
        shape: () => ({
          ...this._def.shape(),
          ...merging._def.shape()
        }),
        typeName: ZodFirstPartyTypeKind.ZodObject
      });
      return merged;
    }
    // merge<
    //   Incoming extends AnyZodObject,
    //   Augmentation extends Incoming["shape"],
    //   NewOutput extends {
    //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
    //       ? Augmentation[k]["_output"]
    //       : k extends keyof Output
    //       ? Output[k]
    //       : never;
    //   },
    //   NewInput extends {
    //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
    //       ? Augmentation[k]["_input"]
    //       : k extends keyof Input
    //       ? Input[k]
    //       : never;
    //   }
    // >(
    //   merging: Incoming
    // ): ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"],
    //   NewOutput,
    //   NewInput
    // > {
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    setKey(key, schema) {
      return this.augment({ [key]: schema });
    }
    // merge<Incoming extends AnyZodObject>(
    //   merging: Incoming
    // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
    // ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"]
    // > {
    //   // const mergedShape = objectUtil.mergeShapes(
    //   //   this._def.shape(),
    //   //   merging._def.shape()
    //   // );
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    catchall(index) {
      return new _ZodObject({
        ...this._def,
        catchall: index
      });
    }
    pick(mask) {
      const shape = {};
      for (const key of util.objectKeys(mask)) {
        if (mask[key] && this.shape[key]) {
          shape[key] = this.shape[key];
        }
      }
      return new _ZodObject({
        ...this._def,
        shape: () => shape
      });
    }
    omit(mask) {
      const shape = {};
      for (const key of util.objectKeys(this.shape)) {
        if (!mask[key]) {
          shape[key] = this.shape[key];
        }
      }
      return new _ZodObject({
        ...this._def,
        shape: () => shape
      });
    }
    /**
     * @deprecated
     */
    deepPartial() {
      return deepPartialify(this);
    }
    partial(mask) {
      const newShape = {};
      for (const key of util.objectKeys(this.shape)) {
        const fieldSchema = this.shape[key];
        if (mask && !mask[key]) {
          newShape[key] = fieldSchema;
        } else {
          newShape[key] = fieldSchema.optional();
        }
      }
      return new _ZodObject({
        ...this._def,
        shape: () => newShape
      });
    }
    required(mask) {
      const newShape = {};
      for (const key of util.objectKeys(this.shape)) {
        if (mask && !mask[key]) {
          newShape[key] = this.shape[key];
        } else {
          const fieldSchema = this.shape[key];
          let newField = fieldSchema;
          while (newField instanceof ZodOptional) {
            newField = newField._def.innerType;
          }
          newShape[key] = newField;
        }
      }
      return new _ZodObject({
        ...this._def,
        shape: () => newShape
      });
    }
    keyof() {
      return createZodEnum(util.objectKeys(this.shape));
    }
  };
  ZodObject.create = (shape, params) => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  ZodObject.strictCreate = (shape, params) => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strict",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  ZodObject.lazycreate = (shape, params) => {
    return new ZodObject({
      shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  var ZodUnion = class extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      const options = this._def.options;
      function handleResults(results) {
        for (const result of results) {
          if (result.result.status === "valid") {
            return result.result;
          }
        }
        for (const result of results) {
          if (result.result.status === "dirty") {
            ctx.common.issues.push(...result.ctx.common.issues);
            return result.result;
          }
        }
        const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union,
          unionErrors
        });
        return INVALID;
      }
      if (ctx.common.async) {
        return Promise.all(options.map(async (option) => {
          const childCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            },
            parent: null
          };
          return {
            result: await option._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            }),
            ctx: childCtx
          };
        })).then(handleResults);
      } else {
        let dirty = void 0;
        const issues = [];
        for (const option of options) {
          const childCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            },
            parent: null
          };
          const result = option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          });
          if (result.status === "valid") {
            return result;
          } else if (result.status === "dirty" && !dirty) {
            dirty = { result, ctx: childCtx };
          }
          if (childCtx.common.issues.length) {
            issues.push(childCtx.common.issues);
          }
        }
        if (dirty) {
          ctx.common.issues.push(...dirty.ctx.common.issues);
          return dirty.result;
        }
        const unionErrors = issues.map((issues2) => new ZodError(issues2));
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union,
          unionErrors
        });
        return INVALID;
      }
    }
    get options() {
      return this._def.options;
    }
  };
  ZodUnion.create = (types, params) => {
    return new ZodUnion({
      options: types,
      typeName: ZodFirstPartyTypeKind.ZodUnion,
      ...processCreateParams(params)
    });
  };
  var getDiscriminator = (type) => {
    if (type instanceof ZodLazy) {
      return getDiscriminator(type.schema);
    } else if (type instanceof ZodEffects) {
      return getDiscriminator(type.innerType());
    } else if (type instanceof ZodLiteral) {
      return [type.value];
    } else if (type instanceof ZodEnum) {
      return type.options;
    } else if (type instanceof ZodNativeEnum) {
      return util.objectValues(type.enum);
    } else if (type instanceof ZodDefault) {
      return getDiscriminator(type._def.innerType);
    } else if (type instanceof ZodUndefined) {
      return [void 0];
    } else if (type instanceof ZodNull) {
      return [null];
    } else if (type instanceof ZodOptional) {
      return [void 0, ...getDiscriminator(type.unwrap())];
    } else if (type instanceof ZodNullable) {
      return [null, ...getDiscriminator(type.unwrap())];
    } else if (type instanceof ZodBranded) {
      return getDiscriminator(type.unwrap());
    } else if (type instanceof ZodReadonly) {
      return getDiscriminator(type.unwrap());
    } else if (type instanceof ZodCatch) {
      return getDiscriminator(type._def.innerType);
    } else {
      return [];
    }
  };
  var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.object) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const discriminator = this.discriminator;
      const discriminatorValue = ctx.data[discriminator];
      const option = this.optionsMap.get(discriminatorValue);
      if (!option) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union_discriminator,
          options: Array.from(this.optionsMap.keys()),
          path: [discriminator]
        });
        return INVALID;
      }
      if (ctx.common.async) {
        return option._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
      } else {
        return option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
      }
    }
    get discriminator() {
      return this._def.discriminator;
    }
    get options() {
      return this._def.options;
    }
    get optionsMap() {
      return this._def.optionsMap;
    }
    /**
     * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
     * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
     * have a different value for each object in the union.
     * @param discriminator the name of the discriminator property
     * @param types an array of object schemas
     * @param params
     */
    static create(discriminator, options, params) {
      const optionsMap = /* @__PURE__ */ new Map();
      for (const type of options) {
        const discriminatorValues = getDiscriminator(type.shape[discriminator]);
        if (!discriminatorValues.length) {
          throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
        }
        for (const value of discriminatorValues) {
          if (optionsMap.has(value)) {
            throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
          }
          optionsMap.set(value, type);
        }
      }
      return new _ZodDiscriminatedUnion({
        typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
        discriminator,
        options,
        optionsMap,
        ...processCreateParams(params)
      });
    }
  };
  function mergeValues(a, b) {
    const aType = getParsedType(a);
    const bType = getParsedType(b);
    if (a === b) {
      return { valid: true, data: a };
    } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
      const bKeys = util.objectKeys(b);
      const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
      const newObj = { ...a, ...b };
      for (const key of sharedKeys) {
        const sharedValue = mergeValues(a[key], b[key]);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newObj[key] = sharedValue.data;
      }
      return { valid: true, data: newObj };
    } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
      if (a.length !== b.length) {
        return { valid: false };
      }
      const newArray = [];
      for (let index = 0; index < a.length; index++) {
        const itemA = a[index];
        const itemB = b[index];
        const sharedValue = mergeValues(itemA, itemB);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newArray.push(sharedValue.data);
      }
      return { valid: true, data: newArray };
    } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
      return { valid: true, data: a };
    } else {
      return { valid: false };
    }
  }
  var ZodIntersection = class extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      const handleParsed = (parsedLeft, parsedRight) => {
        if (isAborted(parsedLeft) || isAborted(parsedRight)) {
          return INVALID;
        }
        const merged = mergeValues(parsedLeft.value, parsedRight.value);
        if (!merged.valid) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_intersection_types
          });
          return INVALID;
        }
        if (isDirty(parsedLeft) || isDirty(parsedRight)) {
          status.dirty();
        }
        return { status: status.value, value: merged.data };
      };
      if (ctx.common.async) {
        return Promise.all([
          this._def.left._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }),
          this._def.right._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          })
        ]).then(([left, right]) => handleParsed(left, right));
      } else {
        return handleParsed(this._def.left._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }), this._def.right._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }));
      }
    }
  };
  ZodIntersection.create = (left, right, params) => {
    return new ZodIntersection({
      left,
      right,
      typeName: ZodFirstPartyTypeKind.ZodIntersection,
      ...processCreateParams(params)
    });
  };
  var ZodTuple = class _ZodTuple extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.array) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: ctx.parsedType
        });
        return INVALID;
      }
      if (ctx.data.length < this._def.items.length) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: this._def.items.length,
          inclusive: true,
          exact: false,
          type: "array"
        });
        return INVALID;
      }
      const rest = this._def.rest;
      if (!rest && ctx.data.length > this._def.items.length) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: this._def.items.length,
          inclusive: true,
          exact: false,
          type: "array"
        });
        status.dirty();
      }
      const items = [...ctx.data].map((item, itemIndex) => {
        const schema = this._def.items[itemIndex] || this._def.rest;
        if (!schema)
          return null;
        return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
      }).filter((x) => !!x);
      if (ctx.common.async) {
        return Promise.all(items).then((results) => {
          return ParseStatus.mergeArray(status, results);
        });
      } else {
        return ParseStatus.mergeArray(status, items);
      }
    }
    get items() {
      return this._def.items;
    }
    rest(rest) {
      return new _ZodTuple({
        ...this._def,
        rest
      });
    }
  };
  ZodTuple.create = (schemas, params) => {
    if (!Array.isArray(schemas)) {
      throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new ZodTuple({
      items: schemas,
      typeName: ZodFirstPartyTypeKind.ZodTuple,
      rest: null,
      ...processCreateParams(params)
    });
  };
  var ZodRecord = class _ZodRecord extends ZodType {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.object) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const pairs = [];
      const keyType = this._def.keyType;
      const valueType = this._def.valueType;
      for (const key in ctx.data) {
        pairs.push({
          key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
          value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
      if (ctx.common.async) {
        return ParseStatus.mergeObjectAsync(status, pairs);
      } else {
        return ParseStatus.mergeObjectSync(status, pairs);
      }
    }
    get element() {
      return this._def.valueType;
    }
    static create(first, second, third) {
      if (second instanceof ZodType) {
        return new _ZodRecord({
          keyType: first,
          valueType: second,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(third)
        });
      }
      return new _ZodRecord({
        keyType: ZodString.create(),
        valueType: first,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(second)
      });
    }
  };
  var ZodMap = class extends ZodType {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.map) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.map,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const keyType = this._def.keyType;
      const valueType = this._def.valueType;
      const pairs = [...ctx.data.entries()].map(([key, value], index) => {
        return {
          key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
          value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
        };
      });
      if (ctx.common.async) {
        const finalMap = /* @__PURE__ */ new Map();
        return Promise.resolve().then(async () => {
          for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        });
      } else {
        const finalMap = /* @__PURE__ */ new Map();
        for (const pair of pairs) {
          const key = pair.key;
          const value = pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      }
    }
  };
  ZodMap.create = (keyType, valueType, params) => {
    return new ZodMap({
      valueType,
      keyType,
      typeName: ZodFirstPartyTypeKind.ZodMap,
      ...processCreateParams(params)
    });
  };
  var ZodSet = class _ZodSet extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.set) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.set,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const def = this._def;
      if (def.minSize !== null) {
        if (ctx.data.size < def.minSize.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: def.minSize.value,
            type: "set",
            inclusive: true,
            exact: false,
            message: def.minSize.message
          });
          status.dirty();
        }
      }
      if (def.maxSize !== null) {
        if (ctx.data.size > def.maxSize.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: def.maxSize.value,
            type: "set",
            inclusive: true,
            exact: false,
            message: def.maxSize.message
          });
          status.dirty();
        }
      }
      const valueType = this._def.valueType;
      function finalizeSet(elements2) {
        const parsedSet = /* @__PURE__ */ new Set();
        for (const element of elements2) {
          if (element.status === "aborted")
            return INVALID;
          if (element.status === "dirty")
            status.dirty();
          parsedSet.add(element.value);
        }
        return { status: status.value, value: parsedSet };
      }
      const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
      if (ctx.common.async) {
        return Promise.all(elements).then((elements2) => finalizeSet(elements2));
      } else {
        return finalizeSet(elements);
      }
    }
    min(minSize, message) {
      return new _ZodSet({
        ...this._def,
        minSize: { value: minSize, message: errorUtil.toString(message) }
      });
    }
    max(maxSize, message) {
      return new _ZodSet({
        ...this._def,
        maxSize: { value: maxSize, message: errorUtil.toString(message) }
      });
    }
    size(size, message) {
      return this.min(size, message).max(size, message);
    }
    nonempty(message) {
      return this.min(1, message);
    }
  };
  ZodSet.create = (valueType, params) => {
    return new ZodSet({
      valueType,
      minSize: null,
      maxSize: null,
      typeName: ZodFirstPartyTypeKind.ZodSet,
      ...processCreateParams(params)
    });
  };
  var ZodFunction = class _ZodFunction extends ZodType {
    constructor() {
      super(...arguments);
      this.validate = this.implement;
    }
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.function) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.function,
          received: ctx.parsedType
        });
        return INVALID;
      }
      function makeArgsIssue(args, error) {
        return makeIssue({
          data: args,
          path: ctx.path,
          errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
          issueData: {
            code: ZodIssueCode.invalid_arguments,
            argumentsError: error
          }
        });
      }
      function makeReturnsIssue(returns, error) {
        return makeIssue({
          data: returns,
          path: ctx.path,
          errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
          issueData: {
            code: ZodIssueCode.invalid_return_type,
            returnTypeError: error
          }
        });
      }
      const params = { errorMap: ctx.common.contextualErrorMap };
      const fn = ctx.data;
      if (this._def.returns instanceof ZodPromise) {
        const me = this;
        return OK(async function(...args) {
          const error = new ZodError([]);
          const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
            error.addIssue(makeArgsIssue(args, e));
            throw error;
          });
          const result = await Reflect.apply(fn, this, parsedArgs);
          const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
            error.addIssue(makeReturnsIssue(result, e));
            throw error;
          });
          return parsedReturns;
        });
      } else {
        const me = this;
        return OK(function(...args) {
          const parsedArgs = me._def.args.safeParse(args, params);
          if (!parsedArgs.success) {
            throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
          }
          const result = Reflect.apply(fn, this, parsedArgs.data);
          const parsedReturns = me._def.returns.safeParse(result, params);
          if (!parsedReturns.success) {
            throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
          }
          return parsedReturns.data;
        });
      }
    }
    parameters() {
      return this._def.args;
    }
    returnType() {
      return this._def.returns;
    }
    args(...items) {
      return new _ZodFunction({
        ...this._def,
        args: ZodTuple.create(items).rest(ZodUnknown.create())
      });
    }
    returns(returnType) {
      return new _ZodFunction({
        ...this._def,
        returns: returnType
      });
    }
    implement(func) {
      const validatedFunc = this.parse(func);
      return validatedFunc;
    }
    strictImplement(func) {
      const validatedFunc = this.parse(func);
      return validatedFunc;
    }
    static create(args, returns, params) {
      return new _ZodFunction({
        args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
        returns: returns || ZodUnknown.create(),
        typeName: ZodFirstPartyTypeKind.ZodFunction,
        ...processCreateParams(params)
      });
    }
  };
  var ZodLazy = class extends ZodType {
    get schema() {
      return this._def.getter();
    }
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      const lazySchema = this._def.getter();
      return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
    }
  };
  ZodLazy.create = (getter, params) => {
    return new ZodLazy({
      getter,
      typeName: ZodFirstPartyTypeKind.ZodLazy,
      ...processCreateParams(params)
    });
  };
  var ZodLiteral = class extends ZodType {
    _parse(input) {
      if (input.data !== this._def.value) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_literal,
          expected: this._def.value
        });
        return INVALID;
      }
      return { status: "valid", value: input.data };
    }
    get value() {
      return this._def.value;
    }
  };
  ZodLiteral.create = (value, params) => {
    return new ZodLiteral({
      value,
      typeName: ZodFirstPartyTypeKind.ZodLiteral,
      ...processCreateParams(params)
    });
  };
  function createZodEnum(values, params) {
    return new ZodEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodEnum,
      ...processCreateParams(params)
    });
  }
  var ZodEnum = class _ZodEnum extends ZodType {
    _parse(input) {
      if (typeof input.data !== "string") {
        const ctx = this._getOrReturnCtx(input);
        const expectedValues = this._def.values;
        addIssueToContext(ctx, {
          expected: util.joinValues(expectedValues),
          received: ctx.parsedType,
          code: ZodIssueCode.invalid_type
        });
        return INVALID;
      }
      if (!this._cache) {
        this._cache = new Set(this._def.values);
      }
      if (!this._cache.has(input.data)) {
        const ctx = this._getOrReturnCtx(input);
        const expectedValues = this._def.values;
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return INVALID;
      }
      return OK(input.data);
    }
    get options() {
      return this._def.values;
    }
    get enum() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    get Values() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    get Enum() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    extract(values, newDef = this._def) {
      return _ZodEnum.create(values, {
        ...this._def,
        ...newDef
      });
    }
    exclude(values, newDef = this._def) {
      return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
        ...this._def,
        ...newDef
      });
    }
  };
  ZodEnum.create = createZodEnum;
  var ZodNativeEnum = class extends ZodType {
    _parse(input) {
      const nativeEnumValues = util.getValidEnumValues(this._def.values);
      const ctx = this._getOrReturnCtx(input);
      if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
        const expectedValues = util.objectValues(nativeEnumValues);
        addIssueToContext(ctx, {
          expected: util.joinValues(expectedValues),
          received: ctx.parsedType,
          code: ZodIssueCode.invalid_type
        });
        return INVALID;
      }
      if (!this._cache) {
        this._cache = new Set(util.getValidEnumValues(this._def.values));
      }
      if (!this._cache.has(input.data)) {
        const expectedValues = util.objectValues(nativeEnumValues);
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return INVALID;
      }
      return OK(input.data);
    }
    get enum() {
      return this._def.values;
    }
  };
  ZodNativeEnum.create = (values, params) => {
    return new ZodNativeEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
      ...processCreateParams(params)
    });
  };
  var ZodPromise = class extends ZodType {
    unwrap() {
      return this._def.type;
    }
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.promise,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
      return OK(promisified.then((data) => {
        return this._def.type.parseAsync(data, {
          path: ctx.path,
          errorMap: ctx.common.contextualErrorMap
        });
      }));
    }
  };
  ZodPromise.create = (schema, params) => {
    return new ZodPromise({
      type: schema,
      typeName: ZodFirstPartyTypeKind.ZodPromise,
      ...processCreateParams(params)
    });
  };
  var ZodEffects = class extends ZodType {
    innerType() {
      return this._def.schema;
    }
    sourceType() {
      return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
    }
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      const effect = this._def.effect || null;
      const checkCtx = {
        addIssue: (arg) => {
          addIssueToContext(ctx, arg);
          if (arg.fatal) {
            status.abort();
          } else {
            status.dirty();
          }
        },
        get path() {
          return ctx.path;
        }
      };
      checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
      if (effect.type === "preprocess") {
        const processed = effect.transform(ctx.data, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(processed).then(async (processed2) => {
            if (status.value === "aborted")
              return INVALID;
            const result = await this._def.schema._parseAsync({
              data: processed2,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return INVALID;
            if (result.status === "dirty")
              return DIRTY(result.value);
            if (status.value === "dirty")
              return DIRTY(result.value);
            return result;
          });
        } else {
          if (status.value === "aborted")
            return INVALID;
          const result = this._def.schema._parseSync({
            data: processed,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        }
      }
      if (effect.type === "refinement") {
        const executeRefinement = (acc) => {
          const result = effect.refinement(acc, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(result);
          }
          if (result instanceof Promise) {
            throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
          }
          return acc;
        };
        if (ctx.common.async === false) {
          const inner = this._def.schema._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          executeRefinement(inner.value);
          return { status: status.value, value: inner.value };
        } else {
          return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            return executeRefinement(inner.value).then(() => {
              return { status: status.value, value: inner.value };
            });
          });
        }
      }
      if (effect.type === "transform") {
        if (ctx.common.async === false) {
          const base = this._def.schema._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (!isValid(base))
            return INVALID;
          const result = effect.transform(base.value, checkCtx);
          if (result instanceof Promise) {
            throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
          }
          return { status: status.value, value: result };
        } else {
          return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
            if (!isValid(base))
              return INVALID;
            return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
              status: status.value,
              value: result
            }));
          });
        }
      }
      util.assertNever(effect);
    }
  };
  ZodEffects.create = (schema, effect, params) => {
    return new ZodEffects({
      schema,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect,
      ...processCreateParams(params)
    });
  };
  ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
    return new ZodEffects({
      schema,
      effect: { type: "preprocess", transform: preprocess },
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      ...processCreateParams(params)
    });
  };
  var ZodOptional = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType === ZodParsedType.undefined) {
        return OK(void 0);
      }
      return this._def.innerType._parse(input);
    }
    unwrap() {
      return this._def.innerType;
    }
  };
  ZodOptional.create = (type, params) => {
    return new ZodOptional({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodOptional,
      ...processCreateParams(params)
    });
  };
  var ZodNullable = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType === ZodParsedType.null) {
        return OK(null);
      }
      return this._def.innerType._parse(input);
    }
    unwrap() {
      return this._def.innerType;
    }
  };
  ZodNullable.create = (type, params) => {
    return new ZodNullable({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodNullable,
      ...processCreateParams(params)
    });
  };
  var ZodDefault = class extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      let data = ctx.data;
      if (ctx.parsedType === ZodParsedType.undefined) {
        data = this._def.defaultValue();
      }
      return this._def.innerType._parse({
        data,
        path: ctx.path,
        parent: ctx
      });
    }
    removeDefault() {
      return this._def.innerType;
    }
  };
  ZodDefault.create = (type, params) => {
    return new ZodDefault({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodDefault,
      defaultValue: typeof params.default === "function" ? params.default : () => params.default,
      ...processCreateParams(params)
    });
  };
  var ZodCatch = class extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      const newCtx = {
        ...ctx,
        common: {
          ...ctx.common,
          issues: []
        }
      };
      const result = this._def.innerType._parse({
        data: newCtx.data,
        path: newCtx.path,
        parent: {
          ...newCtx
        }
      });
      if (isAsync(result)) {
        return result.then((result2) => {
          return {
            status: "valid",
            value: result2.status === "valid" ? result2.value : this._def.catchValue({
              get error() {
                return new ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        });
      } else {
        return {
          status: "valid",
          value: result.status === "valid" ? result.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      }
    }
    removeCatch() {
      return this._def.innerType;
    }
  };
  ZodCatch.create = (type, params) => {
    return new ZodCatch({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodCatch,
      catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
      ...processCreateParams(params)
    });
  };
  var ZodNaN = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.nan) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.nan,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return { status: "valid", value: input.data };
    }
  };
  ZodNaN.create = (params) => {
    return new ZodNaN({
      typeName: ZodFirstPartyTypeKind.ZodNaN,
      ...processCreateParams(params)
    });
  };
  var BRAND = Symbol("zod_brand");
  var ZodBranded = class extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      const data = ctx.data;
      return this._def.type._parse({
        data,
        path: ctx.path,
        parent: ctx
      });
    }
    unwrap() {
      return this._def.type;
    }
  };
  var ZodPipeline = class _ZodPipeline extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.common.async) {
        const handleAsync = async () => {
          const inResult = await this._def.in._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return DIRTY(inResult.value);
          } else {
            return this._def.out._parseAsync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        };
        return handleAsync();
      } else {
        const inResult = this._def.in._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return {
            status: "dirty",
            value: inResult.value
          };
        } else {
          return this._def.out._parseSync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      }
    }
    static create(a, b) {
      return new _ZodPipeline({
        in: a,
        out: b,
        typeName: ZodFirstPartyTypeKind.ZodPipeline
      });
    }
  };
  var ZodReadonly = class extends ZodType {
    _parse(input) {
      const result = this._def.innerType._parse(input);
      const freeze = (data) => {
        if (isValid(data)) {
          data.value = Object.freeze(data.value);
        }
        return data;
      };
      return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
    }
    unwrap() {
      return this._def.innerType;
    }
  };
  ZodReadonly.create = (type, params) => {
    return new ZodReadonly({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodReadonly,
      ...processCreateParams(params)
    });
  };
  function cleanParams(params, data) {
    const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
    const p2 = typeof p === "string" ? { message: p } : p;
    return p2;
  }
  function custom(check, _params = {}, fatal) {
    if (check)
      return ZodAny.create().superRefine((data, ctx) => {
        var _a, _b;
        const r2 = check(data);
        if (r2 instanceof Promise) {
          return r2.then((r3) => {
            var _a2, _b2;
            if (!r3) {
              const params = cleanParams(_params, data);
              const _fatal = (_b2 = (_a2 = params.fatal) != null ? _a2 : fatal) != null ? _b2 : true;
              ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
            }
          });
        }
        if (!r2) {
          const params = cleanParams(_params, data);
          const _fatal = (_b = (_a = params.fatal) != null ? _a : fatal) != null ? _b : true;
          ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
        }
        return;
      });
    return ZodAny.create();
  }
  var late = {
    object: ZodObject.lazycreate
  };
  var ZodFirstPartyTypeKind;
  (function(ZodFirstPartyTypeKind2) {
    ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
    ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
    ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
    ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
    ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
    ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
  })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
  var instanceOfType = (cls, params = {
    message: `Input not instance of ${cls.name}`
  }) => custom((data) => data instanceof cls, params);
  var stringType = ZodString.create;
  var numberType = ZodNumber.create;
  var nanType = ZodNaN.create;
  var bigIntType = ZodBigInt.create;
  var booleanType = ZodBoolean.create;
  var dateType = ZodDate.create;
  var symbolType = ZodSymbol.create;
  var undefinedType = ZodUndefined.create;
  var nullType = ZodNull.create;
  var anyType = ZodAny.create;
  var unknownType = ZodUnknown.create;
  var neverType = ZodNever.create;
  var voidType = ZodVoid.create;
  var arrayType = ZodArray.create;
  var objectType = ZodObject.create;
  var strictObjectType = ZodObject.strictCreate;
  var unionType = ZodUnion.create;
  var discriminatedUnionType = ZodDiscriminatedUnion.create;
  var intersectionType = ZodIntersection.create;
  var tupleType = ZodTuple.create;
  var recordType = ZodRecord.create;
  var mapType = ZodMap.create;
  var setType = ZodSet.create;
  var functionType = ZodFunction.create;
  var lazyType = ZodLazy.create;
  var literalType = ZodLiteral.create;
  var enumType = ZodEnum.create;
  var nativeEnumType = ZodNativeEnum.create;
  var promiseType = ZodPromise.create;
  var effectsType = ZodEffects.create;
  var optionalType = ZodOptional.create;
  var nullableType = ZodNullable.create;
  var preprocessType = ZodEffects.createWithPreprocess;
  var pipelineType = ZodPipeline.create;
  var ostring = () => stringType().optional();
  var onumber = () => numberType().optional();
  var oboolean = () => booleanType().optional();
  var coerce = {
    string: (arg) => ZodString.create({ ...arg, coerce: true }),
    number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
    boolean: (arg) => ZodBoolean.create({
      ...arg,
      coerce: true
    }),
    bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
    date: (arg) => ZodDate.create({ ...arg, coerce: true })
  };
  var NEVER = INVALID;

  // apps-script/shims/jsonwebtoken.js
  var strip = (s) => s.replace(/=+$/, "");
  var enc = (obj) => strip(Utilities.base64EncodeWebSafe(Utilities.newBlob(JSON.stringify(obj)).getBytes()));
  var dec = (s) => JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(s)).getDataAsString());
  var sig = (data, secret) => strip(Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(data, secret)));
  function seconds(expiresIn) {
    if (typeof expiresIn === "number") return expiresIn;
    const m = /^(\d+)\s*([smhd]?)$/.exec(String(expiresIn).trim());
    if (!m) return 8 * 3600;
    return Number(m[1]) * { s: 1, m: 60, h: 3600, d: 86400 }[m[2] || "s"];
  }
  function sign(payload, secret, opts = {}) {
    const now = Math.floor(Date.now() / 1e3);
    const body = { ...payload, iat: now, exp: now + seconds(opts.expiresIn || "8h") };
    if (opts.issuer) body.iss = opts.issuer;
    const data = `${enc({ alg: "HS256", typ: "JWT" })}.${enc(body)}`;
    return `${data}.${sig(data, secret)}`;
  }
  function verify(token, secret, opts = {}) {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) throw new Error("malformed token");
    const data = `${parts[0]}.${parts[1]}`;
    if (sig(data, secret) !== parts[2]) throw new Error("invalid signature");
    const payload = dec(parts[1]);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) throw new Error("token expired");
    if (opts.issuer && payload.iss !== opts.issuer) throw new Error("invalid issuer");
    return payload;
  }
  var jsonwebtoken_default = { sign, verify };

  // apps-script/shims/config.js
  function prop(key, fallback) {
    try {
      const v = PropertiesService.getScriptProperties().getProperty(key);
      return v === null || v === "" ? fallback : v;
    } catch {
      return fallback;
    }
  }
  function bool(v, fallback) {
    if (v === void 0 || v === null || v === "") return fallback;
    return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
  }
  function ensureSecret() {
    const props = PropertiesService.getScriptProperties();
    let s = props.getProperty("JWT_SECRET");
    if (!s) {
      s = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
      props.setProperty("JWT_SECRET", s);
    }
    return s;
  }
  var config = {
    env: "production",
    edition: "apps-script",
    realtime: false,
    isProd: true,
    isTest: false,
    port: 0,
    get jwtSecret() {
      return ensureSecret();
    },
    jwtExpiresIn: prop("JWT_EXPIRES_IN", "8h"),
    corsOrigins: [],
    dataStore: "apps-script",
    localDataDir: "",
    sheets: { sheetId: "", serviceAccountEmail: "", privateKey: "", refreshSeconds: 0, flushMs: 0 },
    course: {
      code: prop("COURSE_CODE", "DAT"),
      name: prop("COURSE_NAME", "Technopreneurship"),
      assessmentTitle: prop("ASSESSMENT_TITLE", "Technopreneurship Final Assessment"),
      semester: prop("SEMESTER", "2026/2027"),
      institution: prop("INSTITUTION_NAME", "Universiti Tun Hussein Onn Malaysia (UTHM)"),
      department: prop("DEPARTMENT_NAME", "Jabatan Teknologi Maklumat (JTM)"),
      centre: prop("CENTRE_NAME", "Pusat Pengajian Diploma"),
      programme: prop("PROGRAMME_NAME", "Diploma Teknologi Maklumat (DAT)")
    },
    monitoring: {
      cameraRequiredDefault: bool(prop("CAMERA_REQUIRED_DEFAULT", "true"), true),
      retentionDays: Number(prop("MONITORING_RETENTION_DAYS", "90")) || 90,
      iceServers: prop("WEBRTC_ICE_SERVERS", "stun:stun.l.google.com:19302").split(",").map((s) => s.trim()).filter(Boolean).map((urls) => ({ urls })),
      turnUsername: prop("WEBRTC_TURN_USERNAME", ""),
      turnCredential: prop("WEBRTC_TURN_CREDENTIAL", "")
    },
    demoPassword: prop("DEMO_PASSWORD", "Demo@2026"),
    clientDistDir: ""
  };

  // server/src/auth/jwt.js
  function signToken(user) {
    return jsonwebtoken_default.sign(
      { sub: user.user_id, role: user.role, name: user.name, student_id: user.student_id || null },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn, issuer: "tfa" }
    );
  }
  function verifyToken(token) {
    return jsonwebtoken_default.verify(token, config.jwtSecret, { issuer: "tfa" });
  }

  // server/src/data/schema.js
  var TABLES = {
    Users: {
      id: "user_id",
      columns: [
        "user_id",
        "username",
        "password_hash",
        "role",
        "name",
        "email",
        "student_id",
        "active",
        "must_change_password",
        "created_at",
        "updated_at",
        "last_login_at"
      ],
      types: { active: "boolean", must_change_password: "boolean" }
    },
    Students: {
      id: "student_id",
      columns: ["student_id", "matric_no", "name", "email", "group_id", "role", "course_code", "section", "active"],
      types: { active: "boolean" }
    },
    Groups: {
      id: "group_id",
      columns: ["group_id", "group_name", "business_name", "business_idea", "student_1", "student_2", "student_3", "student_4", "status"],
      types: {}
    },
    Assessments: {
      id: "assessment_id",
      columns: [
        "assessment_id",
        "title",
        "course_code",
        "course_name",
        "semester",
        "description",
        "instructions",
        "duration_minutes",
        "start_at",
        "end_at",
        "status",
        "camera_required",
        "proctoring_enabled",
        "question_mode",
        "components",
        "proposal_template",
        "results_released",
        "created_by",
        "created_at",
        "updated_at"
      ],
      types: {
        duration_minutes: "number",
        camera_required: "boolean",
        proctoring_enabled: "boolean",
        results_released: "boolean",
        components: "json",
        proposal_template: "json"
      }
    },
    Questions: {
      id: "question_id",
      columns: [
        "question_id",
        "assessment_id",
        "section",
        "topic",
        "question_text",
        "question_type",
        "marks",
        "time_limit",
        "active",
        "order_index",
        "options",
        "guidance",
        "created_at",
        "updated_at"
      ],
      types: { marks: "number", time_limit: "number", active: "boolean", order_index: "number", options: "json" }
    },
    Attempts: {
      id: "attempt_id",
      columns: [
        "attempt_id",
        "assessment_id",
        "student_id",
        "group_id",
        "component",
        "status",
        "started_at",
        "deadline_at",
        "submitted_at",
        "last_activity_at",
        "last_saved_at",
        "camera_status",
        "flags_count",
        "marking_status",
        "total_marks",
        "max_marks",
        "lecturer_feedback",
        "marked_by",
        "marked_at",
        "reopened_by",
        "reopened_at",
        "reopen_reason"
      ],
      types: { flags_count: "number", total_marks: "number", max_marks: "number" }
    },
    Answers: {
      id: "answer_id",
      columns: [
        "answer_id",
        "assessment_id",
        "student_id",
        "group_id",
        "question_id",
        "component",
        "answer",
        "timestamp",
        "status",
        "marks",
        "lecturer_feedback",
        "marked_at",
        "marked_by"
      ],
      types: { marks: "number" }
    },
    ProctoringLogs: {
      id: "log_id",
      columns: [
        "log_id",
        "assessment_id",
        "student_id",
        "group_id",
        "timestamp",
        "event_type",
        "severity",
        "description",
        "review_status",
        "reviewed_by",
        "review_note"
      ],
      types: {}
    },
    BusinessProposals: {
      id: "proposal_id",
      columns: [
        "proposal_id",
        "group_id",
        "assessment_id",
        "business_name",
        "executive_summary",
        "marketing",
        "product_plan",
        "operations",
        "financial_plan",
        "other_sections",
        "generated_document",
        "status",
        "sections_json",
        "generated_at",
        "updated_at",
        "reviewed_by",
        "reviewed_at",
        "finalised_by",
        "finalised_at",
        "lecturer_notes"
      ],
      types: { sections_json: "json", other_sections: "json" }
    },
    GroupReports: {
      id: "report_id",
      columns: [
        "report_id",
        "group_id",
        "assessment_id",
        "business_name",
        "members",
        "submission_status",
        "proposal_status",
        "total_group_score",
        "lecturer_feedback",
        "generated_document",
        "reviewed_by",
        "reviewed_at",
        "status",
        "generated_at",
        "updated_at"
      ],
      types: { total_group_score: "number", members: "json" }
    },
    AuditLogs: {
      id: "log_id",
      columns: ["log_id", "timestamp", "actor_id", "actor_role", "actor_name", "action", "entity_type", "entity_id", "details", "ip"],
      types: {}
    },
    Settings: {
      id: "key",
      columns: ["key", "value", "updated_at", "updated_by"],
      types: {}
    }
  };
  var TABLE_NAMES = Object.keys(TABLES);
  function coerceIn(table, column, value) {
    const type = TABLES[table].types[column];
    if (value === void 0 || value === null) return type === "boolean" ? false : type === "json" ? null : "";
    if (value instanceof Date) return value.toISOString();
    const s = typeof value === "string" ? value : String(value);
    switch (type) {
      case "boolean":
        return ["true", "1", "yes"].includes(s.trim().toLowerCase());
      case "number": {
        if (s.trim() === "") return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
      }
      case "json": {
        if (s.trim() === "") return null;
        try {
          return JSON.parse(s);
        } catch {
          return null;
        }
      }
      default:
        return s;
    }
  }
  function coerceOut(table, column, value) {
    const type = TABLES[table].types[column];
    if (value === void 0 || value === null) return "";
    switch (type) {
      case "boolean":
        return value ? "TRUE" : "FALSE";
      case "number":
        return value === "" ? "" : String(value);
      case "json":
        return typeof value === "string" ? value : JSON.stringify(value);
      default:
        return typeof value === "string" ? value : typeof value === "object" ? JSON.stringify(value) : String(value);
    }
  }
  function rowToObject(table, headerRow, cells) {
    const def = TABLES[table];
    const obj = {};
    for (const col of def.columns) {
      const idx = headerRow.indexOf(col);
      obj[col] = coerceIn(table, col, idx >= 0 ? cells[idx] : void 0);
    }
    return obj;
  }
  function objectToRow(table, headerRow, obj) {
    return headerRow.map((col) => coerceOut(table, col, obj[col]));
  }

  // apps-script/shims/crypto.js
  function randomBytes(n) {
    const bytes = [];
    for (let i = 0; i < n; i++) bytes.push(Math.floor(Math.random() * 256));
    return {
      toString(enc2) {
        if (enc2 === "hex") return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
        const b642 = Utilities.base64Encode(bytes);
        return enc2 === "base64url" ? b642.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b642;
      }
    };
  }
  var crypto_default = { randomBytes };

  // server/src/lib/ids.js
  function newId(prefix) {
    const rand = crypto_default.randomBytes(8).toString("base64url").replace(/[-_]/g, "").slice(0, 10).toLowerCase();
    return `${prefix}_${Date.now().toString(36)}${rand}`;
  }
  function nowIso() {
    return (/* @__PURE__ */ new Date()).toISOString();
  }

  // server/src/data/store.js
  var PREFIX = {
    Users: "usr",
    Students: "stu",
    Groups: "grp",
    Assessments: "asm",
    Questions: "q",
    Attempts: "att",
    Answers: "ans",
    ProctoringLogs: "plog",
    BusinessProposals: "prop",
    GroupReports: "rep",
    AuditLogs: "alog",
    Settings: "set"
  };
  var BaseStore = class {
    constructor() {
      this.cache = {};
      for (const t of Object.keys(TABLES)) this.cache[t] = /* @__PURE__ */ new Map();
    }
    assertTable(table) {
      if (!TABLES[table]) throw new Error(`Unknown table: ${table}`);
    }
    idColumn(table) {
      return TABLES[table].id;
    }
    normalise(table, row) {
      const def = TABLES[table];
      const out = {};
      for (const col of def.columns) {
        const t = def.types[col];
        let v = row[col];
        if (v === void 0) v = t === "boolean" ? false : t === "json" || t === "number" ? null : "";
        out[col] = v;
      }
      return out;
    }
    list(table) {
      this.assertTable(table);
      return Array.from(this.cache[table].values()).map((r2) => ({ ...r2 }));
    }
    get(table, id2) {
      this.assertTable(table);
      const r2 = this.cache[table].get(String(id2));
      return r2 ? { ...r2 } : null;
    }
    find(table, pred) {
      return this.list(table).filter(pred);
    }
    findOne(table, pred) {
      for (const r2 of this.cache[table].values()) if (pred(r2)) return { ...r2 };
      return null;
    }
    count(table, pred) {
      let n = 0;
      for (const r2 of this.cache[table].values()) if (!pred || pred(r2)) n++;
      return n;
    }
    insert(table, row) {
      this.assertTable(table);
      const idCol = this.idColumn(table);
      const full = this.normalise(table, row);
      if (!full[idCol]) full[idCol] = newId(PREFIX[table] || "row");
      if (this.cache[table].has(full[idCol])) throw new Error(`Duplicate ${idCol} in ${table}: ${full[idCol]}`);
      this.cache[table].set(full[idCol], full);
      this.persistInsert(table, full);
      return { ...full };
    }
    update(table, id2, patch) {
      this.assertTable(table);
      const existing = this.cache[table].get(String(id2));
      if (!existing) throw new Error(`${table} row not found: ${id2}`);
      const idCol = this.idColumn(table);
      const next = this.normalise(table, { ...existing, ...patch, [idCol]: existing[idCol] });
      this.cache[table].set(existing[idCol], next);
      this.persistUpdate(table, next);
      return { ...next };
    }
    remove(table, id2) {
      this.assertTable(table);
      const existing = this.cache[table].get(String(id2));
      if (!existing) return false;
      this.cache[table].delete(String(id2));
      this.persistRemove(table, existing);
      return true;
    }
    // Adapters override these.
    init() {
    }
    persistInsert() {
    }
    persistUpdate() {
    }
    persistRemove() {
    }
    flush() {
    }
    close() {
    }
  };

  // apps-script/shims/store.js
  var SCOPE_COLUMNS = {
    Answers: ["student_id", "group_id", "assessment_id"],
    Attempts: ["student_id", "attempt_id", "group_id"],
    ProctoringLogs: ["student_id", "group_id"],
    BusinessProposals: ["group_id"],
    GroupReports: ["group_id"]
  };
  var APPEND_ONLY = /* @__PURE__ */ new Set(["AuditLogs", "ProctoringLogs"]);
  var SpreadsheetStore = class extends BaseStore {
    constructor(spreadsheet) {
      super();
      this.ss = spreadsheet;
      this.loaded = /* @__PURE__ */ new Set();
      this.partial = /* @__PURE__ */ new Set();
      this.sheets = {};
      this.headers = {};
      this.rowIndex = {};
      this.scope = {};
      this.tail = {};
      for (const t of Object.keys(TABLES)) this.rowIndex[t] = /* @__PURE__ */ new Map();
    }
    /** Request-level hints set by the router before handlers run. */
    setScope(scope = {}, tail = {}) {
      this.scope = scope || {};
      this.tail = tail || {};
    }
    sheet(table) {
      if (this.sheets[table]) return this.sheets[table];
      let sh = this.ss.getSheetByName(table);
      if (!sh) {
        sh = this.ss.insertSheet(table);
        sh.getRange(1, 1, 1, TABLES[table].columns.length).setValues([TABLES[table].columns]);
        sh.getRange(1, 1, sh.getMaxRows(), TABLES[table].columns.length).setNumberFormat("@");
        sh.setFrozenRows(1);
      }
      this.sheets[table] = sh;
      return sh;
    }
    header(table) {
      if (this.headers[table]) return this.headers[table];
      const sh = this.sheet(table);
      const def = TABLES[table];
      const width = Math.max(sh.getLastColumn(), def.columns.length);
      let header = sh.getRange(1, 1, 1, width).getValues()[0].map((h) => String(h || "").trim());
      const missing = def.columns.filter((c) => !header.includes(c));
      if (!header.filter(Boolean).length || missing.length) {
        header = [...header.filter(Boolean), ...missing];
        sh.getRange(1, 1, 1, header.length).setValues([header]);
        sh.getRange(1, 1, sh.getMaxRows(), header.length).setNumberFormat("@");
      }
      this.headers[table] = header;
      return header;
    }
    /** Create every worksheet with its header row (used by setup()). */
    ensureAll() {
      for (const t of Object.keys(TABLES)) this.header(t);
    }
    assertTableName(table) {
      if (!TABLES[table]) throw new Error(`Unknown table: ${table}`);
    }
    ingest(table, header, cells, rowNumber) {
      const idIdx = header.indexOf(TABLES[table].id);
      const id2 = cells[idIdx];
      if (id2 === void 0 || id2 === null || id2 === "") return;
      this.cache[table].set(String(id2), rowToObject(table, header, cells));
      this.rowIndex[table].set(String(id2), rowNumber);
    }
    /** Load the rows needed for this request: scoped, tail-only, or everything. */
    ensureLoaded(table) {
      this.assertTableName(table);
      if (this.loaded.has(table) || this.partial.has(table)) return;
      const sh = this.sheet(table);
      const header = this.header(table);
      const lastRow = sh.getLastRow();
      const scopeCol = (SCOPE_COLUMNS[table] || []).find((c) => this.scope[c] !== void 0 && this.scope[c] !== "");
      if (scopeCol && lastRow > 1) {
        const col = header.indexOf(scopeCol) + 1;
        const finder = sh.getRange(2, col, lastRow - 1, 1).createTextFinder(String(this.scope[scopeCol])).matchEntireCell(true).matchCase(true);
        const hits = finder.findAll();
        for (const cell of hits) {
          const r2 = cell.getRow();
          this.ingest(table, header, sh.getRange(r2, 1, 1, header.length).getValues()[0], r2);
        }
        this.partial.add(table);
        return;
      }
      const n = this.tail[table];
      if (n && lastRow > 1) {
        const start = Math.max(2, lastRow - n + 1);
        const values = sh.getRange(start, 1, lastRow - start + 1, header.length).getValues();
        values.forEach((cells, i) => this.ingest(table, header, cells, start + i));
        this.partial.add(table);
        return;
      }
      if (lastRow > 1) {
        const values = sh.getRange(2, 1, lastRow - 1, header.length).getValues();
        values.forEach((cells, i) => this.ingest(table, header, cells, i + 2));
      }
      this.loaded.add(table);
    }
    // Reads: load lazily.
    list(table) {
      this.ensureLoaded(table);
      return super.list(table);
    }
    get(table, id2) {
      this.ensureLoaded(table);
      const hit = super.get(table, id2);
      if (hit || this.loaded.has(table)) return hit;
      return this.fetchById(table, id2);
    }
    find(table, pred) {
      this.ensureLoaded(table);
      return super.find(table, pred);
    }
    findOne(table, pred) {
      this.ensureLoaded(table);
      return super.findOne(table, pred);
    }
    count(table, pred) {
      this.ensureLoaded(table);
      return super.count(table, pred);
    }
    update(table, id2, patch) {
      this.ensureLoaded(table);
      if (!this.cache[table].has(String(id2))) this.fetchById(table, id2);
      return super.update(table, id2, patch);
    }
    remove(table, id2) {
      this.ensureLoaded(table);
      if (!this.cache[table].has(String(id2))) this.fetchById(table, id2);
      return super.remove(table, id2);
    }
    insert(table, row) {
      if (APPEND_ONLY.has(table) && !this.loaded.has(table) && !this.partial.has(table)) {
        this.header(table);
        const full = this.normalise(table, row);
        const idCol = TABLES[table].id;
        if (!full[idCol]) full[idCol] = `${table === "AuditLogs" ? "alog" : "plog"}_${Date.now().toString(36)}${Utilities.getUuid().replace(/-/g, "").slice(0, 10)}`;
        this.persistInsert(table, full);
        return { ...full };
      }
      this.ensureLoaded(table);
      return super.insert(table, row);
    }
    /** Find one row by primary key with TextFinder (used when only part of a table is loaded). */
    fetchById(table, id2) {
      const sh = this.sheet(table);
      const header = this.header(table);
      const lastRow = sh.getLastRow();
      if (lastRow < 2) return null;
      const col = header.indexOf(TABLES[table].id) + 1;
      const hit = sh.getRange(2, col, lastRow - 1, 1).createTextFinder(String(id2)).matchEntireCell(true).matchCase(true).findNext();
      if (!hit) return null;
      const r2 = hit.getRow();
      this.ingest(table, header, sh.getRange(r2, 1, 1, header.length).getValues()[0], r2);
      const row = this.cache[table].get(String(id2));
      return row ? { ...row } : null;
    }
    // Writes: immediate.
    persistInsert(table, row) {
      const sh = this.sheet(table);
      sh.appendRow(objectToRow(table, this.header(table), row));
      this.rowIndex[table].set(row[TABLES[table].id], sh.getLastRow());
    }
    persistUpdate(table, row) {
      const id2 = row[TABLES[table].id];
      const r2 = this.rowIndex[table].get(id2);
      if (!r2) return this.persistInsert(table, row);
      const header = this.header(table);
      this.sheet(table).getRange(r2, 1, 1, header.length).setValues([objectToRow(table, header, row)]);
      return void 0;
    }
    persistRemove(table, row) {
      const id2 = row[TABLES[table].id];
      const r2 = this.rowIndex[table].get(id2);
      if (!r2) return;
      this.sheet(table).deleteRow(r2);
      this.rowIndex[table].delete(id2);
      for (const [k, v] of this.rowIndex[table]) if (v > r2) this.rowIndex[table].set(k, v - 1);
    }
    flush() {
    }
    close() {
    }
  };
  var store = null;
  function createStore() {
    store = new SpreadsheetStore(SpreadsheetApp.getActiveSpreadsheet());
    return store;
  }
  function getStore() {
    if (!store) createStore();
    return store;
  }

  // server/src/lib/errors.js
  var HttpError = class extends Error {
    constructor(status, message, details) {
      super(message);
      this.status = status;
      this.details = details;
    }
  };
  var badRequest = (m, d) => new HttpError(400, m, d);
  var unauthorized = (m = "Authentication required") => new HttpError(401, m);
  var forbidden = (m = "You do not have permission to perform this action") => new HttpError(403, m);
  var notFound = (m = "Not found") => new HttpError(404, m);
  var conflict = (m, d) => new HttpError(409, m, d);

  // server/src/auth/session.js
  function resolveUser(token) {
    if (!token) throw unauthorized();
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw unauthorized("Your session has expired. Please login again.");
    }
    const user = getStore().get("Users", payload.sub);
    if (!user || !user.active) throw unauthorized("Your account is not active");
    return { user_id: user.user_id, role: user.role, name: user.name, username: user.username, student_id: user.student_id || null, email: user.email };
  }

  // server/src/auth/middleware.js
  var ROLES = ["student", "lecturer", "admin"];
  function requireRole(...roles) {
    return (req, _res, next) => {
      if (!req.user) return next(unauthorized());
      if (!roles.includes(req.user.role)) return next(forbidden());
      next();
    };
  }
  var requireStaff = requireRole("lecturer", "admin");

  // apps-script/shims/sanitize-html.js
  var DROP_WITH_CONTENT = /* @__PURE__ */ new Set(["script", "style", "textarea", "option", "noscript", "iframe", "object", "embed", "svg", "math", "template", "title"]);
  var VOID = /* @__PURE__ */ new Set(["br", "hr", "img", "input", "meta", "link", "area", "base", "col", "wbr", "source", "track"]);
  var TOKEN = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  var ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  function escapeText(s) {
    return s.replace(/<(?![a-zA-Z/!])/g, "&lt;").replace(/<$/g, "&lt;");
  }
  function sanitizeHtml(input, opts = {}) {
    var _a, _b, _c;
    const allowed = new Set((opts.allowedTags || []).map((t) => t.toLowerCase()));
    const allowedAttrs = opts.allowedAttributes || {};
    const src = String(input != null ? input : "");
    let out = "";
    let last = 0;
    let skipUntil = null;
    const open = [];
    let m;
    TOKEN.lastIndex = 0;
    while (m = TOKEN.exec(src)) {
      const text = src.slice(last, m.index);
      if (!skipUntil) out += escapeText(text);
      last = TOKEN.lastIndex;
      const raw = m[0];
      const name = (m[1] || "").toLowerCase();
      if (!name) continue;
      const closing = raw.startsWith("</");
      if (skipUntil) {
        if (closing && name === skipUntil) skipUntil = null;
        continue;
      }
      if (DROP_WITH_CONTENT.has(name)) {
        if (!closing && !raw.endsWith("/>")) skipUntil = name;
        continue;
      }
      if (!allowed.has(name)) continue;
      if (closing) {
        if (open.includes(name)) {
          while (open.length) {
            const t = open.pop();
            out += `</${t}>`;
            if (t === name) break;
          }
        }
        continue;
      }
      const attrs = [];
      const permitted = /* @__PURE__ */ new Set([...allowedAttrs["*"] || [], ...allowedAttrs[name] || []]);
      let a;
      ATTR.lastIndex = 0;
      while (a = ATTR.exec(m[2] || "")) {
        const an = a[1].toLowerCase();
        if (!permitted.has(an)) continue;
        const av = ((_c = (_b = (_a = a[2]) != null ? _a : a[3]) != null ? _b : a[4]) != null ? _c : "").replace(/"/g, "&quot;");
        if (/^\s*(javascript|data|vbscript):/i.test(av)) continue;
        attrs.push(`${an}="${av}"`);
      }
      out += `<${name}${attrs.length ? ` ${attrs.join(" ")}` : ""}>`;
      if (!VOID.has(name) && !raw.endsWith("/>")) open.push(name);
    }
    if (!skipUntil) out += escapeText(src.slice(last));
    while (open.length) out += `</${open.pop()}>`;
    return out;
  }

  // server/src/lib/sanitize.js
  var RICH = {
    allowedTags: [
      "p",
      "br",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "sub",
      "sup",
      "span",
      "div",
      "hr"
    ],
    allowedAttributes: { td: ["colspan", "rowspan"], th: ["colspan", "rowspan"] },
    allowedSchemes: [],
    disallowedTagsMode: "discard",
    parser: { lowerCaseTags: true }
  };
  function sanitizeRichText(html) {
    if (html === null || html === void 0) return "";
    return sanitizeHtml(String(html), RICH).trim();
  }
  function sanitizePlain(text) {
    if (text === null || text === void 0) return "";
    return sanitizeHtml(String(text), { allowedTags: [], allowedAttributes: {} }).trim();
  }
  function htmlToText(html) {
    return sanitizeHtml(String(html || "").replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, "\n").replace(/<br\s*\/?>/gi, "\n"), { allowedTags: [], allowedAttributes: {} }).replace(/\n{3,}/g, "\n\n").trim();
  }

  // server/src/services/templates.js
  var COMMON_SECTION = "Common";
  var DEFAULT_COMPONENTS = ["Marketing", "Product Planning", "Financial Planning"];
  var QUESTION_TYPES = [
    "multiple_choice",
    "short_answer",
    "structured",
    "long_answer",
    "case_study",
    "numerical",
    "scenario"
  ];
  var QUESTION_TYPE_LABELS = {
    multiple_choice: "Multiple Choice",
    short_answer: "Short Answer",
    structured: "Structured Answer",
    long_answer: "Long Answer",
    case_study: "Case Study",
    numerical: "Numerical",
    scenario: "Scenario-based Question"
  };
  var DEFAULT_PROPOSAL_TEMPLATE = [
    { key: "business_overview", title: "Business Overview", source: "group", source_topics: [] },
    { key: "executive_summary", title: "Executive Summary", source: "answers", source_topics: ["Executive Summary"], compose_fallback: "excerpts" },
    { key: "business_problem", title: "Business Problem", source: "answers", source_topics: ["Business Problem"] },
    { key: "target_market", title: "Target Market", source: "answers", source_topics: ["Target Market"] },
    { key: "marketing_strategy", title: "Marketing Strategy", source: "answers", source_topics: ["Marketing Strategy"] },
    { key: "product_plan", title: "Product / Service Planning", source: "answers", source_topics: ["Product / Service Planning"] },
    { key: "operations", title: "Operations Plan", source: "answers", source_topics: ["Operations Plan"] },
    { key: "financial_plan", title: "Financial Plan", source: "answers", source_topics: ["Financial Plan"] },
    { key: "competitive_analysis", title: "Competitive Analysis", source: "answers", source_topics: ["Competitive Analysis"] },
    { key: "innovation", title: "Innovation", source: "answers", source_topics: ["Innovation"] },
    { key: "conclusion", title: "Conclusion", source: "answers", source_topics: ["Conclusion"] }
  ];
  var PROCTORING_EVENT_TYPES = [
    "TAB_SWITCH_DETECTED",
    "WINDOW_BLUR",
    "FULLSCREEN_EXIT",
    "CAMERA_DISABLED",
    "CAMERA_PERMISSION_REVOKED",
    "CAMERA_DISCONNECTED",
    "FACE_NOT_DETECTED",
    "MULTIPLE_FACES_DETECTED",
    "LARGE_PASTE_DETECTED",
    "LONG_IDLE_PERIOD",
    "CAMERA_ENABLED",
    "FULLSCREEN_ENTERED",
    "CONNECTION_LOST",
    "CONNECTION_RESTORED"
  ];
  var PROCTORING_SEVERITY = {
    TAB_SWITCH_DETECTED: "medium",
    WINDOW_BLUR: "low",
    FULLSCREEN_EXIT: "low",
    CAMERA_DISABLED: "high",
    CAMERA_PERMISSION_REVOKED: "high",
    CAMERA_DISCONNECTED: "high",
    FACE_NOT_DETECTED: "medium",
    MULTIPLE_FACES_DETECTED: "medium",
    LARGE_PASTE_DETECTED: "medium",
    LONG_IDLE_PERIOD: "low",
    CAMERA_ENABLED: "info",
    FULLSCREEN_ENTERED: "info",
    CONNECTION_LOST: "info",
    CONNECTION_RESTORED: "info"
  };
  var normaliseTopic = (t) => String(t || "").trim().toLowerCase().replace(/\s+/g, " ");

  // server/src/services/assessments.js
  var ASSESSMENT_STATUSES = ["draft", "scheduled", "open", "closed"];
  function listAssessments() {
    return getStore().list("Assessments").map(decorate).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }
  function getAssessment(id2) {
    const a = getStore().get("Assessments", id2);
    if (!a) throw notFound("Assessment not found");
    return decorate(a);
  }
  function decorate(a) {
    return {
      ...a,
      components: Array.isArray(a.components) && a.components.length ? a.components : DEFAULT_COMPONENTS,
      proposal_template: Array.isArray(a.proposal_template) && a.proposal_template.length ? a.proposal_template : DEFAULT_PROPOSAL_TEMPLATE,
      question_mode: a.question_mode || "component",
      is_open_now: isOpenNow(a),
      server_time: nowIso()
    };
  }
  function isOpenNow(a, now = Date.now()) {
    if (a.status !== "open") return false;
    if (a.start_at && Date.parse(a.start_at) > now) return false;
    if (a.end_at && Date.parse(a.end_at) <= now) return false;
    return true;
  }
  function validateTemplate(t) {
    if (!Array.isArray(t)) throw badRequest("Proposal template must be a list of sections");
    return t.map((s, i) => {
      const title = sanitizePlain(s.title);
      if (!title) throw badRequest(`Template section ${i + 1} needs a title`);
      return {
        key: sanitizePlain(s.key) || title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
        title,
        source: s.source === "group" ? "group" : "answers",
        source_topics: Array.isArray(s.source_topics) ? s.source_topics.map(sanitizePlain).filter(Boolean) : [],
        compose_fallback: s.compose_fallback === "excerpts" ? "excerpts" : void 0
      };
    });
  }
  function clean(patch) {
    const upd = {};
    if (patch.title !== void 0) upd.title = sanitizePlain(patch.title);
    if (patch.course_code !== void 0) upd.course_code = sanitizePlain(patch.course_code);
    if (patch.course_name !== void 0) upd.course_name = sanitizePlain(patch.course_name);
    if (patch.semester !== void 0) upd.semester = sanitizePlain(patch.semester);
    if (patch.description !== void 0) upd.description = sanitizePlain(patch.description);
    if (patch.instructions !== void 0) upd.instructions = sanitizeRichText(patch.instructions);
    if (patch.duration_minutes !== void 0) {
      const n = Number(patch.duration_minutes);
      if (!Number.isInteger(n) || n < 1 || n > 24 * 60) throw badRequest("Duration must be between 1 and 1440 minutes");
      upd.duration_minutes = n;
    }
    for (const k of ["start_at", "end_at"]) {
      if (patch[k] !== void 0) {
        if (patch[k] === "" || patch[k] === null) upd[k] = "";
        else {
          const d = new Date(patch[k]);
          if (Number.isNaN(d.getTime())) throw badRequest(`${k} is not a valid date/time`);
          upd[k] = d.toISOString();
        }
      }
    }
    if (patch.status !== void 0) {
      if (!ASSESSMENT_STATUSES.includes(patch.status)) throw badRequest("Invalid status");
      upd.status = patch.status;
    }
    if (patch.camera_required !== void 0) upd.camera_required = Boolean(patch.camera_required);
    if (patch.proctoring_enabled !== void 0) upd.proctoring_enabled = Boolean(patch.proctoring_enabled);
    if (patch.results_released !== void 0) upd.results_released = Boolean(patch.results_released);
    if (patch.question_mode !== void 0) {
      if (!["component", "all"].includes(patch.question_mode)) throw badRequest('question_mode must be "component" or "all"');
      upd.question_mode = patch.question_mode;
    }
    if (patch.components !== void 0) {
      if (!Array.isArray(patch.components)) throw badRequest("components must be a list");
      const comps = patch.components.map(sanitizePlain).filter(Boolean);
      if (!comps.length) throw badRequest("At least one component is required");
      if (new Set(comps.map((c) => c.toLowerCase())).size !== comps.length) throw badRequest("Component names must be unique");
      upd.components = comps;
    }
    if (patch.proposal_template !== void 0) upd.proposal_template = validateTemplate(patch.proposal_template);
    return upd;
  }
  function createAssessment(input, actor) {
    const upd = clean(input);
    if (!upd.title) throw badRequest("Title is required");
    const row = getStore().insert("Assessments", {
      course_code: config.course.code,
      course_name: config.course.name,
      semester: config.course.semester,
      duration_minutes: 120,
      status: "draft",
      camera_required: config.monitoring.cameraRequiredDefault,
      proctoring_enabled: true,
      question_mode: "component",
      components: DEFAULT_COMPONENTS,
      proposal_template: DEFAULT_PROPOSAL_TEMPLATE,
      results_released: false,
      ...upd,
      created_by: (actor == null ? void 0 : actor.user_id) || "",
      created_at: nowIso(),
      updated_at: nowIso()
    });
    return decorate(row);
  }
  function updateAssessment(id2, patch) {
    const store2 = getStore();
    const a = store2.get("Assessments", id2);
    if (!a) throw notFound("Assessment not found");
    const upd = clean(patch);
    if (upd.start_at && upd.end_at && Date.parse(upd.end_at) <= Date.parse(upd.start_at)) throw badRequest("End time must be after start time");
    return decorate(store2.update("Assessments", id2, { ...upd, updated_at: nowIso() }));
  }
  function deleteAssessment(id2) {
    const store2 = getStore();
    if (!store2.get("Assessments", id2)) throw notFound("Assessment not found");
    if (store2.count("Attempts", (t) => t.assessment_id === id2)) throw badRequest("This assessment already has student attempts and cannot be deleted. Close it instead.");
    for (const q of store2.find("Questions", (q2) => q2.assessment_id === id2)) store2.remove("Questions", q.question_id);
    store2.remove("Assessments", id2);
  }

  // server/src/api/schemas.js
  var id = external_exports.string().min(1).max(100);
  var login = external_exports.object({ username: external_exports.string().min(1).max(100), password: external_exports.string().min(1).max(200) });
  var changePassword = external_exports.object({ current_password: external_exports.string().min(1), new_password: external_exports.string().min(8).max(200) });
  var saveAnswers = external_exports.object({
    answers: external_exports.array(external_exports.object({ question_id: external_exports.string().min(1), answer: external_exports.string().max(6e4).nullable().optional() })).min(1).max(100)
  });
  var heartbeat = external_exports.object({ camera_status: external_exports.string().max(40).optional() });
  var studentEvent = external_exports.object({
    event_type: external_exports.enum(PROCTORING_EVENT_TYPES),
    description: external_exports.string().max(500).optional().default(""),
    client_time: external_exports.string().max(40).optional()
  });
  var createStudent = external_exports.object({
    matric_no: external_exports.string().min(1).max(30),
    name: external_exports.string().min(1).max(120),
    email: external_exports.string().max(120).optional().default(""),
    section: external_exports.string().max(40).optional().default(""),
    group_id: external_exports.string().max(100).optional().default(""),
    component: external_exports.string().max(60).optional().default(""),
    password: external_exports.string().min(8).max(100).optional()
  });
  var updateStudent = external_exports.object({
    matric_no: external_exports.string().min(1).max(30).optional(),
    name: external_exports.string().min(1).max(120).optional(),
    email: external_exports.string().max(120).optional(),
    section: external_exports.string().max(40).optional(),
    group_id: external_exports.string().max(100).optional(),
    component: external_exports.string().max(60).optional(),
    active: external_exports.boolean().optional()
  });
  var resetStudentPassword = external_exports.object({ password: external_exports.string().min(8).max(100).optional() });
  var createGroup = external_exports.object({ group_name: external_exports.string().min(1).max(80), business_name: external_exports.string().max(160).optional().default(""), business_idea: external_exports.string().max(4e3).optional().default("") });
  var updateGroup = external_exports.object({ group_name: external_exports.string().min(1).max(80).optional(), business_name: external_exports.string().max(160).optional(), business_idea: external_exports.string().max(4e3).optional(), status: external_exports.enum(["active", "inactive"]).optional() });
  var addMember = external_exports.object({ student_id: id, component: external_exports.string().max(60).optional() });
  var assignComponent = external_exports.object({ component: external_exports.string().max(60) });
  var assessment = external_exports.object({
    title: external_exports.string().min(1).max(160).optional(),
    course_code: external_exports.string().max(20).optional(),
    course_name: external_exports.string().max(120).optional(),
    semester: external_exports.string().max(40).optional(),
    description: external_exports.string().max(2e3).optional(),
    instructions: external_exports.string().max(2e4).optional(),
    duration_minutes: external_exports.number().int().optional(),
    start_at: external_exports.string().max(40).nullable().optional(),
    end_at: external_exports.string().max(40).nullable().optional(),
    status: external_exports.enum(ASSESSMENT_STATUSES).optional(),
    camera_required: external_exports.boolean().optional(),
    proctoring_enabled: external_exports.boolean().optional(),
    results_released: external_exports.boolean().optional(),
    question_mode: external_exports.enum(["component", "all"]).optional(),
    components: external_exports.array(external_exports.string().max(60)).optional(),
    proposal_template: external_exports.array(external_exports.object({
      key: external_exports.string().max(60).optional(),
      title: external_exports.string().max(120),
      source: external_exports.enum(["group", "answers"]).optional(),
      source_topics: external_exports.array(external_exports.string().max(120)).optional(),
      compose_fallback: external_exports.string().max(20).optional()
    })).optional()
  });
  var question = external_exports.object({
    section: external_exports.string().max(60).optional(),
    topic: external_exports.string().max(120).optional(),
    question_text: external_exports.string().max(2e4).optional(),
    question_type: external_exports.string().max(30).optional(),
    marks: external_exports.number().optional(),
    time_limit: external_exports.number().nullable().optional(),
    active: external_exports.boolean().optional(),
    guidance: external_exports.string().max(5e3).optional(),
    options: external_exports.array(external_exports.object({ key: external_exports.string().max(5).optional(), text: external_exports.string().max(1e3), correct: external_exports.boolean().optional() })).nullable().optional()
  });
  var questionOrder = external_exports.object({ order: external_exports.array(id) });
  var reviewEvent = external_exports.object({ review_status: external_exports.enum(["pending", "reviewed", "dismissed", "escalated"]), review_note: external_exports.string().max(1e3).optional().default("") });
  var marks = external_exports.object({
    items: external_exports.array(external_exports.object({ question_id: id, marks: external_exports.union([external_exports.number(), external_exports.string(), external_exports.null()]).optional(), lecturer_feedback: external_exports.string().max(1e4).optional() })).default([]),
    lecturer_feedback: external_exports.string().max(1e4).optional()
  });
  var reason = external_exports.object({ reason: external_exports.string().min(1).max(500) });
  var reopenAttempt = external_exports.object({ extra_minutes: external_exports.number().int(), reason: external_exports.string().min(1).max(500) });
  var generateProposal = external_exports.object({ reset: external_exports.boolean().optional().default(false) });
  var editSection = external_exports.object({ html: external_exports.string().max(6e4).nullable() });
  var proposalStatus = external_exports.object({ status: external_exports.enum(["reviewed", "finalised", "exported", "reopen", "notes"]), notes: external_exports.string().max(1e4).optional() });
  var groupReport = external_exports.object({ lecturer_feedback: external_exports.string().max(1e4).optional(), status: external_exports.enum(["draft", "reviewed", "finalised"]).optional() });
  var createUser = external_exports.object({ username: external_exports.string().min(3).max(60), password: external_exports.string().min(8).max(100), role: external_exports.enum(ROLES), name: external_exports.string().min(1).max(120), email: external_exports.string().max(120).optional().default("") });
  var updateUser = external_exports.object({ name: external_exports.string().min(1).max(120).optional(), email: external_exports.string().max(120).optional(), role: external_exports.enum(ROLES).optional(), active: external_exports.boolean().optional(), username: external_exports.string().min(3).max(60).optional() });
  var resetPassword = external_exports.object({ password: external_exports.string().min(8).max(100) });
  var setting = external_exports.object({ value: external_exports.string().max(5e3) });
  var purge = external_exports.object({ days: external_exports.number().int().min(1).max(3650) });

  // server/src/api/router.js
  var STAFF = ["lecturer", "admin"];
  var created = (body) => ({ __status: 201, body });
  function compilePath(path) {
    const keys = [];
    const re = new RegExp(`^${path.replace(/\/:(\w+)/g, (_, k) => {
      keys.push(k);
      return "/([^/]+)";
    })}/?$`);
    return { re, keys };
  }
  function matchRoute(routes2, method, pathname) {
    for (const r2 of routes2) {
      if (r2.method !== method) continue;
      r2._c = r2._c || compilePath(r2.path);
      const m = r2._c.re.exec(pathname);
      if (!m) continue;
      const params = {};
      r2._c.keys.forEach((k, i) => {
        params[k] = decodeURIComponent(m[i + 1]);
      });
      return { route: r2, params };
    }
    return null;
  }
  function checkAuth(route, user) {
    if (route.auth === "none") return;
    if (!user) throw unauthorized();
    if (Array.isArray(route.auth) && !route.auth.includes(user.role)) throw forbidden();
  }
  function validateBody(route, body) {
    if (!route.schema) return body;
    const result = route.schema.safeParse(body != null ? body : {});
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`);
      throw badRequest(issues[0] || "Invalid request", issues);
    }
    return result.data;
  }

  // apps-script/shims/bcryptjs.js
  var ITERATIONS = 2e3;
  var b64 = (bytes) => Utilities.base64Encode(bytes);
  var bytesOf = (s) => Utilities.newBlob(s).getBytes();
  function derive(password, saltB64, iterations) {
    let block = Utilities.computeHmacSha256Signature(bytesOf(`${saltB64}:${password}`), bytesOf(saltB64));
    const acc = block.slice();
    for (let i = 1; i < iterations; i++) {
      block = Utilities.computeHmacSha256Signature(block, bytesOf(saltB64));
      for (let j = 0; j < acc.length; j++) acc[j] ^= block[j];
    }
    return b64(acc);
  }
  function hash(plain) {
    const salt = b64(Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)));
    return `pbkdf2$${ITERATIONS}$${salt}$${derive(plain, salt, ITERATIONS)}`;
  }
  function compare(plain, stored) {
    if (typeof stored !== "string" || !stored.startsWith("pbkdf2$")) return false;
    const [, iter, salt, expected] = stored.split("$");
    const actual = derive(plain, salt, Number(iter));
    if (actual.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  }
  var bcryptjs_default = { hash, compare };

  // server/src/auth/password.js
  var ROUNDS = 10;
  function hashPassword(plain) {
    if (typeof plain !== "string" || plain.length < 8) throw new Error("Password must be at least 8 characters");
    return bcryptjs_default.hash(plain, ROUNDS);
  }
  function verifyPassword(plain, hash2) {
    if (!hash2 || typeof plain !== "string") return false;
    return bcryptjs_default.compare(plain, hash2);
  }

  // server/src/services/users.js
  var publicUser = (u) => u && {
    user_id: u.user_id,
    username: u.username,
    role: u.role,
    name: u.name,
    email: u.email,
    student_id: u.student_id,
    active: u.active,
    must_change_password: u.must_change_password,
    created_at: u.created_at,
    last_login_at: u.last_login_at
  };
  function findByUsername(username) {
    const u = String(username || "").trim().toLowerCase();
    return getStore().findOne("Users", (r2) => String(r2.username).toLowerCase() === u);
  }
  function authenticate(username, password) {
    const user = findByUsername(username);
    const ok = user ? verifyPassword(password, user.password_hash) : false;
    if (!user || !ok) throw unauthorized("Invalid username or password");
    if (!user.active) throw unauthorized("Your account has been deactivated. Contact your lecturer.");
    getStore().update("Users", user.user_id, { last_login_at: nowIso() });
    return user;
  }
  function listUsers() {
    return getStore().list("Users").map(publicUser).sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
  }
  function createUser2({ username, password, role, name, email, student_id, must_change_password = true }) {
    if (!ROLES.includes(role)) throw badRequest("Invalid role");
    if (!username || !name) throw badRequest("Username and name are required");
    if (findByUsername(username)) throw conflict(`Username "${username}" already exists`);
    const password_hash = hashPassword(password);
    const row = getStore().insert("Users", {
      username: String(username).trim(),
      password_hash,
      role,
      name: String(name).trim(),
      email: email || "",
      student_id: student_id || "",
      active: true,
      must_change_password,
      created_at: nowIso(),
      updated_at: nowIso()
    });
    return publicUser(row);
  }
  function updateUser2(id2, patch) {
    const store2 = getStore();
    const u = store2.get("Users", id2);
    if (!u) throw notFound("User not found");
    const allowed = {};
    if (patch.name !== void 0) allowed.name = String(patch.name).trim();
    if (patch.email !== void 0) allowed.email = String(patch.email).trim();
    if (patch.role !== void 0) {
      if (!ROLES.includes(patch.role)) throw badRequest("Invalid role");
      allowed.role = patch.role;
    }
    if (patch.active !== void 0) allowed.active = Boolean(patch.active);
    if (patch.username !== void 0 && patch.username !== u.username) {
      if (findByUsername(patch.username)) throw conflict("Username already exists");
      allowed.username = String(patch.username).trim();
    }
    allowed.updated_at = nowIso();
    return publicUser(store2.update("Users", id2, allowed));
  }
  function resetPassword2(id2, newPassword, { mustChange = true } = {}) {
    const store2 = getStore();
    if (!store2.get("Users", id2)) throw notFound("User not found");
    const password_hash = hashPassword(newPassword);
    return publicUser(store2.update("Users", id2, { password_hash, must_change_password: mustChange, updated_at: nowIso() }));
  }
  function changeOwnPassword(id2, currentPassword, newPassword) {
    const store2 = getStore();
    const u = store2.get("Users", id2);
    if (!u) throw notFound("User not found");
    if (!verifyPassword(currentPassword, u.password_hash)) throw badRequest("Current password is incorrect");
    if (String(newPassword).length < 8) throw badRequest("New password must be at least 8 characters");
    const password_hash = hashPassword(newPassword);
    store2.update("Users", id2, { password_hash, must_change_password: false, updated_at: nowIso() });
  }

  // server/src/services/students.js
  function listStudents({ group_id, active } = {}) {
    const store2 = getStore();
    const groups = new Map(store2.list("Groups").map((g) => [g.group_id, g]));
    return store2.list("Students").filter((s) => (group_id ? s.group_id === group_id : true) && (active === void 0 ? true : s.active === active)).map((s) => withGroup(s, groups.get(s.group_id))).sort((a, b) => (a.group_name || "").localeCompare(b.group_name || "") || a.name.localeCompare(b.name));
  }
  function withGroup(s, g) {
    return {
      ...s,
      component: s.role,
      group_name: (g == null ? void 0 : g.group_name) || "",
      business_name: (g == null ? void 0 : g.business_name) || "",
      business_idea: (g == null ? void 0 : g.business_idea) || ""
    };
  }
  function getStudent(id2) {
    const store2 = getStore();
    const s = store2.get("Students", id2);
    if (!s) throw notFound("Student not found");
    return withGroup(s, s.group_id ? store2.get("Groups", s.group_id) : null);
  }
  function getStudentByUser(user) {
    if (!(user == null ? void 0 : user.student_id)) throw notFound("No student profile is linked to this account");
    return getStudent(user.student_id);
  }
  function findByMatric(matric) {
    const m = String(matric || "").trim().toLowerCase();
    return getStore().findOne("Students", (s) => String(s.matric_no).toLowerCase() === m);
  }
  function createStudent2({ matric_no, name, email, section, group_id, component, password, must_change_password = true }) {
    const store2 = getStore();
    matric_no = sanitizePlain(matric_no).toUpperCase();
    name = sanitizePlain(name);
    if (!matric_no || !name) throw badRequest("Matric number and name are required");
    if (findByMatric(matric_no)) throw conflict(`A student with matric number ${matric_no} already exists`);
    if (findByUsername(matric_no)) throw conflict(`A login with username ${matric_no} already exists`);
    if (group_id && !store2.get("Groups", group_id)) throw badRequest("Group does not exist");
    const student = store2.insert("Students", {
      matric_no,
      name,
      email: sanitizePlain(email),
      group_id: group_id || "",
      role: sanitizePlain(component) || "",
      course_code: config.course.code,
      section: sanitizePlain(section),
      active: true
    });
    const initialPassword = password || generatePassword();
    createUser2({ username: matric_no, password: initialPassword, role: "student", name, email, student_id: student.student_id, must_change_password });
    if (group_id) syncGroupMembers(group_id);
    return { student: getStudent(student.student_id), initialPassword };
  }
  function updateStudent2(id2, patch) {
    const store2 = getStore();
    const s = store2.get("Students", id2);
    if (!s) throw notFound("Student not found");
    const upd = {};
    if (patch.name !== void 0) upd.name = sanitizePlain(patch.name);
    if (patch.email !== void 0) upd.email = sanitizePlain(patch.email);
    if (patch.section !== void 0) upd.section = sanitizePlain(patch.section);
    if (patch.component !== void 0) upd.role = sanitizePlain(patch.component);
    if (patch.active !== void 0) upd.active = Boolean(patch.active);
    if (patch.matric_no !== void 0) {
      const m = sanitizePlain(patch.matric_no).toUpperCase();
      const other = findByMatric(m);
      if (other && other.student_id !== id2) throw conflict("Matric number already in use");
      upd.matric_no = m;
    }
    const oldGroup = s.group_id;
    if (patch.group_id !== void 0 && patch.group_id !== s.group_id) {
      if (patch.group_id && !store2.get("Groups", patch.group_id)) throw badRequest("Group does not exist");
      if (patch.group_id) assertGroupHasSpace(patch.group_id, id2);
      upd.group_id = patch.group_id || "";
    }
    store2.update("Students", id2, upd);
    const user = store2.findOne("Users", (u) => u.student_id === id2);
    if (user) {
      const userPatch = { updated_at: nowIso() };
      if (upd.name) userPatch.name = upd.name;
      if (upd.email !== void 0) userPatch.email = upd.email;
      if (upd.matric_no) userPatch.username = upd.matric_no;
      if (upd.active !== void 0) userPatch.active = upd.active;
      store2.update("Users", user.user_id, userPatch);
    }
    if (upd.group_id !== void 0) {
      if (oldGroup) syncGroupMembers(oldGroup);
      if (upd.group_id) syncGroupMembers(upd.group_id);
    }
    return getStudent(id2);
  }
  function resetStudentPassword2(id2, password) {
    const store2 = getStore();
    const user = store2.findOne("Users", (u) => u.student_id === id2);
    if (!user) throw notFound("Login account not found for this student");
    const pw = password || generatePassword();
    resetPassword2(user.user_id, pw, { mustChange: true });
    return pw;
  }
  function assertGroupHasSpace(group_id, excludingStudentId) {
    const members = getStore().find("Students", (s) => s.group_id === group_id && s.student_id !== excludingStudentId && s.active);
    if (members.length >= 4) throw conflict("A group may have at most 4 members");
  }
  function syncGroupMembers(group_id) {
    var _a;
    const store2 = getStore();
    const g = store2.get("Groups", group_id);
    if (!g) return;
    const members = store2.find("Students", (s) => s.group_id === group_id).sort((a, b) => a.name.localeCompare(b.name));
    const patch = {};
    for (let i = 0; i < 4; i++) patch[`student_${i + 1}`] = ((_a = members[i]) == null ? void 0 : _a.student_id) || "";
    store2.update("Groups", group_id, patch);
  }
  function generatePassword() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let s = "";
    for (let i = 0; i < 10; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    return `${s}!`;
  }

  // server/src/services/groups.js
  function listGroups() {
    const store2 = getStore();
    const students = store2.list("Students");
    return store2.list("Groups").map((g) => ({ ...g, members: students.filter((s) => s.group_id === g.group_id).map((s) => withGroup(s, g)) })).sort((a, b) => a.group_name.localeCompare(b.group_name));
  }
  function getGroup(id2) {
    const store2 = getStore();
    const g = store2.get("Groups", id2);
    if (!g) throw notFound("Group not found");
    const members = store2.find("Students", (s) => s.group_id === id2).map((s) => withGroup(s, g)).sort((a, b) => a.name.localeCompare(b.name));
    return { ...g, members };
  }
  function createGroup2({ group_name, business_name, business_idea }) {
    group_name = sanitizePlain(group_name);
    if (!group_name) throw badRequest("Group name is required");
    const store2 = getStore();
    if (store2.findOne("Groups", (g2) => g2.group_name.toLowerCase() === group_name.toLowerCase())) throw conflict("Group name already exists");
    const g = store2.insert("Groups", {
      group_name,
      business_name: sanitizePlain(business_name),
      business_idea: sanitizePlain(business_idea),
      status: "active"
    });
    return getGroup(g.group_id);
  }
  function updateGroup2(id2, patch) {
    const store2 = getStore();
    const g = store2.get("Groups", id2);
    if (!g) throw notFound("Group not found");
    const upd = {};
    if (patch.group_name !== void 0) {
      const name = sanitizePlain(patch.group_name);
      if (!name) throw badRequest("Group name is required");
      const other = store2.findOne("Groups", (x) => x.group_name.toLowerCase() === name.toLowerCase() && x.group_id !== id2);
      if (other) throw conflict("Group name already exists");
      upd.group_name = name;
    }
    if (patch.business_name !== void 0) upd.business_name = sanitizePlain(patch.business_name);
    if (patch.business_idea !== void 0) upd.business_idea = sanitizePlain(patch.business_idea);
    if (patch.status !== void 0) upd.status = ["active", "inactive"].includes(patch.status) ? patch.status : g.status;
    store2.update("Groups", id2, upd);
    return getGroup(id2);
  }
  function addMember2(group_id, student_id, component) {
    const store2 = getStore();
    if (!store2.get("Groups", group_id)) throw notFound("Group not found");
    const s = store2.get("Students", student_id);
    if (!s) throw notFound("Student not found");
    if (s.group_id && s.group_id !== group_id) {
      const other = store2.get("Groups", s.group_id);
      throw conflict(`${s.name} is already a member of ${(other == null ? void 0 : other.group_name) || "another group"}. Remove them from that group first.`);
    }
    assertGroupHasSpace(group_id, student_id);
    const patch = { group_id };
    if (component !== void 0) patch.role = sanitizePlain(component);
    store2.update("Students", student_id, patch);
    syncGroupMembers(group_id);
    return getGroup(group_id);
  }
  function removeMember(group_id, student_id) {
    const store2 = getStore();
    const s = store2.get("Students", student_id);
    if (!s || s.group_id !== group_id) throw badRequest("Student is not a member of this group");
    store2.update("Students", student_id, { group_id: "" });
    syncGroupMembers(group_id);
    return getGroup(group_id);
  }
  function assignComponent2(group_id, student_id, component) {
    const store2 = getStore();
    const s = store2.get("Students", student_id);
    if (!s || s.group_id !== group_id) throw badRequest("Student is not a member of this group");
    component = sanitizePlain(component);
    store2.update("Students", student_id, { role: component });
    return getGroup(group_id);
  }
  function deleteGroup(id2) {
    const store2 = getStore();
    if (!store2.get("Groups", id2)) throw notFound("Group not found");
    if (store2.count("Students", (s) => s.group_id === id2)) throw conflict("Remove all members before deleting the group");
    if (store2.count("Answers", (a) => a.group_id === id2)) throw conflict("This group has assessment answers and cannot be deleted");
    store2.remove("Groups", id2);
  }

  // server/src/services/questions.js
  function listQuestions(assessment_id, { activeOnly = false } = {}) {
    return getStore().find("Questions", (q) => q.assessment_id === assessment_id && (!activeOnly || q.active)).sort((a, b) => {
      var _a, _b;
      return ((_a = a.order_index) != null ? _a : 0) - ((_b = b.order_index) != null ? _b : 0) || (a.created_at || "").localeCompare(b.created_at || "");
    });
  }
  function getQuestion(id2) {
    const q = getStore().get("Questions", id2);
    if (!q) throw notFound("Question not found");
    return q;
  }
  function questionsForStudent(assessment2, component) {
    const all = listQuestions(assessment2.assessment_id, { activeOnly: true });
    if (assessment2.question_mode === "all") return all;
    const comp = String(component || "").toLowerCase();
    return all.filter((q) => q.section === COMMON_SECTION || q.section.toLowerCase() === comp);
  }
  function clean2(patch, assessment2) {
    const upd = {};
    if (patch.section !== void 0) {
      const section = sanitizePlain(patch.section);
      const allowed = [COMMON_SECTION, ...assessment2.components];
      if (!allowed.some((s) => s.toLowerCase() === section.toLowerCase())) throw badRequest(`Section must be one of: ${allowed.join(", ")}`);
      upd.section = allowed.find((s) => s.toLowerCase() === section.toLowerCase());
    }
    if (patch.topic !== void 0) upd.topic = sanitizePlain(patch.topic);
    if (patch.question_text !== void 0) {
      upd.question_text = sanitizeRichText(patch.question_text);
      if (!upd.question_text) throw badRequest("Question text is required");
    }
    if (patch.question_type !== void 0) {
      if (!QUESTION_TYPES.includes(patch.question_type)) throw badRequest("Invalid question type");
      upd.question_type = patch.question_type;
    }
    if (patch.marks !== void 0) {
      const n = Number(patch.marks);
      if (!Number.isFinite(n) || n < 0 || n > 1e3) throw badRequest("Marks must be a number between 0 and 1000");
      upd.marks = n;
    }
    if (patch.time_limit !== void 0) {
      const n = patch.time_limit === "" || patch.time_limit === null ? null : Number(patch.time_limit);
      if (n !== null && (!Number.isFinite(n) || n < 0)) throw badRequest("Time limit must be a positive number of minutes");
      upd.time_limit = n;
    }
    if (patch.active !== void 0) upd.active = Boolean(patch.active);
    if (patch.guidance !== void 0) upd.guidance = sanitizeRichText(patch.guidance);
    if (patch.options !== void 0) {
      if (patch.options === null) upd.options = null;
      else {
        if (!Array.isArray(patch.options)) throw badRequest("Options must be a list");
        upd.options = patch.options.map((o, i) => ({
          key: sanitizePlain(o.key) || String.fromCharCode(65 + i),
          text: sanitizePlain(o.text),
          correct: Boolean(o.correct)
        })).filter((o) => o.text);
      }
    }
    return upd;
  }
  function createQuestion(assessment_id, input) {
    const assessment2 = getAssessment(assessment_id);
    const upd = clean2({ section: COMMON_SECTION, question_type: "long_answer", marks: 10, active: true, ...input }, assessment2);
    if (!upd.question_text) throw badRequest("Question text is required");
    if (upd.question_type === "multiple_choice" && (!upd.options || upd.options.length < 2)) throw badRequest("Multiple choice questions need at least two options");
    const existing = listQuestions(assessment_id);
    const order_index = existing.length ? Math.max(...existing.map((q) => {
      var _a;
      return (_a = q.order_index) != null ? _a : 0;
    })) + 1 : 1;
    return getStore().insert("Questions", { assessment_id, order_index, ...upd, created_at: nowIso(), updated_at: nowIso() });
  }
  function updateQuestion(id2, patch) {
    const q = getQuestion(id2);
    const assessment2 = getAssessment(q.assessment_id);
    const upd = clean2(patch, assessment2);
    const type = upd.question_type || q.question_type;
    const options = upd.options !== void 0 ? upd.options : q.options;
    if (type === "multiple_choice" && (!options || options.length < 2)) throw badRequest("Multiple choice questions need at least two options");
    return getStore().update("Questions", id2, { ...upd, updated_at: nowIso() });
  }
  function reorderQuestions(assessment_id, orderedIds) {
    const store2 = getStore();
    const qs = listQuestions(assessment_id);
    const ids = new Set(qs.map((q) => q.question_id));
    if (!Array.isArray(orderedIds) || orderedIds.some((id2) => !ids.has(id2))) throw badRequest("Invalid question order");
    let i = 1;
    for (const id2 of orderedIds) store2.update("Questions", id2, { order_index: i++ });
    for (const q of qs) if (!orderedIds.includes(q.question_id)) store2.update("Questions", q.question_id, { order_index: i++ });
    return listQuestions(assessment_id);
  }
  function deleteQuestion(id2) {
    const store2 = getStore();
    const q = getQuestion(id2);
    if (store2.count("Answers", (a) => a.question_id === id2)) throw badRequest("Students have answered this question. Deactivate it instead of deleting.");
    store2.remove("Questions", q.question_id);
  }

  // apps-script/shims/logger.js
  var log = (kind, ...args) => {
    try {
      (kind === "error" ? console.error : console.log)(`[${kind.toUpperCase()}]`, ...args.map((a) => a instanceof Error ? a.message : a));
    } catch {
    }
  };
  var logger = { debug: () => {
  }, info: (...a) => log("info", ...a), warn: (...a) => log("warn", ...a), error: (...a) => log("error", ...a) };

  // server/src/services/audit.js
  function audit(actor, action, entityType, entityId, details, ip) {
    try {
      getStore().insert("AuditLogs", {
        timestamp: nowIso(),
        actor_id: (actor == null ? void 0 : actor.user_id) || "system",
        actor_role: (actor == null ? void 0 : actor.role) || "system",
        actor_name: (actor == null ? void 0 : actor.name) || "System",
        action,
        entity_type: entityType || "",
        entity_id: entityId ? String(entityId) : "",
        details: typeof details === "string" ? details : details ? JSON.stringify(details) : "",
        ip: ip || ""
      });
    } catch (err) {
      logger.error("Audit log failed:", err.message);
    }
  }

  // server/src/services/attempts.js
  var listeners = /* @__PURE__ */ new Set();
  function emit(attempt, reason2) {
    for (const fn of listeners) {
      try {
        fn(attempt, reason2);
      } catch {
      }
    }
  }
  function findAttempt(assessment_id, student_id) {
    return getStore().findOne("Attempts", (t) => t.assessment_id === assessment_id && t.student_id === student_id);
  }
  function getAttempt(id2) {
    const t = getStore().get("Attempts", id2);
    if (!t) throw notFound("Attempt not found");
    return t;
  }
  function remainingSeconds(attempt, now = Date.now()) {
    if (!attempt || attempt.status !== "in_progress" || !attempt.deadline_at) return 0;
    return Math.max(0, Math.floor((Date.parse(attempt.deadline_at) - now) / 1e3));
  }
  function isExpired(attempt, now = Date.now()) {
    return (attempt == null ? void 0 : attempt.status) === "in_progress" && attempt.deadline_at && Date.parse(attempt.deadline_at) <= now;
  }
  function assessmentsForStudent(student) {
    const store2 = getStore();
    return store2.find("Assessments", (a) => a.status !== "draft").map((a) => {
      const full = getAssessment(a.assessment_id);
      const attempt = findAttempt(a.assessment_id, student.student_id);
      return summariseForStudent(full, attempt);
    }).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }
  function summariseForStudent(assessment2, attempt) {
    const a = assessment2;
    return {
      assessment_id: a.assessment_id,
      title: a.title,
      course_code: a.course_code,
      course_name: a.course_name,
      semester: a.semester,
      description: a.description,
      instructions: a.instructions,
      duration_minutes: a.duration_minutes,
      start_at: a.start_at,
      end_at: a.end_at,
      status: a.status,
      is_open_now: a.is_open_now,
      camera_required: a.camera_required,
      proctoring_enabled: a.proctoring_enabled,
      results_released: a.results_released,
      created_at: a.created_at,
      server_time: nowIso(),
      attempt: attempt ? publicAttempt(attempt) : null
    };
  }
  function publicAttempt(t) {
    return {
      attempt_id: t.attempt_id,
      status: t.status,
      started_at: t.started_at,
      deadline_at: t.deadline_at,
      submitted_at: t.submitted_at,
      last_saved_at: t.last_saved_at,
      last_activity_at: t.last_activity_at,
      camera_status: t.camera_status,
      remaining_seconds: remainingSeconds(t),
      marking_status: t.marking_status,
      reopened_at: t.reopened_at
    };
  }
  function startAttempt(student, assessment_id) {
    const store2 = getStore();
    const assessment2 = getAssessment(assessment_id);
    let attempt = findAttempt(assessment_id, student.student_id);
    if (attempt) {
      autoSubmitIfExpired(attempt);
      return getAttempt(attempt.attempt_id);
    }
    if (!isOpenNow(assessment2)) throw forbidden("This assessment is not open at the moment");
    if (!student.group_id) throw forbidden("You have not been assigned to a group yet. Please contact your lecturer.");
    if (assessment2.question_mode === "component" && !student.role) {
      throw forbidden("You have not been assigned a business component yet. Please contact your lecturer.");
    }
    const now = Date.now();
    let deadline = now + assessment2.duration_minutes * 60 * 1e3;
    if (assessment2.end_at) deadline = Math.min(deadline, Date.parse(assessment2.end_at));
    attempt = store2.insert("Attempts", {
      assessment_id,
      student_id: student.student_id,
      group_id: student.group_id,
      component: student.role || "",
      status: "in_progress",
      started_at: new Date(now).toISOString(),
      deadline_at: new Date(deadline).toISOString(),
      last_activity_at: nowIso(),
      camera_status: "unknown",
      flags_count: 0,
      marking_status: "pending"
    });
    audit({ user_id: student.student_id, role: "student", name: student.name }, "ATTEMPT_STARTED", "Attempt", attempt.attempt_id, { assessment_id });
    emit(attempt, "started");
    return attempt;
  }
  function getAttemptContext(student, assessment_id) {
    const assessment2 = getAssessment(assessment_id);
    let attempt = findAttempt(assessment_id, student.student_id);
    if (attempt) attempt = autoSubmitIfExpired(attempt) || attempt;
    const questions = questionsForStudent(assessment2, student.role).map((q) => studentQuestion(q));
    const answers = attempt ? getStore().find("Answers", (a) => a.assessment_id === assessment_id && a.student_id === student.student_id).map((a) => ({ question_id: a.question_id, answer: a.answer, timestamp: a.timestamp, status: a.status })) : [];
    const canSeeMarks = assessment2.results_released && attempt && ["submitted", "auto_submitted"].includes(attempt.status) && attempt.marking_status === "finalised";
    return {
      assessment: summariseForStudent(assessment2, attempt),
      student: {
        student_id: student.student_id,
        name: student.name,
        matric_no: student.matric_no,
        group_id: student.group_id,
        group_name: student.group_name,
        business_name: student.business_name,
        business_idea: student.business_idea,
        component: student.role
      },
      questions,
      answers,
      results: canSeeMarks ? resultsForStudent(student, assessment_id, attempt) : null,
      server_time: nowIso()
    };
  }
  function studentQuestion(q) {
    return {
      question_id: q.question_id,
      section: q.section,
      topic: q.topic,
      question_text: q.question_text,
      question_type: q.question_type,
      marks: q.marks,
      time_limit: q.time_limit,
      order_index: q.order_index,
      guidance: q.guidance,
      options: Array.isArray(q.options) ? q.options.map((o) => ({ key: o.key, text: o.text })) : null
    };
  }
  function resultsForStudent(student, assessment_id, attempt) {
    const answers = getStore().find("Answers", (a) => a.assessment_id === assessment_id && a.student_id === student.student_id);
    return {
      total_marks: attempt.total_marks,
      max_marks: attempt.max_marks,
      lecturer_feedback: attempt.lecturer_feedback,
      marked_at: attempt.marked_at,
      per_question: answers.map((a) => ({ question_id: a.question_id, marks: a.marks, lecturer_feedback: a.lecturer_feedback }))
    };
  }
  function sanitizeAnswer(question2, raw) {
    if (raw === null || raw === void 0) return "";
    switch (question2.question_type) {
      case "multiple_choice": {
        const key = sanitizePlain(raw);
        const keys = (question2.options || []).map((o) => o.key);
        if (key && !keys.includes(key)) throw badRequest("Invalid option selected");
        return key;
      }
      case "numerical":
      // final value on the first line, optional working below (plain text)
      case "short_answer":
        return sanitizePlain(raw).slice(0, 5e3);
      default:
        return sanitizeRichText(raw).slice(0, 45e3);
    }
  }
  function saveAnswers2(student, assessment_id, items) {
    const store2 = getStore();
    const assessment2 = getAssessment(assessment_id);
    const attempt = findAttempt(assessment_id, student.student_id);
    if (!attempt) throw badRequest("Start the assessment before saving answers");
    if (autoSubmitIfExpired(attempt)) throw conflict("Time has expired. Your latest saved answers were submitted automatically.", { code: "TIME_EXPIRED" });
    if (attempt.status !== "in_progress") throw conflict("This attempt has been submitted and is locked", { code: "LOCKED" });
    if (!Array.isArray(items) || !items.length) throw badRequest("No answers provided");
    if (items.length > 100) throw badRequest("Too many answers in one request");
    const visible = new Map(questionsForStudent(assessment2, student.role).map((q) => [q.question_id, q]));
    const saved = [];
    const ts = nowIso();
    for (const item of items) {
      const q = visible.get(item.question_id);
      if (!q) throw forbidden("You cannot answer this question");
      const answer = sanitizeAnswer(q, item.answer);
      const existing = store2.findOne("Answers", (a) => a.assessment_id === assessment_id && a.student_id === student.student_id && a.question_id === q.question_id);
      if (existing) {
        if (existing.answer !== answer) store2.update("Answers", existing.answer_id, { answer, timestamp: ts, status: "draft" });
      } else {
        store2.insert("Answers", {
          assessment_id,
          student_id: student.student_id,
          group_id: attempt.group_id,
          question_id: q.question_id,
          component: attempt.component,
          answer,
          timestamp: ts,
          status: "draft",
          marks: null,
          lecturer_feedback: ""
        });
      }
      saved.push({ question_id: q.question_id, timestamp: ts });
    }
    const updated = store2.update("Attempts", attempt.attempt_id, { last_saved_at: ts, last_activity_at: ts });
    emit(updated, "saved");
    return { saved, server_time: ts, remaining_seconds: remainingSeconds(updated) };
  }
  function markAnswersSubmitted(attempt) {
    const store2 = getStore();
    const answers = store2.find("Answers", (a) => a.assessment_id === attempt.assessment_id && a.student_id === attempt.student_id);
    for (const a of answers) if (a.status !== "submitted") store2.update("Answers", a.answer_id, { status: "submitted" });
  }
  function submitAttempt(student, assessment_id) {
    const store2 = getStore();
    const attempt = findAttempt(assessment_id, student.student_id);
    if (!attempt) throw badRequest("No attempt to submit");
    if (attempt.status !== "in_progress") throw conflict("This attempt has already been submitted");
    markAnswersSubmitted(attempt);
    const updated = store2.update("Attempts", attempt.attempt_id, {
      status: "submitted",
      submitted_at: nowIso(),
      last_activity_at: nowIso(),
      marking_status: "pending"
    });
    audit({ user_id: student.student_id, role: "student", name: student.name }, "ATTEMPT_SUBMITTED", "Attempt", attempt.attempt_id, { assessment_id });
    emit(updated, "submitted");
    return updated;
  }
  function autoSubmitIfExpired(attempt) {
    if (!isExpired(attempt)) return null;
    const store2 = getStore();
    markAnswersSubmitted(attempt);
    const updated = store2.update("Attempts", attempt.attempt_id, {
      status: "auto_submitted",
      submitted_at: attempt.deadline_at,
      marking_status: "pending"
    });
    audit(null, "ATTEMPT_AUTO_SUBMITTED", "Attempt", attempt.attempt_id, { assessment_id: attempt.assessment_id, student_id: attempt.student_id });
    emit(updated, "auto_submitted");
    return updated;
  }
  function sweepExpiredAttempts() {
    const expired = getStore().find("Attempts", (t) => isExpired(t));
    for (const t of expired) autoSubmitIfExpired(t);
    return expired.length;
  }
  function reopenAttempt2(attempt_id, actor, { extra_minutes, reason: reason2 }) {
    const store2 = getStore();
    const attempt = getAttempt(attempt_id);
    if (attempt.status === "in_progress") throw conflict("This attempt is already in progress");
    if (attempt.marking_status === "finalised") throw conflict("Marks for this attempt are finalised. Reopen marking first.");
    const mins = Number(extra_minutes);
    if (!Number.isInteger(mins) || mins < 1 || mins > 600) throw badRequest("Extra minutes must be between 1 and 600");
    if (!sanitizePlain(reason2)) throw badRequest("A reason is required to reopen an attempt");
    const answers = store2.find("Answers", (a) => a.assessment_id === attempt.assessment_id && a.student_id === attempt.student_id);
    for (const a of answers) store2.update("Answers", a.answer_id, { status: "draft" });
    const updated = store2.update("Attempts", attempt_id, {
      status: "in_progress",
      deadline_at: new Date(Date.now() + mins * 6e4).toISOString(),
      submitted_at: "",
      reopened_by: actor.user_id,
      reopened_at: nowIso(),
      reopen_reason: sanitizePlain(reason2)
    });
    audit(actor, "ATTEMPT_REOPENED", "Attempt", attempt_id, { extra_minutes: mins, reason: sanitizePlain(reason2) });
    emit(updated, "reopened");
    return updated;
  }
  function recordActivity(student, assessment_id, { camera_status } = {}) {
    const attempt = findAttempt(assessment_id, student.student_id);
    if (!attempt || attempt.status !== "in_progress") return attempt;
    const cam = camera_status ? sanitizePlain(camera_status).slice(0, 40) : attempt.camera_status;
    const changed = cam !== attempt.camera_status;
    const last = attempt.last_activity_at ? Date.parse(attempt.last_activity_at) : 0;
    if (!changed && Date.now() - last < 4e4) return attempt;
    const updated = getStore().update("Attempts", attempt.attempt_id, { last_activity_at: nowIso(), camera_status: cam });
    emit(updated, "activity");
    return updated;
  }
  function incrementFlags(attempt_id) {
    const store2 = getStore();
    const t = store2.get("Attempts", attempt_id);
    if (!t) return null;
    const updated = store2.update("Attempts", attempt_id, { flags_count: (t.flags_count || 0) + 1 });
    emit(updated, "flag");
    return updated;
  }

  // server/src/services/proctoring.js
  var listeners2 = /* @__PURE__ */ new Set();
  function recordEvent(student, { assessment_id, event_type, description, client_time }) {
    if (!PROCTORING_EVENT_TYPES.includes(event_type)) throw badRequest("Unknown monitoring event type");
    const attempt = findAttempt(assessment_id, student.student_id);
    if (!attempt) throw badRequest("No active attempt for this assessment");
    const severity = PROCTORING_SEVERITY[event_type] || "low";
    const log2 = getStore().insert("ProctoringLogs", {
      assessment_id,
      student_id: student.student_id,
      group_id: attempt.group_id,
      timestamp: nowIso(),
      event_type,
      severity,
      description: sanitizePlain(description).slice(0, 500) + (client_time ? ` (client time ${sanitizePlain(client_time).slice(0, 40)})` : ""),
      review_status: "pending",
      reviewed_by: "",
      review_note: ""
    });
    if (severity !== "info" && attempt.status === "in_progress") incrementFlags(attempt.attempt_id);
    for (const fn of listeners2) {
      try {
        fn(log2, attempt);
      } catch {
      }
    }
    return log2;
  }
  function listEvents({ assessment_id, student_id, group_id, review_status, severity, limit = 500 } = {}) {
    const store2 = getStore();
    const students = new Map(store2.list("Students").map((s) => [s.student_id, s]));
    const groups = new Map(store2.list("Groups").map((g) => [g.group_id, g]));
    return store2.find("ProctoringLogs", (l) => (!assessment_id || l.assessment_id === assessment_id) && (!student_id || l.student_id === student_id) && (!group_id || l.group_id === group_id) && (!review_status || l.review_status === review_status) && (!severity || l.severity === severity)).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit).map((l) => {
      var _a, _b, _c;
      return { ...l, student_name: ((_a = students.get(l.student_id)) == null ? void 0 : _a.name) || "", matric_no: ((_b = students.get(l.student_id)) == null ? void 0 : _b.matric_no) || "", group_name: ((_c = groups.get(l.group_id)) == null ? void 0 : _c.group_name) || "" };
    });
  }
  function monitoringSummary(assessment_id, student_id) {
    const logs = getStore().find("ProctoringLogs", (l) => l.assessment_id === assessment_id && l.student_id === student_id);
    const by_type = {};
    for (const l of logs) by_type[l.event_type] = (by_type[l.event_type] || 0) + 1;
    const flagged = logs.filter((l) => l.severity !== "info");
    return {
      total_events: logs.length,
      flagged_events: flagged.length,
      pending_review: flagged.filter((l) => l.review_status === "pending").length,
      by_type,
      last_event_at: logs.map((l) => l.timestamp).sort().pop() || null
    };
  }
  function reviewEvent2(log_id, { review_status, review_note }, actor) {
    const store2 = getStore();
    const log2 = store2.get("ProctoringLogs", log_id);
    if (!log2) throw notFound("Monitoring event not found");
    if (!["pending", "reviewed", "dismissed", "escalated"].includes(review_status)) throw badRequest("Invalid review status");
    const updated = store2.update("ProctoringLogs", log_id, { review_status, review_note: sanitizePlain(review_note).slice(0, 1e3), reviewed_by: actor.user_id });
    audit(actor, "MONITORING_EVENT_REVIEWED", "ProctoringLog", log_id, { review_status });
    return updated;
  }
  function purgeOlderThan(days, actor) {
    const store2 = getStore();
    const cutoff = Date.now() - Number(days) * 864e5;
    const old = store2.find("ProctoringLogs", (l) => Date.parse(l.timestamp) < cutoff);
    for (const l of old) store2.remove("ProctoringLogs", l.log_id);
    audit(actor, "MONITORING_EVENTS_PURGED", "ProctoringLog", "", { days, removed: old.length });
    return old.length;
  }

  // server/src/services/marking.js
  function getReview(attempt_id) {
    const store2 = getStore();
    const attempt = getAttempt(attempt_id);
    const student = getStudent(attempt.student_id);
    const assessment2 = getAssessment(attempt.assessment_id);
    const questions = questionsForStudent(assessment2, attempt.component || student.role);
    const answers = store2.find("Answers", (a) => a.assessment_id === attempt.assessment_id && a.student_id === attempt.student_id);
    const byQ = new Map(answers.map((a) => [a.question_id, a]));
    const items = questions.map((q, i) => {
      const a = byQ.get(q.question_id);
      return {
        number: i + 1,
        question: q,
        answer: a ? { answer_id: a.answer_id, answer: a.answer, timestamp: a.timestamp, status: a.status, marks: a.marks, lecturer_feedback: a.lecturer_feedback, marked_at: a.marked_at } : null
      };
    });
    const max_marks = questions.reduce((s, q) => s + (q.marks || 0), 0);
    const marked = items.filter((it) => it.answer && it.answer.marks !== null && it.answer.marks !== void 0);
    const total_marks = marked.reduce((s, it) => s + Number(it.answer.marks || 0), 0);
    return {
      attempt: { ...attempt, remaining_seconds: void 0 },
      student,
      assessment: {
        assessment_id: assessment2.assessment_id,
        title: assessment2.title,
        course_code: assessment2.course_code,
        course_name: assessment2.course_name,
        semester: assessment2.semester,
        results_released: assessment2.results_released
      },
      items,
      totals: { total_marks, max_marks, marked_count: marked.length, question_count: questions.length, all_marked: marked.length === questions.length },
      monitoring: monitoringSummary(attempt.assessment_id, attempt.student_id)
    };
  }
  function saveMarks(attempt_id, { items = [], lecturer_feedback }, actor) {
    const store2 = getStore();
    const attempt = getAttempt(attempt_id);
    if (!["submitted", "auto_submitted"].includes(attempt.status)) throw conflict("Marks can only be entered after the student has submitted");
    if (attempt.marking_status === "finalised") throw conflict('Marks are finalised. Use "Reopen marking" before changing them.');
    const assessment2 = getAssessment(attempt.assessment_id);
    const student = getStudent(attempt.student_id);
    const questions = new Map(questionsForStudent(assessment2, attempt.component || student.role).map((q) => [q.question_id, q]));
    const ts = nowIso();
    for (const item of items) {
      const q = questions.get(item.question_id);
      if (!q) throw badRequest("Question does not belong to this student's assessment");
      let marks2 = item.marks;
      if (marks2 === "" || marks2 === void 0) marks2 = null;
      if (marks2 !== null) {
        marks2 = Number(marks2);
        if (!Number.isFinite(marks2) || marks2 < 0) throw badRequest("Marks must be zero or a positive number");
        if (marks2 > q.marks) throw badRequest(`Marks for question "${sanitizePlain(q.topic || q.question_id)}" cannot exceed ${q.marks}`);
      }
      const feedback = item.lecturer_feedback === void 0 ? void 0 : sanitizeRichText(item.lecturer_feedback);
      const existing = store2.findOne("Answers", (a) => a.assessment_id === attempt.assessment_id && a.student_id === attempt.student_id && a.question_id === q.question_id);
      const patch = { marks: marks2, marked_at: ts, marked_by: actor.user_id };
      if (feedback !== void 0) patch.lecturer_feedback = feedback;
      if (existing) store2.update("Answers", existing.answer_id, patch);
      else {
        store2.insert("Answers", {
          assessment_id: attempt.assessment_id,
          student_id: attempt.student_id,
          group_id: attempt.group_id,
          question_id: q.question_id,
          component: attempt.component,
          answer: "",
          timestamp: "",
          status: "unanswered",
          lecturer_feedback: "",
          ...patch
        });
      }
    }
    const totals = recomputeTotals(attempt, questions);
    const upd = { ...totals, marking_status: "draft", marked_by: actor.user_id, marked_at: ts };
    if (lecturer_feedback !== void 0) upd.lecturer_feedback = sanitizeRichText(lecturer_feedback);
    store2.update("Attempts", attempt_id, upd);
    audit(actor, "MARKS_SAVED", "Attempt", attempt_id, { items: items.length });
    return getReview(attempt_id);
  }
  function recomputeTotals(attempt, questions) {
    const answers = getStore().find("Answers", (a) => a.assessment_id === attempt.assessment_id && a.student_id === attempt.student_id);
    const total = answers.filter((a) => questions.has(a.question_id)).reduce((s, a) => s + (a.marks === null || a.marks === void 0 ? 0 : Number(a.marks)), 0);
    const max = Array.from(questions.values()).reduce((s, q) => s + (q.marks || 0), 0);
    return { total_marks: total, max_marks: max };
  }
  function finaliseMarking(attempt_id, actor) {
    const review = getReview(attempt_id);
    if (!["submitted", "auto_submitted"].includes(review.attempt.status)) throw conflict("The student has not submitted");
    if (review.attempt.marking_status === "finalised") throw conflict("Already finalised");
    if (!review.totals.all_marked) throw badRequest(`All ${review.totals.question_count} questions must be marked before finalising (${review.totals.marked_count} marked)`);
    getStore().update("Attempts", attempt_id, { marking_status: "finalised", marked_by: actor.user_id, marked_at: nowIso() });
    audit(actor, "MARKS_FINALISED", "Attempt", attempt_id, { total_marks: review.totals.total_marks, max_marks: review.totals.max_marks });
    return getReview(attempt_id);
  }
  function reopenMarking(attempt_id, actor, reason2) {
    const attempt = getAttempt(attempt_id);
    if (attempt.marking_status !== "finalised") throw conflict("Marking is not finalised");
    if (!sanitizePlain(reason2)) throw badRequest("A reason is required to reopen finalised marks");
    getStore().update("Attempts", attempt_id, { marking_status: "draft" });
    audit(actor, "MARKING_REOPENED", "Attempt", attempt_id, { reason: sanitizePlain(reason2) });
    return getReview(attempt_id);
  }
  function listAttempts({ assessment_id, group_id, status, marking_status } = {}) {
    const store2 = getStore();
    const students = new Map(store2.list("Students").map((s) => [s.student_id, s]));
    const groups = new Map(store2.list("Groups").map((g) => [g.group_id, g]));
    return store2.find("Attempts", (t) => (!assessment_id || t.assessment_id === assessment_id) && (!group_id || t.group_id === group_id) && (!status || t.status === status) && (!marking_status || t.marking_status === marking_status)).map((t) => {
      const s = students.get(t.student_id);
      const g = groups.get(t.group_id);
      return { ...t, student_name: (s == null ? void 0 : s.name) || "", matric_no: (s == null ? void 0 : s.matric_no) || "", group_name: (g == null ? void 0 : g.group_name) || "", business_name: (g == null ? void 0 : g.business_name) || "" };
    }).sort((a, b) => a.group_name.localeCompare(b.group_name) || a.student_name.localeCompare(b.student_name));
  }

  // server/src/services/proposals.js
  var escapeHtml = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function findProposal(group_id, assessment_id) {
    return getStore().findOne("BusinessProposals", (p) => p.group_id === group_id && p.assessment_id === assessment_id);
  }
  function contributionStatus(group, assessment2) {
    const store2 = getStore();
    const members = group.members.map((m) => {
      var _a, _b;
      const attempt = findAttempt(assessment2.assessment_id, m.student_id);
      const questions = questionsForStudent(assessment2, m.role);
      const answers = store2.find("Answers", (a) => a.assessment_id === assessment2.assessment_id && a.student_id === m.student_id && a.answer);
      return {
        student_id: m.student_id,
        name: m.name,
        matric_no: m.matric_no,
        component: m.role || "(not assigned)",
        attempt_status: (attempt == null ? void 0 : attempt.status) || "not_started",
        submitted: Boolean(attempt && ["submitted", "auto_submitted"].includes(attempt.status)),
        answered_count: answers.filter((a) => questions.some((q) => q.question_id === a.question_id)).length,
        question_count: questions.length,
        marking_status: (attempt == null ? void 0 : attempt.marking_status) || "pending",
        total_marks: (_a = attempt == null ? void 0 : attempt.total_marks) != null ? _a : null,
        max_marks: (_b = attempt == null ? void 0 : attempt.max_marks) != null ? _b : null
      };
    });
    const submitted = members.filter((m) => m.submitted).length;
    return { members, submitted, total: members.length, complete: members.length > 0 && submitted === members.length };
  }
  function assembleSections(group, assessment2) {
    const store2 = getStore();
    const questions = listQuestions(assessment2.assessment_id, { activeOnly: true });
    const numbering = new Map(questions.map((q, i) => [q.question_id, i + 1]));
    const answers = store2.find("Answers", (a) => a.assessment_id === assessment2.assessment_id && a.group_id === group.group_id);
    const members = new Map(group.members.map((m) => [m.student_id, m]));
    const contributionsFor = (q) => answers.filter((a) => a.question_id === q.question_id && members.has(a.student_id)).filter((a) => {
      const m = members.get(a.student_id);
      if (assessment2.question_mode === "all" || q.section === COMMON_SECTION) return true;
      return String(m.role || "").toLowerCase() === String(q.section).toLowerCase();
    }).map((a) => {
      const m = members.get(a.student_id);
      return {
        answer_id: a.answer_id,
        student_id: a.student_id,
        student_name: m.name,
        matric_no: m.matric_no,
        component: m.role || "",
        group_id: group.group_id,
        group_name: group.group_name,
        question_id: q.question_id,
        question_number: numbering.get(q.question_id),
        question_topic: q.topic,
        question_section: q.section,
        question_text: q.question_text,
        answer_html: a.answer || "",
        answer_status: a.status,
        timestamp: a.timestamp
      };
    }).sort((x, y) => x.student_name.localeCompare(y.student_name));
    return assessment2.proposal_template.map((section) => {
      let contributions = [];
      let generated_html = "";
      let note = "";
      if (section.source === "group") {
        generated_html = `<h3>${escapeHtml(group.business_name || "Business name not set")}</h3>` + (group.business_idea ? `<p>${escapeHtml(group.business_idea)}</p>` : "<p><em>Business idea not recorded.</em></p>") + `<p><strong>Group:</strong> ${escapeHtml(group.group_name)}<br/><strong>Members:</strong> ${group.members.map((m) => `${escapeHtml(m.name)} (${escapeHtml(m.role || "component not assigned")})`).join(", ")}</p>`;
        note = "Generated from the group record (business name, business idea, members).";
      } else {
        const topics = new Set((section.source_topics || []).map(normaliseTopic));
        const matching = questions.filter((q) => topics.has(normaliseTopic(q.topic)));
        for (const q of matching) contributions.push(...contributionsFor(q));
        contributions = contributions.filter((c) => c.answer_html && htmlToText(c.answer_html));
        if (!contributions.length && section.compose_fallback === "excerpts") {
          const firsts = [];
          for (const m of group.members) {
            const own = answers.filter((a) => a.student_id === m.student_id && a.answer && htmlToText(a.answer)).sort((a, b) => (numbering.get(a.question_id) || 0) - (numbering.get(b.question_id) || 0));
            if (own[0]) {
              const q = questions.find((qq) => qq.question_id === own[0].question_id);
              const text = htmlToText(own[0].answer).split(/\n+/)[0].slice(0, 600);
              firsts.push({ m, q, text, a: own[0] });
            }
          }
          contributions = firsts.map(({ m, q, text, a }) => ({
            answer_id: a.answer_id,
            student_id: m.student_id,
            student_name: m.name,
            matric_no: m.matric_no,
            component: m.role || "",
            group_id: group.group_id,
            group_name: group.group_name,
            question_id: q.question_id,
            question_number: numbering.get(q.question_id),
            question_topic: q.topic,
            question_section: q.section,
            question_text: q.question_text,
            answer_html: `<p>${escapeHtml(text)}</p>`,
            answer_status: a.status,
            timestamp: a.timestamp,
            excerpt: true
          }));
          note = contributions.length ? "Auto-composed from the opening paragraph of each member's first contribution (no question carries this topic). The lecturer may edit this section." : "No contributions yet.";
        } else if (!matching.length) note = `No question is mapped to this section (expected topic: ${section.source_topics.join(" / ") || "none"}). Configure a question topic or edit the section manually.`;
        else if (!contributions.length) note = "No contributions yet for this section.";
        generated_html = contributions.map((c) => c.answer_html).join("\n");
      }
      return { key: section.key, title: section.title, source: section.source, source_topics: section.source_topics || [], contributions, generated_html, note };
    });
  }
  function computedStatus(status, complete) {
    if (["reviewed", "finalised", "exported"].includes(status)) return status;
    return complete ? "ready_for_review" : "contributions_incomplete";
  }
  function renderProposal(group_id, assessment_id) {
    const group = getGroup(group_id);
    const assessment2 = getAssessment(assessment_id);
    const row = findProposal(group_id, assessment_id);
    const edits = new Map(((row == null ? void 0 : row.sections_json) || []).map((s) => [s.key, s]));
    const sections = assembleSections(group, assessment2).map((s) => {
      const e = edits.get(s.key);
      return { ...s, edited_html: (e == null ? void 0 : e.edited_html) || null, edited_by: (e == null ? void 0 : e.edited_by) || null, edited_at: (e == null ? void 0 : e.edited_at) || null, html: (e == null ? void 0 : e.edited_html) || s.generated_html };
    });
    const contrib = contributionStatus(group, assessment2);
    return {
      proposal_id: (row == null ? void 0 : row.proposal_id) || null,
      group_id,
      assessment_id,
      group: { group_id, group_name: group.group_name, business_name: group.business_name, business_idea: group.business_idea },
      members: group.members.map((m) => ({ student_id: m.student_id, name: m.name, matric_no: m.matric_no, component: m.role })),
      assessment: { assessment_id, title: assessment2.title, course_code: assessment2.course_code, course_name: assessment2.course_name, semester: assessment2.semester },
      status: row ? computedStatus(row.status, contrib.complete) : "draft",
      generated: Boolean(row),
      generated_at: (row == null ? void 0 : row.generated_at) || null,
      updated_at: (row == null ? void 0 : row.updated_at) || null,
      reviewed_by: (row == null ? void 0 : row.reviewed_by) || null,
      reviewed_at: (row == null ? void 0 : row.reviewed_at) || null,
      finalised_by: (row == null ? void 0 : row.finalised_by) || null,
      finalised_at: (row == null ? void 0 : row.finalised_at) || null,
      lecturer_notes: (row == null ? void 0 : row.lecturer_notes) || "",
      contributions: contrib,
      sections
    };
  }
  function generateProposal2(group_id, assessment_id, actor, { reset = false } = {}) {
    const store2 = getStore();
    const existing = findProposal(group_id, assessment_id);
    if (existing && ["finalised", "exported"].includes(existing.status)) throw conflict("This proposal is finalised. Reopen it before regenerating.");
    const group = getGroup(group_id);
    const assessment2 = getAssessment(assessment_id);
    const sections = assembleSections(group, assessment2);
    const contrib = contributionStatus(group, assessment2);
    const prevEdits = new Map(((existing == null ? void 0 : existing.sections_json) || []).map((s) => [s.key, s]));
    const sections_json = sections.map((s) => {
      var _a, _b, _c;
      return {
        key: s.key,
        title: s.title,
        contribution_refs: s.contributions.map((c) => ({ answer_id: c.answer_id, student_id: c.student_id, question_id: c.question_id, excerpt: Boolean(c.excerpt) })),
        edited_html: reset ? null : ((_a = prevEdits.get(s.key)) == null ? void 0 : _a.edited_html) || null,
        edited_by: reset ? null : ((_b = prevEdits.get(s.key)) == null ? void 0 : _b.edited_by) || null,
        edited_at: reset ? null : ((_c = prevEdits.get(s.key)) == null ? void 0 : _c.edited_at) || null
      };
    });
    const textOf = (key) => {
      var _a;
      return htmlToText(((_a = sections.find((s) => s.key === key)) == null ? void 0 : _a.generated_html) || "").slice(0, 4e4);
    };
    const status = computedStatus((existing == null ? void 0 : existing.status) || "draft", contrib.complete);
    const fields = {
      group_id,
      assessment_id,
      business_name: group.business_name,
      executive_summary: textOf("executive_summary"),
      marketing: textOf("marketing_strategy"),
      product_plan: textOf("product_plan"),
      operations: textOf("operations"),
      financial_plan: textOf("financial_plan"),
      other_sections: sections.filter((s) => !["executive_summary", "marketing_strategy", "product_plan", "operations", "financial_plan"].includes(s.key)).map((s) => ({ key: s.key, title: s.title, text: htmlToText(s.generated_html).slice(0, 4e3) })),
      generated_document: `${assessment2.title} \u2014 ${group.group_name} \u2014 ${group.business_name} \u2014 generated ${nowIso()} \u2014 ${sections.length} sections (full document is rendered from stored answers)`,
      status: status === "reviewed" && !contrib.complete ? "contributions_incomplete" : status,
      sections_json,
      generated_at: nowIso(),
      updated_at: nowIso()
    };
    let row;
    if (existing) row = store2.update("BusinessProposals", existing.proposal_id, fields);
    else row = store2.insert("BusinessProposals", { ...fields, reviewed_by: "", reviewed_at: "", finalised_by: "", finalised_at: "", lecturer_notes: "" });
    audit(actor, existing ? "PROPOSAL_REGENERATED" : "PROPOSAL_GENERATED", "BusinessProposal", row.proposal_id, { group_id, assessment_id, complete: contrib.complete });
    return renderProposal(group_id, assessment_id);
  }
  function editSection2(group_id, assessment_id, key, html, actor) {
    const store2 = getStore();
    const row = findProposal(group_id, assessment_id);
    if (!row) throw notFound("Generate the proposal first");
    if (["finalised", "exported"].includes(row.status)) throw conflict("This proposal is finalised and cannot be edited");
    const sections = Array.isArray(row.sections_json) ? row.sections_json : [];
    const idx = sections.findIndex((s) => s.key === key);
    if (idx < 0) throw badRequest("Unknown section");
    const clean3 = html === null || html === "" ? null : sanitizeRichText(html).slice(0, 45e3);
    sections[idx] = { ...sections[idx], edited_html: clean3, edited_by: clean3 ? actor.user_id : null, edited_at: clean3 ? nowIso() : null };
    store2.update("BusinessProposals", row.proposal_id, { sections_json: sections, updated_at: nowIso() });
    audit(actor, clean3 ? "PROPOSAL_SECTION_EDITED" : "PROPOSAL_SECTION_RESET", "BusinessProposal", row.proposal_id, { key });
    return renderProposal(group_id, assessment_id);
  }
  function setProposalStatus(group_id, assessment_id, status, actor, notes) {
    const store2 = getStore();
    const row = findProposal(group_id, assessment_id);
    if (!row) throw notFound("Generate the proposal first");
    const group = getGroup(group_id);
    const contrib = contributionStatus(group, getAssessment(assessment_id));
    const patch = { updated_at: nowIso() };
    if (notes !== void 0) patch.lecturer_notes = sanitizeRichText(notes);
    switch (status) {
      case "reviewed":
        if (["finalised", "exported"].includes(row.status)) throw conflict("Proposal is already finalised");
        patch.status = "reviewed";
        patch.reviewed_by = actor.user_id;
        patch.reviewed_at = nowIso();
        break;
      case "finalised":
        if (!contrib.complete) throw conflict("All members must submit before the proposal can be finalised");
        patch.status = "finalised";
        patch.finalised_by = actor.user_id;
        patch.finalised_at = nowIso();
        if (!row.reviewed_at) {
          patch.reviewed_by = actor.user_id;
          patch.reviewed_at = nowIso();
        }
        break;
      case "exported":
        if (!["finalised", "exported"].includes(row.status)) throw conflict("Finalise the proposal before marking it as printed/exported");
        patch.status = "exported";
        break;
      case "reopen":
        patch.status = computedStatus("draft", contrib.complete);
        patch.finalised_by = "";
        patch.finalised_at = "";
        break;
      case "notes":
        break;
      // notes only
      default:
        throw badRequest("Unsupported status change");
    }
    store2.update("BusinessProposals", row.proposal_id, patch);
    audit(actor, `PROPOSAL_${status.toUpperCase()}`, "BusinessProposal", row.proposal_id, { group_id, assessment_id });
    return renderProposal(group_id, assessment_id);
  }
  function proposalOverview(assessment_id) {
    const assessment2 = getAssessment(assessment_id);
    const store2 = getStore();
    return store2.list("Groups").map((g) => {
      const group = getGroup(g.group_id);
      const contrib = contributionStatus(group, assessment2);
      const row = findProposal(g.group_id, assessment_id);
      return {
        group_id: g.group_id,
        group_name: g.group_name,
        business_name: g.business_name,
        proposal_id: (row == null ? void 0 : row.proposal_id) || null,
        status: row ? computedStatus(row.status, contrib.complete) : "draft",
        generated_at: (row == null ? void 0 : row.generated_at) || null,
        submitted: contrib.submitted,
        total: contrib.total,
        members: contrib.members
      };
    }).sort((a, b) => a.group_name.localeCompare(b.group_name));
  }

  // server/src/services/reports.js
  function branding() {
    return { ...config.course, generated_at: nowIso() };
  }
  function individualReport(attempt_id) {
    const review = getReview(attempt_id);
    return { ...review, branding: branding(), report_type: "individual" };
  }
  function groupReport2(group_id, assessment_id) {
    const group = getGroup(group_id);
    const assessment2 = getAssessment(assessment_id);
    const contrib = contributionStatus(group, assessment2);
    const proposal = findProposal(group_id, assessment_id);
    const stored = getStore().findOne("GroupReports", (r2) => r2.group_id === group_id && r2.assessment_id === assessment_id);
    const marked = contrib.members.filter((m) => m.total_marks !== null && m.total_marks !== void 0 && m.marking_status !== "pending");
    const sum = marked.reduce((s, m) => s + Number(m.total_marks || 0), 0);
    const maxSum = marked.reduce((s, m) => s + Number(m.max_marks || 0), 0);
    const overview = proposalOverview(assessment_id).find((p) => p.group_id === group_id);
    return {
      report_type: "group",
      branding: branding(),
      report_id: (stored == null ? void 0 : stored.report_id) || null,
      group: { group_id, group_name: group.group_name, business_name: group.business_name, business_idea: group.business_idea },
      assessment: { assessment_id, title: assessment2.title, course_code: assessment2.course_code, course_name: assessment2.course_name, semester: assessment2.semester },
      members: contrib.members,
      submission: { submitted: contrib.submitted, total: contrib.total, complete: contrib.complete },
      marking: {
        marked_count: marked.length,
        finalised_count: contrib.members.filter((m) => m.marking_status === "finalised").length,
        total_group_score: sum,
        max_group_score: maxSum,
        average_percentage: maxSum ? Math.round(sum / maxSum * 1e3) / 10 : null
      },
      proposal: { status: (overview == null ? void 0 : overview.status) || "draft", generated_at: (proposal == null ? void 0 : proposal.generated_at) || null, reviewed_at: (proposal == null ? void 0 : proposal.reviewed_at) || null, finalised_at: (proposal == null ? void 0 : proposal.finalised_at) || null },
      lecturer_feedback: (stored == null ? void 0 : stored.lecturer_feedback) || "",
      status: (stored == null ? void 0 : stored.status) || "draft",
      reviewed_by: (stored == null ? void 0 : stored.reviewed_by) || null,
      reviewed_at: (stored == null ? void 0 : stored.reviewed_at) || null,
      updated_at: (stored == null ? void 0 : stored.updated_at) || null
    };
  }
  function saveGroupReport(group_id, assessment_id, { lecturer_feedback, status }, actor) {
    const store2 = getStore();
    const data = groupReport2(group_id, assessment_id);
    const existing = store2.findOne("GroupReports", (r2) => r2.group_id === group_id && r2.assessment_id === assessment_id);
    const row = {
      group_id,
      assessment_id,
      business_name: data.group.business_name,
      members: data.members.map((m) => ({ student_id: m.student_id, name: m.name, matric_no: m.matric_no, component: m.component, total_marks: m.total_marks, max_marks: m.max_marks, marking_status: m.marking_status, attempt_status: m.attempt_status })),
      submission_status: data.submission.complete ? "complete" : `${data.submission.submitted}/${data.submission.total} submitted`,
      proposal_status: data.proposal.status,
      total_group_score: data.marking.total_group_score,
      lecturer_feedback: lecturer_feedback === void 0 ? (existing == null ? void 0 : existing.lecturer_feedback) || "" : sanitizeRichText(lecturer_feedback),
      generated_document: `Group report \u2014 ${data.group.group_name} \u2014 ${data.assessment.title} \u2014 ${nowIso()}`,
      reviewed_by: actor.user_id,
      reviewed_at: nowIso(),
      status: ["draft", "reviewed", "finalised"].includes(status) ? status : (existing == null ? void 0 : existing.status) || "draft",
      generated_at: (existing == null ? void 0 : existing.generated_at) || nowIso(),
      updated_at: nowIso()
    };
    const saved = existing ? store2.update("GroupReports", existing.report_id, row) : store2.insert("GroupReports", row);
    audit(actor, "GROUP_REPORT_SAVED", "GroupReport", saved.report_id, { group_id, assessment_id, status: saved.status });
    return groupReport2(group_id, assessment_id);
  }
  function dashboardStats(assessment_id) {
    const store2 = getStore();
    const students = listStudents({ active: true });
    const groups = listGroups();
    const attempts = assessment_id ? listAttempts({ assessment_id }) : [];
    const byStudent = new Map(attempts.map((t) => [t.student_id, t]));
    const submitted = attempts.filter((t) => ["submitted", "auto_submitted"].includes(t.status));
    const inProgress = attempts.filter((t) => t.status === "in_progress");
    const notStarted = students.filter((s) => !byStudent.has(s.student_id));
    const proposals = assessment_id ? proposalOverview(assessment_id) : [];
    const pendingFlags = assessment_id ? store2.count("ProctoringLogs", (l) => l.assessment_id === assessment_id && l.severity !== "info" && l.review_status === "pending") : 0;
    const assessment2 = assessment_id ? getAssessment(assessment_id) : null;
    return {
      assessment: assessment2 ? { assessment_id, title: assessment2.title, status: assessment2.status, is_open_now: assessment2.is_open_now, question_count: listQuestions(assessment_id, { activeOnly: true }).length } : null,
      total_students: students.length,
      total_groups: groups.length,
      not_started: notStarted.length,
      in_progress: inProgress.length,
      submitted: submitted.length,
      not_submitted: students.length - submitted.length,
      marking_completed: submitted.filter((t) => t.marking_status === "finalised").length,
      marking_pending: submitted.filter((t) => t.marking_status !== "finalised").length,
      proposal_incomplete: proposals.filter((p) => ["draft", "contributions_incomplete"].includes(p.status)).length,
      proposal_ready: proposals.filter((p) => ["ready_for_review", "reviewed", "finalised", "exported"].includes(p.status)).length,
      monitoring_alerts: pendingFlags,
      server_time: nowIso()
    };
  }
  function studentStatusList(assessment_id) {
    const students = listStudents({ active: true });
    return students.map((s) => {
      var _a, _b;
      const t = assessment_id ? findAttempt(assessment_id, s.student_id) : null;
      return {
        student_id: s.student_id,
        name: s.name,
        matric_no: s.matric_no,
        group_id: s.group_id,
        group_name: s.group_name,
        business_name: s.business_name,
        component: s.role,
        attempt_id: (t == null ? void 0 : t.attempt_id) || null,
        attempt_status: (t == null ? void 0 : t.status) || "not_started",
        marking_status: (t == null ? void 0 : t.marking_status) || "pending",
        total_marks: (_a = t == null ? void 0 : t.total_marks) != null ? _a : null,
        max_marks: (_b = t == null ? void 0 : t.max_marks) != null ? _b : null,
        camera_status: (t == null ? void 0 : t.camera_status) || "unknown",
        last_activity_at: (t == null ? void 0 : t.last_activity_at) || null,
        submitted_at: (t == null ? void 0 : t.submitted_at) || null,
        deadline_at: (t == null ? void 0 : t.deadline_at) || null,
        started_at: (t == null ? void 0 : t.started_at) || null,
        flags: (t == null ? void 0 : t.flags_count) || 0
      };
    });
  }

  // server/src/api/routes.js
  var SETTING_KEYS = {
    privacy_notice: "Text shown to students before camera access is requested",
    monitoring_retention_days: "Days to keep monitoring events (used by the purge action)",
    allow_video_recording: "Reserved: video recording is NOT implemented; live metadata only",
    institution_name: "Institution name override",
    department_name: "Department name override",
    centre_name: "Centre name override",
    programme_name: "Programme name override",
    course_code: "Course code override",
    course_name: "Course name override",
    semester: "Semester override"
  };
  var r = (method, path, auth, handler, extra = {}) => ({ method, path, auth, handler, ...extra });
  var studentOf = (ctx) => getStudentByUser(ctx.user);
  var routes = [
    // ---- Public --------------------------------------------------------------
    r("GET", "/health", "none", () => ({ ok: true, time: nowIso() })),
    r("GET", "/meta", "none", () => {
      var _a, _b;
      return {
        course: config.course,
        server_time: nowIso(),
        question_types: QUESTION_TYPES.map((v) => ({ value: v, label: QUESTION_TYPE_LABELS[v] })),
        proctoring_event_types: PROCTORING_EVENT_TYPES,
        default_components: DEFAULT_COMPONENTS,
        default_proposal_template: DEFAULT_PROPOSAL_TEMPLATE,
        common_section: COMMON_SECTION,
        data_store: config.dataStore,
        edition: config.edition,
        realtime: config.realtime,
        ice_servers: config.monitoring.iceServers.map((s) => config.monitoring.turnUsername && String(s.urls).startsWith("turn") ? { ...s, username: config.monitoring.turnUsername, credential: config.monitoring.turnCredential } : s),
        monitoring_retention_days: Number((_a = getStore().get("Settings", "monitoring_retention_days")) == null ? void 0 : _a.value) || config.monitoring.retentionDays,
        privacy_notice: ((_b = getStore().get("Settings", "privacy_notice")) == null ? void 0 : _b.value) || ""
      };
    }),
    r("GET", "/meta/time", "none", () => ({ server_time: nowIso(), epoch_ms: Date.now() })),
    // ---- Auth ----------------------------------------------------------------
    r("POST", "/auth/login", "none", (ctx) => {
      const user = authenticate(ctx.body.username, ctx.body.password);
      audit({ user_id: user.user_id, role: user.role, name: user.name }, "LOGIN", "User", user.user_id, null, ctx.ip);
      return { token: signToken(user), user: publicUser(user), expires_in: config.jwtExpiresIn };
    }, { schema: login, rateLimit: "login" }),
    r("GET", "/auth/me", "any", (ctx) => ({ user: publicUser(getStore().get("Users", ctx.user.user_id)) })),
    r("POST", "/auth/change-password", "any", (ctx) => {
      changeOwnPassword(ctx.user.user_id, ctx.body.current_password, ctx.body.new_password);
      ctx.audit("PASSWORD_CHANGED", "User", ctx.user.user_id);
      return { ok: true };
    }, { schema: changePassword }),
    r("POST", "/auth/logout", "any", (ctx) => {
      ctx.audit("LOGOUT", "User", ctx.user.user_id);
      return { ok: true };
    }),
    // ---- Student -------------------------------------------------------------
    r("GET", "/student/dashboard", ["student"], (ctx) => {
      const s = studentOf(ctx);
      return {
        student: { student_id: s.student_id, name: s.name, matric_no: s.matric_no, email: s.email, section: s.section, group_id: s.group_id, group_name: s.group_name, business_name: s.business_name, business_idea: s.business_idea, component: s.role },
        assessments: assessmentsForStudent(s),
        course: config.course,
        server_time: nowIso()
      };
    }),
    r("GET", "/student/assessments/:id", ["student"], (ctx) => getAttemptContext(studentOf(ctx), ctx.params.id)),
    r("POST", "/student/assessments/:id/start", ["student"], (ctx) => {
      const s = studentOf(ctx);
      startAttempt(s, ctx.params.id);
      return getAttemptContext(s, ctx.params.id);
    }),
    r("POST", "/student/assessments/:id/answers", ["student"], (ctx) => saveAnswers2(studentOf(ctx), ctx.params.id, ctx.body.answers), { schema: saveAnswers }),
    r("POST", "/student/assessments/:id/submit", ["student"], (ctx) => {
      const s = studentOf(ctx);
      submitAttempt(s, ctx.params.id);
      return getAttemptContext(s, ctx.params.id);
    }),
    r("POST", "/student/assessments/:id/heartbeat", ["student"], (ctx) => {
      const attempt = recordActivity(studentOf(ctx), ctx.params.id, ctx.body);
      return { server_time: nowIso(), attempt: attempt ? publicAttempt(attempt) : null };
    }, { schema: heartbeat }),
    r("POST", "/student/assessments/:id/events", ["student"], (ctx) => {
      const log2 = recordEvent(studentOf(ctx), { assessment_id: ctx.params.id, ...ctx.body });
      return created({ log_id: log2.log_id, timestamp: log2.timestamp });
    }, { schema: studentEvent }),
    // ---- Lecturer: dashboard ---------------------------------------------------
    r("GET", "/lecturer/dashboard", STAFF, (ctx) => {
      var _a;
      const assessment_id = ctx.query.assessment_id || ((_a = listAssessments()[0]) == null ? void 0 : _a.assessment_id) || null;
      return { stats: dashboardStats(assessment_id), students: studentStatusList(assessment_id), assessments: listAssessments(), groups: listGroups() };
    }),
    // ---- Lecturer: students -----------------------------------------------------
    r("GET", "/lecturer/students", STAFF, (ctx) => ({ students: listStudents({ group_id: ctx.query.group_id }) })),
    r("POST", "/lecturer/students", STAFF, (ctx) => {
      const result = createStudent2(ctx.body);
      ctx.audit("STUDENT_CREATED", "Student", result.student.student_id, { matric_no: result.student.matric_no });
      return created(result);
    }, { schema: createStudent }),
    r("PATCH", "/lecturer/students/:id", STAFF, (ctx) => {
      const s = updateStudent2(ctx.params.id, ctx.body);
      ctx.audit("STUDENT_UPDATED", "Student", s.student_id, ctx.body);
      return { student: s };
    }, { schema: updateStudent }),
    r("POST", "/lecturer/students/:id/reset-password", STAFF, (ctx) => {
      const password = resetStudentPassword2(ctx.params.id, ctx.body.password);
      ctx.audit("STUDENT_PASSWORD_RESET", "Student", ctx.params.id);
      return { password };
    }, { schema: resetStudentPassword }),
    // ---- Lecturer: groups -------------------------------------------------------
    r("GET", "/lecturer/groups", STAFF, () => ({ groups: listGroups() })),
    r("GET", "/lecturer/groups/:id", STAFF, (ctx) => ({ group: getGroup(ctx.params.id) })),
    r("POST", "/lecturer/groups", STAFF, (ctx) => {
      const g = createGroup2(ctx.body);
      ctx.audit("GROUP_CREATED", "Group", g.group_id, { group_name: g.group_name });
      return created({ group: g });
    }, { schema: createGroup }),
    r("PATCH", "/lecturer/groups/:id", STAFF, (ctx) => {
      const g = updateGroup2(ctx.params.id, ctx.body);
      ctx.audit("GROUP_UPDATED", "Group", g.group_id, ctx.body);
      return { group: g };
    }, { schema: updateGroup }),
    r("DELETE", "/lecturer/groups/:id", STAFF, (ctx) => {
      deleteGroup(ctx.params.id);
      ctx.audit("GROUP_DELETED", "Group", ctx.params.id);
      return { ok: true };
    }),
    r("POST", "/lecturer/groups/:id/members", STAFF, (ctx) => {
      const g = addMember2(ctx.params.id, ctx.body.student_id, ctx.body.component);
      ctx.audit("GROUP_MEMBER_ADDED", "Group", g.group_id, ctx.body);
      return { group: g };
    }, { schema: addMember }),
    r("DELETE", "/lecturer/groups/:id/members/:student_id", STAFF, (ctx) => {
      const g = removeMember(ctx.params.id, ctx.params.student_id);
      ctx.audit("GROUP_MEMBER_REMOVED", "Group", g.group_id, { student_id: ctx.params.student_id });
      return { group: g };
    }),
    r("PUT", "/lecturer/groups/:id/members/:student_id/component", STAFF, (ctx) => {
      const g = assignComponent2(ctx.params.id, ctx.params.student_id, ctx.body.component);
      ctx.audit("COMPONENT_ASSIGNED", "Student", ctx.params.student_id, ctx.body);
      return { group: g };
    }, { schema: assignComponent }),
    // ---- Lecturer: assessments & questions -----------------------------------------
    r("GET", "/lecturer/assessments", STAFF, () => ({ assessments: listAssessments() })),
    r("GET", "/lecturer/assessments/:id", STAFF, (ctx) => ({ assessment: getAssessment(ctx.params.id), questions: listQuestions(ctx.params.id) })),
    r("POST", "/lecturer/assessments", STAFF, (ctx) => {
      const a = createAssessment(ctx.body, ctx.user);
      ctx.audit("ASSESSMENT_CREATED", "Assessment", a.assessment_id, { title: a.title });
      return created({ assessment: a });
    }, { schema: assessment }),
    r("PATCH", "/lecturer/assessments/:id", STAFF, (ctx) => {
      const a = updateAssessment(ctx.params.id, ctx.body);
      ctx.audit("ASSESSMENT_UPDATED", "Assessment", a.assessment_id, Object.keys(ctx.body));
      return { assessment: a };
    }, { schema: assessment }),
    r("DELETE", "/lecturer/assessments/:id", STAFF, (ctx) => {
      deleteAssessment(ctx.params.id);
      ctx.audit("ASSESSMENT_DELETED", "Assessment", ctx.params.id);
      return { ok: true };
    }),
    r("GET", "/lecturer/assessments/:id/questions", STAFF, (ctx) => ({ questions: listQuestions(ctx.params.id) })),
    r("POST", "/lecturer/assessments/:id/questions", STAFF, (ctx) => {
      const q = createQuestion(ctx.params.id, ctx.body);
      ctx.audit("QUESTION_CREATED", "Question", q.question_id, { section: q.section, topic: q.topic });
      return created({ question: q });
    }, { schema: question }),
    r("PUT", "/lecturer/assessments/:id/questions/order", STAFF, (ctx) => {
      const qs = reorderQuestions(ctx.params.id, ctx.body.order);
      ctx.audit("QUESTIONS_REORDERED", "Assessment", ctx.params.id);
      return { questions: qs };
    }, { schema: questionOrder }),
    r("PATCH", "/lecturer/questions/:id", STAFF, (ctx) => {
      const q = updateQuestion(ctx.params.id, ctx.body);
      ctx.audit("QUESTION_UPDATED", "Question", q.question_id, Object.keys(ctx.body));
      return { question: q };
    }, { schema: question }),
    r("DELETE", "/lecturer/questions/:id", STAFF, (ctx) => {
      deleteQuestion(ctx.params.id);
      ctx.audit("QUESTION_DELETED", "Question", ctx.params.id);
      return { ok: true };
    }),
    // ---- Lecturer: monitoring -------------------------------------------------------
    r("GET", "/lecturer/assessments/:id/monitoring", STAFF, (ctx) => {
      sweepExpiredAttempts();
      return { students: studentStatusList(ctx.params.id), events: listEvents({ assessment_id: ctx.params.id, limit: 200 }), server_time: nowIso() };
    }),
    r("GET", "/lecturer/monitoring/events", STAFF, (ctx) => ({ events: listEvents({ ...ctx.query, limit: Math.min(Number(ctx.query.limit) || 500, 2e3) }) })),
    r("PATCH", "/lecturer/monitoring/events/:id", STAFF, (ctx) => ({ event: reviewEvent2(ctx.params.id, ctx.body, ctx.user) }), { schema: reviewEvent }),
    // ---- Lecturer: attempts, review, marking ------------------------------------------
    r("GET", "/lecturer/attempts", STAFF, (ctx) => {
      sweepExpiredAttempts();
      return { attempts: listAttempts(ctx.query) };
    }),
    r("GET", "/lecturer/attempts/:id/review", STAFF, (ctx) => getReview(ctx.params.id)),
    r("PUT", "/lecturer/attempts/:id/marks", STAFF, (ctx) => saveMarks(ctx.params.id, ctx.body, ctx.user), { schema: marks }),
    r("POST", "/lecturer/attempts/:id/finalise", STAFF, (ctx) => finaliseMarking(ctx.params.id, ctx.user)),
    r("POST", "/lecturer/attempts/:id/reopen-marking", STAFF, (ctx) => reopenMarking(ctx.params.id, ctx.user, ctx.body.reason), { schema: reason }),
    r("POST", "/lecturer/attempts/:id/reopen", STAFF, (ctx) => ({ attempt: reopenAttempt2(ctx.params.id, ctx.user, ctx.body) }), { schema: reopenAttempt }),
    // ---- Lecturer: proposals -----------------------------------------------------------
    r("GET", "/lecturer/assessments/:id/proposals", STAFF, (ctx) => ({ proposals: proposalOverview(ctx.params.id) })),
    r("GET", "/lecturer/assessments/:id/proposals/:group_id", STAFF, (ctx) => ({ proposal: renderProposal(ctx.params.group_id, ctx.params.id) })),
    r("POST", "/lecturer/assessments/:id/proposals/:group_id/generate", STAFF, (ctx) => ({ proposal: generateProposal2(ctx.params.group_id, ctx.params.id, ctx.user, ctx.body) }), { schema: generateProposal }),
    r("PUT", "/lecturer/assessments/:id/proposals/:group_id/sections/:key", STAFF, (ctx) => ({ proposal: editSection2(ctx.params.group_id, ctx.params.id, ctx.params.key, ctx.body.html, ctx.user) }), { schema: editSection }),
    r("POST", "/lecturer/assessments/:id/proposals/:group_id/status", STAFF, (ctx) => ({ proposal: setProposalStatus(ctx.params.group_id, ctx.params.id, ctx.body.status, ctx.user, ctx.body.notes) }), { schema: proposalStatus }),
    // ---- Lecturer: reports --------------------------------------------------------------
    r("GET", "/lecturer/reports/individual/:attempt_id", STAFF, (ctx) => {
      const rep = individualReport(ctx.params.attempt_id);
      ctx.audit("INDIVIDUAL_REPORT_VIEWED", "Attempt", ctx.params.attempt_id);
      return rep;
    }),
    r("GET", "/lecturer/reports/group/:assessment_id/:group_id", STAFF, (ctx) => groupReport2(ctx.params.group_id, ctx.params.assessment_id)),
    r("PUT", "/lecturer/reports/group/:assessment_id/:group_id", STAFF, (ctx) => saveGroupReport(ctx.params.group_id, ctx.params.assessment_id, ctx.body, ctx.user), { schema: groupReport }),
    r("GET", "/lecturer/audit", STAFF, (ctx) => ({ logs: getStore().list("AuditLogs").sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, Math.min(Number(ctx.query.limit) || 200, 1e3)) })),
    // ---- Admin ------------------------------------------------------------------------------
    r("GET", "/admin/users", ["admin"], () => ({ users: listUsers() })),
    r("POST", "/admin/users", ["admin"], (ctx) => {
      if (ctx.body.role === "student") throw badRequest("Create student accounts from the lecturer Student Manager so a student profile is linked");
      const u = createUser2({ ...ctx.body, must_change_password: true });
      ctx.audit("USER_CREATED", "User", u.user_id, { role: u.role, username: u.username });
      return created({ user: u });
    }, { schema: createUser }),
    r("PATCH", "/admin/users/:id", ["admin"], (ctx) => {
      if (ctx.params.id === ctx.user.user_id && (ctx.body.active === false || ctx.body.role && ctx.body.role !== "admin")) throw badRequest("You cannot deactivate or demote your own account");
      const u = updateUser2(ctx.params.id, ctx.body);
      ctx.audit("USER_UPDATED", "User", u.user_id, ctx.body);
      return { user: u };
    }, { schema: updateUser }),
    r("POST", "/admin/users/:id/reset-password", ["admin"], (ctx) => {
      const u = resetPassword2(ctx.params.id, ctx.body.password);
      ctx.audit("USER_PASSWORD_RESET", "User", u.user_id);
      return { user: u };
    }, { schema: resetPassword }),
    r("GET", "/admin/settings", ["admin"], () => ({
      settings: getStore().list("Settings"),
      keys: SETTING_KEYS,
      env: { data_store: config.dataStore, edition: config.edition, sheet_id_configured: Boolean(config.sheets.sheetId), service_account: config.sheets.serviceAccountEmail ? config.sheets.serviceAccountEmail.replace(/^(.{3}).+(@.+)$/, "$1***$2") : "", retention_days_default: config.monitoring.retentionDays }
    })),
    r("PUT", "/admin/settings/:key", ["admin"], (ctx) => {
      const key = ctx.params.key;
      if (!SETTING_KEYS[key]) throw badRequest("Unknown setting key");
      const store2 = getStore();
      const value = sanitizePlain(ctx.body.value);
      const existing = store2.get("Settings", key);
      const row = existing ? store2.update("Settings", key, { value, updated_at: nowIso(), updated_by: ctx.user.user_id }) : store2.insert("Settings", { key, value, updated_at: nowIso(), updated_by: ctx.user.user_id });
      ctx.audit("SETTING_UPDATED", "Setting", key);
      return { setting: row };
    }, { schema: setting }),
    r("GET", "/admin/audit", ["admin"], (ctx) => {
      const limit = Math.min(Number(ctx.query.limit) || 500, 5e3);
      const logs = getStore().list("AuditLogs").filter((l) => (!ctx.query.action || l.action === ctx.query.action) && (!ctx.query.actor_id || l.actor_id === ctx.query.actor_id)).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
      return { logs };
    }),
    r("POST", "/admin/retention/purge-monitoring", ["admin"], (ctx) => ({ removed: purgeOlderThan(ctx.body.days, ctx.user) }), { schema: purge }),
    r("GET", "/admin/health", ["admin"], () => ({ ok: true, data_store: config.dataStore, counts: Object.fromEntries(["Users", "Students", "Groups", "Assessments", "Questions", "Attempts", "Answers", "ProctoringLogs", "BusinessProposals", "GroupReports", "AuditLogs"].map((t) => [t, getStore().count(t)])) }))
  ];

  // server/src/demo/demoContent.js
  var DEMO_GROUPS = [
    {
      group_name: "Group A",
      business_name: "Eco-Friendly Food Delivery",
      business_idea: "A campus food-delivery service that uses reusable containers and bicycle couriers to cut single-use packaging and emissions.",
      members: [
        { name: "Abu (DEMO)", matric_no: "DEMO-A001", component: "Marketing" },
        { name: "Ali (DEMO)", matric_no: "DEMO-A002", component: "Product Planning" },
        { name: "Ahmad (DEMO)", matric_no: "DEMO-A003", component: "Financial Planning" }
      ],
      profile: { market: "UTHM students and staff ordering lunch and dinner on campus", competitors: "GrabFood, foodpanda and cafeteria walk-ins", product: "a mobile ordering app with a deposit-based reusable container scheme", price: "RM 2 delivery fee with a RM 1 container deposit refunded on return", startup: "RM 18,000 for bicycles, insulated bags, 600 containers and app development", revenue: "RM 9,500 per month at 190 orders a day", breakeven: "month 11", innovation: "a container-return QR tracking system that rewards students with discount points" }
    },
    {
      group_name: "Group B",
      business_name: "Smart Waste Management",
      business_idea: "Sensor-equipped campus bins that report fill levels so cleaning teams collect only when needed and recycling rates can be measured.",
      members: [
        { name: "Siti (DEMO)", matric_no: "DEMO-B001", component: "Marketing" },
        { name: "Aina (DEMO)", matric_no: "DEMO-B002", component: "Product Planning" },
        { name: "Farah (DEMO)", matric_no: "DEMO-B003", component: "Financial Planning" }
      ],
      profile: { market: "university facilities departments and residential colleges", competitors: "conventional scheduled collection and imported smart-bin vendors", product: "a low-cost ultrasonic bin sensor with a LoRaWAN gateway and a web dashboard", price: "RM 45 per sensor per month on a subscription basis", startup: "RM 32,000 for 120 sensors, two gateways and dashboard development", revenue: "RM 5,400 per month from a first campus contract", breakeven: "month 14", innovation: "predictive collection routes generated from fill-level history" }
    },
    {
      group_name: "Group C",
      business_name: "Campus Smart Parking",
      business_idea: "A real-time parking availability app for campus car parks using camera-based occupancy detection and a reservation feature for events.",
      members: [
        { name: "Adam (DEMO)", matric_no: "DEMO-C001", component: "Marketing" },
        { name: "Hakim (DEMO)", matric_no: "DEMO-C002", component: "Product Planning" },
        { name: "Danish (DEMO)", matric_no: "DEMO-C003", component: "Financial Planning" }
      ],
      profile: { market: "staff and postgraduate drivers across the main campus car parks", competitors: "manual guards and generic parking apps without campus coverage", product: "an occupancy-detection camera module per car park row and a reservation app", price: "RM 3 per event reservation and a RM 1,200 monthly licence to the university", startup: "RM 27,000 for cameras, edge computers and app development", revenue: "RM 4,800 per month from licences and reservations", breakeven: "month 12", innovation: "event-day dynamic allocation that opens restricted bays automatically" }
    }
  ];
  var DEMO_QUESTIONS = [
    { section: "Marketing", topic: "Target Market", question_type: "structured", marks: 10, question_text: "<p>Describe the <strong>target market</strong> for your group's business. Identify the primary customer segment, estimate its size on campus, and explain the key needs or pain points that your business addresses.</p>" },
    { section: "Marketing", topic: "Marketing Strategy", question_type: "long_answer", marks: 10, question_text: "<p>Propose a <strong>marketing strategy</strong> for the first six months of operation. Cover positioning, pricing approach, promotion channels (online and on-campus), and how you will measure success.</p>" },
    { section: "Marketing", topic: "Competitive Analysis", question_type: "case_study", marks: 10, question_text: "<p>Conduct a <strong>competitive analysis</strong>. Identify at least two existing alternatives that your customers use today, compare them with your business on price, convenience and sustainability, and state your competitive advantage.</p>" },
    { section: "Product Planning", topic: "Business Problem", question_type: "structured", marks: 10, question_text: "<p>State the <strong>business problem</strong> your group is solving. Explain who experiences the problem, how often, and what evidence (observations, surveys or data) shows that the problem is real on campus.</p>" },
    { section: "Product Planning", topic: "Product / Service Planning", question_type: "long_answer", marks: 10, question_text: "<p>Describe the <strong>product or service</strong> in detail: its core features, the technology used, the customer journey from first contact to repeat use, and the minimum viable version you would launch first.</p>" },
    { section: "Product Planning", topic: "Innovation", question_type: "scenario", marks: 10, question_text: "<p>A competitor launches a similar service next semester. Explain the <strong>innovation</strong> in your product or process that is difficult to copy, and how you would continue to improve it.</p>" },
    { section: "Financial Planning", topic: "Operations Plan", question_type: "structured", marks: 10, question_text: "<p>Prepare an <strong>operations plan</strong>: the key activities, staffing (roles and hours), equipment, suppliers and the monthly operating costs needed to deliver the service reliably.</p>" },
    { section: "Financial Planning", topic: "Financial Plan", question_type: "structured", marks: 10, question_text: "<p>Prepare the <strong>financial plan</strong>: start-up cost, sources of funding, pricing, projected monthly revenue for the first year, and the expected break-even point. Show your working.</p>" },
    { section: "Financial Planning", topic: "Conclusion", question_type: "short_answer", marks: 10, question_text: "<p>Write a <strong>conclusion</strong> that summarises why this business is financially sustainable and the main risks the group must manage in year one.</p>" }
  ];
  function demoAnswer(topic, g) {
    const p = g.profile;
    switch (topic) {
      case "Target Market":
        return `<p><strong>Primary segment.</strong> ${g.business_name} targets ${p.market}. From our informal count during one week, this segment represents several thousand potential users across the main campus.</p><p><strong>Key needs.</strong> Customers want convenience, predictable cost and a visibly sustainable option. Our survey of 60 respondents (DEMO data) found that 72% would switch providers for a greener service at the same price.</p>`;
      case "Marketing Strategy":
        return `<p><strong>Positioning.</strong> The convenient, sustainable choice on campus. <strong>Pricing.</strong> ${p.price}.</p><p><strong>Promotion.</strong> Launch week booths at the student centre, Instagram and TikTok reels, residential college ambassadors and a referral code that gives both parties a discount.</p><p><strong>Measurement.</strong> Weekly active users, repeat-order rate and cost per acquisition reviewed every fortnight.</p>`;
      case "Competitive Analysis":
        return `<p>Customers currently rely on ${p.competitors}.</p><ul><li><strong>Price:</strong> comparable or lower because we operate only on campus.</li><li><strong>Convenience:</strong> faster because our team is based inside the campus.</li><li><strong>Sustainability:</strong> our strongest advantage; competitors do not offer it.</li></ul><p><strong>Competitive advantage:</strong> a campus-only focus combined with a measurable sustainability promise.</p>`;
      case "Business Problem":
        return `<p>${g.business_idea}</p><p>The problem is experienced daily by ${p.market}. Our observations over five days and a short survey (DEMO data) confirmed that the current situation causes waste, delays and frustration, and that no existing campus service addresses it.</p>`;
      case "Product / Service Planning":
        return `<p><strong>Core offering.</strong> ${p.product}.</p><p><strong>Customer journey.</strong> Discover through campus promotion, register with a student email, use the service, receive a confirmation, and return as a repeat customer through loyalty points.</p><p><strong>Minimum viable version.</strong> A single-location pilot for one semester with manual fallback processes before scaling to the whole campus.</p>`;
      case "Innovation":
        return `<p>Our key innovation is ${p.innovation}. It is difficult to copy because it depends on data we collect from day one and on relationships with campus units.</p><p>We will continue improving through monthly user feedback sessions and by releasing a new feature every semester.</p>`;
      case "Operations Plan":
        return `<p><strong>Key activities.</strong> Daily service delivery, maintenance, customer support and weekly reporting.</p><p><strong>Staffing.</strong> Three founders working part-time (15 hours each per week) plus two part-time student assistants during peak hours.</p><p><strong>Equipment and suppliers.</strong> ${p.startup.split(" for ")[1] || "core equipment"} sourced from local suppliers with a maintenance contract.</p><p><strong>Monthly operating cost.</strong> Approximately RM 3,200 covering wages, consumables, hosting and maintenance.</p>`;
      case "Financial Plan":
        return `<p><strong>Start-up cost:</strong> ${p.startup}.</p><p><strong>Funding:</strong> founders' contribution (40%), university entrepreneurship grant (40%) and a small family loan (20%).</p><p><strong>Pricing:</strong> ${p.price}.</p><p><strong>Projected revenue:</strong> ${p.revenue}, growing 5% per month after the pilot.</p><p><strong>Break-even:</strong> expected in ${p.breakeven}, based on monthly operating costs of RM 3,200.</p>`;
      case "Conclusion":
        return `${g.business_name} is financially sustainable because recurring revenue exceeds operating costs after the pilot period and start-up costs are recovered by ${p.breakeven}. The main year-one risks are slower adoption than projected, equipment downtime and dependence on campus approvals, which we manage through a phased pilot and a maintenance reserve.`;
      default:
        return `<p>DEMO answer for ${topic}.</p>`;
    }
  }

  // server/src/demo/seed.js
  var import_meta = {};
  function seedDemo(store2, { withAnswers = true, log: log2 = console.log } = {}) {
    const password = config.demoPassword;
    const admin = createUser2({ username: "admin", password, role: "admin", name: "Demo Administrator", must_change_password: false });
    const lecturer = createUser2({ username: "lecturer", password, role: "lecturer", name: "Demo Lecturer", must_change_password: false });
    const assessment2 = createAssessment({
      title: `${config.course.assessmentTitle} (DEMO)`,
      description: "DEMO assessment seeded for evaluation. All data is fictional.",
      instructions: "<p>Answer every question assigned to your business component. Your answers will be combined with your group members' answers into one business proposal.</p><p>Keep your camera on if required and stay on this tab for the duration of the assessment.</p>",
      duration_minutes: 120,
      status: "open",
      camera_required: true,
      proctoring_enabled: true,
      question_mode: "component"
    }, admin);
    const questions = [];
    for (const q of DEMO_QUESTIONS) questions.push(createQuestion(assessment2.assessment_id, q));
    const groups = [];
    for (const g of DEMO_GROUPS) {
      const group = createGroup2({ group_name: g.group_name, business_name: g.business_name, business_idea: g.business_idea });
      const members = [];
      for (const m of g.members) {
        const { student } = createStudent2({ matric_no: m.matric_no, name: m.name, email: "", section: "DEMO", group_id: group.group_id, component: m.component, password, must_change_password: false });
        members.push(student);
      }
      groups.push({ def: g, group, members });
    }
    if (withAnswers) {
      const plan = [[0, [0, 1, 2]], [1, [0, 1]]];
      for (const [gi, memberIdx] of plan) {
        const g = groups[gi];
        for (const mi of memberIdx) {
          const student = getStudent(g.members[mi].student_id);
          startAttempt(student, assessment2.assessment_id);
          const mine = questions.filter((q) => q.section === student.role);
          saveAnswers2(student, assessment2.assessment_id, mine.map((q) => ({ question_id: q.question_id, answer: demoAnswer(q.topic, g.def) })));
          submitAttempt(student, assessment2.assessment_id);
        }
      }
    }
    updateAssessment(assessment2.assessment_id, { status: "open" });
    store2.flush();
    log2("");
    log2("DEMO data created. Login accounts (all use the same password):");
    log2(`  password : ${password}`);
    log2("  admin    : admin");
    log2("  lecturer : lecturer");
    for (const g of groups) for (const m of g.members) log2(`  student  : ${m.matric_no.padEnd(10)} ${m.name} \u2014 ${g.def.group_name}, ${m.role}`);
    log2("");
    return { admin, lecturer, assessment: assessment2, questions, groups };
  }
  function wipe(store2) {
    for (const t of TABLE_NAMES) for (const row of store2.list(t)) store2.remove(t, row[Object.keys(row)[0]]);
    store2.flush();
  }
  var isMain = typeof process !== "undefined" && process.argv && process.argv[1] && import_meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
  if (isMain) {
    const args = new Set(process.argv.slice(2));
    const store2 = createStore();
    if (args.has("--reset")) {
      logger.warn("Wiping ALL existing data\u2026");
      wipe(store2);
    }
    if (store2.count("Users")) {
      logger.error("The store already contains users. Run with --reset to wipe everything first (this deletes ALL data).");
      process.exit(1);
    }
    seedDemo(store2, { withAnswers: !args.has("--no-answers") });
    store2.close();
    process.exit(0);
  }

  // apps-script/src/main.js
  var VERSION = "1.0.0";
  var MUTATING = /* @__PURE__ */ new Set(["POST", "PUT", "PATCH", "DELETE"]);
  function json(status, body) {
    const out = ContentService.createTextOutput(JSON.stringify({ status, body }));
    out.setMimeType(ContentService.MimeType.JSON);
    return out;
  }
  function parseRequest(e) {
    let req = {};
    try {
      req = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    } catch {
      return null;
    }
    const method = String(req.method || "GET").toUpperCase();
    const full = String(req.path || "/");
    const [pathname, qs = ""] = full.split("?");
    const query = {};
    for (const part of qs.split("&")) {
      if (!part) continue;
      const [k, v = ""] = part.split("=");
      query[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, " "));
    }
    return { method, pathname: pathname.replace(/\/+$/, "") || "/", query, body: req.body || {}, token: req.token || "" };
  }
  function applyScope(store2, route, params, query, user) {
    const p = route.path;
    if (p.startsWith("/student/")) {
      store2.setScope({ student_id: user.student_id });
      return;
    }
    if (/^\/lecturer\/attempts\/:id\//.test(p) || p === "/lecturer/reports/individual/:attempt_id") {
      const attempt = store2.fetchById("Attempts", params.id || params.attempt_id);
      if (attempt) store2.setScope({ student_id: attempt.student_id });
      return;
    }
    if (params.group_id && (p.includes("/proposals/:group_id") || p.includes("/reports/group/"))) {
      store2.setScope({ group_id: params.group_id });
      return;
    }
    if (p === "/lecturer/assessments/:id/monitoring") {
      store2.setScope({}, { ProctoringLogs: 400 });
      return;
    }
    if (p === "/lecturer/monitoring/events") {
      if (query.student_id) store2.setScope({ student_id: query.student_id });
      else store2.setScope({}, { ProctoringLogs: Math.min(Number(query.limit) || 500, 2e3) });
      return;
    }
    if (p === "/lecturer/dashboard") {
      store2.setScope({}, { ProctoringLogs: 2e3 });
      return;
    }
    if (p === "/lecturer/audit" || p === "/admin/audit") {
      store2.setScope({}, { AuditLogs: Math.min(Number(query.limit) || 500, 5e3) });
    }
  }
  function handle(req) {
    const store2 = createStore();
    const match = matchRoute(routes, req.method, req.pathname);
    if (!match) return { status: 404, body: { error: "API route not found" } };
    const { route, params } = match;
    try {
      let user = null;
      if (route.auth !== "none") user = resolveUser(req.token);
      checkAuth(route, user);
      applyScope(store2, route, params, req.query, user);
      const body = validateBody(route, req.body);
      const ctx = { user, params, query: req.query, body, ip: "", audit: (action, entityType, entityId, details) => audit(user, action, entityType, entityId, details, "") };
      const result = route.handler(ctx);
      if (result && result.__status) return { status: result.__status, body: result.body };
      return { status: 200, body: result };
    } catch (err) {
      const status = err.status || 500;
      if (status >= 500) console.error(err && err.stack ? err.stack : err);
      return { status, body: { error: status >= 500 ? `Internal error: ${err.message}` : err.message, details: err.details, code: err.details && err.details.code } };
    }
  }
  function needsLock(req) {
    if (!MUTATING.has(req.method)) return false;
    return !req.pathname.startsWith("/student/");
  }
  function doPost(e) {
    const req = parseRequest(e);
    if (!req) return json(400, { error: "Invalid JSON request" });
    if (needsLock(req)) {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(28e3);
      } catch {
        return json(503, { error: "The server is busy. Please try again in a moment." });
      }
      try {
        const res2 = handle(req);
        return json(res2.status, res2.body);
      } finally {
        lock.releaseLock();
      }
    }
    const res = handle(req);
    return json(res.status, res.body);
  }
  function doGet(e) {
    const action = e && e.parameter && e.parameter.action;
    if (action === "meta") {
      const res = handle({ method: "GET", pathname: "/meta", query: {}, body: {}, token: "" });
      return json(res.status, res.body);
    }
    return json(200, { ok: true, edition: "apps-script", version: VERSION, time: (/* @__PURE__ */ new Date()).toISOString(), message: "Technopreneurship Final Assessment API is running. Point the web application (config.json \u2192 apiUrl) at this URL." });
  }
  function setup() {
    const store2 = createStore();
    store2.ensureAll();
    ensureSecret();
    if (store2.count("Users")) {
      console.log("Setup complete. Users already exist; no new administrator was created.");
      return "Worksheets verified. Users already exist.";
    }
    const password = `Admin-${Utilities.getUuid().slice(0, 8)}`;
    createUser2({ username: "admin", password, role: "admin", name: "System Administrator", must_change_password: true });
    const msg = `Worksheets created. First administrator account \u2192 username: admin   password: ${password}   (change it at first login)`;
    console.log(msg);
    return msg;
  }
  function seedDemoData() {
    const store2 = createStore();
    store2.ensureAll();
    ensureSecret();
    if (store2.count("Users")) {
      const msg = "The spreadsheet already contains users. Demo data is only seeded into an empty spreadsheet.";
      console.log(msg);
      return msg;
    }
    const lines = [];
    seedDemo(store2, { withAnswers: true, log: (l) => lines.push(l) });
    console.log(lines.join("\n"));
    return lines.join("\n");
  }
  return __toCommonJS(main_exports);
})();

// ---- Apps Script entry points (must be top-level functions) ----
function doGet(e) { return TFA.doGet(e); }
function doPost(e) { return TFA.doPost(e); }
function setup() { return TFA.setup(); }
function seedDemoData() { return TFA.seedDemoData(); }
