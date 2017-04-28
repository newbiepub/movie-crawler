import cheerio from "cheerio";
import request from 'request';
import _ from "lodash";
import CryptoJS from "crypto-js";

class Phimmoi {
    constructor() {
        this.baseUrl = "http://www.phimmoi.net/";
        this.requestOption = {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
                'referer': 'http://www.phimmoi.net/',
                'cookie': '_a3rd1478681532=0-9; ADB3rdCookie1478681307=1; ADB3rdCookie1413887770=1; _a3rd1407405582=0-8; ADB3rdCookie1385973822=1; gen_crtg_rta=; __RC=5; __R=3; __UF=-1; __uif=__uid%3A2625795562883732188%7C__ui%3A-1%7C__create%3A1482579556; __tb=0; __IP=2883739208; __utmt=1; __utmt_b=1; __utma=247746630.1273382115.1482841916.1484328884.1484382954.4; __utmb=247746630.3.10.1484382954; __utmc=247746630; __utmz=247746630.1482841916.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _a3rd1426850317=0-5; _a3rd1401790478=0-6'
            },
            timeout: 10000,
            retries: 5
        }
    }

    crawlPhimMoi(callback) {
        request(this.baseUrl, this.requestOption, (err, res, html) => {
            if (!err && res.statusCode === 200) {
                let $ = cheerio.load(html);
                let listMovies = $('.movie-list-index .movie-item');
                let MovieLinks = [];
                _.each(listMovies, (movieItem) => {
                    MovieLinks.push({title: movieItem.attribs.title, link: movieItem.attribs.href});
                });
                this.getMediaUrl(MovieLinks, (movies) => {
                    callback(movies);
                });
            } else {
                console.log(err);
                callback({});
            }
        })
    }

    crawlWithCategory() {

    }

    getMediaUrl(listUrl, callback) {
        _.each(listUrl, (movie, index) => {
            this.findMedia(movie.link, (getMedia) => {
                request(getMedia, this.requestOption, (err, res, jsonString) => {
                    if (!err && res.statusCode === 200) {
                        let body = JSON.parse(jsonString);
                        let password = "PhimMoi.Net@" + body.episodeId;
                        let mediaItems = [];
                        setTimeout(() => {
                            _.each(body.medias, (media) => {
                                let mediaItem = {
                                    type: media.type,
                                    width: media.width,
                                    height: media.height,
                                    resolution: media.resolution,
                                    url: this.decodeAES(media.url, password)
                                };
                                mediaItems.push(mediaItem);
                            });
                            Object.assign(movie, {mediaUrls: mediaItems});
                            listUrl.splice(index, 1, movie);
                            if (index === listUrl.length - 1) {
                                callback(listUrl);
                            }
                        }, 500);
                    } else {
                        console.log(err);
                        callback({err: err});
                    }
                })
            })
        })
    }

    findMedia(url, callback) {
        return request(`${this.baseUrl}${url}xem-phim.html`, this.requestOption, (err, res, html) => {
            if (!err && res.statusCode === 200) {
                let $ = cheerio.load(html);
                let media = $('script[onload="checkEpisodeInfoLoaded(this)"]').attr("src");
                console.log(`Getting PhimMoi Media: \n ${media} \n\n`,);
                callback(media.replace("javascript", "json"));
            } else {
                console.log(err);
                callback({err: err});
            }
        });
    };

    decodeAES(url, password) {
        try {
            if(url.indexOf(".com") == -1) {
                let decrytData = CryptoJS.AES.decrypt(url.toString(), password);
                return decrytData.toString(CryptoJS.enc.Utf8);
            }
            return url

        } catch (e) {
            console.log(url);
            console.log(e);
        }
        return "";
    }
}

export default Phimmoi;