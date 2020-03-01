// 编译类
class Compiler {
  constructor (el, vm) {
    this.vm = vm // 把传进来的vm 存起来，因为这个vm.a = 1 没毛病
    let element = document.querySelector(el) // 拿到 app 节点
    let fragment = document.createDocumentFragment() // 创建fragment代码片段
    fragment.append(element) // 把app节点 添加到 创建fragment代码片段中
    this.replace(fragment) // 套数据函数
    document.body.appendChild(fragment) // 最后添加到body中
  }
  replace(frag) {
      let vm = this.vm // 拿到之前存起来的vm
      // 循环frag.childNodes
      Array.from(frag.childNodes).forEach(node => {
        let txt = node.textContent; // 拿到文本 例如："开发语言：{{language}}"
        let reg = /\{\{(.*?)\}\}/g; // 定义匹配正则
        if (node.nodeType === 3 && reg.test(txt)) {
        
            replaceTxt();
            
            function replaceTxt() {
                // 如果匹配到的话，就替换文本
                node.textContent = txt.replace(reg, (matched, placeholder) => {
                  new Watcher(vm, placeholder, replaceTxt);   // 监听变化，进行匹配替换内容
                  return placeholder.split('.').reduce((obj, key) => {
                      return obj[key]; // 例如：去vm.makeUp.one对象拿到值
                  }, vm)
                })
            }
        } else if (node.nodeType === 1) {
            const nodeAttr = node.attributes // 属性集合
            Array.from(nodeAttr).forEach(item => {
                let name = item.name; // 属性名
                let exp = item.value; // 属性值
                // 如果属性有 v-
                if (name.includes('v-')){
                    node.value = vm[exp];
                    node.addEventListener('input', e => {
                      // 相当于给this.language赋了一个新值
                      // 而值的改变会调用set，set中又会调用notify，notify中调用watcher的update方法实现了更新操作
                      vm[exp] = e.target.value;
                    });
                }
            });
        }
        // 如果还有字节点，并且长度不为0 
        if (node.childNodes && node.childNodes.length) {
            // 直接递归匹配替换
            this.replace(node)
        }
      })
  }
}