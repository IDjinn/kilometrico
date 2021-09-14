const express = require('express')
const app = express()
const http = require('http').createServer(app);
const port = 3000;
const zlib = require('zlib');
const bodyParser = require("body-parser");
const fs = require('fs');

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb", }));
app.use(bodyParser.json({ limit: '50mb' }));
let users = require('./users.json');
let data = require('./data.json');
const { url } = require('inspector');

const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'images')))


app.get('/', (req, res) => {
    res.send('Hello World!')
})



app.post('/login', (req, res) => {
    console.log(req.query)
    const { username, password } = req.query;
    if (!username || !password)
        return res.status(401).send();

    const user = users[username];
    console.log(user)
    if (user && user.senha === password) {
        users[username].token = newToken()
        console.log(users[username])
        saveUsers(users);
        return res.status(200).json({ token: users[username].token, expiresAt: Date.now() + 1000 * 60 * 60 * 24, username, password })
    };


    return res.status(401).send();
});


app.post('/login/token', (req, res) => {
    console.log('imhere', req.query)
    const { token } = req.query;
    if (!token)
        return res.status(401).send();

    console.log(token)
    const data = Object.entries(users).find(([key, value]) => value.token === token);
    if (data) {
        return res.status(200).json({ username: data[0], ...data[1] })
    };

    return res.status(401).send();
});


app.post('/logs', (req, res) => {
    const { km, driver } = req.query;
    if (!req.body || !req.body.data || !km || !driver)
        return res.status(401).send();

    console.log('lost post write')

    const timestamp = Date.now();
    const date = new Date(timestamp);
    const folder = dateToLocale(date);

    const path = `${__dirname}\\images\\${folder}`;
    if (fs.existsSync(path) == false) {
        console.log('making dir for date', date.toDateString())
        fs.mkdirSync(path);
    }

    fs.writeFileSync(`${path}\\${timestamp}.jpg`, Buffer.from(req.body.data, "base64"));

    console.log('lost post write end', Date.now() - timestamp, 'ms')

    try {
        const currentDataCopy = copyIt(data);
        const lastImage = { ...currentDataCopy.images.last };
        delete lastImage['previous']
        const currentImageData = {
            driver,
            km,
            date: folder,
            timestamp,
            previous: lastImage
        };
        currentDataCopy.images.last = currentImageData;

        currentDataCopy.images.archive[folder] = currentDataCopy.images.archive[folder] || {}
        currentDataCopy.images.archive[folder][timestamp] = currentImageData;

        const lastDriver = copyIt(users[lastImage.driver]);
        if (lastDriver) {
            const diff = parseInt(currentImageData.km - lastImage.km)
            if (diff < 0)
                throw new Error('Invalid range, diff < 0');

            console.log('last', lastDriver, 'diff', diff)
            lastDriver.km = diff + lastDriver.km
            saveUsers(users);
        }
        saveData(currentDataCopy);
    } catch (e) {
        if (e.message === 'Invalid range, diff < 0')
            console.log('tried up invalid range diff');
        else
            console.error(e);
        return res.status(499).json({ error: JSON.stringify(e) });
    }

    return res.status(200).json(fetch(10))
});


http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

console.log('started');


const saveData = (newData) => {
    data = newData;
    fs.writeFileSync('./data.json', JSON.stringify(newData));
}

const saveUsers = (newUsers) => {
    users = newUsers;
    fs.writeFileSync('./users.json', JSON.stringify(newUsers));
}



const fetch = (count) => {
    const fetchOlderLog = (previous, logs = [], max = 30) => {
        if (logs.length > max) return logs;
        if (!previous || !data.images.archive[previous.date]) return logs;

        const older = data.images.archive[previous.date][previous.timestamp];
        if (!older)
            return logs;

        logs.push(older);
        return fetchOlderLog(older.previous, logs, max);
    }

    const parseToURL = (log) => log && log.date && log.timestamp ? `static/${log.date}/${log.timestamp}.jpg` : null;
    const parseLogsToURL = (logs) => {
        const ret = new Map()
        for (const log of logs) {
            if (log)
                ret.set(log.timestamp, { ...log, url: parseToURL(log) });
        }

        return ret;
    }

    const logs = fetchOlderLog(data.images.last, [], count);
    const urls = parseLogsToURL(logs);
    const lastURL = parseToURL(data.images.last);
    if (lastURL)
        urls.set(data.images.last.timestamp, { ...data.images.last, url: lastURL });

    const parseToArray = (objs) => {
        const ret = [];
        for (const [key, value] of objs.entries()) {
            ret.push([value.date, value.km, value.driver, value.url]);
        }
        return ret;
    }

    return parseToArray(urls);
}

const dateToLocale = (date) => date.toLocaleDateString('pt-BR').replace('/', '-').replace('/', '-');
const newToken = (length = 10) => {
    const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890!@#$%¨&*()';
    const builder = [];
    for (let i = 0; i < length; i++) {
        builder.push(allowedChars[Math.floor(Math.random() * allowedChars.length)]);
    }
    return builder.join('');
}


const copyIt = (obj) => JSON.parse(JSON.stringify(obj));