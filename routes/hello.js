const express = require("express");
const router = express.Router();

const sqlite3 = require("sqlite3"); // 追加

//appjsで呼び出すのではなく各ルーティングファイルに必要に応じて呼び出す
const { check, validationResult } = require("express-validator");

// データベースオブジェクトの取得
const db = new sqlite3.Database("mydb.sqlite3");
console.log(db);

// GETアクセスの処理
router.get("/", (req, res, next) => {
  // データベースのシリアライズ
  db.serialize(() => {
    //レコードをすべて取り出す
    db.all("select * from mydata", (err, rows) => {
      // データベースアクセス完了時の処理
      if (!err) {
        var data = {
          title: "Hello!",
          content: rows, // 取得したレコードデータ
        };
        res.render("hello/index", data);
      }
    });
  });
});

router.get("/add", (req, res, next) => {
  var data = {
    title: "Hello/Add",
    content: "新しいレコードを入力：",
    form: { name: "", mail: "", age: 0 },
  };
  res.render("hello/add", data);
});

router.post(
  "/add",
  [
    check("name", "NAME は必ず入力して下さい。").notEmpty(),
    check("mail", "MAIL はメールアドレスを記入して下さい。").isEmail(),
    check("age", "AGE は年齢（整数）を入力下さい。").isInt(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      var result = '<ul class="text-danger">';
      var result_arr = errors.array();
      for (var n in result_arr) {
        result += "<li>" + result_arr[n].msg + "</li>";
      }
      result += "</ul>";
      var data = {
        title: "Hello/Add",
        content: result,
        form: req.body,
      };
      res.render("hello/add", data);
    } else {
      var nm = req.body.name;
      var ml = req.body.mail;
      var ag = req.body.age;
      db.serialize(() => {
        db.run(
          "insert into mydata (name, mail, age) values (?, ?, ?)",
          nm,
          ml,
          ag
        );
      });
      res.redirect("/hello");
    }
  }
);

module.exports = router;
