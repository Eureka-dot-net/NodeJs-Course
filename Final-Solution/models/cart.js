const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err && fileContent.length > 0) {
        cart = JSON.parse(fileContent);
      }

      const existingProduct = cart.products.find(prod => prod.id === id);

      if (existingProduct) {
        existingProduct.qty += 1;
      } else {
        cart.products.push({ id: id, qty: 1 });
      }

      cart.totalPrice = Number(cart.totalPrice) + Number(productPrice);

      fs.writeFile(p, JSON.stringify(cart), err => {
        if (err) console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return;
      }
      const updatedCart = { ...JSON.parse(fileContent) };
      const product = updatedCart.products.find(prod => prod.id === id)
      if (!product) {
        return;
      }
      const productQty = product.qty;
      updatedCart.products = updatedCart.products.filter(p => p.id !== id)
      updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;
      fs.writeFile(p, JSON.stringify(updatedCart), err => {
        console.log(err);
      })
    })
  }

  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }
};
