class MVVM {
  constructor(options) {
    this.$el = options.el; // 创建一个当前实例 $el
    this.$data = options.data;
    // 判断根元素是否存在 <div id="app"></div> => 编译模板
    if (this.$el) {
      // 把 data 里的数据全部转化成用 object.defineProperty 来定义
      new Observer(this.$data);

      for (let key in this.$data) {
        Object.defineProperty(this, key, {
          enumerable: true,
          get() {
            return this.$data[key]; // this.a == {a: 1}
          },
          set(newVal) {
            this.$data[key] = newVal;
          }
        })
      }

      new Compiler(this.$el, this);
    }
  }
}