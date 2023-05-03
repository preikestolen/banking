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
    res.clearCookie("exchangeStatus", { httpOnly: true, overwrite: true});
    // delete cookie in log out
    res.render(__dirname + "/views/login.ejs", {loginData: "none"});
});

app.get("/signup", function(req, res) {
    res.clearCookie("context", { httpOnly: true, overwrite: true});
    res.clearCookie("txSuccess", { httpOnly: true, overwrite: true});
    res.clearCookie("exchangeStatus", { httpOnly: true, overwrite: true});
    res.render(__dirname + "/views/signup.ejs", {usernameData: "none"});
});

app.post("/signup", function(req, res) {
    const fullname = req.body.fullname
    const username = req.body.username
    const password = req.body.password
    const country = req.body.country
    if(fullname.includes("=") || fullname.includes(";") || username.includes("=") 
    || username.includes(";") || password.includes("=") || password.includes(";") 
    || country.includes("=") || country.includes(";")) {
        // basic sql injection prevention
        // just checking if = inserted for 1=1
        // and if ; inserted for ;drop table account;
        return res.render(__dirname + "/views/signup.ejs", {usernameData: "sql-injection"});
    }
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
    if(username.includes("=") || username.includes(";") || password.includes("=") || password.includes(";")) {
        // basic sql injection prevention
        // just checking if = inserted for 1=1
        // and if ; inserted for ;drop table account;
        return res.render(__dirname + "/views/login.ejs", {loginData: "sql-injection"});
    }
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
    var exchanges;
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
    var getBalances =`select * from account where account.username = "${username}"`
    var getTransfers = `select t.txCurrency, t.txAmount, ` +
    `a.username as fromUsername, c.fullname as fromName, a2.username as toUsername, c2.fullname as toName ` +
    `from transfer as t join account as a on t.fromID = a.accountid join account as a2 on  t.toID = a2.accountid `+
    `join customer as c on a.customerid = c.customerid join customer as c2 on a2.customerid = c2.customerid `+
    `where a.username = "${username}" or a2.username = "${username}" order by t.txID desc`
    var getExchanges = `select a2.exID, a2.fromCurrency as fromCurrency, a2.fromAmount as fromAmount, 
    a2.toCurrency as toCurrency, a2.toAmount as toAmount, a2.exRate as exRate, c.username as username, c.fullname as fullName
    from (select a.customerid, e.*
    from exchange as e, account as a
    where e.accountID = a.accountid) as a2, customer as c
    where a2.customerid = c.customerid
    having c.username = "${username}"
    order by a2.exID desc`
    conn.query(getTransfers, function (err, result) {
        if (err) throw err;
        // result = result[0]
        // console.log(result)
        // list of dictionary
        transfers = result
        conn.query(getExchanges, function (err, result) {
            if (err) throw err;
            // console.log(result)
            // list of dictionary
            exchanges = result
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
                exStCookie = req.cookies["exchangeStatus"]
                res.clearCookie("txSuccess", { httpOnly: true, overwrite: true});
                if(exStCookie != null && exStCookie.ex != "confirm") {
                    res.clearCookie("exchangeStatus", { httpOnly: true, overwrite: true});
                }
                res.render(__dirname + "/views/account.ejs", {customerData: newContext, txData: txCookie, transfersData: transfers, exchangeStatusData: exStCookie, exchangesData: exchanges});
            });
        });
    });
});

app.post("/transfer", function (req, res) {
    // get is what client gets from server, post is what client posts to server
    // deal with the contents of the submitted transfer form
    var currency = req.body.currency
    if(currency == "try") {currency = "trl"}
    var amount = req.body.amount
    const username = req.body.username
    if(username.includes("=") || username.includes(";") || currency.includes("=") 
    || currency.includes(";") || amount.includes("=") || amount.includes(";")) {
        // basic sql injection prevention
        // just checking if = inserted for 1=1
        // and if ; inserted for ;drop table account;
        res.cookie("txSuccess", {"tx": "sql-injection"}, { httpOnly: true, overwrite: true });
        return res.redirect(303, "/account") 
    }
    amount = Number(Number(amount).toFixed(4))
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
    const rates = {
        btceth: 15.40,
        btcusd: 25000,
        btctrl: 500000,
        ethbtc: 0.065,
        ethusd: 1700,
        ethtrl: 34000,
        usdbtc: 0.00004,
        usdeth: 0.0006,
        usdtrl: 20,
        trlbtc: 0.000002,
        trleth: 0.00003,
        trlusd: 0.05
    }
    var amount = req.body.amount
    var fromCurrency = req.body.fromcurrency
    var toCurrency = req.body.tocurrency
    var exDetails = [amount, fromCurrency, toCurrency, currentRate, newAmount]
    if(amount.includes("=") || amount.includes(";") || fromCurrency.includes("=") 
    || fromCurrency.includes(";") || toCurrency.includes("=") || toCurrency.includes(";")) {
        // basic sql injection prevention
        // just checking if = inserted for 1=1
        // and if ; inserted for ;drop table account;
        if(fromCurrency == "trl") {fromCurrency = "try"}
        if(toCurrency == "trl") {toCurrency = "try"}
        exDetails = [amount, fromCurrency, toCurrency, currentRate, newAmount]
        res.cookie("exchangeStatus", {"ex": "sql-injection", "details": exDetails}, { httpOnly: true, overwrite: true });
        return res.redirect(303, "/account")
    }
    amount = Number(Number(amount).toFixed(4))
    var currentRate;
    var newAmount;
    if(fromCurrency == "try") {fromCurrency = "trl"}
    if(toCurrency == "try") {toCurrency = "trl"}
    exDetails = [amount, fromCurrency, toCurrency, currentRate, newAmount]
    const context = req.cookies["context"];
    if(context == null) {
        return res.redirect(301, "/login")
    }
    const username = context.username
    // console.log(exDetails)
    if(fromCurrency == toCurrency) {
        // can not exchange same currency
        if(fromCurrency == "trl") {fromCurrency = "try"}
        if(toCurrency == "trl") {toCurrency = "try"}
        exDetails = [amount, fromCurrency, toCurrency, currentRate, newAmount]
        res.cookie("exchangeStatus", {"ex": "samecurrency", "details": exDetails}, { httpOnly: true, overwrite: true });
        return res.redirect(303, "/account")
    }
    else {
        if(eval("context." + fromCurrency + ">=" + amount)) {
            var currentRate = eval("rates." + fromCurrency + toCurrency)
            var newAmount = amount * currentRate
            newAmount = Number(newAmount.toFixed(4))
            exDetails[3] = currentRate
            exDetails[4] = newAmount
            // console.log(exDetails)
            if(fromCurrency == "trl") {fromCurrency = "try"}
            if(toCurrency == "trl") {toCurrency = "try"}
            exDetails = [amount, fromCurrency, toCurrency, currentRate, newAmount]
            res.cookie("exchangeStatus", {"ex": "confirm", "details": exDetails}, { httpOnly: true, overwrite: true });
            return res.redirect(303, "/account")
        }
        else {
            // balance not enough
            res.cookie("exchangeStatus", {"ex": "nobalance", "details": exDetails}, { httpOnly: true, overwrite: true });
            return res.redirect(303, "/account")
        }
    }
});

app.post("/confirmexchange", function (req, res) {
    // sql for exchanging
    const context = req.cookies["context"]
    const username = context.username
    const exStCookie = req.cookies["exchangeStatus"]
    var fromCurrency = exStCookie.details[1]
    const fromAmount = exStCookie.details[0]
    var toCurrency = exStCookie.details[2]
    const toAmount = exStCookie.details[4]
    const exRate = exStCookie.details[3]
    if(fromCurrency == "try") {fromCurrency = "trl"}
    if(toCurrency == "try") {toCurrency = "trl"}
    console.log(exStCookie)
    console.log(context)
    if(context == null) {
        return res.redirect(301, "/login")
    }
    getAccount = `select * from account where account.username = "${username}"`
    conn.query(getAccount, function (err, result) {
        if(result.length > 0) {
            // user exists (extra check)
            result = result[0]
            const accountId = result.accountid
            newExchange = `insert into exchange (accountID, fromCurrency, fromAmount, toCurrency, toAmount, exRate) values ("${accountId}", "${fromCurrency}", "${fromAmount}", "${toCurrency}", "${toAmount}", "${exRate}")`
            updateAccountMinus = `update account set account.` + fromCurrency + `= account.` + fromCurrency + `-` + fromAmount + ` where account.accountid = "${accountId}"`
            updateAccountPlus = `update account set account.` + toCurrency + `= account.` + toCurrency + `+` + toAmount + ` where account.accountid = "${accountId}"`
            conn.query(newExchange, function (err, result) {
                // add the exchange
                if (err) throw err;
            });
            conn.query(updateAccountMinus, function (err, result) {
                // update the account
                if (err) throw err;
            });
            conn.query(updateAccountPlus, function (err, result) {
                // update the account
                if (err) throw err;
            }); 
        }
    });
    res.clearCookie("exchangeStatus", { httpOnly: true, overwrite: true})
    return res.redirect(303, "/account")
});

app.post("/cancelexchange", function (req, res) {
    res.clearCookie("exchangeStatus", { httpOnly: true, overwrite: true})
    return res.redirect(303, "/account")
});