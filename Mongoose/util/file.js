const fs = require('fs').promises

const deleteFile = (filePath) => {
    fs.unlink(filePath)
        .catch(err => {
            console.error(`Failed to delete file: ${filePath}`, err);
        });
}

exports.deleteFile = deleteFile;