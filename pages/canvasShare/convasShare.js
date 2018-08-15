// pages/canvasShare/convasShare.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canvasHeight: 600
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.showLoading({
      title: '加载中',
    });
    // this.setData({
    //   codeimg: app.globalData.codeimg
    // });
    this.testCanvas();
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
    // this.testCanvas();
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
  onShareAppMessage: function (msg) {
    console.log("onShareAppMessage");
    return {
      title: " ",
      success: function (res) {
        console.log("转发成功", res);
      }
    }
  },
  testCanvas() {
    const _this = this;
    console.log("1231");
    var res = wx.getSystemInfoSync();
    //先创建一个画布
    const ctx = wx.createCanvasContext("test")
    wx.setStorageSync("canvasInfo", {})
    this.ctxFontTitle(ctx, app.globalData.title);
    this.ctxFontContent(ctx, app.globalData.summary);
    console.log(wx.getStorageSync("canvasInfo") || {})
    //填充背景色
    let canvasInfo = wx.getStorageSync("canvasInfo") || {}
    ctx.fillStyle = '#fff';
    let tCanvasHeight = canvasInfo.baseHeight + canvasInfo.lineCount * 25 + 145 + 40;
    // if (tCanvasHeight < res.screenHeight) tCanvasHeight = res.screenHeight;
    this.setData({
      canvasHeight: tCanvasHeight
    });
    ctx.fillRect(0, 0, res.screenWidth, tCanvasHeight);
    wx.setStorageSync("canvasInfo", {})
    this.ctxFontTitle(ctx, app.globalData.title);
    this.ctxFontContent(ctx, app.globalData.summary);
    console.log(app.globalData.codeimg);
    wx.getImageInfo({
      src: app.globalData.codeimg,
      success: function(resPath) {
        console.log((res.screenWidth - 145) / 2);
        ctx.drawImage(resPath.path, (res.screenWidth - 145) / 2, canvasInfo.baseHeight + canvasInfo.lineCount * 25, 145, 145);
        //成功执行，draw方法中进行回调
        ctx.draw(true, function() {
          console.log("draw callback success")
          //保存临时图片
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: res.screenWidth,
            height: tCanvasHeight,
            destWidth: res.screenWidth * 3,
            destHeight: tCanvasHeight * 3,
            canvasId: 'test',
            success: function(res) {
              console.log("get tempfilepath(success) is:", res.tempFilePath)
              _this.setData({
                tempFilePath: res.tempFilePath
              });
              wx.hideLoading();
            },
            fail: function() {
              console.log('get tempfilepath is fail')
              wx.hideLoading();
            }
          })
        })
      },
      fail: function(msg) {
        wx.showToast({
          title: msg,
        });
      }
    });

  },
  promisify: function(fn, reverse) {
    if ({}.toString.call(fn) !== '[object Function]') throw new TypeError('Only normal function can be promisified');
    return function(...args) {
      return new Promise((resolve, reject) => {
        const callback = function(...args) {
          if ({}.toString.call(args[0]) === '[object Error]') return reject(args[0]);
          resolve(args);
        };
        try {
          if (reverse === true) fn.apply(null, [callback, ...args]);
          else fn.apply(null, [...args, callback]);
        } catch (err) {
          reject(err);
        }
      });
    }
  },
  ctxFontMeasur: function(context, text, baseHeight, lineCount, blod, isTitle) {
    console.log("baseHeight" + baseHeight);
    console.log("lineCount" + lineCount);
    var res = wx.getSystemInfoSync();
    var chr = text.split(""); //这个方法是将一个字符串分割成字符串数组
    var temp = "";
    var row = [];
    for (var a = 0; a < chr.length; a++) {
      if (context.measureText(temp).width < (res.screenWidth - 20 - 30)) {
        temp += chr[a];
      } else {
        a--; //这里添加了a-- 是为了防止字符丢失，效果图中有对比
        row.push(temp);
        temp = "";
      }
    }
    row.push(temp);

    //如果数组长度大于2 则截取前两个
    if (row.length > 2 && isTitle === 1) {
      var rowCut = row.slice(0, 2);
      var rowPart = rowCut[1];
      var test = "";
      var empty = [];
      for (var a = 0; a < rowPart.length; a++) {
        if (context.measureText(test).width < 220) {
          test += rowPart[a];
        } else {
          break;
        }
      }
      empty.push(test);
      var group = empty[0] + "..." //这里只显示两行，超出的用...表示
      rowCut.splice(1, 1, group);
      row = rowCut;
    }

    for (var b = 0; b < row.length; b++) {
      if (blod === 'blod') {
        context.fillText(row[b], 20 - 0.5, baseHeight + b * 25 + lineCount * 25, res.screenWidth);
        context.fillText(row[b], 20, (baseHeight + b * 25 + lineCount * 25) - 0.5, res.screenWidth);
      } else {
        context.fillText(row[b], 20, (baseHeight + b * 25 + lineCount * 25), res.screenWidth);
      }
    }
    return b;
  },
  ctxFontTitle: function(context, text) {
    var res = wx.getSystemInfoSync();
    context.setFontSize(16)
    context.setFillStyle("#295B8F")
    let lineCount = this.ctxFontMeasur(context, text, 30, 0, "blod", 1);
    console.log(lineCount);
    context.setStrokeStyle("#295B8F")
    context.moveTo(20, (30 + lineCount * 25))
    context.lineTo(res.screenWidth - 20, (30 + lineCount * 25))
    context.stroke()

    context.moveTo(20, (30 + 5 + lineCount * 25))
    context.lineTo(res.screenWidth - 20, (30 + 5 + lineCount * 25))
    context.stroke()
    let canvasInfo = wx.getStorageSync("canvasInfo") || {};
    wx.setStorageSync("canvasInfo", {
      baseHeight: (canvasInfo.baseHeight || 0) + 30 + 5,
      lineCount: (canvasInfo.lineCount || 0) + lineCount + 1
    })
  },
  ctxFontContent: function(context, text) {
    let canvasInfo = wx.getStorageSync("canvasInfo") || {};
    console.log(canvasInfo)
    var res = wx.getSystemInfoSync();
    context.setFontSize(14)
    context.setFillStyle("#000")
    let lineCount = this.ctxFontMeasur(context, text, (canvasInfo.baseHeight || 0), canvasInfo.lineCount || 0, "", 0);
    wx.setStorageSync("canvasInfo", {
      baseHeight: (canvasInfo.baseHeight || 0) + 30,
      lineCount: (canvasInfo.lineCount || 0) + lineCount
    })
  },
  getMiniCode(obj) {
    wx.request({
      url: 'https://www.baijiashiping.com/index.php/Wechat/articles',
      data: obj.param,
      success: function(msg) {
        obj.success();
      },
      fail: function(msg) {
        obj.success();
      }
    })
  },
  saveImage() {
    //将图片保存在系统相册中(应先获取权限，)
    wx.saveImageToPhotosAlbum({
      filePath: this.data.tempFilePath,
      success(res) {
        wx.showToast({
          title: "保存卡片成功！",
        });
        console.log("save photo is success")
      },
      fail: function() {
        wx.showToast({
          title: "保存卡片失败！",
          icon: 'none',
        });
        console.log("save photo is fail")
      }
    })
  }
})