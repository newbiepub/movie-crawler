import Router from "router";
import url from "url";
import qs from "querystring";
import consolidate from "consolidate";
import bodyParser from "body-parser";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import {resolve} from "path";
import CrawlerFunc from "./function";
import csrf from 'csurf';

const app = Router();

//Body Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// query string
app.use(
    (req, res, next) => {
        req.query = qs.parse(
            url.parse(req.url).query
        )
        next()
    }
)

// enable cookie
app.use(cookieParser());

// helmet best practise protection
app.use(helmet());

app.use(csrf({ cookie: true }));

// Prevent csrf
app.use(function (req, res, next) {
    res.locals = res.locals || {};
    res.locals.csrftoken = req.csrfToken();
    next();
});

// render
app.use(
    (req, res, next) => {
        res.render = (filename, params = {}) => {
            const path = resolve(__dirname, './', 'views', filename);
            res.locals = res.locals || {}
            consolidate.mustache(
                path,
                Object.assign(params, res.locals),
                (err, html) => {
                    if (err) {
                        throw err
                    }
                    res.setHeader('Content-Type', 'text/html; charset=utf8')
                    res.end(html)
                }
            )
        };
        next()
    }
);

app.get('/', (req, res, next) => {
    CrawlerFunc.crawlerUrl((postContent) => {
        res.render("home.html", {movies: postContent});
    });
});

app.get('/crawler', (req, res, next) => {
    res.setHeader("Content-Type", "text/html;charset=utf8");

    if(req.query.url) {
        CrawlerFunc.crawlMovieWithUrl(req.query.url)
            .then(movie => {
                res.render("crawler.html", {csrfToken: req.csrfToken(), movie: movie});
            }).catch(err => {
                res.render("crawler.html", {csrfToken: req.csrfToken(), movie: false})
        })
    } else {
        res.render("crawler.html", {csrfToken: req.csrfToken(), movie: false})
    }
});


app.get("/stream", (req, res, next) => {
    res.setHeader("Content-Type", "text/html;charset=utf8");
    if(req.query.url) {
        CrawlerFunc.requestStream(decodeURIComponent(req.query.url))
            .then((response) => {
                console.log(response);
            })
            .catch(err => {
                console.log(err);
            });
    }
});

app.get("/phimvuihd", (req, res, next) => {
    res.setHeader("Content-Type", "text/plain;charset=utf8");
    CrawlerFunc.crawlerVuiHD().then(body => {
        console.log(body);
        res.end(JSON.stringify(body))
    }).catch(err => {
        res.end(JSON.stringify(err));
    })
})

export default app;