const fs = require('fs').promises;
const path = require('path');
const dirname = require('../util/path');

const p = path.join(dirname, 'data', 'products.json');

module.exports = class Product {
    constructor(title) {
        this.title = title;
    }

    async save() {
        try {
            const products = await Product._readProducts();
            products.push(this);
            await fs.writeFile(p, JSON.stringify(products, null, 2), 'utf-8');
        } catch (err) {
            console.error('Failed to save product:', err);
        }
    }

    static async fetchAll() {
        return await Product._readProducts();
    }

    // 🔁 Shared private method
    static async _readProducts() {
        try {
            const data = await fs.readFile(p, 'utf-8');
            return JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return []; // File not found — return empty array
            }
            throw err; // Other errors should be handled upstream
        }
    }
};
