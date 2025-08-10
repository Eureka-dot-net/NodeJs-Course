const { getDb } = require('../util/mongodb');
const { ObjectId } = require('mongodb');

class User {
  constructor(name, email, options = {}) {
    this.name = name;
    this.email = email;

    // Destructure with defaults
    const {
      cart = { items: [] },
      id = null,
    } = options;

    this.cart = cart;

    if (id) {
      this._id = typeof id === 'string'
        ? ObjectId.createFromHexString(id)
        : id;
    }
  }

  getCart() {
    const db = getDb();
    return db.collection('products')
      .find({ _id: { $in: this.cart.items.map(item => item.productId) } })
      .toArray()
      .then(products => {
        return products.map(product => {
          return {
            ...product,
            quantity: this.cart.items.find(item => item.productId.toString() === product._id.toString()).quantity
          };
        });
      });
  }

  deleteItemFromCart(productId) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });

    return db.collection('users') // <-- Add `return` here
      .updateOne(
        { _id: this._id },
        { $set: { cart: { items: updatedCartItems } } }
      )
      .then(result => {
        this.cart.items = updatedCartItems;
      })
      .catch(err => {
        console.error('Update error:', err);
      });
  }

  addToCart(product) {
    const cartProduct = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });

    if (cartProduct >= 0) {
      let newQuantity = this.cart.items[cartProduct].quantity + 1;
      this.cart.items[cartProduct].quantity = newQuantity;
    } else {
      this.cart.items.push({ productId: product._id, price: product.price, quantity: 1 });
    }

    const db = getDb();
    return db.collection('users')
      .updateOne(
        { _id: this._id },
        { $set: { cart: this.cart } }
      )
      .then(result => {
        console.log('Cart updated:', result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  getOrders() {
    const db = getDb();
    return db.collection('orders')
      .find({ 'user._id': this._id })
      .toArray()
      .catch(err => {
        console.log(err);
      });
  }

  addOrder() {
    return this.getCart()
      .then(products => {
        const db = getDb();
        return db.collection('orders')
          .insertOne({
            products: products,
            user: {
              _id: this._id,
              name: this.name
            }
          })
      })
      .then(result => {
        console.log('Order added:', result);
        this.cart = { items: [] }; // Clear cart after order
        return db.collection('users')
          .updateOne(
            { _id: this._id },
            { $set: { cart: this.cart } }
          );
      })
      .catch(err => {
        console.log(err);
      });
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db.collection('users')
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection('users')
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

  static findByEmail(email) {
    const db = getDb();
    return db.collection('users')
      .findOne({ email: email })
      .then(user => {
        return User.fromDb(user);
      })
      .catch(err => {
        console.log(err);
      });
  }

  static fromDb(userObj) {
    if (!userObj) return null;
    return new User(
      userObj.name,
      userObj.email,
      { cart: userObj.cart, id: userObj._id }
    );
  }

  static findById(id) {
    const db = getDb();
    return db.collection('users')
      .findOne({ _id: ObjectId.createFromHexString(id) })
      .then(user => {
        return User.fromDb(user);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = User;
