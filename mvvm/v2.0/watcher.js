// 发布订阅
class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

class Watcher {
  constructor(vm, exp, fn) {
    this.fn = fn;
    this.vm = vm;
    this.exp = exp; // 添加到订阅中
    Dep.target = this;
    let val = vm;
    let arr = exp.split('.');
    arr.forEach((k) => {
      val = val[k];
    });
    Dep.target = null;
  }
  update() {
    let val = this.vm;
    let arr = this.exp.split('.');
    arr.forEach((k) => {
      val = val[k];
    });
    this.fn(val);
  }
}