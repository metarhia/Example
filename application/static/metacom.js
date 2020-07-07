export class Metacom {
  constructor(host) {
    this.socket = new WebSocket('wss://' + host);
    this.api = {};
  }

  async load(...interfaces) {
    const introspect = this.httpCall('system')('introspect');
    const introspection = await introspect(interfaces);
    const available = Object.keys(introspection);
    for (const interfaceName of interfaces) {
      if (!available.includes(interfaceName)) continue;
      const methods = {};
      const iface = introspection[interfaceName];
      const request = this.socketCall(interfaceName);
      const methodNames = Object.keys(iface);
      for (const methodName of methodNames) {
        methods[methodName] = request(methodName);
      }
      this.api[interfaceName] = methods;
    }
  }

  httpCall(iname, ver) {
    return methodName => (args = {}) => {
      const interfaceName = ver ? `${iname}.${ver}` : iname;
      const url = `/api/${interfaceName}/${methodName}`;
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      }).then(res => {
        const { status } = res;
        if (status === 200) return res.json();
        throw new Error(`Status Code: ${status}`);
      });
    };
  }

  socketCall(iname, ver) {
    return methodName => (args = {}) => {
      const interfaceName = ver ? `${iname}.${ver}` : iname;
      return new Promise((resolve, reject) => {
        const req = { interface: interfaceName, method: methodName, args };
        this.socket.send(JSON.stringify(req));
        this.socket.onmessage = event => {
          const obj = JSON.parse(event.data);
          if (obj.result !== 'error') resolve(obj);
          else reject(new Error(`Status Code: ${obj.reason}`));
        };
      });
    };
  }
}
