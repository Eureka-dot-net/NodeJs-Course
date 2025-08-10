const { getDb } = require('../util/mongodb');
const { ObjectId } = require('mongodb');

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    if (id) {
      this._id = typeof id === 'string' ? ObjectId.createFromHexString(id) : id;
    }
    this.userId = userId; // Assuming you want to store the userId as well
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db.collection('products')
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection('products')
        .insertOne(this);
    }
    return dbOp
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products')
      .find()
      .toArray()
      .then(products => {
        console.log(products);
        return products;
      })
      .catch(err => {
        console.log(err);
      });
  }

  static findById(id) {
    const db = getDb();
    console.log('Finding product with id:', id);
    return db.collection('products')

      .find({ _id: ObjectId.createFromHexString(id) })
      .next()
      .then(product => {
        return product;
      })
      .catch(err => {
        console.log(err);
      });
  }

  static deleteById(id) {
    const db = getDb();
    return db.collection('products')
      .deleteOne({ _id: ObjectId.createFromHexString(id) })
      .then(result => {
        console.log('Deleted product with id:', id);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = Product;
