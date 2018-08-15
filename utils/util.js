var wxrequest = require('../pages/common/request.js');
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


//支付相关util
function pay(app, successCall,errorCall) {
  const _this = this;
  let vipInfo = app.globalData.vipInfo;
  console.log(vipInfo);
  wx.showModal({
    title: '温馨提示',
    content: 'VIP 用户可阅读所有文章，年费为 ' + vipInfo.vipmoney + ' 元',
    success: function(res) {
      if (res.confirm) {
        if (vipInfo.vip === 2) {
          let vipmoney = app.globalData.vipInfo.vipmoney;
          wxrequest.wxrequest({
            url: "https://www.baijiashiping.com/index.php/Wechat/vip",
            method: "POST",
            param: {
              openid: vipInfo.openid,
              id: vipInfo.id
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function(msg) {
              console.log('成功', msg);
              // wx.showToast({
              //   title: '成功',
              //   icon: 'success',
              //   duration: 2000
              // });
              wx.requestPayment({
                'timeStamp': msg.timeStamp,
                'nonceStr': msg.nonceStr,
                'package': msg.package,
                'signType': msg.signType,
                'paySign': msg.paySign,
                'success': function(res) {
                  console.log("微信成功", res);
                  payCallback(res, msg.ordernum, 1, app, successCall, errorCall);
                },
                'fail': function(res) {
                  console.log("微信失败", res);
                  payCallback(res, msg.ordernum, 2, app, successCall, errorCall);
                }
              })
            },
            error: function(msg) {
              wx.showToast({
                title: msg,
                icon: 'none',
                duration: 2000
              });
            }
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '您已经是会员，无须重复支付！',
            showCancel: false
          });
        }
      } else if (res.cancel) {

      }
    },
    fail: function() {

    }
  })
}

function payCallback(res, ordernum, state, app, successCall, errorCall) {
  const _this = this;
  console.log("res", res);
  let vipInfo = app.globalData.vipInfo;
  let param = {
    id: vipInfo.id,
    openid: vipInfo.openid,
    state: state,
    order: ordernum
  };
  console.log("支付回调", param);
  wxrequest.wxrequest({
    url: "https://www.baijiashiping.com/index.php/Wechat/wechatpay",
    method: "POST",
    param: param,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function(msg) {
      if (state === 1) {
        wx.showToast({
          title: "支付成功,您的免费阅读时间还有" + msg + "天！",
          icon: "none",
          duration: 3000
        });
        app.globalData.vipInfo.vip = 1;
        app.globalData.vipInfo.viptime = msg;
        successCall(msg);
      } else {
        wx.showToast({
          title: "您已取消支付！",
          icon: "none",
          duration: 2000
        });
      }

    },
    error: function(msg) {
      console.log("支付回调失败", msg);
      wx.showToast({
        title: "支付失败！",
        icon: "none",
        duration: 2000
      });
    }
  });
}


//获取用户信息util
function getUserInfo(e, _this, app, successCall) {
  app.globalData.userInfo = e.detail.userInfo;
  _this.setData({
    hasUserInfo: true
  });
  getLogin(app, function() {
    doGetUser(_this, app, app.globalData.code, app.globalData.userInfo.nickName, app.globalData.userInfo.avatarUrl, successCall);
  });
}

function getLogin(app, callback) {
  wx.login({
    success: function(res) {
      console.log(res);
      app.globalData.code = res.code;
      callback();
    }
  });
}

function doGetUser(_this, app, code, name, img, successCall) {
  _this.data.hasUserInfo && getUser({
    param: {
      code: code,
      name: name,
      img: img
    },
    success: function(msg) {
      console.log("用户信息", msg);
      app.globalData.vipInfo = msg;
      app.globalData.hasUserInfo = true;
      successCall(msg);
    },
    error: function(msg) {
      console.log(msg);
      wx.showModal({
        showCancel: false,
        title: "提示",
        content: "" + msg
      })
    }
  });
}

function getUser(obj) {

  let data = {
    code: obj.param.code,
    name: obj.param.name,
    img: obj.param.img
  };
  console.log(data)
  wxrequest.wxrequest({
    url: "https://www.baijiashiping.com/index.php/Wechat/user",
    method: "POST",
    param: data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function(msg) {
      console.log('成功', msg);
      obj.success(msg)
    },
    error: function(msg) {
      obj.error(msg);
    }
  });
}

module.exports = {
  formatTime: formatTime,
  pay: pay,
  getUserInfo: getUserInfo
}