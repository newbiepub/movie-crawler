import cheerio from "cheerio";
import request from 'request';
import _ from "lodash";
import CryptoJS from "crypto-js";

class PhimBatHu {
    constructor () {
        this.baseUrl = "https://phimbathu.com/";
        this.requestOption = {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
                'referer': 'https://phimbathu.com/',
                'cookie': '_a3rd1478681532=0-9; ADB3rdCookie1478681307=1; ADB3rdCookie1413887770=1; _a3rd1407405582=0-8; ADB3rdCookie1385973822=1; gen_crtg_rta=; __RC=5; __R=3; __UF=-1; __uif=__uid%3A2625795562883732188%7C__ui%3A-1%7C__create%3A1482579556; __tb=0; __IP=2883739208; __utmt=1; __utmt_b=1; __utma=247746630.1273382115.1482841916.1484328884.1484382954.4; __utmb=247746630.3.10.1484382954; __utmc=247746630; __utmz=247746630.1482841916.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _a3rd1426850317=0-5; _a3rd1401790478=0-6'
            },
            timeout: 30000,
            retries: 5
        }
    }

    requestAsync(url, method, data) {
        return new Promise((resolve, reject) => {
            request[method](url, data, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            })
        })
    }

    decodeAES(url, password) {
        try {
            if (!url.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi)) {
                let decrytData = CryptoJS.AES.decrypt(url.toString(), password);
                return decrytData.toString(CryptoJS.enc.Utf8);
            }
            return url

        } catch (e) {
            console.log(e);
            return url;
        }
    }

    extractMedia(body) {
        const beginSlice = body.indexOf('var playerSetting = {') + 20;
        const endSlice = body.indexOf('"};') + 2;
        const result = JSON.parse(
            body.slice(beginSlice, endSlice).trim()
        );
        let sources = [];
        if (result.err) {
            return {
                sources
            }
        }
        _.each(result.sourceLinks, (item) => {
            sources = sources.concat(item.links);
        });
        _.each(result.sourceLinksBk, (item) => {
            sources = sources.concat(item.links);
        });
        return {
            modelId: result.modelId,
            sources
        }
    }

    getMedias (playerSetting) {
        let sources = [];
        for(let video of playerSetting.sources) {
            sources.push({
                    src: this.decodeAES(
                        video.file,
                        'phimbathu.com' + '4590481877' + playerSetting.modelId
                    ),
                    label: parseFloat(video.label),
                    type: video.type
                })
        }
        return sources;
    }

    async crawlVideoLink (url) {
        try {
            let response = await this.requestAsync(url, "get", this.requestOption),
                playerSetting = this.extractMedia(response);
            return this.getMedias(playerSetting)
        } catch(e) {
            console.log("Crawling Error - PhimBatHu");
            console.log(e);
            throw e;
        }
    }
}

export default PhimBatHu;