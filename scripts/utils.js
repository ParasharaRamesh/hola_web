const $ = require("jquery");

module.exports = {
    sendRequest: function (method, url, data, contentType='application/json', useAuthToken=true) {
        let userToken;
        if(useAuthToken) {
            userToken = window.localStorage.getItem('key');
        }

        return $.ajax({
            method: method,
            url: url,
            data: method === "POST" ? JSON.stringify(data): data,
            contentType: contentType,
            headers: useAuthToken ? {'Authorization': 'Token ' + userToken} : {},
        });
    },
    showToast: function (text) {
        document.getElementById('toast').MaterialSnackbar.showSnackbar({message: text, timeout: 3500});
    }
};