const MongoClient = require('mongodb').MongoClient,
      Forge       = require('node-forge'),
      request     = require('request'),
      fs          = require('fs');

const MongoUrl = process.env.MONGOURL || "";
const MongoDBName  = MongoUrl.substr(MongoUrl.lastIndexOf("/") + 1);

var defaultCallback = (db, cb) => {cb();};

var dbConnect = function(callback = defaultCallback) {
    MongoClient.connect(MongoUrl, function(err, client) {
        let db = client.db(MongoDBName);
        callback(db, () => {
            client.close();
        });
    });
};

var getHistoryList = function(user, limit = 10, callback) {
    dbConnect((db, after) => {
        let col = db.collection(`pong.history.${user}`);
         col.find().sort({time: -1}).limit(limit)
            .toArray(function(err, result) {
                callback(result);
                after();
            });
    });
}

// user  发起人
// with  接受人
// enemy 敌人
var updateHistory = function(user1, user2, winner, seed=5, callback) {
    let snap1 = readCode(user1, user1).snap;
    let snap2 = readCode(user2, user2).snap;
    dbConnect((db, after) => {
        let col = db.collection(`pong.history.${user1}`);
        let currentTime = (new Date()).getTime();
        col.insertOne({user: user1, with: user2, snap1: snap1, snap2: snap2, enemy: user2, seed: seed, winner: winner, time: currentTime}, function(err, res) {
            let col2 = db.collection(`pong.history.${user2}`);
            col2.insertOne({user: user1, with: user2, snap1: snap1, snap2: snap2, enemy: user1, seed: seed, winner: winner, time: currentTime}, function(err, res) {
                callback(true);
                after();
            });
        });
    });
}

var getScoreList = function(limit = 10, callback) {
    dbConnect((db, after) => {
        let col = db.collection("pong.leaderboard");
         col.find().sort({score: -1}).limit(limit)
            .toArray(function(err, result) {
                callback(result);
                after();
            });
    });
}

var getScore = function(user, callback) {
    dbConnect((db, after) => {
        let col = db.collection("pong.leaderboard");
         col.find({user: user})
            .toArray(function(err, result) {
                if (result.length) {
                    callback(result[0].score);
                } else {
                    callback(0);
                }
                after();
            });
    });
}

var updateScore = function(user, score=0, callback) {
    dbConnect((db, after) => {
        let col = db.collection("pong.leaderboard");
         col.find({user: user})
            .toArray(function(err, result) {
                let lastScore = 0;
                if (result.length) {
                    lastScore = result[0].score;
                }
                if (lastScore < score) {
                    col.updateOne({user: user}, {$set: {score: score} }, function(err, result2) {
                        if (result2.result.nModified) {
                            callback(score);
                            after();
                        } else {
                            col.insertOne({user: user, score: score}, function(err, res) {
                                callback(score);
                                after();
                            });
                        }
                    });
                } else {
                    callback(lastScore);
                    after();
                }
            });
    });
}

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
    let time = (new Date()).getTime();
    if (!fs.existsSync(`./code/${user}`)) fs.mkdirSync(`./code/${user}`);
    fs.writeFileSync(`./code/${user}/${name}.js.code`, code);
    fs.writeFileSync(`./code/${user}/${user}.js.code`, code);
    if (!fs.existsSync(`./code/${user}/snapshot`)) fs.mkdirSync(`./code/${user}/snapshot`);
    fs.writeFileSync(`./code/${user}/snapshot/${user}-${time}.js.code`, code);
    fs.writeFileSync(`./code/${user}/${name}.js.snapshot`, `${time}`);
    fs.writeFileSync(`./code/${user}/${user}.js.snapshot`, `${time}`);
}

var readCode = function (user, name, snapshot="") {
    user = localize(user);
    name = localize(name);
    snap = localize(`${snapshot}`);
    if (!fs.existsSync(`./code/${user}`)) return "";
    if (!fs.existsSync(`./code/${user}/${name}.js.code`)) return "";
    if (!fs.existsSync(`./code/${user}/${name}.js.snapshot`)) return "";
    if (!snap) {
        return {
            code: fs.readFileSync(`./code/${user}/${name}.js.code`).toString(),
            snap: fs.readFileSync(`./code/${user}/${name}.js.snapshot`).toString()
        }
    } else {
        if (!fs.existsSync(`./code/${user}/snapshot`)) return "";
        if (!fs.existsSync(`./code/${user}/snapshot/${user}-${snapshot}.js.code`)) return "";
        return {
            code: fs.readFileSync(`./code/${user}/snapshot/${user}-${snapshot}.js.code`).toString(),
            snap: snap
        }
    }
    
}

var listCode = function (user=null) {
    let dir = `./code`;
    if (user) dir = `./code/${user}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    let list = fs.readdirSync(dir);
    let res = {};
    for (let i = 0; i < list.length; i++) {
        if (list[i].indexOf(".") != 0) {
            if (list[i] == "snapshot") continue;
            if (list[i].endsWith(".js.snapshot")) continue;
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

exports.checkUser      = checkUser;
exports.saveCode       = saveCode;
exports.readCode       = readCode;
exports.listCode       = listCode;
exports.getScore       = getScore;
exports.updateScore    = updateScore;
exports.getScoreList   = getScoreList;
exports.getHistoryList = getHistoryList;
exports.updateHistory  = updateHistory;