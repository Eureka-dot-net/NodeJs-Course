const Cart = require('./cart')
const db = require('./../util/database')

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    return db.execute('Insert into products (title, price, imageUrl, description) values (?, ?, ?, ?)',
      [this.title, this.price, this.imageUrl, this.description]
    );
  }

  static deleteProduct(id) {

  }

  static fetchAll() {
    return db.execute('Select * from products')
  }

  static findById(id, cb) {
    return db.execute('Select * from products where id = ?',
      [id]
    )
  }
};
