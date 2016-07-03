/**
 * Created by ericwang on 6/23/16.
 */

var RaceLayer = cc.Layer.extend({
    bgSprite: null,
    node_num: null,
    sp_num_vector: null,
    sp_horse_vector: null,
    cur_info: null,
    btn_start: null,
    target_arr: null, //最后的排序结果

    time_count_down : null,
    isConfigExist : null,
    label_tips : null,
    label_bg : null,
    Node_time : null,
    Label_next_stage : null,
    Label_next_time : null,
    Label_current_info : null,
    //json
    order: null,
    year: null,
    month: null,
    day: null,
    hour: null,
    minute: null,
    second: null,
    current_stage: null,
    _scrollview : null,
    _zhalan : null,
    _zhalan_front : null,
    ctor: function () {
        this._super();

        this.target_arr = [];
        this.order = [];
        //node_num_sp
        this.sp_num_vector = [];
        //sp_horse_vector
        this.sp_horse_vector = [];
        var size = cc.winSize;

        //读取json文件
        this.isConfigExist = this.jsonParse();

        var now = Date.parse(new Date());
        var time = Date.parse(this.createTime());

        this.time_count_down = parseInt((time - now) / 1000);

        this.label_bg = cc.Sprite.create(res.Time_BG_png);
        this.label_bg.setPosition(size.width/2, size.height/2);
        this.label_bg.setVisible(this.time_count_down > 0);
        this.addChild(this.label_bg, 10);
        this.label_tips = cc.LabelTTF.create("", "", 30);
        this.label_tips.setPosition(size.width/2, size.height/2);
        this.label_tips.setVisible(this.time_count_down > 0);

        //debug
        // this.time_count_down = 3;

        if (this.time_count_down > 0 && this.time_count_down < 100000)
        {
            this.label_tips.setString("本期游戏还有" + this.time_count_down + "s" + "开始");
        }
        else
        {
            this.label_bg.setVisible(true);
            this.label_tips.setVisible(true);
            this.label_tips.setString("本期尚未开始");
        }

        this.addChild(this.label_tips, 11);
        if (!this.isConfigExist)
        {
            this.label_bg.setVisible(false);
            this.label_tips.setVisible(false);
        }


        //bg
        this.bgSprite = cc.Sprite.create(res.Bg_png);
        this.bgSprite.attr({
            x: size.width/2,
            y: size.height/2,
        });
        this.addChild(this.bgSprite);

        this.createScrollView();

        //node_num
        this.node_num = [];
        for (var i = 0; i < 10; i++)
        {
            var node = new cc.Node();
            node.attr({
                x : 80 + i * 60,
                y : 590
            });
            this.node_num.push(node);
            this.addChild(node);
        }
        //添加所有数字
        this.addAllNum();

        this.initZhaLan();

        //时间控制
        if (this.time_count_down > 0 && this.time_count_down < 100000)
        {
            this.schedule(this.updateTime, 1);
        }

        if (!this.isConfigExist)
        {
            var label_bg = cc.Sprite.create(res.CountDown_png);
            label_bg.setPosition(size.width/2, size.height/2);
            this.addChild(label_bg);
            var label_tips = cc.LabelTTF.create("本期尚未开始", "", 40);
            label_tips.setPosition(size.width/2, size.height/2);
            this.addChild(label_tips);
        }

        //初始化显示信息
        this.Label_next_stage = cc.LabelTTF.create("1243", "", 24);
        this.Label_next_stage.setPosition(size.width - 130, size.height - 30);
        this.Label_next_stage.setAnchorPoint(0, 0.5);
        this.addChild(this.Label_next_stage);

        this.Label_next_time = cc.LabelTTF.create("1243", "", 24);
        this.Label_next_time.setPosition(size.width - 130, size.height - 68);
        this.Label_next_time.setAnchorPoint(0, 0.5);
        this.addChild(this.Label_next_time);

        this.Label_current_info = cc.LabelTTF.create("12323", "", 24);
        this.Label_current_info.setPosition(size.width/2, 33);
        this.addChild(this.Label_current_info);

        //刷新界面显示
        this.refreshInfo();
    },
    createScrollView: function () {
        var spX = 0;
        var spY = 0;
        var width = 0;


        var frame = cc.spriteFrameCache.getSpriteFrame("content_1.png");
        var sp1 = cc.Sprite.create(frame);
        spX = sp1.getContentSize().width;
        spY = sp1.getContentSize().height;

        var container = new cc.Layer();
        container.setContentSize(cc.size(spX*3, spY));

        //左边
        sp1.setPosition(spX/2.0, spY/2.0);
        container.addChild(sp1);
        width += spX;

        //中间
        for(var i = 0; i < 4; i++)
        {
            frame = cc.spriteFrameCache.getSpriteFrame("content_2.png");
            var sp2 = cc.Sprite.create(frame);
            sp2.setPosition(spX/2.0 + width, spY/2.0);
            container.addChild(sp2);
            width += spX;
        }


        //右边
        frame = cc.spriteFrameCache.getSpriteFrame("content_3.png");
        var sp3 = cc.Sprite.create(frame);
        sp3.setPosition(spX/2.0 + width, spY/2.0);
        width += spX;
        container.addChild(sp3);

        //栅栏
        // frame = cc.spriteFrameCache.getSpriteFrame("zha_00000.png");
        // this._zhalan = cc.Sprite.create(frame);
        // this._zhalan.setPosition(width - 215, spY/2.0-25);
        // container.addChild(this._zhalan);


        this._scrollview = new cc.ScrollView(container.getContentSize(), container);
        this._scrollview.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this._scrollview.setTouchEnabled(false);

        this._scrollview.setPosition(0, 20);
        this._scrollview.setContentOffset(cc.p(-5*spX,0), false);
        this.addChild(this._scrollview);
    },

    initZhaLan: function () {
        var size = cc.winSize;
        var frame =cc.spriteFrameCache.getSpriteFrame("zha_00000.png");
        this._zhalan = cc.Sprite.create(frame);
        this._zhalan.setPosition(size.width - 215, size.height/2.0-10);
        this.addChild(this._zhalan);

        this._zhalan_front = cc.Sprite.create(res.Zhalan_Front_png);
        this._zhalan_front.setPosition(size.width/2.0, size.height/2.0 + 20);
        this.addChild(this._zhalan_front);
    },

    createTime: function () {
        var date = new Date();
        date.setYear(this.year);
        date.setMonth(this.month-1);
        date.setDate(this.day);
        date.setHours(this.hour);
        date.setMinutes(this.minute);
        date.setSeconds(this.second);
        return date;
    },

    startGame: function () {
        var size = cc.winSize;

        if (!this.isConfigExist)
        {
            return;
        }
        this.resetHorseVector();
        this.horseReset();
        cc.audioEngine.playEffect(res.Sound2, true);
        this.horseRun();
        this.scheduleOnce(function () {
            this._zhalan.runAction(cc.moveBy(1,cc.p(480,0)));
            this._zhalan_front.runAction(cc.moveBy(1,cc.p(480,0)));
        });


        this._scrollview.setContentOffsetInDuration(cc.p(0,0),10);
        this.scheduleUpdate();
        this.scheduleOnce(function () {
            this.unscheduleUpdate();
        }, 10.0);
        this.scheduleOnce(this.reachTheTarget, 10.0);
    },

    finishGame: function () {
        cc.audioEngine.stopAllEffects();
        this.time_count_down = 0;

        this._scrollview.setContentOffset(cc.p(-5*960,0),false);
        this.label_bg.setVisible(true);
        this.label_tips.setVisible(true);
        this.label_tips.setString("本期已结束");
        this.initZhaLan();
        this.showReward();
    },

    showReward : function () {
        cc.audioEngine.playEffect(res.RewardSound);
        var size = cc.winSize;
        var rewardBoard = cc.Sprite.create(res.RewardBoard_png);
        rewardBoard.setPosition(size.width/2, size.height/2);
        rewardBoard.setTag(200);
        this.addChild(rewardBoard,200);
        var particle = new cc.ParticleFireworks();
        particle.texture = cc.textureCache.addImage("res/stars.png");
        particle.setPosition(size.width/2, size.height/2 + 10);
        rewardBoard.addChild(particle);
        var result = [];
        for (var i = 0; i < 3; i++)
        {
            var horse = new Horse(this.target_arr[i].tag, 2);
            horse.setScale(0.9);
            result.push(horse);
        }
        result[0].setPosition(size.width/2, size.height/2 + 80);
        result[1].setPosition(size.width/2 - 200, size.height/2 + 50);
        result[2].setPosition(size.width/2 + 200, size.height/2 + 30);
        for (var key in result)
        {
            rewardBoard.addChild(result[key]);
            result[key].onJumpAction();
        }
        this.runAction(cc.sequence(cc.delayTime(10), cc.callFunc(function () {
            rewardBoard.removeAllChildren();
            rewardBoard.removeFromParent();
        }, this)));
        this.runAction(cc.sequence(cc.delayTime(10), cc.callFunc(function () {
            this.resetHorseVector();
            this.horseReset();

            var arr = this.sp_horse_vector.sort();
            this.updateNumPos(arr);

            var size = cc.winSize;

        },this)));
    },

    zhanlanAction : function () {
        //栅栏动画
        var animation = new cc.Animation();
        for (var i = 0; i < 5; i++)
        {
            var frameName = "zha_0000" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
            animation.addSpriteFrame(frame);
        }
        animation.setDelayPerUnit(0.1);
        animation.setRestoreOriginalFrame(false);
        var action = cc.animate(animation);
        if (this._zhalan != null)
        {
            this._zhalan.runAction(action);
        }
    },

    getDateString: function (type) {
        var year = this.year;
        var month = this.month;
        var day = this.day;
        var hour = this.hour;
        var minute = this.minute;
        var second = this.second;

        if (hour < 10)
        {
            hour = "0"+hour;
        }
        if (minute < 10)
        {
            minute = "0" + minute;
        }
        if (second < 10)
        {
            second = "0" + second;
        }
        if (type == 1)
        {
            return year+"-"+month+"-"+day+"   "+hour+":"+minute+":"+second;
        }
        else
        {
            return hour+":"+minute+":"+second;
        }
    },

    refreshInfo: function () {

        this.Label_current_info.setString(this.getDateString(1) + "     " + this.current_stage);

        var stage = Number(this.current_stage) + 1;
        this.Label_next_stage.setString(stage);

        this.Label_next_time.setString(this.getDateString(2));
    },

    horseReset: function () {
        var size = cc.winSize;
        var offsetX = 225;
        var offsetY = 180;
        if (this.sp_horse_vector.length > 1)
        {
            for (var i = 0; i < this.sp_horse_vector.length; i++)
            {
                this.sp_horse_vector[i].setPosition(size.width - offsetX + i * 13.4, size.height - offsetY - i * 30);
                this.sp_horse_vector[i].stopAllActions();
            }
        }
        for (var i in this.node_num)
        {
            this.node_num[i].removeAllChildren();
        }

    },

    addAllNum: function () {
        var size = cc.winSize;
        var idx = 0;
        for(var i = 1; i <= 10; i++)
        {
            var sp_name = "num_" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(sp_name);
            var sp = cc.Sprite.create(frame);
            this.sp_num_vector.push(sp);
            this.node_num[idx].addChild(sp);
            idx++;
        }
        var offsetX = 225;
        var offsetY = 180;
        idx = 0;
        for(var i = 0; i < 10; ++i)
        {
            var horse = new Horse(i, 1);
            horse.setScale(0.55);
            horse.setPosition(size.width - offsetX + idx * 13.4, size.height - offsetY - idx * 30);
            horse.tag = idx;
            idx++;
            this.sp_horse_vector.push(horse);
            this.addChild(horse);
        }
    },

    resetHorseVector:function () {
      this.sp_horse_vector.sort(this.sortByTag);
    },

    sortByTag: function (a, b) {
        return a.tag > b.tag;
    },

    horseRun: function () {
        if (this.order.length == 10)
        {
            this.horseRunWithConfig();
        }
        else 
        {
            this.horseRunWithoutConfig();
        }
    },

    //配置文件有顺序
    horseRunWithConfig: function () {
        var size = cc.winSize;
        var offsetY = 180;
        this.target_arr = [];
        var tempRandom = 10;
        for (var i = 0; i < this.sp_horse_vector.length; i++)
        {
            var random = 10;
            for(;;)
            {
                random = 10 + cc.random0To1();
                if (random > tempRandom)
                {
                    break;
                }
            }
            tempRandom = random;
            var idx = Number(this.order[i]) - 1;
            cc.log(idx, random);
            this.sp_horse_vector[idx]._random = random;

            this.target_arr.push(this.sp_horse_vector[i]);

            var currentPosX = this.sp_horse_vector[i].getPositionX();
            var move = this.createActions(random - i*0.02, currentPosX, 630 + i * 10, size.height - offsetY - i * 30);
            this.sp_horse_vector[i].onRunAction();
            this.sp_horse_vector[i].runAction(move);
        }
    },

    //配置文件无顺序
    horseRunWithoutConfig: function () {
        var size = cc.winSize;
        var offsetY = 180;
        this.target_arr = [];
        for (var i = 0; i < this.sp_horse_vector.length; i++)
        {
            var random = cc.random0To1() + 10;
            this.sp_horse_vector[i]._random = random;


            this.target_arr.push(this.sp_horse_vector[i]);

            var currentPosX = this.sp_horse_vector[i].getPositionX();
            var move = this.createActions(random - i*0.02, currentPosX, 630 + i * 10, size.height - offsetY - i * 30);
            this.sp_horse_vector[i].onRunAction();
            this.sp_horse_vector[i].runAction(move);
        }
    },

    reachTheTarget:function () {
        var arr =  this.target_arr.sort(this.sortByRandom);
        for (var i in this.node_num)
        {
            this.node_num[i].removeAllChildren();
        }
        var j = 0;
        for (var i in arr)
        {
            var idx = arr[i].tag;
            this.node_num[j].addChild(this.sp_num_vector[idx]);
            j++;
            this.sp_horse_vector[idx].runAction(cc.moveBy(2,-400,0));
        }
        this.runAction(cc.sequence(cc.delayTime(2),cc.callFunc(this.finishGame, this)));
    },

    sortByRandom:function (a, b) {
        return a._random > b._random;
    },

    createActions: function (time, cur_posX,  x, y) {
        var random1 = null;
        var random2 = null;
        for (; ;) {
            random1 = cc.random0To1();
            if (random1 > 0.3 && random1 < 0.7) {
                break;
            }
        }
        for (; ;) {
            random2 = cc.random0To1();
            if (random2 > 0.3 && random2 < 0.7) {
                break;
            }
        }
        var random_time = random1 * time;
        var random_distance = random2 * x;
        var move1 = cc.MoveTo.create(random_time, cc.p(cur_posX - random_distance, y));
        var move2 = cc.MoveTo.create(time - random_time, cc.p(cur_posX - x, y));
        var sequence = cc.sequence(move1, move2);
        return sequence;
    },

    update: function () {
        var arr = this.sp_horse_vector.sort(this.sortNum);
        this.updateNumPos(arr);
    },

    sortNum: function (a,b) {
        return a.getPositionX() > b.getPositionX();
    },

    updateNumPos: function (arr) {
        for (var i in this.node_num)
        {
            this.node_num[i].removeAllChildren();
        }
        var j = 0;
        for (var i in arr)
        {
            var idx = arr[i].tag;
            this.node_num[j].addChild(this.sp_num_vector[idx]);
            j++;
        }
    },

    newSchedule: function (callback, interval) {
        var then = Date.now();
        interval = interval*1000;
        this.schedule(function () {
            var now = Date.now();
            var delta = now - then;
            if (delta > interval)
            {
                then = now - (delta % interval);
                callback.call(this);
            }
        }.bind(this), 0);
    },

    //总的定时器
    updateTime:function () {
        this.time_count_down--;
        this.label_tips.setString("本期游戏还有" + this.time_count_down + "s" + "开始");

        if (this.time_count_down == 2)
        {
            cc.audioEngine.playEffect(res.Sound1);
        }
        if (this.time_count_down == 1)
        {
            this.zhanlanAction();
        }
        if (this.time_count_down == 0)
        {
            this.label_bg.setVisible(false);
            this.label_tips.setVisible(false);
            this.unschedule(this.updateTime);
            this.startGame();
        }
    },

    //json解析
    jsonParse : function () {
        var jsonStr = cc.loader._loadTxtSync("res/config.json");
        if (jsonStr == null)
        {
            return false;
        }
        var jsonData = JSON.parse(jsonStr);

        this.current_stage = jsonData["current_stage"];
        this.year = Number(jsonData["year"]);
        this.month = Number(jsonData["month"]);
        this.day = Number(jsonData["day"]);
        this.hour = Number(jsonData["hour"]);
        this.minute = Number(jsonData["minute"]);
        this.second = Number(jsonData["second"]);
        this.order = jsonData["order"];

        return true;
    }
});

var RaceScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames("res/Horse.plist", "res/Horse.png");
        cc.spriteFrameCache.addSpriteFrames(res.Grass_plist, res.Grass_png);
        cc.spriteFrameCache.addSpriteFrames(num_vector.num_plist, num_vector.num_png);
        cc.spriteFrameCache.addSpriteFrames(res.HorseJump_plist, res.HorseJump_png);
        var layer = new RaceLayer();
        this.addChild(layer);
    }
});