//index.js
//获取应用实例
const app = getApp();
var wxrequest = require('../common/request.js');
var utils = require('../../utils/util.js');
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    hasVip: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    vipTip1: "立即加入VIP用户",
    vipTip2: "您的免费阅读时间还有",
    viptime: "",
    articalList: [],
    page: "1",
    pagenum: 10,
    hiddenloading: true,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    const _this = this;
    this.setData({
      pagenum: 10,
      count: -1,
      page: "1",
      articalList: [],
      hasmoreData: true,
      hiddenloading: true
    })
    this.getList({
      param: {
        page: 1,
        id: app.globalData.vipInfo !== undefined ? app.globalData.vipInfo.id : "0"
      },
      success: function(msg) {
        console.log(msg)
        _this.setData({
          "articalList": msg.data,
          "hiddenLoading": true
        })
      },
      error: function(msg) {
        console.log(msg);
        _this.setData({
          "hiddenLoading": true
        });
      }
    });
    console.log('刷新数据')
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const _this = this;
    console.log('加载更多');
    console.log(_this);
    this.setData({
      hiddenloading: false
    })
    this.getList({
      param: {
        page: Number(_this.data.page) + 1,
        id: app.globalData.vipInfo !== undefined ? app.globalData.vipInfo.id : "0"
      },
      success: function(msg) {
        console.log(msg)
        msg.data.forEach(function(element) {
          _this.data.articalList.push(element);
        });
        setTimeout(function() {
          _this.setData({
            page: Number(_this.data.page) + 1,
            hiddenloading: true,
            "articalList": _this.data.articalList
          })
        }, 300)
      },
      error: function(msg) {
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        });
        _this.setData({
          hiddenloading: true
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log("onshow");
    this.setData({
      hasUserInfo: app.globalData.hasUserInfo || false,
      avatarUrl: (app.globalData.userInfo || {}).avatarUrl || "",
      hasVip: app.globalData.hasVip || false,
      viptime: (app.globalData.vipInfo||{}).viptime||""
    });
  },
  onLoad: function() {
    const _this = this;
    //这里需要判断是否有VIP hasVip
    console.log(app.globalData.vipInfo);
    if (app.globalData.vipInfo.vip === 1) {
      this.setData({
        hasVip: true,
        viptime: app.globalData.vipInfo.viptime
      });
    } else if (app.globalData.vipInfo.vip === 2) {
      this.setData({
        hasVip: false
      });
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      console.log(2)
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    };
    _this.getList({
      param: {
        page: 1,
        id: app.globalData.vipInfo !== undefined ? app.globalData.vipInfo.id : "0"
      },
      success: function(msg) {
        _this.setData({
          "articalList": msg.data,
          "hiddenLoading": true
        })
      },
      error: function(msg) {
        console.log("msg" + msg);
        _this.setData({
          "hiddenLoading": true
        });
      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(msg) {
    console.log("onShareAppMessage");
    return {
      title: " ",
      success: function(res) {
        console.log("转发成功", res);
      }
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getList(obj) {
    const _this = this;
    wx.request({
      url: "https://www.baijiashiping.com/index.php/Wechat/my_article",
      data: obj.param,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(msg) {
        console.log("收藏列表", msg)
        if (msg.statusCode === 200) {
          if (msg.data.status === 1) {
            obj.success(msg.data.data);
          } else {
            console.log("msg.data.msg" + msg.data.msg)
            obj.error(msg.data.msg);
          }
        } else {
          obj.error(msg.errMsg);
        }
      },
      fail: function(msg) {
        console.log(msg)
        obj.error(msg.errMsg);
      }
    });
  },
  goto: function(event) {

    if (!this.data.hasUserInfo) {
      this.util("open");
      return;
    }
    console.log(event.currentTarget.dataset.article)
    wx.setStorageSync("item", event.currentTarget.dataset.item);
    app.globalData.article = event.currentTarget.dataset.article;
    app.globalData.title = event.currentTarget.dataset.title;
    app.globalData.num = event.currentTarget.dataset.num;
    wx.navigateTo({
      url: '/pages/artical/artical?id=' + event.currentTarget.dataset.article,
      function(msg) {
        console.log(msg);
      },
      function(msg) {
        console.log(msg);
      }
    })
  },
  pay() {
    const _this = this;
    utils.pay(app, function(msg) {
      console.log("成功回调");
      _this.setData({
        hasVip: true,
        viptime: msg,
      });
      app.globalData.hasVip = true;
    });
    return;
  }
})