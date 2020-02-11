
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const PORT = process.env.PORT || 3001;

let swaggerDocumentCache = null;

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/view', async (req, res) => {
    if (req.body.url) {
        try {
            const data = await fetch(req.body.url);

            swaggerDocumentCache = await data.json();

            let host = swaggerDocumentCache && swaggerDocumentCache.host;

            if (host) {
                host = host.replace("9999:9999", "9999");

                if (!host.startsWith("http")) {
                    host = "http://" + host;
                }

                let url = new URL(host);

                if (url.host.startsWith("fabio") || url.host.endsWith(":9999")) {
                    swaggerDocumentCache.host = new URL("", url.origin).href.replace(/^http:\/\//, "");

                    const url2 = new URL(req.body.url);
                    const basePath = url2.pathname.replace(/^\/|\/$/, "").split("/")[0];
                    swaggerDocumentCache.basePath = basePath;
                }
            }

            res.redirect('/ui');
        } catch (err) {
            console.log(err.message);

            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }
});

app.use('/api-docs', (req, res, next) => {
    if (swaggerDocumentCache) {
        swaggerDocument = swaggerDocumentCache;
        req.swaggerDoc = swaggerDocument;
    }
    next();
}, swaggerUi.serve, swaggerUi.setup());

app.get('/docs', function (req, res) {
    res.json(swaggerDocumentCache);
});

app.get('/ui', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/ui.html'));
})

app.listen(PORT, () => console.log(`App is running at port ${PORT} . . .`));