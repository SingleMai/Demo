class Dep {
  constructor() {
      this.subs = [] // 定义数组
  }
  // 订阅函数
  addSub(sub) {
    this.subs.push(sub)
  }
  // 发布函数
  notify() {
    this.subs.filter(item => typeof item !== 'string').forEach(sub => sub.update())
  }
}

class Watcher {
  constructor (vm, exp, fn) {
    this.fn = fn // 传进来的fn
    this.vm = vm // 传进来的vm
    this.exp = exp // 传进来的匹配到exp 例如："language"，"makeUp.one"
    Dep.exp = exp // 给Dep类挂载一个exp
    Dep.target = this // 给Dep类挂载一个watcher对象，跟新的时候就用到了
    let arr = exp.split('.')
    let val = vm
    arr.forEach(key => {
        val = val[key] // 获取值，这时候会粗发vm.proxy的get()函数，get()里面就添加addSub订阅函数
    })
    Dep.target = null // 添加了订阅之后，把Dep.target清空
  }
  update() {
    // 设置值会触发 vm.proxy.set 函数，然后调用发布的notify，
    // 最后调用 update，update 里面继续调用this.fn(val)
    let exp = this.exp
    let arr = exp.split('.')
    let val = this.vm
    arr.forEach(key => {
        val = val[key]
    })
    this.fn(val)
  }
}