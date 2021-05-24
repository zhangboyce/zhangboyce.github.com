let url = require('url');
let sessionGenerator = sessionManager();

module.exports = function aServer() {
    return function(req, res) {

        // 1. 路径解析
        let URL = url.parse(req.url, true);
        let pathname = URL.pathname;
        let query = URL.query;
        req.URL = URL;
        req.query = query;
        req.pathname = pathname;

        // 2. cookie 解析
        let headers = req.headers;
        let cookies = parseCookie(headers.cookie);
        req.cookies = cookies;

        // 3. 处理session
        let session_id = req.cookies['session_id'];
        if (!session_id) {
            req.session = sessionGenerator.generate();
        } else {
            let session = sessionGenerator.get(session_id);
            if (session) {
                if (session.expires <= new Date().getTime()) {
                    console.log('session is expired.', JSON.stringify(session))
                    sessionGenerator.delete(session_id);
                    req.session = sessionGenerator.generate();
                } else {
                    req.session = session;
                }
            } else {
                console.log('not found session', session_id)
                req.session = sessionGenerator.generate();
            }   
        }

        // hack res.writeHead to set session_id
        let writeHead = res.writeHead;
        res.writeHead = function() {
            let cks = res.getHeader('Set-Cookie');
            let sessionStr = cookieSetter().serialize('session_id', req.session.id);
            cks = [sessionStr].concat(cks);
            res.setHeader('Set-Cookie', cks);

            return writeHead.apply(res, arguments);
        }

        handle(req, res);
    };
}

function handle(req, res) {
    let setter = cookieSetter();
    setter.add({ name: 'boyce', age: 18 });
    let cookies = setter.get();
    res.setHeader('Set-Cookie', cookies);

    res.writeHead(200);
    res.end('ok');
}

// 解析客户端cookie
function parseCookie(cookie) {
    let cookies = {};
    if (!cookie) return cookies;

    return cookie.split(';').map(it => it.trim().split('=')).reduce((a, c) => {
        a[c[0]] = c[1];
        return a;
    }, {});
}

// 设置cookie
function cookieSetter() {
    let cookies = [];
    return {
        add: function(cookieMap, opt) {
            cookies.push({ cookieMap, opt });
        },
        get: function() {
            return cookies.map(cookie => {
                let { cookieMap, opt } = cookie;

                let pairs = Object.keys(cookieMap).map(key => [key + '=' + encodeURIComponent(cookieMap[key])]);
                
                opt = opt || {};
                opt.maxAge && pairs.push('Max-Age=' + opt.maxAge);
                opt.domain && pairs.push('Domain=' + opt.domain);
                opt.path && pairs.push('Path=' + opt.path);
                opt.expires && pairs.push('Expires=' + opt.expires.toUTCSting());
                opt.httpOnly && pairs.push('HttpOnly');
                opt.secure && pairs.push('Secure');

                return pairs.join(';')
            });
        },

        serialize: function(name, value, opt) {
            this.add({ [name]: value }, opt);
            return this.get();
        }
    }
}

// session创建
function sessionManager() {
    let sessions = Object.create(null);
    let EXPIRES = 20 * 60 * 1000;

    return {
        generate: function() {
            let session = Object.create(null);
            session.id = new Date().getTime() + Math.random();
            session.expires = new Date().getTime() + EXPIRES;

            sessions[session.id] = session;
            return session;
        },
        get(id) {
            return sessions[id];
        },
        delete(id) {
            delete sessions[id];
        }
    } 
}












