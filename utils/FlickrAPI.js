const Flickr = require("flickr-sdk");
const FLICKR_API_KEY = "a1e7371a4c830edbe1390563968ad488";
var flickrAPI = new Flickr(FLICKR_API_KEY);

function flickrError(err) {
    throw Error("Flickr API error: "+err);
}
// Turns a "photo object" from .getRecent, into a photo URL
function photoToURL(photo) {
    return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
}

// Turns a "photo object" into a "Photo info" object (URL, title, author, date-taken)
function photoInfo(photo) {
    return new Promise((resolve,reject)=> {
        flickrAPI.photos.getInfo({photo_id:photo.id}).then(

            // Success
            (res)=> {
                var result = res.body;
                resolve({
                    url: photoToURL(photo),
                    title: photo.title,
                    author: result.photo.owner.realname,
                    authorId: result.photo.owner.nsid,
                    date: result.photo.dates.taken,
                    description: result.photo.description._content
                });
            },
            // Error
            (err)=> {
                flickrError(err);
                reject(err);
            }
        );
    });
}

module.exports = {
    getRandomPhotos: (amount)=> {
        return new Promise((resolve,reject)=> {
            flickrAPI.photos.getRecent({
                page: 1,
                per_page: 300
            }).then(
                (res)=> {
                    var result = res.body;
                    if (result.stat !== "ok") {
                        var err = "ERROR IN getRecent photos -  "+result.stat;
                        flickrError(err);
                        reject(err);
                    }
                    // An array of "photo" objects
                    var photos = result.photos.photo
                    var result_photos = [], photo, rand;
                    while (result_photos.length < amount) {
                        rand = Math.floor(Math.random()*photos.length);
                        // splice returns an array(!) even if it's one item (for some reason)
                        photo = (photos.splice(rand,1))[0];
                        result_photos.push(photoInfo(photo));
                    }
                    resolve(Promise.all(result_photos));
                },
                (err)=> {
                    flickrError(err);
                    reject(err);
                }
            );
        });
    },

    getAuthorPhotos: (authorId, amount)=> {
        return new Promise((resolve,reject)=> {
            flickrAPI.photos.search({
                user_id: authorId,
                page: 1,
                per_page: 300
            }).then(
                (res)=> {
                    var result = res.body;
                    if (result.stat !== "ok") {
                        var err = "ERROR IN search photos -  "+result.stat;
                        flickrError(err);
                        reject(err);
                    }
                    // An array of "photo" objects
                    var photos = result.photos.photo
                    var result_photos = [], photo, rand;
                    while (result_photos.length < amount) {
                        rand = Math.floor(Math.random()*photos.length);
                        // splice returns an array(!) even if it's one item (for some reason)
                        photo = (photos.splice(rand,1))[0];
                        result_photos.push(photoInfo(photo));
                    }
                    resolve(Promise.all(result_photos));
                },
                (err)=> {
                    flickrError(err);
                    reject(err);
                }
            );
        });
    }

}
