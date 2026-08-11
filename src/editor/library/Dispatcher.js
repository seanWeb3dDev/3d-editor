/**
 * @param {any} fn
 * @return {boolean}
 */
function isFunction(fn) {
    if (typeof fn !== "function") {
        console.log('传入的事件不为函数');
        return false;
    }
    return true;
}


export class Dispatcher {

    constructor() {
        this.bindings = [];
        this.active = true;
    }


    /**
     * @description
     * 往事件类型实例中添加事件
     * @param {Function} fn 事件
     * @param {context} scope 执行上下文
     * @param {number} priority 优先级 从大到小执行
     * @returns {Event}
     */
    add(fn,scope,priority) {
        if (!isFunction(fn)) return;
        return this.#_register(fn,false,scope,priority);
    }

    /**
     * @description
     * 往事件类型实例中添加单次执行事件
     * @param {Function} fn 事件
     * @param {context} scope 执行上下文
     * @param {number} priority 优先级 从大到小执行
     * @returns {Event}
     */
    addOnce(fn,scope,priority) {
        if (!isFunction(fn)) return;
        return this.#_register(fn,true,scope,priority);
    }

    /**
     * @description 清除事件
     * @param {Function} fn 事件
     * @param {context} scope 执行上下文
     */
    remove(fn,scope) {
        if (!isFunction(fn)) return;
        const index = this.#_indexOfListener(fn,scope);
        if (index !== -1) {
            this.bindings[index]._destroy();
            this.bindings.splice(index,1);
        }
    }

    /**
     * @description 清除所有事件
     */
    removeAll() {
        for (var a = this.bindings.length; a--;) this.bindings[a]._destroy();
        this.bindings.length = 0;
    }

    /**
     * @description 派发事件
     */
    dispatch() {
        if (this.active) {
            const params = Array.prototype.slice.call(arguments);
            let length = this.bindings.length;
            let list = null;
            if (length !== 0) {
                list = [...this.bindings];
                do length--;
                while (list[length] && list[length].execute(params) !== !1);

            }
        }
    }

    /**
     * @description 释放该实例
     */
    dispose() {
        this.removeAll();
        this.active = false;
        delete this.bindings;
    }
    /**
     * @description 获取事件列表
     */
    getEventList() {
        if (this.bindings) return this.bindings;
    }

    /**
     * @description 注册事件
     */
    #_register(fn,isOnce,scope,priority) {
        let index = this.#_indexOfListener(fn,scope);
        let event;

        if (index !== -1) {
            console.log('事件已经存在');
        } else {
            event = new Event(this,fn,isOnce,scope,priority);
            this.#_addBinding(event);
        }
        return event;

    }
    #_indexOfListener(fn,scope) {
        for (var index = this.bindings.length,d; index--;)
            if (((d = this.bindings[index]),d._listener === fn && d.context === scope))
                // 事件已存在
                return index;
        return -1;

    }
    #_addBinding(fn) {
        let l = this.bindings.length;
        do --l;
        while (this.bindings[l] && fn._priority <= this.bindings[l]._priority);
        this.bindings.splice(l + 1,0,fn);

    }
}
class Event {
    constructor(dispatcher,fn,isOnce,scope,priority) {
        this._listener = fn;
        this._isOnce = isOnce;
        this.context = scope;
        this._dispatcher = dispatcher;
        this._priority = priority || 0;
        this.active = true;
        this.params = true;
    }

    /**
     * @description 事件执行函数
     * @param {[]} arg 参数
     */
    execute(arg) {
        let result;
        if (this.active && this._listener) {
            result = this._listener.apply(this.context,arg);
            this._isOnce && this.detach();
        }
        return result;

    }

    /**
     * @description 事件解除绑定
     */
    detach() {
        this._dispatcher.remove(this._listener,this.context);
    }

    _destroy() {
        delete this._dispatcher;
        delete this._listener;
        delete this.context;
    }
}