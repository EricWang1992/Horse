var res = {
    
    CountDown_png : "res/countdown.png",
    Content_png : "res/content.png",
    Bg_png : "res/bg.png",
    Time_BG_png : "res/time.png",
    RewardBoard_png: "res/rewardboard.png",
    Stars_png: "res/stars.png",
    Sound1 : "res/sound1.mp3",
    Sound2 : "res/sound2.mp3",
    RewardSound : "res/reward.mp3",
    Grass_plist : "res/grass_content.plist",
    Grass_png : "res/grass_content.png",
    Horse_plist : "res/Horse.plist",
    Horse_png : "res/Horse.png",
    HorseJump_plist : "res/Horse_jump.plist",
    HorseJump_png : "res/Horse_jump.png"
};
var num_vector = {
    num_plist : "res/num.plist",
    num_png : "res/num.png"
};


var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
for (var i in num_vector){
    g_resources.push(num_vector[i]);
}