const MongoClient = require('mongodb').MongoClient,
      Forge       = require('node-forge'),
      request     = require('request'),
      fs          = require('fs');

const MongoUrl = "";
const MongoDBName  = "";

var defaultCallback = (db, cb) => {cb();};

var dbConnect = function(callback = defaultCallback) {
    MongoClient.connect(MongoUrl, function(err, client) {
        let db = client.db(MongoDBName);
        callback(db, () => {
            client.close();
        });
    });
};

var localize = function (word) {
    word = word.replace("\\", "");
    word = word.replace("\"", "");
    word = word.replace('\'', "");
    word = word.replace(/[!@#$%^&\*\(\)\+\[\]{}\|:;\?\/<>,\.`~=]/g, "");
    return word;
}

var saveCode = function (user, name, code) {
    user = localize(user);
    name = localize(name);
    if (!fs.existsSync(`./code/${user}`)) fs.mkdirSync(`./code/${user}`);
    fs.writeFileSync(`./code/${user}/${name}.js.code`, code);
    fs.writeFileSync(`./code/${user}/${user}.js.code`, code);
}

var readCode = function (user, name) {
    user = localize(user);
    name = localize(name);
    if (!fs.existsSync(`./code/${user}`)) return "";
    if (!fs.existsSync(`./code/${user}/${name}.js.code`)) return "";
    return fs.readFileSync(`./code/${user}/${name}.js.code`).toString();
}

var listCode = function (user=null) {
    let dir = `./code`;
    if (user) dir = `./code/${user}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    let list = fs.readdirSync(dir);
    let res = {};
    for (let i = 0; i < list.length; i++) {
        if (list[i].indexOf(".") != 0) {
            if (user && `${user}.js.code` == list[i]) continue;
            res[list[i].replace(".js.code", "")] = 1;
        }
    }
    return res;
}

var checkUser = function(urname, passwd, callback=() => {}) {
    request.post('http://minecraft.biggerlab.com/', {form:{
        user: urname,
        pass: passwd
    }}, function(error, response, body) {
        try {
            let data = JSON.parse(body);
            callback({
                error: null,
                name: data.name,
                user: data.user,
                email: data.email,
                id: data._id
            })
        } catch (error) {
            callback({error: body});
        }
    });
}

exports.checkUser = checkUser;
exports.saveCode  = saveCode;
exports.readCode  = readCode;
exports.listCode  = listCode;
