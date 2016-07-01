/**
 * Created by ericwang on 6/23/16.
 */

var RaceLayer = cc.Layer.extend({
    bgSprite: null,
    node_num: null,
    sp_content: null,
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
        if (this.time_count_down > 0 && this.time_count_down < 100000)
        {
            this.label_tips.setString("距离下次游戏开始还有" + this.time_count_down + "s");
        }
        else
        {
            this.label_bg.setVisible(true);
            this.label_tips.setVisible(true);
            this.label_tips.setString("配置文件过时，请刷新重试");
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


        //Content
        this.sp_content = cc.Sprite.create(res.Content_png);
        this.sp_content.attr({
            x: -480,
            y: size.height/2 + 20
        });
        this.addChild(this.sp_content);


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
            var label_tips = cc.LabelTTF.create("未找到配置文件,请稍候再试", "", 40);
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
        this.scheduleOnce(this.updateContent, 0);
        this.scheduleUpdate();
        this.scheduleOnce(function () {
            this.unscheduleUpdate();
        }, 5.0);
        this.scheduleOnce(this.reachTheTarget, 5.0);
    },

    finishGame: function () {
        cc.audioEngine.stopAllEffects();
        this.time_count_down = 0;

        this.label_bg.setVisible(true);
        this.label_tips.setVisible(true);
        this.label_tips.setString("游戏结束");
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
            var tag = this.target_arr[i].tag + 1;
            var sp_dir = "res/horse" + tag + ".png";
            var sp = cc.Sprite.create(sp_dir);
            sp.setScale(0.5);
            result.push(sp);
        }
        result[0].setPosition(size.width/2, size.height/2 + 100);
        result[1].setPosition(size.width/2 - 200, size.height/2 + 50);
        result[2].setPosition(size.width/2 + 200, size.height/2 + 50);
        for (var key in result)
        {
            rewardBoard.addChild(result[key]);
            result[key].runAction(cc.repeatForever(cc.sequence(cc.scaleTo(1.5, -0.5, 0.5), cc.scaleTo(1.5,0.5,0.5))));
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
            }
        }
        for (var i in this.node_num)
        {
            this.node_num[i].removeAllChildren();
        }

        this.sp_content.setPosition(-480, size.height/2 + 20);
    },


    addAllNum: function () {
        var size = cc.winSize;
        var idx = 0;
        for(var i in num_vector)
        {
            var sp = cc.Sprite.create(num_vector[i]);
            this.sp_num_vector.push(sp);
            this.node_num[idx].addChild(sp);
            idx++;
        }
        var offsetX = 225;
        var offsetY = 180;
        idx = 0;
        for(var i in horse_vector)
        {
            var sp = cc.Sprite.create(horse_vector[i]);
            sp.setScale(0.23,0.2);
            sp.setPosition(size.width - offsetX + idx * 13.4, size.height - offsetY - idx * 30);
            sp.tag = idx;
            idx++;
            this.sp_horse_vector.push(sp);
            this.addChild(sp);
        }
    },


    resetHorseVector:function () {
      this.sp_horse_vector.sort(this.sortByTag);
    },

    sortByTag: function (a, b) {
        return a.tag > b.tag;
    },

    updateContent: function () {
        var size = cc.winSize;
        var moveTo = cc.MoveTo.create(4.5, cc.p(1440, size.height/2 + 20));
        this.sp_content.runAction(moveTo);
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
        var tempRandom = 5;
        for (var i = 0; i < this.sp_horse_vector.length; i++)
        {
            var random = 5;
            for(;;)
            {
                random = 5 + cc.random0To1();
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
            var random = cc.random0To1() + 5;
            this.sp_horse_vector[i]._random = random;


            this.target_arr.push(this.sp_horse_vector[i]);

            var currentPosX = this.sp_horse_vector[i].getPositionX();
            var move = this.createActions(random - i*0.02, currentPosX, 630 + i * 10, size.height - offsetY - i * 30);
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
        this.label_tips.setString("距离下次游戏开始还有" + this.time_count_down + "s");

        if (this.time_count_down == 2)
        {
            cc.audioEngine.playEffect(res.Sound1);
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
        var layer = new RaceLayer();
        this.addChild(layer);
    }
});