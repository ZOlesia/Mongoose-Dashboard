var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const flash = require('express-flash');


app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./static")));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/basic_mongoose');
app.use(flash());


var AnimalSchema = new mongoose.Schema({
    name : {type: String, required: true, minlength: 2},
    class : {type: String, required: true, minlength: 6},
    img : {type: String, required: true, minlength: 5}
}, {timestamps: true});
var Animal = mongoose.model('Animal', AnimalSchema);


app.get('/', function(req, res){
    Animal.find({}, null, {sort: '-createdAt'}, function(err, result)
    {
        if(err)
        {
            console.log('ERROR CANNOT DISPLAY ANIMALS');
        }
        else
        {
            console.log("*********************");
            console.log(result);
            res.render("animals", {all_animals: result});
        }
    })
})

app.get('/animals/new', function(req, res) 
{
    res.render("index");
})

app.post('/animals', function(req, res){
    console.log("111111111");
    var animal = new Animal({ name: req.body.name, class: req.body.class, img: req.body.img });
    animal.save(function(err){
        if(err){
            console.log('ERROR!!!!');
            for(var key in err.errors){
                req.flash('animal_creation', err.errors[key].message);
            }
            return res.redirect('/animals/new');
        }
        else{
            console.log('222222222');
            console.log(animal);
            res.redirect('/');
        }
    })
})


app.get('/animal/:id', function(req, res){
    Animal.find({_id: req.params.id}, function(err, data){
        if(err)
        {
            console.log('CANNOT SHOW THIS ANIMAL');
            res.redirect('/');
        }
        else
        {
            console.log(data);
            res.render('animal', {animal: data});
        }
    })
})

app.get('/animal/edit/:id', function(req, res){
    Animal.find({_id: req.params.id}, function(err, data){
        if(err)
        {
            console.log('CANNOT EDIT THIS ANIMAL');
            res.redirect('/animal/edit/' + req.params.id);
        }
        else
        {
            console.log(data);
            res.render('edit', {edit_animal: data});
        }
    })
})

app.post('/animal/:id', function(req, res){
    Animal.findByIdAndUpdate(req.params.id, {$set:req.body}, function(err, data){
        if(err){
            console.log('ERROR WHILE EDITIND');
            for(var key in err.errors){
                req.flash('animal_creation', err.errors[key].message);
            }
            res.redirect('/animal/edit/' + req.params.id);
        }
        else{
            res.redirect('/animal/' + req.params.id);
        }
    })
})

app.get('/animal/destroy/:id', function(req, res){
    Animal.findByIdAndRemove(req.params.id, function(err, data){
        if(err){
            console.log('CANNOT DELETE ANIMAL');
            res.redirect('/animal/' + req.params.id);
        } else
        {
            res.redirect('/');
        }
    })
})


app.listen(1337, function() {
    console.log("listening on port 1337");
});


