// pages/articalList/articalList.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    articalList: [],
    page: "1",
    pagenum: 10,
    hiddenLoading: true,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    ActionSheet: {
      show: false,
      actionSheetStyle: "",
      items: [{
        openType: "share",
        label: "分享给朋友",
        optType: "01"
      }],
    },
    showModalStatus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var scene = decodeURIComponent(options.scene);
    if (scene && scene != "undefined") {

    } else {
      scene = options.article || "";
    }
    this.setData({
      scene: scene
    });

    console.log("测试的");
    console.log(scene);
    const _this = this;
    console.log("onload")
    _this.getLogin(function() {
      if (app.globalData.userInfo) {
        console.log(1);
        console.log(app.globalData.userInfo)
        _this.setData({
          userInfo: app.globalData.userInfo,
          avatarUrl: app.globalData.userInfo.avatarUrl,
          hasUserInfo: true
        })
        app.globalData.hasUserInfo = true;
        _this.doGetUser(app.globalData.code, app.globalData.userInfo.nickName, app.globalData.userInfo.avatarUrl);
      } else if (_this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        console.log(2);
        console.log(app.userInfoReadyCallback);
        if (!app.userInfoReadyCallback) {
          app.userInfoReadyCallback = res => {
            console.log(res);
            _this.setData({
              userInfo: res.userInfo,
              avatarUrl: res.userInfo.avatarUrl,
              hasUserInfo: true
            });
            app.globalData.userInfo = res.userInfo;
            app.globalData.hasUserInfo = true;
            _this.doGetUser(app.globalData.code, res.userInfo.nickName, res.userInfo.avatarUrl);
          }
        } else {

        }
        if (_this.data.scene && _this.data.scene != "undefined") {
          console.log("scene:" + _this.data.scene);
          app.globalData.article = _this.data.scene;
          _this.navigateTo(_this.data.scene);
          _this.data.scene = "undefined";
        }
      } else {
        console.log(3);
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            console.log(res)
            app.globalData.userInfo = res.userInfo
            console.log(app.globalData.userInfo)
            _this.setData({
              userInfo: res.userInfo,
              avatarUrl: res.userInfo.avatarUrl,
              hasUserInfo: true
            })
            app.globalData.hasUserInfo = true;
            _this.doGetUser(app.globalData.code, res.userInfo.nickName, res.userInfo.avatarUrl);
          },
          fail: res => {
            console.log(res)
          }
        })
      };
    });

    _this.getList({
      param: {
        page: 1
      },
      success: function(msg) {
        _this.setData({
          "articalList": msg.data
        })
      },
      error: function(msg) {
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: '' + msg.errMsg
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    console.log(wx.getSystemInfoSync())
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log("onshow");
    this.setData({
      hasUserInfo: app.globalData.hasUserInfo || false,
      avatarUrl: (app.globalData.userInfo || {}).avatarUrl || "",
      hasVip: app.globalData.hasVip||false
    });
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
        page: 1
      },
      success: function(msg) {
        console.log(msg)
        _this.setData({
          "articalList": msg.data
        })
      },
      error: function(msg) {
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: '' + msg
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
        page: Number(_this.data.page) + 1
      },
      success: function(msg) {
        console.log(msg)
        // _this.setData({
        //   "articalList": msg.data
        // })
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
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: '' + msg
        });
        _this.setData({
          hiddenloading: true,
        });
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (msg) {
    console.log("onShareAppMessage");
    return {
      title: " ",
      success: function (res) {
        console.log("转发成功", res);
      }
    }
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
    // wx.navigateTo({
    //   url: '/pages/artical/artical?id=' + event.currentTarget.dataset.article,
    //   function(msg) {
    //     console.log(msg);
    //   },
    //   function(msg) {
    //     console.log(msg);
    //   }
    // })
    this.navigateTo(event.currentTarget.dataset.article);
  },
  navigateTo(article) {
    app.globalData.article = article;
    wx.navigateTo({
      url: '/pages/artical/artical?id=' + article,
      function(msg) {
        console.log(msg);
      },
      function(msg) {
        console.log(msg);
      }
    })
  },
  getList(obj) {
    const _this = this;
    wx.request({
      url: "https://www.baijiashiping.com/index.php/Wechat/articles",
      data: {
        page: obj.param.page
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(msg) {
        if (msg.statusCode === 200) {
          if (msg.data.status === 1) {
            console.log("获取列表", msg.data.data);
            obj.success(msg.data.data);
          } else {
            obj.error(msg.data.msg);
          }
        } else {
          obj.error(msg.errMsg);
        }
      },
      fail: function(msg) {
        obj.error(msg.errMsg);
      }
    });
  },
  getUser(obj) {

    let data = {
      code: obj.param.code,
      name: obj.param.name,
      img: obj.param.img
    };
    console.log(data)
    const _this = this;
    wx.request({
      url: "https://www.baijiashiping.com/index.php/Wechat/user",
      data: data,
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
        obj.error(msg.errMsg);
      }
    });
  },
  getUserInfo: function(e) {
    const _this = this;
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo;
    app.globalData.hasUserInfo = true;
    this.setData({
      userInfo: e.detail.userInfo,
      avatarUrl: e.detail.userInfo.avatarUrl,
      hasUserInfo: true
    });
    _this.getLogin(function() {
      _this.doGetUser(app.globalData.code, app.globalData.userInfo.nickName, app.globalData.userInfo.avatarUrl);
    });

  },
  doGetUser(code, name, img) {
    const _this = this;
    _this.data.hasUserInfo && _this.getUser({
      param: {
        code: code,
        name: name,
        img: img
      },
      success: function(msg) {
        console.log("用户信息", msg);
        console.log(JSON.stringify(msg))
        app.globalData.vipInfo = msg;
        app.globalData.hasVip = app.globalData.vipInfo.vip === 1 ? true : false;
        _this.setData({
          hasVip: true
        });
        if (_this.data.scene && _this.data.scene != "undefined") {
          console.log("scene:" + _this.data.scene);
          app.globalData.article = _this.data.scene;
          _this.navigateTo(_this.data.scene);
          _this.data.scene = "undefined";
        }
        console.log(msg);
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
  },
  getLogin(callback) {
    const _this = this;
    wx.login({
      success: function(res) {
        console.log(res);
        app.globalData.code = res.code;
        callback();
      }
    });
  },
  toUser() {
    wx.navigateTo({
      url: '/pages/index/index',
      function(msg) {
        console.log(msg);
      },
      function(msg) {
        console.log(msg);
      }
    })
  },
























  powerDrawer: function(e) {
    console.log("12312")
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function(currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长
      timingFunction: "linear", //线性
      delay: 0 //0则不延迟
    });

    // 第2步：这个动画实例赋给当前的动画实例
    this.animation = animation;

    // 第3步：执行第一组动画
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画
    setTimeout(function() {
      // 执行第二组动画
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
      this.setData({
        animationData: animation
      })

      //关闭
      if (currentStatu == "close") {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)

    // 显示
    if (currentStatu == "open") {
      this.setData({
        showModalStatus: true
      });
    }
  }

})