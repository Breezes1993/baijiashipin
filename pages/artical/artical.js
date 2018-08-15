// pages/article/article.js
import "../common/request.js"
const app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
var wxrequest = require('../common/request.js');
var base64Util = require('../../utils/base64.js');
var utils = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: app.globalData.title,
    content: "",
    contents: [],
    article: app.globalData.article,
    num: app.globalData.num,
    reate_time: "",
    thumbs: "", //点赞数量
    isThumb: "0", //1已经点赞
    summary: "", //文章摘要
    codeimg: "",
    item: {},
    ActionSheet: {
      show: false,
      actionSheetStyle: "",
      items: [{
        openType: "share",
        label: "分享给朋友",
        optType: "01"
      }, {
        openType: "share",
        label: "生成卡片 保存分享",
        optType: "02"
      }, {
        openType: "share",
        label: "收藏",
        label2: "取消收藏",
        optType: "03"
      }]
    },
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var scene = decodeURIComponent(options.scene);
    if (scene && scene != "undefined") {
      app.globalData.article = scene;
      this.setData({
        article: scene
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    const _this = this;
    this.setData({
      article: app.globalData.article
    })
    this.setData({
      item: wx.getStorageSync("item")
    });
    console.log(app.globalData)
    wx.showLoading({
      title: '加载中',
    });
    this.doGetDetail();
  },
  doGetDetail() {
    const _this = this;
    this.getDetail({
      param: {
        article: _this.data.article,
        id: app.globalData.vipInfo !== undefined ? app.globalData.vipInfo.id : "0",
        page: "pages/articalList/articalList",
        width: 1,
        line_color: {
          "r": "0",
          "g": "0",
          "b": "0"
        }
      },
      success: function(msg) {
        console.log("文章明细");
        console.log(msg);
        let isThumb = 0;
        let mThumbs = wx.getStorageSync("mThumbs") || {};
        let thumbInfo = mThumbs[_this.data.article] || {};
        thumbInfo.isThumb === 1 ? isThumb = 1 : isThumb = 0;
        console.log("12421")
        if (isThumb === 1) {
          let myDate = new Date();
          let year = myDate.getYear(); //获取当前年份(2位)
          let month = myDate.getMonth(); //获取当前月份(0-11,0代表1月)
          let date = myDate.getDate(); //获取当前日(1-31)
          if (date > thumbInfo.date && (month >= thumbInfo.month && year >= thumbInfo.year)) {
            isThumb = 0;
          }
        }
        _this.setData({
          title: msg.title,
          create_time: msg.create_time,
          num: msg.num,
          type: msg.type,
          thumbs: msg.thumbs,
          summary: msg.summary,
          codeimg: msg.codeimg,
          isThumb: isThumb, //0未赞 1赞
          collection: msg.collection, //（1已收藏 2未收藏）
        });
        app.globalData.summary = msg.summary;
        app.globalData.codeimg = msg.codeimg;
        app.globalData.title = msg.title;
        let contents = _this.spliceStr(msg.content);
        _this.setData({
          contents: contents
        });
        contents.forEach((element, index) => {
          WxParse.wxParse('contents[' + index + ']', 'html', element, _this, 5);
          if (index === 0) {
            wx.hideLoading();
          }
        });
        wx.hideLoading();

        return;
      },
      error: function(msg) {
        console.log(msg);
        wx.hideLoading();
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(msg) {
    console.log("onShareAppMessage");
    console.log("s", msg);
    this.setData({
      "ActionSheet.show": false
    })

    return {
      // title: '我的分享',
      title:" ",
      path: 'pages/articalList/articalList?article=' + app.globalData.article, //这里拼接需要携带的参数
      success: function (res) {
        console.log("转发成功", res);
      }
    }
  },
  share: function() {
    if (this.compareVersion(wx.getSystemInfoSync().SDKVersion, "1.2.0") === -1) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      });

    } else {
      console.log("12313");
      this.setData({
        "ActionSheet.show": true,
        "ActionSheet.corver":true
      })
      wx.showShareMenu({
        withShareTicket: true,
        function(msg) {
          console.log(msg)
        },
        function(msg) {
          console.log(msg)
        },
        function(msg) {
          console.log(msg)
        }
      });
    }
  },
  toCanvasShare() {
    wx.navigateTo({
      url: '/pages/canvasShare/convasShare',
      function(msg) {
        console.log(msg)
      },
      function(msg) {
        console.log(msg)
      }
    })
  },
  enshrine() {
    const _this = this;
    if (_this.data.collection === 1) {
      console.log("取消收藏");
      //1已收藏
      wxrequest.wxrequest({
        url: "https://www.baijiashiping.com/index.php/Wechat/del_article",
        method: "POST",
        param: {
          article: app.globalData.article,
          id: app.globalData.vipInfo !== undefined ? app.globalData.vipInfo.id : "0"
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(msg) {
          _this.setData({
            collection: 2
          });
          wx.showToast({
            title: '取消成功',
            icon: 'success',
            duration: 2000
          });
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
      //2未收藏
      console.log("收藏");
      wxrequest.wxrequest({
        url: "https://www.baijiashiping.com/index.php/Wechat/enshrine",
        method: "POST",
        param: {
          article: app.globalData.article,
          id: app.globalData.vipInfo !== undefined ? app.globalData.vipInfo.id : "0"
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(msg) {
          _this.setData({
            collection: 1
          });
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            duration: 2000
          });
        },
        error: function(msg) {
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          });
        }
      });
    }

  },
  chooseItem: function(param) {
    if (param.currentTarget.dataset.optType === "03") {

    }
  },
  actionsheetHide: function() {
    this.setData({
      "ActionSheet.show": false
    })
  },
  compareVersion: function(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    var len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }

    for (var i = 0; i < len; i++) {
      var num1 = parseInt(v1[i])
      var num2 = parseInt(v2[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }

    return 0
  },
  getDetail(obj) {
    console.log(obj.param)
    const _this = this;
    wx.request({
      url: "https://www.baijiashiping.com/index.php/Wechat/article",
      data: obj.param,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(msg) {
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
      fail: function(msg) {
        console.log(msg)
        obj.error(msg);
      }
    });
  },
  spliceStr: function(a) {
    var contents = []
    var count = 0;
    var brLast = "<br" + a.split("<br")[a.split("<br").length - 1];
    while (a.indexOf("<br") !== -1 && count <= 10) {
      // console.log(a.indexOf("<br"))
      var tmpContent = a.slice(0, a.indexOf("<br"));
      a = String(a.slice(a.indexOf("<br")));
      // console.log(a);
      count++;
      // console.log(a.indexOf("<br"));
      var tmpBr = "";
      tmpBr = a.slice(0, a.indexOf(">") + 1);
      a = a.slice(a.indexOf(">") + 1);
      contents.push(tmpContent + tmpBr);
    }
    contents.push(a);
    return contents;
  },
  doThumb() {
    if (this.data.isThumb === 1) {
      wx.showToast({
        title: "每天同一篇文章只能点赞一次！",
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const _this = this;
    console.log("doThumb");
    wx.showLoading({
      title: '加载中',
    });
    wxrequest.wxrequest({
      url: "https://www.baijiashiping.com/index.php/Wechat/thumbs",
      method: "POST",
      param: {
        article: app.globalData.article,
        id: app.globalData.vipInfo !== undefined ? app.globalData.vipInfo.id : "0"
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(msg) {
        let mThumbs = wx.getStorageSync("mThumbs") || {};
        console.log(JSON.stringify(mThumbs));
        if (!mThumbs[_this.data.article]) {
          mThumbs[_this.data.article] = {};
        }
        let thumbInfo = mThumbs[_this.data.article];
        console.log(JSON.stringify(thumbInfo));
        thumbInfo.isThumb = 1;
        var myDate = new Date();
        thumbInfo.year = myDate.getYear(); //获取当前年份(2位)
        thumbInfo.month = myDate.getMonth(); //获取当前月份(0-11,0代表1月)
        thumbInfo.date = myDate.getDate(); //获取当前日(1-31)
        console.log(JSON.stringify(mThumbs));
        wx.setStorageSync("mThumbs", mThumbs);
        _this.setData({
          isThumb: 1,
          thumbs: Number(_this.data.thumbs) + 1
        });
        wx.hideLoading();
        wx.showToast({
          title: '点赞成功',
          icon: 'success',
          duration: 2000
        });
      },
      error: function(msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  pay() {
    const _this = this;
    //多余的代码不用了，只用到util的pay方法
    utils.pay(app, function() {
      app.globalData.hasVip = true;
      _this.doGetDetail();
    });
  },
  getUserInfo(e) {
    const _this = this;
    if(app.globalData.hasUserInfo){
      _this.pay();
    }else{
      utils.getUserInfo(e, _this, app, function (msg) {
        if (msg.vip === 2) {
          _this.pay()
        } else {
          _this.doGetDetail();
        }
      });
    }
  },
})