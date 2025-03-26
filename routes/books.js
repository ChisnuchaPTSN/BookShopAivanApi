const router = require('express').Router();
const booksController = require('../controllers/booksController');
const verify  = require('../middleware/jwtMiddleware').verify;


router.route('/')
    .get(booksController.getBooks)
    .post(verify,booksController.addBook)

router.route('/:bookid/')
    .get(booksController.getBookById)
    .put(verify,booksController.updateBookById)
    .delete(verify,booksController.deleteBookById)

router.route('/cover/:bookid/')
    .get(booksController.getBookCover)
    .post(verify,booksController.uploadBookCover)
    .put(verify,booksController.updateBookThumbnailUrl)


module.exports = router;
