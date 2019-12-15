var mkdirp = require('mkdirp');
const multer = require('multer');


module.exports = {
save: function save(req, res) {
  console.log("in uploadAvatar");
//
mkdirp('./user/userid' , function (err) {
  console.log("dentro mkdirp");
  var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './user/userid');
        },
        filename: function (req, file, cb) {
          cb(null , file.originalname);
        }
      });
    var upload = multer({ storage: storage }).array('multiAudio', 4)
    upload(req, res, function(err) {
    console.log(req.body);
    console.log(req.file);

    if(err) {
        return res.end("Error uploading file.");
    }
    res.end("File is uploaded");
});

});

// mkdirp('./user/userid' , function (err) {
//     console.log("dentro mkdirp");
//   var storage = multer.diskStorage({
//       destination: function(req, file, cb) {
//           cb(null, './user/userid');
//         },
//         filename: function (req, file, cb) {
//           cb(null , file.originalname);
//         }
//       });
//   var upload = multer({ storage: storage }).array('multiAudio', 4);
// });

}
}
