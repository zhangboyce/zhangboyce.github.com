import Dep from './Dep';

export class Observer {
    constructor(value) {
        this.value = value;
        this.dep = new Dep();

        // 将当前Observer添加到被侦测value的__ob__属性上
        def(value, '__ob__', this); 

        // 拦截数组的方法，在拦截的方法中触发依赖，在数组自己的get中收集依赖
        if (Array.isArray(value)) {
            const arrayMethods = getArrayMethods();
            Object.setPrototypeOf(value, arrayMethods);

            // 侦测数组中的元素
            value.forEach(function(item)) {
                observe(item);
            }

        } else {
            this.walk(value);
        }
    }

    walk(obj) {
        const keys = Object.keys(obj);
        for(let i=0; i<keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]]);
        }
    }
}

function observe(value) {
    let ob;
    if (Object.hasOwnProperty(value, '__ob__') 
        && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    } else {
        ob = new Observer(value);
    }
    return ob;
}

function def(obj, key, value) {
    Object.defineProperty(obj, key, {
        value: value,
        enumerable: false,
        writable: true,
        configurable: true
    })
}

function defineReactive(data, key, value) {
    let childOb = observe(value);
    let dep = new Dep();
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function() {

            dep.depend(); // 收集依赖

            if (childOb) {
                childOb.dep.depend();
            }
            return value;
        },
        set: function(newValue) {
            if (value === newValue) return;
            value = newValue;

            dep.notify(); // 通知依赖
        }
    });
}

function getArrayMethods() {
    const arrayProto = Array.prototype;
    const arrayMethods = Object.create(arrayProto);

    [
    'push', 'pop', 'shift', 'unshift', 
    'splice', 'sort', 'reverse'
    ].forEach(function(method) {
        const original = arrayProto[method];
        Object.defineProperty(arrayMethods, method, {
            value: function(...args) {

                // 拦截数组的方法，添加依赖
                const ob = this.__ob__;
                ob.dep.notify();

                return original.apply(this, args);
            },
            enumerable: false,
            writable: true,
            configurable: true
        })
    });

    return arrayMethods;
}





