const jsParser = require("@babel/parser");
const t = require("@babel/types");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const lodash = require("lodash");
const event = require("./event");
const { getPageTypeInstancePath } = require("../common/utils-busi/traverse");
const { config } = require("../config/base");

// js的state数据列表
let stateDataArr = [];

module.exports = function (jsSourceCode = "", options = {}) {
  stateDataArr = getStateDataFromJsCode(jsSourceCode);
  return function plugin(tree) {
    tree.walk(function (node) {
      // debugger;
      //标签转换
      if (node.tag) {
        let newTag = tagTransform(node.tag);
        node.tag = newTag;
      }
      // 转换属性
      if (node.attrs instanceof Object) {
        // debugger
        let newAttrs = attrsTransform(node.attrs, options);
        node.attrs = newAttrs;
      }
      // 转换content
      if (Array.isArray(node.content)) {
        node.content = node.content.map((item) => {
          if (/{{.*}}/g.test(item)&&!/<!--.*-->/g.test(item)) {
            return contentTransform(item);
          } else {
            return item;
          }
        });
      }
      return node;
    });
    return tree;
  };
};

// 标签转换
function tagTransform(tag) {
  // 标签映射关系表：key为Uni，val为微信小程序
  const TagMap = {
    view: "block",
  };
  let newTag = lodash.findKey(TagMap, function (item) {
    return item === tag;
  });
  return newTag || tag;
}

// 属性转换
function attrsTransform(attrs, options = {}) {
  let newAttrs = {};
  for (let key in attrs) {
    let newKey = key;
    let newVal = attrs[key];
    // 处理wx:for
    if (key === "wx:for") {
      newKey = "v-for";
      let indexStr = "index";
      let itemStr = "item";
      if (attrs["wx:for-index"]) {
        indexStr = attrs["wx:for-index"];
      }
      if (attrs["wx:for-index"] === "*this") {
        indexStr = "";
      }
      if (attrs["wx:for-item"]) {
        itemStr = attrs["wx:for-item"];
      }
      let list = attrsMustacheTransform(attrs[key], options);
      newVal = `(${itemStr}${indexStr ? " , " + indexStr : ""}) in ${list}`;
    }
    // 处理wx:for-index
    else if (key === "wx:for-index") {
      newKey = "";
    }
    // 处理wx:for-item
    else if (key === "wx:for-item") {
      newKey = "";
    }
    // 处理wx:key
    else if (key === "wx:key") {
      newKey = ":key";
      if (attrs[key].trim() === "*this") {
        newVal = attrs["wx:for-item"] || "item";
      }
    }
    // 处理wx:if
    else if (key === "wx:if") {
      newKey = "v-if";
      newVal = attrsMustacheTransform(attrs[key], options);
    }
    // 处理wx:elif
    else if (key === "wx:elif") {
      newKey = "v-else-if";
      newVal = attrsMustacheTransform(attrs[key], options);
    }
    // 处理wx:else
    else if (key === "wx:else") {
      newKey = "v-else";
      newVal = "";
    }
    // 处理事件
    else if (event.EventReg.test(key)) {
      let keyAttrArr = key.match(
        new RegExp(
          `^(${event.EventPropagationType.join(
            "|"
          )})|(([^\x00-\xff]|[a-zA-Z_$])([^\x00-\xff]|[a-zA-Z0-9_$])*)$`,
          "g"
        )
      );
      let eventPropagationType = keyAttrArr[0];
      let eventType = lodash.findKey(event.EventTypeMap, function (item) {
        return item === keyAttrArr[1];
      });
      eventType = eventType || keyAttrArr[1];

      if (eventPropagationType === "bind") {
        newKey = "@" + eventType;
      }
      // 与 bind 不同， catch 会阻止事件向上冒泡。
      else if (eventPropagationType === "catch") {
        newKey = "@" + eventType + ".stop";
      }
      // todo：待处理其他事件传播类型情况
      else {
        newKey = "@" + eventType;
      }
      newVal = attrs[key].replace(/^{{|}}$/g, "");
    }
    //key不以wx:和事件开头，但是value中包括{{}}表达式的
    else if (
      !/^wx:/.test(key) &&
      !event.EventReg.test(key) &&
      /{{.*}}/g.test(attrs[key])
    ) {
      newKey = ":" + key;
      newVal = attrsMustacheTransform(attrs[key], options);
    }

    if (newKey) {
      newAttrs[newKey] = newVal;
    }
  }

  return newAttrs;
}

// 属性双大括号表达式转换
function attrsMustacheTransform(value, options = {}) {
  let defualtOptions = {};
  options = Object.assign(defualtOptions, options);
  let str = value.replace(/'/g, '"').replace(/{{.*?}}/g, (word) => {
    return word.replace(/"/g, "'");
  });
  str = "'" + str.replace(/{{/g, "' + (").replace(/}}/g, ") + '") + "'";
  let ast = {};
  try {
    ast = jsParser.parse(str);
  } catch (error) {
    ast = jsParser.parse("");
    console.warn(`to用户：${str}解析失败，请确认语法是否正确`)
  }
  traverse(ast, {
    // 在字段前面添加state对象
    Identifier(path) {
      if (
        path.key !== "property" &&
        stateDataArr.indexOf(path.node.name) > -1
      ) {
        let newNode = createMemberExpression(
          config.stateKeyWord,
          path.node.name
        );
        path.replaceWith(newNode);
        path.skip();
      }
    },
    // 消除括号
    BinaryExpression(path, state) {
      if (
        path.node.right.type === "StringLiteral" &&
        path.node.right.value === ""
      ) {
        path.replaceWith(path.node.left);
      } else if (
        path.node.left.type === "StringLiteral" &&
        path.node.left.value === ""
      ) {
        path.replaceWith(path.node.right);
      }
    },
  });
  let code = generator(ast).code;
  return code.replace(/;$/, "");
}

// 内容转换
function contentTransform(content, options = {}) {
  // 将字符串拆解为多段{{}}，并分别进行表达式转换
  content = content.replace(/{{.*?}}/g, (express) => {
    return contentMustacheTransform(express, options);
  });
  return content;
}

// 内容大括号表达式转换
function contentMustacheTransform(content, options = {}) {
  let defualtOptions = {};
  options = Object.assign(defualtOptions, options);
  content = content.replace(/^({{)|(}})$/g, "");
  let ast = "";
  try {
    ast = jsParser.parse(content);
  } catch (error) {
    ast = jsParser.parse("");
    console.warn(`to用户：${content}解析失败，请确认是否存在语法错误！`);
  }
  traverse(ast, {
    // 在字段前面添加state对象
    Identifier(path) {
      if (
        path.key !== "property" &&
        stateDataArr.indexOf(path.node.name) > -1
      ) {
        let newNode = createMemberExpression(
          config.stateKeyWord,
          path.node.name
        );
        path.replaceWith(newNode);
        path.skip();
      }
    },
  });
  let code = generator(ast).code;
  return "{{" + code.replace(/;$/, "") + "}}";
}

// 创建MemberExpression
function createMemberExpression(objectName, propertyName) {
  let object = t.identifier(objectName);
  let property = t.identifier(propertyName);
  return t.memberExpression(object, property);
}

// 从js源码中获取state数据列表
function getStateDataFromJsCode(jsSourceCode) {
  let result = [];
  try {
    let ast = "";
    try {
      ast = jsParser.parse(jsSourceCode, {
        sourceType: "unambiguous",
      });
    } catch (error) {
      ast = jsParser.parse("");
      console.warn(`to用户：${jsSourceCode}解析失败，请确认语法是否正确`)
    }
    traverse(ast, {
      Program: {
        enter(programPath) {
          let pageInstancePath = getPageTypeInstancePath(programPath, "Page");
          pageInstancePath.get("properties").some((nodePath) => {
            let item = nodePath.node;
            if (item.value.type === "ObjectExpression") {
              let name = item.key.name || item.key.value;
              const KeyWord = "data";
              if (name === KeyWord) {
                result = item.value.properties.map((innerItem) => {
                  return innerItem.key.name;
                });
                return true;
              }
            }
          });
        },
      },
    });
  } catch (error) {}
  return result;
}
