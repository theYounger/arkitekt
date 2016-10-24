'use strict';

function authCheck(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/login');
  }
  next();
}

var express = require('express');
var Router = express.Router();
var previewFix = require('../lib/img_preview_fix');
var Gallery = require('../models').Gallery;
var methodOverride = require('method-override');
var imageTotal;
var imagePartition;

Router.use(
  authCheck,
  methodOverride(function methodOverride(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

Router.route('/')
.get(function queryAllImages(req, res) {
  Gallery.findAll({
    attributes: ['id', 'author', 'link'],
  })
  .then(function loadResults(imageResults) {
    res.render('./galleryTemplates/index', {
      photos: imageResults,
    });
  });
})
.post(function createImage(req, res) {
  Gallery.create({
    UserId: req.user.id,
    author: req.body.author,
    link: req.body.link,
    description: req.body.description
  }).then(function reGallery() {
    res.redirect('/gallery');
  });
});

Router.get('/new', function getImageForm(req, res) {
  res.render('./galleryTemplates/new');
});

Router.route('/:id')
.get(function queryImage(req, res) {
  Gallery.findAll({
    attributes: ['UserId', 'id', 'author', 'link', 'description', 'createdAt', 'updatedAt']
  })
  .then( (image) => {
    var mainIndex;
    var imageMap = image.map((element) => {
      return {
        UserId: element.dataValues.UserId,
        link: element.dataValues.link,
        id: element.dataValues.id,
        author: element.dataValues.author,
        description: element.dataValues.description,
        createdAt: element.dataValues.createdAt,
        updatedAt: element.dataValues.updatedAt
      };
    });
    imageMap.forEach((ele, ind) => {
      if(ele.id == req.params.id){
        mainIndex = ind;
      }
    });
    previewFix(req, res, mainIndex, imageMap);
  });
})
.put(function queryImage(req, res) {
  var selectRow = {};
  Gallery.findAll( { where: { id: req.params.id } } )
    .then (function updateImage() {
      for (var key in req.body) {
        selectRow[key] = req.body[key];
      }
      Gallery.update(selectRow, {where: { id: req.params.id }})
        .then( (result) => {
        });
    }).then(function reGallery() {
    res.redirect('/gallery/' + req.params.id);
  });
})
.delete (function destroyImage(req, res){
  Gallery.destroy( { where: { id: req.params.id } } )
  .then(function loadResults(resultLoad) {
    res.render('./galleryTemplates/index', {
      photos: resultLoad
    });
  });
});

1
Router.get('/:id/edit', function queryImage(req, res) {
  Gallery.findAll( { where: { id: req.params.id } } )
  .then(function loadResult(imageResult) {
    var imgData = imageResult[0].dataValues;
    res.render('./galleryTemplates/edit', {
      photoId: imgData.id,
      photoLink: imgData.link
    });
  });
});

module.exports = Router;