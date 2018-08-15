function wxrequest(obj) {
  const _this = this;
  wx.request({
    url: obj.url,
    data: obj.param,
    header: obj.header||{},
    method: obj.method,
    dataType: obj.dataType||"",
    success: function (msg) {
      console.log(msg);
      if (msg.statusCode === 200) {
        if (msg.data.status === 1) {
          obj.success(msg.data.data);
        } else {
          obj.error(msg.data.msg);
        }
      } else {
        obj.error(msg.errMsg);
      }
    },
    fail: function (msg) {
      obj.error(msg);
    }
  });
}
module.exports = {
  wxrequest: wxrequest
}