module.exports.getExpirationDate = () => {
    var today = new Date();

    var day = today.getDate() + 1;
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    var tomorrow = new Date(month+'-'+day+'-'+year);

    return tomorrow;
}

// check if date cookie is set
// if no cookie, assign current date as cookie
// set expiration to midnight of current date
