function isAuthenticated(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  return next();
}

var Router = require('express').Router();
var Gallery = require('../models').Gallery;
var previewFix = require('../lib/img_preview_fix');

Router.route('/')
/*  to see a single gallery photo */
.get( isAuthenticated, (req, res) => {
  Gallery.findAll({
    attributes: ['UserId', 'id', 'author', 'link', 'description', 'createdAt', 'updatedAt']
  })
  .then( (image) => {
    console.log('image', image);
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
    var mainIndex;
    imageMap.forEach((ele, ind) => {
      if(ele.id == req.params.id){
        mainIndex = ind;
      }
    });
    previewFix(req, res, mainIndex, imageMap);
  });
})
/*  updates a single gallery photo identified by the :id param */
  .put( isAuthenticated, ( req, res ) => {
    var selectRow = {};
    Gallery.findAll({where: {id: req.params.id}})
      .then ( () => {
        for (var key in req.body) {
          selectRow[key] = req.body[key];
        }
        Gallery.update(selectRow, {where: { id: req.params.id }})
          .then( (result) => {
          });
      }).then( ()=> {
      res.redirect('/gallery/' + req.params.id);
    });
  })
/* to delete a single gallery photo identified by the :id param */
  .delete ( isAuthenticated, ( req, res ) => {
    Gallery.destroy({where: {id: req.params.id}})
      .then((gallery) => {
        res.render('./galleryTemplates/index', {
          photos: gallery
        });
      });
    });

  module.exports = Router;
