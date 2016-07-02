/**
 * Created by ericwang on 6/23/16.
 */
var Horse = cc.Sprite.extend({
    idx : null,
    type : null,
    isRunning : null,
    isJumping : null,
    ctor:function (idx, type) {
        this._super();
        this.idx = idx+1;
        this.type = type;

        this.isRunning = false;
        this.isJumping = false;
        // cc.spriteFrameCache.addSpriteFrames()

        this.setSpriteFrameForIdx();
    },
    setSpriteFrameForIdx:function () {
        var frameName = null;
        if(this.type == 1)
        {
            frameName = this.idx + "_0001.png";
        }
        else 
        {
            frameName = this.idx + "_J_0001.png";
        }
        
        var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
        if(frame != null)
        {
            this.setSpriteFrame(frame);
        }
    },
    onRunAction: function () {
        if(!this.isRunning)
        {
            var animation = new cc.Animation();
            for(var i = 1; i <= 6; i++)
            {
                var frameName = this.idx + "_000" + i + ".png";
                var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
                animation.addSpriteFrame(frame);
            }
            animation.setDelayPerUnit(0.1);
            animation.setRestoreOriginalFrame(true);

            var action = cc.animate(animation);
            this.runAction(cc.repeatForever(action));
            this.isRunning = true;
        }
        else
        {
            this.stopAllActions();
            this.isRunning = false;
        }
    },
    onJumpAction: function () {
        if(!this.isJumping)
        {
            var animation = new cc.Animation();
            for(var i = 1; i <= 9; i++)
            {
                var frameName = this.idx + "_J_000" + i + ".png";
                var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
                animation.addSpriteFrame(frame);
            }
            animation.setDelayPerUnit(0.15);
            animation.setRestoreOriginalFrame(true);
            
            var action = cc.animate(animation);
            this.runAction(cc.repeatForever(action));
            this.isJumping = true;
        }
        else 
        {
            this.stopAllActions();
            this.isJumping = false;
        }
    }
});