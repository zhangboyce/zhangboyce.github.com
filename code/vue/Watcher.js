export default class Watcher {
    constructor(vm, expOrFtn, cb) {
        this.vm = vm;
        this.cb = cb;
        this.getter = parsePath(expOrFtn);
        this.value = this.get();
    }

    get() {
        // 构造当前Watcher的时候主动调用一下get，将自己加入到vm的依赖收集中，window.target = this
        window.target = this;
        let value = this.getter.call(this.vm, this.vm);
        window.target = undefined;
        return value;
    }

    update() {
        const oldValue = this.value;
        this.value = this.get();
        this.cb.call(this.vm, this.value, this.oldValue);
    }
}

function parsePath(path) {
    const segments = path.split('\.'); // 'user.name'
    return function(obj) {
        for (let i = segments.length - 1; i >= 0; i--) {
            if (!obj) return;
            obj = obj[segments[i]];
        }
        return obj;
    }
}