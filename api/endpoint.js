


export class Endpoint {
    static BASE_URL = 'http://192.168.101.2:3000';

    static format({ route, args, token }) {
        try {
            const endpoint = Endpoint.BASE_URL + '/' + route;
            return `${endpoint}?token=${token || 'null'}${args ? '&' + Object.entries(args).map(([key, value]) => `${key}=${value}`).join('&') : ''}`;
        }
        catch (e) {
            console.error(e)
        }
    }

    setToken(newToken) {
        this.token = newToken;
    }

    logs = {
        route: 'logs',
        fetch: ({ before, after }) => Endpoint.format({ route: this.logs.route, args: { before, after } }),
        create: ({ photo, km, timestamp, driver, token }) => Endpoint.format({ token, route: this.logs.route, args: { photo, km, timestamp, driver } }),
    }

    image = {
        route: 'image',
        fetch: ({ id }) => Endpoint.format({ route: this.image.route, args: { id } })
    }

    login = {
        route: 'login',
        dewit: ({ username, password, macAddress, timestamp = Date.now() }) => Endpoint.format({ route: this.login.route, args: { username, password, macAddress, timestamp } }),
        withToken: ({ token }) => Endpoint.format({ route: this.login.route + '/token', token })
    }
}

const endpoint = new Endpoint();
export default endpoint;