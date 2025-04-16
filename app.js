const app = require('express')();

require('dotenv').config({
    path: './.env'
});

app.use(require('cors')());

app.use(require('body-parser').json({
    limit: '10000mb'
}));

app.use(require('body-parser').urlencoded({
    extended: true,
    limit: '10000mb'
}));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });


app.use('/swaped-file', require('express').static('uploads'));

app.use('/v1/api/files', require('./routes/file'));
app.use('/v1/api/champs', require('./routes/champ'));
app.use('/v1/api/matieres', require('./routes/matiere'));
app.use('/v1/api/fabriques', require('./routes/fabrique'));
app.use('/v1/api/matieres', require('./routes/matiere'));
app.use('/v1/api/niveau-academiques', require('./routes/niveau-academique'));
app.use('/v1/api/annee-academinques', require('./routes/annee-academinque'));
app.use('/v1/api/formulaires', require('./routes/formaulaire-route'));
app.use('/v1/api/formulaires-reponses', require('./routes/response-formulaire-route'));
app.use('/v1/api/folders', require('./routes/folder-route'));
app.use('/v1/api/users', require('./routes/user'));


app.get('/', (req, res) => {
    res.send('ici la terre');
})

require('./configs/db')().then(_ => {
    const port = process.env.PORT
    app.listen(port, () => {
        console.log(process.env.MONGO_RUI);
        console.log(`Server started on ${port}`);
    });
});