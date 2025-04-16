// controllers/BaseController.js

class BaseController {
  create(item) {
    throw new Error("Method 'create()' must be implemented.");
  }

  findAll() {
    throw new Error("Method 'findAll()' must be implemented.");
  }

  findOne(id) {
    throw new Error("Method 'findOne()' must be implemented.");
  }

  update(id, item) {
    throw new Error("Method 'update()' must be implemented.");
  }

  delete(id) {
    throw new Error("Method 'delete()' must be implemented.");
  }
}

module.exports = BaseController;
