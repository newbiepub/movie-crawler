import request from "request";

const _eval = require("eval");

class FshareFilm {
    constructor() {
        this.baseUrl = "http://fsharefilm.com/";
        this.requestOption = {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
                'referer': 'http://fsharefilm.com/',
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

    getScriptFromTag(html) {
        let beginSlice = html.indexOf('<script type="text/javascript">') + 31;
        if (html.indexOf("text/javascript") === -1) {
            beginSlice = html.indexOf('<script>') + 8;
        }
        let endSlice = html.indexOf('</script>');
        return html.substring(beginSlice, endSlice);
    }

    async getMediaData(reqData) {
        try {
            const unpacker = require("js-beautify/js/lib/unpackers/p_a_c_k_e_r_unpacker");
            const beautify = require("js-beautify").js_beautify;
            let options = this.requestOption;
            Object.assign(options, {
                form: {
                    'action': 'get_player',
                    'url': reqData.url,
                    'sub': reqData.sub,
                    'subeng': reqData.sub_eng,
                    'id_post': reqData.id_post,
                    'id_ep': reqData.id_ep
                }
            });
            let sources = {};
            let response = await this.requestAsync(reqData.ajaxurl, 'post', options);
            response = JSON.parse(response);
            let getPlayerFuncs = this.getScriptFromTag(response.html_player);
            let unpackSource = unpacker.unpack(getPlayerFuncs);
            if(unpackSource.indexOf('addWebSeed("') !== -1) {
                let beginSplice = unpackSource.indexOf(`addWebSeed("`) + 12;
                let endSplice = unpackSource.indexOf(`.mp4"`) + 4;
                sources = [
                    {
                        type: "mp4",
                        label: 720,
                        src: unpackSource.substring(beginSplice, endSplice).trim()
                    }
                ]
            } else {
                let beginSplice = unpackSource.indexOf("sources:[{") + 9;
                let endSplice = unpackSource.indexOf("],tracks") - 1;
                let sourceString = `[${unpackSource.substring(beginSplice, endSplice).trim()}]`;
                sourceString = sourceString.replace(/type/gi, '"type"');
                sourceString = sourceString.replace(/label/gi, '"label"');
                sourceString = sourceString.replace(/file/gi, '"src"');
                sources = JSON.parse(sourceString);
            }
            return sources;
        } catch (e) {
            throw e;
        }
    }

    async crawlVideoLink(url) {
        try {
            let response = await this.requestAsync(url, 'get', this.requestOption);
            let beginSlice = response.indexOf("var ajaxurl ="),
                endSlice = response.indexOf("is_drive = true;") + 15;
            let result = response.substring(beginSlice, endSlice);
            result += "; exports.data = {ajaxurl: ajaxurl, url: url, sub: sub, sub_eng: sub_eng, id_post: id_post, id_ep: id_ep, is_drive: is_drive}";
            let res = _eval(result);
            return await this.getMediaData(res.data);
        } catch (e) {
            console.log('error - crawlVideoLink - fsharefilm', e);
            throw e;
        }
    }
}

export default FshareFilm;