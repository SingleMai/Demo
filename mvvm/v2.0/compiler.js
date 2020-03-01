/* 模板编译 - Compiler 类
 Compiler 是解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图
 并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图
*/
class Compiler {
  constructor(el, vm) {
    // 判断 el 属性，是不是一个元素，否则进行获取
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm; // vm 实例
    // 把当前节点中的元素获取到放到内存中，防止页面重绘
    const fragment = this.node2Fragment(this.el);

    // 1. 编译模板 用 data 中的数据进行编译
    this.compile(fragment);
    // 2. 把内存中的内容进行替换
    this.el.appendChild(fragment);
    // 3. 再把替换后的内容写到页面中去
  }
  isDirective(attrName) {
    return attrName.startWith('v-'); // 是否含有 v- 开头
  }
  /**
   * 编译元素节点
   * @param {*} node 元素节点
   */
  compileElement(node) {
    // 获取当前节点的属性;「类数组」NamedNodeMap;也存在没有属性，则 NamedNodeMap{length: 0}
    let attributes = node.attributes;
    // Array.from()、[...xxx]、[].slice.call 等都可以转化为真实数组
    Array.from(attributes).forEach((attr) => {
      // attr 格式: type='text' v-model v-html v-bind
      let name = attr.name;
      // 需要调用不同的指令来处理
      if (name.indexOf('v-') !== -1) {
        let exp = attr.value;
        let [, directive] = name.split('-'); // 获取指令名
        CompilerUtil[directive](node, exp, this.vm);
      }
    });
  }
  /**
   * 编译文本节点 判断当前文本节点中的内容是否含有 {{}}
   * @param {*} node 文本节点
   */
  compileText(node) {
    const content = node.textContent;
    console.log(content, 'content');
    if (/\{\{(.+?)\}\}/.test(content)) { // 通过正则去匹配只需要包含有{{}}的，并获取中间的内容
      CompilerUtil['text'](node, content, this.vm);
    }
  }
  /**
   * 编译内存中的 DOM 节点
   * @param {*} fragmentNode 文档碎片
   */
  compile(fragmentNode) {
    // 从文档碎片中拿到子节点 注意: childNodes 只包含第一层，不包含 {{}}
    let childNodes = Array.from(fragmentNode.childNodes); // 获取的是类数组 NodeList
    childNodes.forEach(child => {
      // 是否是元素节点
      if (this.isElementNode(child)) {
        this.compileElement(child);
        // 如果是元素的话 需要把自己传进去再去遍历子节点 —— 递归
        this.compile(child);
      } else {
        // 文本节点
        this.compileText(child);
      }
    });
  }
  /**
   * 将节点中的元素放到内存中
   * @param {*} node 节点
   */
  node2Fragment(node) {
    // 创建一个稳定的碎片；目的是为了将这个节点中的每个孩子都写到这个文档碎片中去
    let fragment = document.createDocumentFragment();
    let firstChild; // 这个节点中的第一个孩子
    while (firstChild = node.firstChild) {
      // appendChild 具有移动性，每移动一个节点到内存中，页面就会少一个节点
      fragment.appendChild(firstChild);
    }
    return fragment;
  }
  /**
   * 判断是不是元素
   * @param {*} node 当前这个元素的节点
   */
  isElementNode(node) {
    return node.nodeType === 1;
  }
}

// 编译功能
CompilerUtil = {
  /**
   * 根据表达式取到对应的数据
   * @param {*} vm 
   * @param {*} expr 
   */
  getVal(vm, expr) {
    return expr.split('.').reduce((data, current) => {
      return data[current];
    }, vm.$data);
  },
  setVal(vm, expr, value) {
    expr.split('.').reduce((data, current, index, arr) => {
      if (index === arr.length - 1) {
        return data[current] = value;
      }
      return data[current];
    }, vm.$data);
  },
  /**
   * 处理 v-model
   * @param {*} node 对应的节点
   * @param {*} expr 表达式
   * @param {*} vm 当前实例
   */
  model(node, expr, vm) {
    // 给输入框赋予 value 属性 node.value = xxx
    let fn = this.updater['modalUpdater'];
    new Watcher(vm, expr, (newValue) => {
      // 给输入框增加一个观察者，数据更新会触发此方法
      fn(node,newValue);
    });
    node.addEventListener('input', e => {
      let value = e.target.value; // 获取用户输入的内容
      this.setVal(vm, expr, value);
    });
    let value = this.getVal(vm, expr); // 返回 tmc
    fn(node, value);
  },
  text(node, expr, vm) {
    let fn = this.updater['textUpdater'];
    let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      // 给表单时每个 {{}} 加上观察者
      new Watcher(vm, args[1], (newValue) => {
        fn(node, newValue); // 返回一个新的字符串
      });
      return this.getVal(vm, args[1].trim());
    });
    fn(node, content);
  },
  updater: {
    // 把数据插入到节点中
    modalUpdater(node, value) {
      node.value = value;
    },
    // 处理文本节点
    textUpdater(node, value) {
      node.textContent = value;
    }
  }
};