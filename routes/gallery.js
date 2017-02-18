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
var sequelize = require('../models').sequelize;
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
    order: '"createdAt" DESC'
  })
  .then(function loadResults(imgs) {
    res.render('./galleryTemplates/index', {
      images: imgs,
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
      where: {
        id: {
          $lte: req.params.id
        }
      },
      order: '"createdAt" DESC',
      limit: 4
    })
    .then(function(imgs) {
      res.render('./galleryTemplates/picpage', {
        img0: imgs[0],
        img1: imgs[1],
        img2: imgs[2],
        img3: imgs[3]
      });
    });

  // Gallery.findById(req.params.id)
  // .then(function (img) {
  //     console.log('img', img);
  // });


  // Gallery.findAll({
  //   attributes: ['UserId', 'id', 'author', 'link', 'description', 'createdAt', 'updatedAt']
  // })
  // .then(function repkgImg(img) {
  //   console.log('inside repkgImg');
  //   var mainIndex;
  //   var reImg = img.map(function mapImg(element) {
  //     return {
  //       UserId: element.dataValues.UserId,
  //       link: element.dataValues.link,
  //       id: element.dataValues.id,
  //       author: element.dataValues.author,
  //       description: element.dataValues.description,
  //       createdAt: element.dataValues.createdAt,
  //       updatedAt: element.dataValues.updatedAt
  //     };
  //   });
  //   reImg.forEach((ele, ind) => {
  //     if(ele.id == req.params.id){
  //       mainIndex = ind;
  //     }
  //   });
  //   previewFix(req, res, mainIndex, reImg);
  // });
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