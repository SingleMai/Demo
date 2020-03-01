class MVVM {
  constructor(options = {}) {
    this.$options = options;
    let data = this._data = this.$options.data;
    this._data = new Observer(data);
    const _vm = this._vm = this.initVm();
    new Compiler(this.$options.el, _vm);
    return _vm;
  }

  initVm() {
    return new Proxy(this, {
      get: (target, key) => {
        return this[key] || this._data[key] || this._computed[key];
      },
      set: (target, key, value) => {
        return Reflect.set(this._data, key, value);
      }
    });
  }
}