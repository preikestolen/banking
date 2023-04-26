const express = require("express");
const app = express();
const ejs = require("ejs");
const port = 5000;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// Setting up our static path and Body Parser
app.use(bodyParser.urlencoded({extended: true}));
// parse application/json
// app.use(bodyParser.json());
app.use(express.static("public"));
app.set('view engine', 'ejs');

const mysql_connector = require('mysql');
const conn = mysql_connector.createConnection({
  host : '127.0.0.1',
  user : 'root',
  password  :'root',
  database : 'banking',
  port: 8889
});

app.listen(process.env.PORT || port, function() {
    console.log("server is listening the port");
});

app.get("/", function(req, res) {
    res.render(__dirname + "/views/home.ejs");
    // conn.query('select * from customer', function (err, result) {
    //     if (err) throw err;
    //     // console.log(result)
    //     ///res.render() function
    //     res.render(__dirname + "/views/home.ejs", {data: result});
    // });
});

app.get("/login", function(req, res) {
    res.clearCookie("context", { httpOnly: true, overwrite: true});
    res.clearCookie("txSuccess", { httpOnly: true, overwrite: true});
    // delete cookie in log out
    res.render(__dirname + "/views/login.ejs", {loginData: "none"});
});

app.get("/signup", function(req, res) {
    res.clearCookie("context", { httpOnly: true, overwrite: true});
    res.clearCookie("txSuccess", { httpOnly: true, overwrite: true});
    res.render(__dirname + "/views/signup.ejs", {usernameData: "none"});
});

app.post("/signup", function(req, res) {
    const fullname = req.body.fullname
    const username = req.body.username
    const password = req.body.password
    const country = req.body.country
    checkUsername = `select * from customer where customer.username = "${username}"`
    query = `insert into customer (username, password, fullname, country) values ("${username}", "${password}", "${fullname}", "${country}")`
    conn.query(checkUsername, function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
            // same username exists, sign up failed
            res.render(__dirname + "/views/signup.ejs", {usernameData: "taken"});
        }
        else {
            // sign up success
            conn.query(query, function (err, result) {
                if (err) throw err;
                res.render(__dirname + "/views/signup.ejs", {usernameData: "success"});
                conn.query(checkUsername, function (err, result) {
                    // add customer to account table
                    var customerid = result[0].customerid
                    createAccount = `insert into account (customerid, username, btc, eth, usd, try) values ("${customerid}", "${username}", "${10}", "${10}", "${1000}", "${1000}")`
                    // initial balances are set for testing purposes
                    conn.query(createAccount, function (err, result) {
                        // account row is added to account table. foreign key is set on customerid and cascade is applied
                    });
                });
            });
        }
    });
});

app.post("/login", function(req, res) {
    const username = req.body.username
    const password = req.body.password
    query = `select * from customer where customer.username = "${username}" and customer.password = "${password}"`
    getBalances =`select * from account where account.username = "${username}"`
    var userBtcAmount = 0
    var userEthAmount = 0
    var userUsdAmount = 0
    var userTryAmount = 0
    conn.query(query, function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
            var newResult = result
            newResult = newResult[0]
            // console.log(newResult)
            // user exists, log in success
            // res.render(__dirname + "/views/account.ejs", {customerData: result});
            // context cookie keeps user data who is currently logged in
            // cookies can be seen via browser so password is not included in the cookie
            var newUsername = newResult.username
            var newFullname = newResult.fullname
            var newCountry = newResult.country
            var newDict = {
                username: newUsername,
                fullname: newFullname,
                country: newCountry,
                btc: userBtcAmount,
                eth: userEthAmount,
                usd: userUsdAmount,
                trl: userTryAmount
            };
            conn.query(getBalances, function (err, result) {
                if (err) throw err;
                // console.log(result)
                result = result[0]
                userBtcAmount = result.btc
                userEthAmount = result.eth
                userUsdAmount = result.usd
                userTryAmount = result.trl
            });
            res.cookie("context", newDict, { httpOnly: true });
            return res.redirect(303, "/account")
        }
        else {
            // username or password is incorrect or user not found
            res.render(__dirname + "/views/login.ejs", {loginData: "wrong"});
        }
    });
});

app.get("/account", function(req, res) {
    const context = req.cookies["context"];
    var transfers;
    if(context == null) {
        // this if statement is here
        // to prevent crash when
        // user logs out and when directed to login page
        // he goes to previous page and see the account details
        // but when he refreshes the page, it gets error 
        // since context cookie is deleted as he went through get("/login")
        return res.redirect(301, "/login")
    }
    const username = context.username
    getBalances =`select * from account where account.username = "${username}"`
    getTransfers = `select t.txCurrency, t.txAmount, ` +
    `a.username as fromUsername, c.fullname as fromName, a2.username as toUsername, c2.fullname as toName ` +
    `from transfer as t join account as a on t.fromID = a.accountid join account as a2 on  t.toID = a2.accountid `+
    `join customer as c on a.customerid = c.customerid join customer as c2 on a2.customerid = c2.customerid `+
    `where a.username = "${username}" or a2.username = "${username}"`
    conn.query(getTransfers, function (err, result) {
        if (err) throw err;
        // result = result[0]
        console.log(result)
        // list of dictionary
        transfers = result
    });
    conn.query(getBalances, function (err, result) {
        if (err) throw err;
        result = result[0]
        // console.log(result)
        context.btc = result.btc
        context.eth = result.eth
        context.usd = result.usd
        context.trl = result.trl
        const newContext = context
        res.cookie('context', newContext, {httpOnly: true, overwrite: true});
        // console.log(newContext)
        if(context == null) {
            return res.redirect(301, "/login")
        }
        txCookie = req.cookies["txSuccess"];
        // console.log(txCookie)
        res.clearCookie("txSuccess", { httpOnly: true, overwrite: true});
        res.render(__dirname + "/views/account.ejs", {customerData: newContext, txData: txCookie, transfersData: transfers});
    });
});

app.post("/transfer", function (req, res) {
    // get is what client gets from server, post is what client posts to server
    // deal with the contents of the submitted transfer form
    const currency = req.body.currency
    const amount = req.body.amount
    const username = req.body.username
    const context = req.cookies["context"];
    if(context == null) {
        return res.redirect(301, "/login")
    }
    const fromUsername = context.username
    var fromID = 0;
    var toID = 0;
    checkAccount = `select * from account where account.username = "${username}"`
    checkFromAccount = `select * from account where account.username = "${fromUsername}"`
    minusAccount = `update account set account.` + currency + `= account.` + currency + `-` + amount + ` where account.username = "${fromUsername}"`
    plusAccount = `update account set account.` + currency + `= account.` + currency + `+` + amount + ` where account.username = "${username}"`
    conn.query(checkAccount, function (err, result) {
        if(result.length > 0) {
            // receiver username exists, now check if sender balance is enough
            if(fromUsername == username) {
                // can not transfer yourself
                res.cookie("txSuccess", {"tx": "sameuser"}, { httpOnly: true, overwrite: true });
                return res.redirect(303, "/account")   
            }
            result = result[0]
            toID = result.accountid
            conn.query(checkFromAccount, function (err, result) {
                // check if sender balance is enough
                result = result[0]
                if(eval("result." + currency +" >= amount")) {
                    fromID = result.accountid
                    // console.log("transfer success")
                    conn.query(minusAccount, function (err, result) {
                        // make the transfer
                    });
                    conn.query(plusAccount, function (err, result) {
                        // make the transfer
                    });
                    newTransfer = `insert into transfer (fromID, toID, txCurrency, txAmount) values ("${fromID}", "${toID}", "${currency}", "${amount}")`
                    conn.query(newTransfer, function (err, result) {
                        // add the transfer
                        if (err) throw err;
                    });
                    res.cookie("txSuccess", {"tx": "success"}, { httpOnly: true, overwrite: true });
                    return res.redirect(303, "/account")
                }
                else {
                    // balance is not enough, do not make the transfer
                    // console.log("balance not enough")
                    res.cookie("txSuccess", {"tx": "nobalance"}, { httpOnly: true, overwrite: true });
                    return res.redirect(303, "/account")
                }
            });
        }
        else{
            // receiver account is not found
            // console.log("account to sent not found")
            res.cookie("txSuccess", {"tx": "nouser"}, { httpOnly: true, overwrite: true });
            return res.redirect(303, "/account")
        }
    });
});
  
app.post("/exchange", function (req, res) {
    // deal with the contents of the submitted exchange form
});