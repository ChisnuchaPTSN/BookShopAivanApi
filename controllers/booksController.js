const db = require("../config/db");
const fs = require("fs");
const path = require("path");

//Get All Books
const getBooks = async function (req, res) {
  try {
    res.setHeader("Content-Type", "application/json");

    db.query(
      `
    SELECT 
      bookid,title,isbn,pageCount,
      publishedDate,thumbnailUrl,
      shortDescription,authorid as 'authorid',authors.name as 'author',
      category,price
    FROM books,authors 
    WHERE books.author=authors.authorid`,
      function (error, results, fields) {
        if (error) throw error;
        return res
          .status(200)
          .send({ error: false, message: "books list", data: results });
      }
    );
  } catch {
    return res.status(401).send();
  }
};

//Get Book by Id
const getBookById = async function (req, res) {
  try {
    res.setHeader("Content-Type", "application/json");

    var bookid = Number(req.params.bookid);

    db.query(
      `
    SELECT 
      bookid,title,isbn,pageCount,
      publishedDate,thumbnailUrl,
      shortDescription,authorid as 'authorid',authors.name as 'author',
      category,price
    FROM books,authors 
    WHERE books.author=authors.authorid AND books.bookid=?`,
      bookid.toString(),
      function (error, results, fields) {
        if (error) throw error;
        return res.send({
          error: false,
          message: "book id =" + bookid.toString(),
          data: results,
        });
      }
    );
  } catch {
    return res.status(401).send();
  }
};

//Update Book by Id
const updateBookById = async function (req, res) {
  try {
    var title = req.body.title;
    var price = req.body.price;
    var isbn = req.body.isbn;
    var pageCount = req.body.pageCount;
    var publishedDate = req.body.publishedDate;
    var thumbnailUrl = req.body.thumbnailUrl;
    var shortDescription = req.body.shortDescription;
    var author = req.body.authorid;
    var category = req.body.category;

    res.setHeader("Content-Type", "application/json");

    var bookid = Number(req.params.bookid);

    db.query(
      `UPDATE books 
              SET 
                    title='${title}', 
                    price=${price},
                    isbn= '${isbn}', 
                    pageCount=${pageCount}, 
                    publishedDate='${publishedDate}', 
                    thumbnailUrl='${thumbnailUrl}', 
                    shortDescription='${shortDescription}', 
                    author='${author}', 
                    category= '${category}'
              WHERE bookid=?`,
      bookid,
      function (error, results, fields) {
        if (error) throw error;
        return res.status(200).send({
          error: false,
          message: "Edit book id =" + bookid.toString(),
          data: results,
        });
      }
    );
  } catch {
    return res.status(401).send();
  }
};

//Add new Book
const addBook = async function (req, res) {
  try {
    var title = req.body.title;
    var price = req.body.price;
    var isbn = req.body.isbn;
    var pageCount = req.body.pageCount;
    var publishedDate = req.body.publishedDate;
    var thumbnailUrl = req.body.thumbnailUrl;
    var shortDescription = req.body.shortDescription;
    var author = req.body.authorid;
    var category = req.body.category;

    res.setHeader("Content-Type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );

    db.query(
      `INSERT INTO books 
      (title,price, isbn, pageCount, publishedDate, thumbnailUrl, 
      shortDescription, author, category) 
      VALUES ( '${title}',${price}, '${isbn}', ${pageCount}, '${publishedDate}', '${thumbnailUrl}', 
      '${shortDescription}', '${author}', '${category}');`,
      function (error, results, fields) {
        if (error) throw error;
        return res.status(201).send({
          error: false,
          message: "Insert new book successfully",
          bookid: results.insertId,
        });
      }
    );
  } catch {
    return res.status(401).send();
  }
};

const deleteBookById = async function (req, res) {
  try {
    res.setHeader("Content-Type", "application/json");
    var bookid = Number(req.params.bookid);

    // ใช้ Promise แทน callback
    const promiseConnection = db.promise();
    const [results] = await promiseConnection.query(
      "DELETE FROM books where bookid=?",
      [bookid]
    );

    // ลบรูปภาพปกหนังสือ
    const bookCoverPath = process.env.BOOKSHOP_PICTURE_PATH;
    if (!fs.existsSync(bookCoverPath)) {
      fs.mkdirSync(bookCoverPath, { recursive: true });
    }

    const files = fs.readdirSync(bookCoverPath);
    const bookFilePattern = new RegExp(`^${bookid}\\.`);

    files.forEach((file) => {
      if (bookFilePattern.test(file)) {
        fs.unlinkSync(path.join(bookCoverPath, file));
        console.log(`Deleted existing file: ${file}`);
      }
    });

    // ส่งการตอบสนองหลังจากดำเนินการทั้งหมดเสร็จสิ้น
    return res.status(200).send({
      error: false,
      message: "Delete book id =" + bookid.toString(),
      data: results,
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return res.status(401).send({
      error: true,
      message: "Failed to delete book"
    });
  }
};

//Get book cover
const getBookCover = async function (req, res) {
  const bookCoverPath = process.env.BOOKSHOP_PICTURE_PATH;
  var bookid = Number(req.params.bookid);
  try {
    var { resolve } = require("path");
    var fullPath = resolve(`${bookCoverPath}${bookid}.jpg`);
    var fs = require("fs");

    if (fs.existsSync(`${bookCoverPath}${bookid}.jpg`))
      fullPath = resolve(`${bookCoverPath}${bookid}.jpg`);
    else if (fs.existsSync(`${bookCoverPath}${bookid}.jpeg`))
      fullPath = resolve(`${bookCoverPath}${bookid}.jpeg`);
    else if (fs.existsSync(`${bookCoverPath}${bookid}.png`))
      fullPath = resolve(`${bookCoverPath}${bookid}.png`);
    else fullPath = resolve(`${bookCoverPath}nocover.jpg`);

    res.sendFile(fullPath, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "file is not found" });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(401).send();
  }
};

//Upload book picture
const uploadBookCover = async function (req, res) {
  const bookCoverPath = process.env.BOOKSHOP_PICTURE_PATH;
  const bookid = Number(req.params.bookid);

  try {
    // Check if request contains files
    if (!req.files || !req.files.book_cover) {
      return res.status(400).send({ msg: "No file uploaded" });
    }

    const bookPictureFile = req.files.book_cover;
    const pictureExt = path.extname(bookPictureFile.name);

    // Check if directory exists, create if it doesn't
    if (!fs.existsSync(bookCoverPath)) {
      fs.mkdirSync(bookCoverPath, { recursive: true });
    }

    // Check for existing files with the same bookid and delete them
    try {
      const files = fs.readdirSync(bookCoverPath);
      const bookFilePattern = new RegExp(`^${bookid}\\.`);

      files.forEach((file) => {
        if (bookFilePattern.test(file)) {
          fs.unlinkSync(path.join(bookCoverPath, file));
          console.log(`Deleted existing file: ${file}`);
        }
      });
    } catch (error) {
      console.error("Error while checking for existing files:", error);
      // Continue with upload even if cleanup fails
    }

    // Create the new file path
    const newFilePath = path.join(bookCoverPath, `${bookid}${pictureExt}`);

    // Upload the new file
    bookPictureFile.mv(newFilePath, function (err) {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(500).send({ msg: "Error occurred during upload" });
      }

      return res.status(200).send({
        name: `${bookid}${pictureExt}`,
        path: newFilePath,
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).send({ msg: "Server error" });
  }
};

//Update Book by Id
const updateBookThumbnailUrl = async function (req, res) {
  try {
    var thumbnailUrl = req.body.thumbnailUrl;
    res.setHeader("Content-Type", "application/json");

    var bookid = Number(req.params.bookid);

    db.query(
      `UPDATE books 
              SET thumbnailUrl='${thumbnailUrl}'
              WHERE bookid=?`,
      bookid,
      function (error, results, fields) {
        if (error) throw error;
        return res.status(200).send({
          error: false,
          message: "Update thumbnailURL for book id =" + bookid.toString(),
          data: results,
        });
      }
    );
  } catch {
    return res.status(401).send();
  }
};

module.exports = {
  getBooks,
  getBookById,
  updateBookById,
  addBook,
  deleteBookById,
  getBookCover,
  uploadBookCover,
  updateBookThumbnailUrl,
};
