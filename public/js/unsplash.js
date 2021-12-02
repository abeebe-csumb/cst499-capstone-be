const fetch = require("node-fetch");


module.exports.url = async () => {
    let apiUrl = `https://api.unsplash.com/photos/random/?client_id=${process.env.UNSPLASH_CLIENT_ID}&count=1&featured=true&orientation=landscape&query=meditation`;
    let response = await fetch(apiUrl);
    let data = await response.json();
    return data[0].urls.small;
}