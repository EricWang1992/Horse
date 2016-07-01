var res = {
    
    CountDown_png : "res/countdown.png",
    Content_png : "res/content.png",
    Bg_png : "res/bg.png",
    Time_BG_png : "res/time.png",
    RewardBoard_png: "res/rewardboard.png",
    Stars_png: "res/stars.png",
    Sound1 : "res/sound1.mp3",
    Sound2 : "res/sound2.mp3",
    RewardSound : "res/reward.mp3"
};
var num_vector = {
    num_1 : "res/num_1.png",
    num_2 : "res/num_2.png",
    num_3 : "res/num_3.png",
    num_4 : "res/num_4.png",
    num_5 : "res/num_5.png",
    num_6 : "res/num_6.png",
    num_7 : "res/num_7.png",
    num_8 : "res/num_8.png",
    num_9 : "res/num_9.png",
    num_10 : "res/num_10.png"
};
var horse_vector = {
    horse1 : "res/horse1.png",
    horse2 : "res/horse2.png",
    horse3 : "res/horse3.png",
    horse4 : "res/horse4.png",
    horse5 : "res/horse5.png",
    horse6 : "res/horse6.png",
    horse7 : "res/horse7.png",
    horse8 : "res/horse8.png",
    horse9 : "res/horse9.png",
    horse10 : "res/horse10.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
for (var i in num_vector){
    g_resources.push(num_vector[i]);
}
for (var i in horse_vector){
    g_resources.push(horse_vector[i]);
}