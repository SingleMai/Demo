class Observer {
  constructor(data) {
    this.dep = new Dep(); // 订阅类
    for (let key in data) {
      data[key] = this.observe(data[key]);
    }
    return this.proxy(data);
  }

  observe(data) {
    if (!data || typeof data !== 'object') return data;
    return new Observer(data);
  }

  proxy(data) {
    const dep = this.dep;
    return new Proxy(data, {
      get: (target, key, receiver) => {
        if (Dep.target) {
          // 如果之前是push过的，就不用重复push了
          if (!dep.subs.includes(Dep.exp)) {
            dep.addSub(Dep.exp) // 把Dep.exp.push到sub数组里面，订阅
            dep.addSub(Dep.target) // 把Dep.target.push到sub数组里面，订阅
          }
        }
        return Reflect.get(target, key, receiver);
      },
      set: (target, key, value) => {
        const result = Reflect.set(target, key, this.observe(value));
        dep.notify();
        return result;
      }
    })
  }
}