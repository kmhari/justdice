/**
 * Created with JetBrains WebStorm.
 * User: hariharasudhan
 * Date: 27/11/13
 * Time: 8:33 AM
 * To change this template use File | Settings | File Templates.
 */
var Admin = exports = module.exports = {};
var db = require("./connect");
var SeedDetail = require("./seed_detail");
var User = require("./users");


Admin.initialize = function(app){

    app.get('/admin/users',function(request,response){
        User.page(1,function(data){
            response.render("users",{data:data})
        })

    });

    app.post('/admin/user/edit',function(request,response){
        var sql = "UPDATE users SET "+request.body.name+ " = ? WHERE ID = ?";
        db.query(sql,[request.body.value,request.body.pk],function(err,rows){
            if(!err){
                response.json({success:true});
            }else{
                console.log(err);
                response.json(400,"Cannot Update");
            }
        })
    });


}