/* 数据劫持 - Observer 类
   主要实现的目的是给 data 数据内的所有层级数据都进行数据劫持，让其具备监听对象变化的能力。
*/
class Observer {
  constructor(data) {
    this.observer(data);
  }
  observer(data) {
    if (data && typeof data === 'object') {
      // 判断 data 数据存在并且 data 是对象属性
      for (let key in data) {
        this.defineReactive(data, key, data[key]);
      }
    }
  }
  defineReactive(obj, key, value) {
    const dep = new Dep();
    this.observer(value); // 如果 value 还是对象，那么要继续递归监听下去
    Object.defineProperty(obj, key, {
      get() {
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set: (newVal) => {
        if (newVal !== value) {
          this.observer(newVal); // 如果赋值是对象的话则需要将其转化为响应式属性
          value = newVal;
          dep.notify(); // 通知所有订阅者
        }
      }
    })
  }
}