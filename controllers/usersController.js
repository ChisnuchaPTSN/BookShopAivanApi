const db = require("../config/db");
const bcrypt = require("bcryptjs");
const sign  = require('../middleware/jwtMiddleware').sign;


//User Sign In and get Token
const signin = async function (req, res) {
  const secretkey=process.env.SECRET
  db.query(
    "SELECT * FROM users where username=?",
    req.body.username,
    function (error, results, fields) {
      try {
        if (error) {
          throw error;
        } else {
          let hashedPassword = results[0].password;
          let userId = results[0].userId;
          const correct = bcrypt.compareSync(req.body.password, hashedPassword);
          if (correct) {
            let user = {
              username: req.body.username,
              role: results.role,
              password: hashedPassword,
            };

            // create a token
            let token = sign(user, secretkey);
            res.setHeader("Content-Type", "application/json");

            return res
              .status(201)
              .send({
                error: false,
                message: "user sigin",
                userId: userId,
                accessToken: token,
              });
          } else {
            return res.status(401).send("login fail");
          }
        }
      } catch (e) {
        return res.status(401).send("login fail");
      }
    }
  );
};

module.exports = {
  signin
};
