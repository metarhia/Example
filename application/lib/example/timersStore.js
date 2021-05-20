({
    values: new Map(),

    method({ key, val, del }) {
        if (del) {
            return this.values.has(del) ? this.values.delete(del) : false;
        };
        if (val) {
            return this.values.set(key, val);
        };
        return this.values.get(key);
    },
});
