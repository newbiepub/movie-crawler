import request from "request";
import cheerio from "cheerio"
import _ from "lodash";
import Config from "./config";
import Phimmoi from './videos/phimmoi';
import PhimVuiHD from "./videos/phimvuihd";
import Bilutv from "./videos/bilutv";
import FshareFilm from "./videos/fsharefilm";

const gotOptions = {
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
        'referer': 'http://www.phimmoi.net/',
        'cookie': '_a3rd1478681532=0-9; ADB3rdCookie1478681307=1; ADB3rdCookie1413887770=1; _a3rd1407405582=0-8; ADB3rdCookie1385973822=1; gen_crtg_rta=; __RC=5; __R=3; __UF=-1; __uif=__uid%3A2625795562883732188%7C__ui%3A-1%7C__create%3A1482579556; __tb=0; __IP=2883739208; __utmt=1; __utmt_b=1; __utma=247746630.1273382115.1482841916.1484328884.1484382954.4; __utmb=247746630.3.10.1484382954; __utmc=247746630; __utmz=247746630.1482841916.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _a3rd1426850317=0-5; _a3rd1401790478=0-6'
    },
    timeout: 5000,
    retries: 0
}

class CrawlerFunc {
    constructor () {

    }

    static crawlerUrl (callback) {
        const phimmoi = new Phimmoi();
        phimmoi.crawlPhimMoi(callback);
    }

    static requestStream (url) {
        const phimmoi = new Phimmoi();
        return new Promise((resolve, reject) => {
            phimmoi.getStreamLink(url).then((res) => resolve(res))
                .catch (err => {
                    reject(err);
            })
        })
    }

    static async crawlMovieWithUrl(url) {
        try {
            const phimmoi = new Phimmoi();
            return phimmoi.crawlFromUrl(url);
        }catch(err) {
            console.log("Error at crawlMovieWithUrl", err);
        }
    }

    static async crawlMediaWithUrl (url) {
        try {
            const phimmoi = new Phimmoi();
            return await phimmoi.crawlMediaUrl(url);
        } catch (err) {
            console.log("Error at crawlMediaWithUrl", err);
        }
    }

    static crawlerVuiHD() {
        return new Promise((resolve, reject) => {
            const phimvui = new PhimVuiHD();
            phimvui.getMovie().then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    }

    static async testStreamGoogleDrive(docId) {
        try {
            const phimvui = new PhimVuiHD();
            return await phimvui.getStreamVideo(docId);
        } catch(e) {
            throw e;
        }
    }

    static async crawlerBilutv(url) {
        try {
            const bilutv = new Bilutv();
            return bilutv.crawlWithUrl(url);
        } catch(e) {
            throw e;
        }
    }

    static async crawlMediaSource(url) {
        try {
            if(url.indexOf("http://www.phimmoi.net/") !== -1) {
                const phimmoi = new Phimmoi();
                return phimmoi.crawlMediaSource(url);
            } else if(url.indexOf("http://fsharefilm.com/") !== -1) {
                const fsharefilm = new FshareFilm();
                return fsharefilm.crawlVideoLink(url);
            } else {
                const bilutv = new Bilutv();
                return bilutv.crawlWithUrl(url);
            }
        } catch (e) {
            throw e;
        }
    }
}

export default CrawlerFunc