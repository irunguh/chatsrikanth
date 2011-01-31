/*

Copyright (c) 2009 Anant Garg (anantgarg.com | inscripts.com)

This script may be used for non-commercial purposes only. For any
commercial purposes, please contact the author at
anant.garg@inscripts.com

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

 */
var applicationName = "ioLite";
var base_url = $homeurl;
var bottomPosition = "25px";
var windowFocus = true;
var username;
var chatHeartbeatCount = 0;
var minChatHeartbeat = 4000;
var maxChatHeartbeat = 33000;
var chatHeartbeatTime = minChatHeartbeat;
var originalTitle;
var blinkOrder = 0;
var friendUpdateTime = 8000;
var chatboxFocus = new Array();
var newMessages = new Array();
var newMessagesWin = new Array();
var chatBoxes = new Array();
var footerPanle = '';
var keyPressedChat = false;
var friendsData = {};
var blockedList = {};
var emptyChatMessage = "Enter Chat Status";
var iBlockedMessage = "You cannot chat with this user. Kindly unblock this user to resume chat.";
var notFriendMessage = "This user is no longer in your friend list. Add this user as a friend to to continue chatting.";
//var userStatusMessage = "";
var userStatusMessageData = {};
var noFriendsMessage = "No User online."

//var smileyJson = {":-)":["grin.gif","19","19","grin"],":lol:":["lol.gif","19","19","LOL"],":cheese:":["cheese.gif","19","19","cheese"],":)":["smile.gif","19","19","smile"],";-)":["wink.gif","19","19","wink"],";)":["wink.gif","19","19","wink"],":smirk:":["smirk.gif","19","19","smirk"],":roll:":["rolleyes.gif","19","19","rolleyes"],":-S":["confused.gif","19","19","confused"],":wow:":["surprise.gif","19","19","surprised"],":bug:":["bigsurprise.gif","19","19","big surprise"],":-P":["tongue_laugh.gif","19","19","tongue laugh"],"%-P":["tongue_rolleye.gif","19","19","tongue rolleye"],";-P":["tongue_wink.gif","19","19","tongue wink"],":P":["rasberry.gif","19","19","rasberry"],":blank:":["blank.gif","19","19","blank stare"],":long:":["longface.gif","19","19","long face"],":ohh:":["ohh.gif","19","19","ohh"],":grrr:":["grrr.gif","19","19","grrr"],":gulp:":["gulp.gif","19","19","gulp"],"8-\/":["ohoh.gif","19","19","oh oh"],":down:":["downer.gif","19","19","downer"],":red:":["embarrassed.gif","19","19","red face"],":sick:":["sick.gif","19","19","sick"],":shut:":["shuteye.gif","19","19","shut eye"],":-\/":["hmm.gif","19","19","hmmm"],">:(":["mad.gif","19","19","mad"],":mad:":["mad.gif","19","19","mad"],">:-(":["angry.gif","19","19","angry"],":angry:":["angry.gif","19","19","angry"],":zip:":["zip.gif","19","19","zipper"],":kiss:":["kiss.gif","19","19","kiss"],":ahhh:":["shock.gif","19","19","shock"],":coolsmile:":["shade_smile.gif","19","19","cool smile"],":coolsmirk:":["shade_smirk.gif","19","19","cool smirk"],":coolgrin:":["shade_grin.gif","19","19","cool grin"],":coolhmm:":["shade_hmm.gif","19","19","cool hmm"],":coolmad:":["shade_mad.gif","19","19","cool mad"],":coolcheese:":["shade_cheese.gif","19","19","cool cheese"],":vampire:":["vampire.gif","19","19","vampire"],":snake:":["snake.gif","19","19","snake"],":exclaim:":["exclaim.gif","19","19","excaim"],":question:":["question.gif","19","19","question"]};


$(document).ready(function(){

    originalTitle = document.title;
    startChatSession();

    $([window, document]).blur(function(){
        windowFocus = false;
    }).focus(function(){
        windowFocus = true;
        document.title = originalTitle;
    });
    //getStatusMessage();
    //Append Main Chatdiv to the body Tag
    $("body").append('<div id="chatMain" class="chatBase" style=""><div class="chatBlLogo"></div><ul><li class="chatString"><span class="tab">Chat <b id="onlineFriendsCount"></b></span>'+"\n"+'<div id="friends" ><span class="head"><a href="#" class="r">&mdash;</a>'+applicationName+' Chat </span><div></div><div class="list"></div></div></li></ul>');


//    $(".statusVisible").click(function(){
//        //updateChatStatus('v');
//        $('.statusVisBlock').toggle();
//        return false;
//    });

//    $(".statusInvisible").click(function(){
//        //updateChatStatus('i');
//        $('.statusVisBlock').toggle();
//        return false;
//    });
//

    $('.tab').click(function(){
        $('.chatString').toggleClass("active");

        return false;
    });
    $('.r').click(function(){
        $('.chatString').toggleClass("active");

        return false;
    });


//    $(".statusLblBtn").click(function(){
//        $('.statusVisBlock').toggle();
//        return false;
//    });
//    $("#loggedInUserStatus").click(function(){
//      //  updateChatStatus();
//        return false;
//    });
   // $("textarea[name=edit_chat]").parent().css("display", "none");
    displayUsersFriends();
    //getBlockedList();
    //getStatusMessage();
    initStatus();
});

function getStatusMessage(){

    $.post(base_url+"ChatChat/index", {
        "action":"getChatStatus"
    },
    function (data){
        userStatusMessageData = data;
        setStatusMessage(data);
        if($.trim(data.status) == "i"){
            $(".chatString").addClass('chatUserInactive');
        }else if($.trim(data.status) == "v"){
            $(".chatString").addClass('chatUserActive');
        }
    }, "json");

}
function initStatus(){
    $("#chatStatusLink, .statusLblField").click(function(){
        //var linkParent = $(this).parent();
        var inputParent = $("textarea[name=edit_chat]").parent();
        //$(linkParent).css("display", "none");
        $(inputParent).css("display", "");
        $("textarea[name=edit_chat]").focus();
        return false;
    });

    $("textarea[name=edit_chat]").blur(function(){
        updateMessageStatus();
    });
    $("textarea[name=edit_chat]").click(function(){
        return false;
    });

    $("textarea[name=edit_chat]").keydown(function(event){
        var characterLimit = 100;
        if(event.keyCode == 13 && event.shiftKey == 0){
            $(this).val($.trim($(this).val().substr(0, characterLimit)));
            var textEntered =  $(this).val();
            var currentlength = textEntered.length;
            if(currentlength > 100){
                $.jGrowl('<font color="red"><b>You cannot write more then '+characterLimit+' characters!</b></font>');
                return false;
            }
            updateMessageStatus();
            return false;
        }else{
            limitChars(this, characterLimit, '');
        }
    });
}

function setStatusMessage(data){
    var message = emptyChatMessage;8
    if($.trim(data.success) == "true"){
        if($.trim(data.status_message) != ""){
            userStatusMessage = data.status_message;
        }else{
            userStatusMessage = message;
        }

        if($.trim(data.status_message) != ""){
            // message = data.status_message;
            $("textarea[name=edit_chat]").val(userStatusMessage);
        }else{
            $("textarea[name=edit_chat]").val();
        }
        //
        // $.jGrowl(userStatusMessage);
        $("#chatStatusLink").html(userStatusMessage);
    //            if($.trim(data.status) == "v"){
    //                $("#loggedInUserStatus").addClass("visiable");
    //            }
    //            if($.trim(data.status) == "i"){
    //                $("#loggedInUserStatus").addClass("invisiable");
    //            }


    }
}
function updateMessageStatus(){

    var linkParent = $("#chatStatusLink").parent();
    var inputParent = $("textarea[name=edit_chat]").parent();
    var statusValue =  $("textarea[name=edit_chat]").val();
    if($.trim(statusValue) != ""){

        statusValue = statusValue.replace("<","&lt;");
        statusValue = statusValue.replace(">","&gt;");
        $("#chatStatusLink").html(statusValue);
        $(linkParent).css("display", "");
        $(inputParent).css("display", "none");
    }else{
        $("#chatStatusLink").html(emptyChatMessage);
        $(linkParent).css("display", "");
        $(inputParent).css("display", "none");
    }
    var postData = {
        "action": "setChatMessage",
        "status_message": $("textarea[name=edit_chat]").val()
    };
    $.post(base_url+"ChatChat/index", postData, function(data){
        if($.trim(data.success) == "true"){
            return true;
        }else{
            $("#chatStatusLink").html(emptyChatMessage);
            if($.trim(data.message) != "") {
                $.jGrowl('<b><font color="red">'+data.message+'</font></b>');
                return false;
            }

        }
    }, "json");

}
function updateChatStatus(statusChecked){

    var changeStatus = "";
    //    $.jGrowl(statusChecked);
    //    $.jGrowl($(".chatString").hasClass("chatUserInactive"));
    if($(".chatString").hasClass("chatUserInactive") == true && statusChecked == 'v'){
        changeStatus = "v";
        $(".chatString").removeClass("chatUserInactive");
        $(".chatString").addClass("chatUserActive");
    }else if($(".chatString").hasClass("chatUserActive") == true && statusChecked == 'i'){
        changeStatus = "i";
        $(".chatString").removeClass("chatUserActive");
        $(".chatString").addClass("chatUserInactive");
    }
    if(changeStatus == ""){
        return false;
    }
    $.post(base_url+'ChatChat/index', {
        "action": "setChatStatus",
        "status": changeStatus
    }, function(data){
        if($.trim(data.success) == "true"){
            return true;
        }
        if($.trim(data.success) == "false"){
            if(changeStatus == "i"){
                $("#loggedInUserStatus").removeClass("invisiable");
                $("#loggedInUserStatus").addClass("visiable");
            }

            if(changeStatus == "v"){
                $("#loggedInUserStatus").removeClass("visiable");
                $("#loggedInUserStatus").addClass("invisiable");
            }

            if($.trim(data.message) != "") {
                $.jGrowl('<b><font color="red">'+data.message+'</font></b>');
            }


        }
        return false;
    }, 'json');


}

function restructureChatBoxes() {
    align = 0;
    for (x in chatBoxes) {
        chatboxtitle = chatBoxes[x];

        if ($("#chatbox_"+chatboxtitle).css('display') != 'none') {
            if (align == 0) {
                $("#chatbox_"+chatboxtitle).css('right', '210px');
            } else {
                width = (align)*(225+7)+210;
                $("#chatbox_"+chatboxtitle).css('right', width+'px');
            }
            align++;
        }
    }
}

function chatWith(chatuser) {
    createChatBox(chatuser);
    $("#chatbox_"+chatuser+" .chatboxtextarea").focus();
}

function createChatBox(chatboxtitle,minimizeChatBox) {
    if ($("#chatbox_"+chatboxtitle).length > 0) {
        if ($("#chatbox_"+chatboxtitle).css('display') == 'none') {
            $("#chatbox_"+chatboxtitle).css('display','block');
            restructureChatBoxes();
        }
        $("#chatbox_"+chatboxtitle+" .chatboxtextarea").focus();
        return;
    }
    var statusMessage  = "";
    if(friendsData.length > 0){
        $.each(friendsData, function (key, value){
            if($.trim(value.username) == $.trim(chatboxtitle) && $.trim(value.status_message) != ""){
                statusMessage = value.status_message;
            }
        });
    }
    $(" <div />" ).attr("id","chatbox_"+chatboxtitle)
    .addClass("chatbox")
    .html('<div class="chatboxhead"><div class="chatboxtitle">'+chatboxtitle+'</div><div class="chatboxoptions"><a href="javascript:void(0)" onclick="javascript:toggleChatBoxGrowth(\''+chatboxtitle+'\')">-</a> <a href="javascript:void(0)" onclick="javascript:closeChatBox(\''+chatboxtitle+'\')">X</a></div><br clear="all"/></div><div class="chatboxcontent"></div><div class="chatboxinput"><div class="statusMessage" id="status_message_'+chatboxtitle+'">'+statusMessage+'</div><textarea class="chatboxtextarea" onkeydown="javascript:return checkChatBoxInputKey(event,this,\''+chatboxtitle+'\');"></textarea></div>')
    .appendTo($( "body" ));

    $("#chatbox_"+chatboxtitle).css('bottom', bottomPosition);

    chatBoxeslength = 0;

    for (x in chatBoxes) {
        if ($("#chatbox_"+chatBoxes[x]).css('display') != 'none') {
            chatBoxeslength++;
        }
    }
    if(chatBoxeslength > 4){
        //        alert(chatBoxes);
        //
        //        var tmp = new Array;
        //        var i = 0;
        //        for(j in chatBoxes){
        //            if(chatBoxes[j] == chatBoxes[0]){
        //                alert(chatBoxes[0]);
        //  alert(chatBoxes);
        $("#chatbox_"+chatBoxes[chatBoxes.length-1]).remove();
        chatBoxes.pop();
        // alert(chatBoxes);
        chatBoxeslength = chatBoxeslength - 1;
    //                continue;
    //            }
    //            tmp[i] = chatBoxes[j];
    //            i++;
    //        }
    //        chatBoxes = tmp;
    }

    if (chatBoxeslength == 0) {
        $("#chatbox_"+chatboxtitle).css('right', '210px');
    } else {
        width = (chatBoxeslength)*(225+7)+210;
        $("#chatbox_"+chatboxtitle).css('right', width+'px');
    }

    chatBoxes.push(chatboxtitle);

    if (minimizeChatBox == 1) {
        minimizedChatBoxes = new Array();

        if ($.cookie('chatbox_minimized')) {
            minimizedChatBoxes = $.cookie('chatbox_minimized').split(/\|/);
        }
        minimize = 0;
        for (j=0;j<minimizedChatBoxes.length;j++) {
            if (minimizedChatBoxes[j] == chatboxtitle) {
                minimize = 1;
            }
        }

        if (minimize == 1) {
            $('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display','none');
            $('#chatbox_'+chatboxtitle+' .chatboxinput').css('display','none');
        }
    }

    chatboxFocus[chatboxtitle] = false;

    $("#chatbox_"+chatboxtitle+" .chatboxtextarea").blur(function(){
        chatboxFocus[chatboxtitle] = false;
        $("#chatbox_"+chatboxtitle+" .chatboxtextarea").removeClass('chatboxtextareaselected');
    }).focus(function(){
        chatboxFocus[chatboxtitle] = true;
        newMessages[chatboxtitle] = false;
        $('#chatbox_'+chatboxtitle+' .chatboxhead').removeClass('chatboxblink');
        $("#chatbox_"+chatboxtitle+" .chatboxtextarea").addClass('chatboxtextareaselected');
    });

    $("#chatbox_"+chatboxtitle).click(function() {
        if ($('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display') != 'none') {
            $("#chatbox_"+chatboxtitle+" .chatboxtextarea").focus();
        }
    });

    $("#chatbox_"+chatboxtitle).show();
}


function chatHeartbeat() {

    var itemsfound = 0;
    if (windowFocus == false) {

        var blinkNumber = 0;
        var titleChanged = 0;
        for (x in newMessagesWin) {
            if (newMessagesWin[x] == true) {
                ++blinkNumber;
                if (blinkNumber >= blinkOrder) {
                    document.title = x+' says...';
                    titleChanged = 1;
                    break;
                }
            }
        }

        if (titleChanged == 0) {
            document.title = originalTitle;
            blinkOrder = 0;
        } else {
            ++blinkOrder;
        }

    } else {
        for (x in newMessagesWin) {
            newMessagesWin[x] = false;
        }
    }

    for (x in newMessages) {
        if (newMessages[x] == true) {
            if (chatboxFocus[x] == false) {
                //FIXME: add toggle all or none policy, otherwise it looks funny
                $('#chatbox_'+x+' .chatboxhead').toggleClass('chatboxblink');
            }
        }
    }

    $.post(base_url+"ChatChat/index",{
        action: "chatheartbeat"
    },
    function(data) {

        $.each(data.items, function(i,item){
            if (item)	{ // fix strange ie bug

                chatboxtitle = item.f;
                if(!chatboxtitle || chatboxtitle == "chatboxtitle"){
                    return;
                }
                if ($("#chatbox_"+chatboxtitle).length <= 0) {
                    createChatBox(chatboxtitle);
                }
                if ($("#chatbox_"+chatboxtitle).css('display') == 'none') {
                    $("#chatbox_"+chatboxtitle).css('display','block');
                    restructureChatBoxes();
                }

                if (item.s == 1) {
                    item.f = username;
                }

                if (item.s == 2) {
                    $("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxinfo">'+item.m+'</span></div>');
                } else {
                    newMessages[chatboxtitle] = true;
                    newMessagesWin[chatboxtitle] = true;
                    $("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxmessagefrom">'+item.f+':&nbsp;&nbsp;</span><span class="chatboxmessagecontent">'+item.m+'</span></div>');
                }

                $("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
                itemsfound += 1;
            }
        });

        chatHeartbeatCount++;

        if (itemsfound > 0) {
            chatHeartbeatTime = minChatHeartbeat;
            chatHeartbeatCount = 1;
        } else if (chatHeartbeatCount >= 10) {
            chatHeartbeatTime *= 2;
            chatHeartbeatCount = 1;
            if (chatHeartbeatTime > maxChatHeartbeat) {
                chatHeartbeatTime = maxChatHeartbeat;
            }
        }
         if (itemsfound == 0) {
              chatHeartbeatTime = maxChatHeartbeat;
         }

        setTimeout('chatHeartbeat();',chatHeartbeatTime);
    },
    "json"
    );
}

function closeChatBox(chatboxtitle) {
    chatBoxes = $.grep(chatBoxes, function(value){
        return value != chatboxtitle;
    });
    $('#chatbox_'+chatboxtitle).remove();
    restructureChatBoxes();

    $.post(base_url+"ChatChat/index", {
        action: "closechat",
        chatbox: chatboxtitle
    });

}

function toggleChatBoxGrowth(chatboxtitle) {

    if ($('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display') == 'none') {

        var minimizedChatBoxes = new Array();

        if ($.cookie('chatbox_minimized')) {
            minimizedChatBoxes = $.cookie('chatbox_minimized').split(/\|/);
        }

        var newCookie = '';

        for (i=0;i<minimizedChatBoxes.length;i++) {
            if (minimizedChatBoxes[i] != chatboxtitle) {
                newCookie += chatboxtitle+'|';
            }
        }

        newCookie = newCookie.slice(0, -1)


        $.cookie('chatbox_minimized', newCookie);
        $('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display','block');
        $('#chatbox_'+chatboxtitle+' .chatboxinput').css('display','block');
        $("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
    } else {

        var newCookie = chatboxtitle;

        if ($.cookie('chatbox_minimized')) {
            newCookie += '|'+$.cookie('chatbox_minimized');
        }


        $.cookie('chatbox_minimized',newCookie);
        $('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display','none');
        $('#chatbox_'+chatboxtitle+' .chatboxinput').css('display','none');
    }

}

function checkChatBoxInputKey(event,chatboxtextarea,chatboxtitle) {


    if(event.keyCode == 13 && event.shiftKey == 0)  {
        message = $(chatboxtextarea).val();
        message = message.replace(/^\s+|\s+$/g,"");

        $(chatboxtextarea).val('');
        $(chatboxtextarea).focus();
        $(chatboxtextarea).css('height','44px');
        if (message != '') {
            var friendFlag = false;
            if(friendsData.length > 0){
                $.each(friendsData, function(friendKey,friendValue){
                    if($.trim(chatboxtitle) == $.trim(friendValue.username)){
                        friendFlag = true;
                    }
                });
                if(friendFlag == false){
                    var removedFriend = "#removed_"+chatboxtitle+":contains('"+notFriendMessage+"')";
                    if(!$.trim($(removedFriend).html())){
                        $("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage" id="removed_'+chatboxtitle+'"><span class="chatboxmessagefrom">&nbsp;</span><span class="chatboxinfo">'+notFriendMessage+'</span></div>');
                        $("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
                    }
                    return false;
                }
            }
//            if(blockedList.i_blocked.length > 0 || blockedList.blocked_me.length > 0) {//if user is in blocked list
//                var iBlocked = $.inArray($.trim(chatboxtitle), blockedList.i_blocked);
//                var blockedMe = $.inArray($.trim(chatboxtitle), blockedList.blocked_me);
//
//                if(iBlocked != -1){
//                    var blockedUser = "#blocked_"+chatboxtitle+":contains('"+iBlockedMessage+"')";
//
//                    if(!$.trim($(blockedUser).html())){
//                        $("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage" id="blocked_'+chatboxtitle+'"><span class="chatboxmessagefrom">&nbsp;</span><span class="chatboxinfo">'+iBlockedMessage+'</span></div>');
//                        $("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
//                    }
//                    return false;
//                }
//                if(blockedMe != -1){
//                    message = message.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
//                    //******** Code For adding Smiles start ***********//
//                    if(smileyJson){ //To do
//                        var messageDisplay = message;
//
//                        jQuery.each(smileyJson, function(key, val) {
//                            image = '<img src="'+base_url+"resources/images/smileys/"+val[0]+'" width="'+val[1]+'" height="'+val[2]+'" alt="'+val[3]+'" />'; ;
//                            messageDisplay = messageDisplay.replace(key, image);
//
//                        });
//
//                    }
//                    //******** Code For adding Smiles ends ***********//
//
//                    $("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxmessagefrom">'+username+':&nbsp;&nbsp;</span><span class="chatboxmessagecontent">'+messageDisplay+'</span></div>');
//                    $("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
//                    return false;
//                }
//            }
            $.post(base_url+"ChatChat/index", {
                action: "sendchat",
                to: chatboxtitle,
                message: message
            } , function(data){
                message = message.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
                //******** Code For adding Smiles start ***********//
//                if(smileyJson){ //To do
//                    var messageDisplay = message;
//
//                    jQuery.each(smileyJson, function(key, val) {
//                        image = '<img src="intranet/web/images/smileys/"'+val[0]+'" width="'+val[1]+'" height="'+val[2]+'" alt="'+val[3]+'" />'; ;
//                        messageDisplay = messageDisplay.replace(key, image);
//
//                    });
//
//                }
                //******** Code For adding Smiles ends ***********//
                var messageDisplay = message;
                $("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxmessagefrom">'+username+':&nbsp;&nbsp;</span><span class="chatboxmessagecontent">'+messageDisplay+'</span></div>');
                $("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
            });
        }
        chatHeartbeatTime = minChatHeartbeat;
        chatHeartbeatCount = 1;

        return false;
    }

    var adjustedHeight = chatboxtextarea.clientHeight;
    var maxHeight = 94;

    if (maxHeight > adjustedHeight) {
        adjustedHeight = Math.max(chatboxtextarea.scrollHeight, adjustedHeight);
        if (maxHeight)
            adjustedHeight = Math.min(maxHeight, adjustedHeight);
        if (adjustedHeight > chatboxtextarea.clientHeight)
            $(chatboxtextarea).css('height',adjustedHeight+8 +'px');
    } else {
        $(chatboxtextarea).css('overflow','auto');
    }

}

function startChatSession(){

    $.post(base_url+"ChatChat/index", {
        action: "startchatsession"
    },  function(data) {

        username = data.username;
        $.each(data.items, function(i,item){

           // for(value in item) {

                if (item){ // fix strange ie bug

                    chatboxtitle = item.f;
                    if ($("#chatbox_"+chatboxtitle).length <= 0) {
                        createChatBox(chatboxtitle,1);
                    }

                    if (item.s == 1) {
                        item.f = username;
                    }

                    if (item.s == 2) {
                        $("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxinfo">'+item.m+'</span></div>');
                    } else {
                        $("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxmessagefrom">'+item.f+':&nbsp;&nbsp;</span><span class="chatboxmessagecontent">'+item.m+'</span></div>');
                    }
                }

           // }
        });

        for (i=0;i<chatBoxes.length;i++) {
            chatboxtitle = chatBoxes[i];
            $("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
            setTimeout('$("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);', 100); // yet another strange ie bug
        }

        setTimeout('chatHeartbeat();',chatHeartbeatTime);

    },
    "json"
    );
}


/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

/**
 * Function to update logged in users friends panel
 */
function displayUsersFriends(){
    url = base_url+"ChatChat/index";
    $.post(url, {
        action: "displayUsersFriends"
    }, updateFriends, "json");

    setTimeout('displayUsersFriends();', friendUpdateTime);
}

/**
 * Function to update friends div
 */
function updateFriends(data){
    var countOnline = 0;
    friendsData = data;
    $("ul.nofriendMessage").remove();
    //countOnline = data.length;

    var html = "";
    var updatedStatusMessage = "";
    if(data.length == 0){

        var htmlMessage = '<li >'+noFriendsMessage+'</li>';
        $("ul.nofriendMessage").remove();
        $("#onlineFriendsCount").html('(0)');
        $("#friends div").html('<ul class="nofriendMessage">'+htmlMessage+'</ul>');
        $("div.list").html("");
        return false;
    //alert('hi'); return;
    }
    $.each(data, function (key, value){
        // $.jGrowl(value.username+'--'+value.loggedIn);
        if(value.loggedIn == true && value.status != "invisiable"){
            countOnline += 1;
        }
        updatedStatusMessage = "#status_message_"+value.username;
        $(updatedStatusMessage).html(value.status_message);
        var userStatusLink = '<a class="action unblock" onclick="blockuser(\''+value.username+'\', this);">&nbsp;</a>';
        //        else if($.trim(value.loggedIn) == "false"){
        //            html += '<li class="offline">'+ '<a href="javascript:void(0)" onclick="javascript:chatWith(\''+value.username+'\')">'+value.username+'</a>'+'</li>'+"\n";;
        //        }
        html += '<li class="'+value.status+'">'+ '<a class="name" href="javascript:void(0)" onclick="javascript:chatWith(\''+value.username+'\')">'+value.username+'</a>';//+'</li>'+"\n";
//        if(blockedList){
//            if(blockedList.i_blocked.length > 0 || blockedList.blocked_me.length > 0) {//if user is in blocked list
//                var iBlocked = $.inArray($.trim(value.username), blockedList.i_blocked);
//                var blockedMe = $.inArray($.trim(value.username), blockedList.blocked_me);
//                if(iBlocked != -1) {
//                    userStatusLink = '<a class="action block" onclick="unblockuser(\''+value.username+'\', this)">&nbsp;</a>';
//                }
//
//                if(blockedMe != -1){//Do nothing (ment for for
//            // return false;
//            }
//            }
//        }
        html = html + userStatusLink+'</li>'+"\n"   ;
    });
    if(countOnline != 0)
    {
        $("#onlineFriendsCount").addClass("onlinecount");

    }
    else
    {
        $("#onlineFriendsCount").removeClass("onlinecount");
    }
    if($('#chat_input').val()!=undefined && $('#chat_input').val()!='Search by Username'){
        var chat_text_input = $('#chat_input').val();
    } else {
        var chat_text_input = 'Search by Username';
    }
    var searchfilter = '<form class="filterform" action="#"><input id="chat_input" width="fixed" autocomplete="off" size="23%" value="'+chat_text_input+'" color="" type="text" class="filterinput"></form>';
    $("#onlineFriendsCount").html('('+countOnline+')');

    $("#friends div.list").html(searchfilter+'<ul id="list_ul">'+html+'</ul>');
    if(userStatusMessageData.length == 0){
        getStatusMessage();
    }
    filtervalues();
    return true;


}

function getLoggedInUserStatus(){

    url = base_url+"ChatChat/index";
    $.post(url, {
        action: "getChatStatus"
    }, function(){}, "json");
}


function filtervalues(){
    $('#chat_input').keyup(function(event) {
		var search_text = $('#chat_input').val();
		var rg = new RegExp(search_text,'i');
		$('#friends .list .name').each(function(){
 			if($.trim($(this).html()).search(rg) == -1) {
				$(this).parent().css('display', 'none');
 				$(this).css('display', 'none');
				$(this).next().css('display', 'none');
				$(this).next().next().css('display', 'none');
			}
			else {
				$(this).parent().css('display', '');
				$(this).css('display', '');
				$(this).next().css('display', '');
				$(this).next().next().css('display', '');
			}
		});
	});

    if($('#chat_input').val()!=undefined && $('#chat_input').val()!='Search by Username'){
        var search_text = $('#chat_input').val();
		var rg = new RegExp(search_text,'i');
		$('#friends .list .name').each(function(){
 			if($.trim($(this).html()).search(rg) == -1) {
				$(this).parent().css('display', 'none');
 				$(this).css('display', 'none');
				$(this).next().css('display', 'none');
				$(this).next().next().css('display', 'none');
			}
			else {
				$(this).parent().css('display', '');
				$(this).css('display', '');
				$(this).next().css('display', '');
				$(this).next().next().css('display', '');
			}
		});

    }
    $('#chat_input').click(function(){
        if($('#chat_input').val() =='Search by Username'){
            $('#chat_input').val('');
        }
    });
}

function getBlockedList(){

    $.post(base_url+"chat/index",
    {
        "action": "getBlockedList"
    },
    function(data){
        blockedList = data;

        //Gets the list of online friends
        displayUsersFriends();
    },
    "json");
    setTimeout('getBlockedList();', friendUpdateTime);
}

function blockuser(username, anchorObject){

    var url = base_url+"ChatChat/index";
    var data = {
        "action": "setFriendChatStatus",
        "chat_status":"b",
        "friend_username": username
    };
    $(anchorObject).removeClass("unblock");
    $(anchorObject).addClass("block");
    $(anchorObject).attr("onclick", "unblockuser('"+username+"', this)");
    $.post(url, data, function(data){
        getBlockedList()
    }, "json");
}

function unblockuser(username, anchorObject){

    var blockedUser = "#blocked_"+username+":contains('"+iBlockedMessage+"')";
    $(blockedUser).html("");
    var url = base_url+"ChatChat/index";
    var data = {
        "action": "setFriendChatStatus",
        "chat_status":"u",
        "friend_username": username
    };
    $(anchorObject).removeClass("block");
    $(anchorObject).addClass("unblock");
    $(anchorObject).attr("onclick", "blockuser('"+username+"', this)");
    $.post(url, data, function(data){
        getBlockedList()
    }, "json");
}

function limitChars(textid, limit, infodiv)

{
    var text = $(textid).val();

    var textlength = text.length;

    if(textlength > limit)
    {
        $.jGrowl('<font color="red"><b>You cannot write more then '+limit+' characters!</b></font>');
        //alert('You cannot write more then '+limit+' characters!');
        $(textid).val(text.substr(0,limit));

        return false;
    }
    else

    {
        // $.jGrowl('<font color="red"><b>You have '+ (limit - textlength) +' characters left.</b></font>');
        return true;

    }

}