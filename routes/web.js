var express = require('express');
var router = express.Router();
const path = require('path');


router.get('/register', function (req, res){
    var dir = __dirname;
    var p = path.resolve( dir, "../public/pages/", "userregistration");
    res.render(p )
})


module.exports = router;