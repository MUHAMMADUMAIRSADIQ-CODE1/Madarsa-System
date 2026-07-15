class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static success(message = 'Success', data = null) {
    return new ApiResponse(200, message, data);
  }

  static created(message = 'Resource created successfully', data = null) {
    return new ApiResponse(201, message, data);
  }

  static accepted(message = 'Request accepted', data = null) {
    return new ApiResponse(202, message, data);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, message, null);
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
    };
  }
}

module.exports = ApiResponse;
