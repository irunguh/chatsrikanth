<?php

/**
 * chat actions.
 *
 * @package    intranet
 * @subpackage chat
 * @author     Avnish Pundir
 * @version    SVN: $Id: actions.class.php 23810 2009-11-12 11:07:44Z Kris.Wallsmith $
 */
sfContext::getInstance()->getConfiguration()->loadHelpers(array('Chat'));
class ChatChatActions extends sfActions
{
  public function executeIndex(sfWebRequest $request)
  {       
        if (!isset($_SESSION['chatHistory'])) {
            $_SESSION['chatHistory'] = array();
        }

        if (!isset($_SESSION['openChatBoxes'])) {
            $_SESSION['openChatBoxes'] = array();
        }
        $arrRequest = $request->getPostParameters();        
        $action = $arrRequest['action'];
        switch(trim($action)){
            case 'startchatsession':
                $this->chatsession();
                break;
            case 'getChatStatus':
                $this->getChatStatus();
                break;
            case 'displayUsersFriends':
                $this->displayUsersFriends();
                break;
            case 'chatheartbeat':
                $this->chartheartbeats();
                break;
            case 'sendchat':
                $this->chartsend($arrRequest);
                break;
            case 'closechat':
                $this->closebox($arrRequest['chatbox']);
                break;
        }
       die;
  }
  private function chatsession(){
       
        $username = sfcontext::getInstance()->getUser()->getGuardUser()->getUserName();
         startChatSession($username);die;
        
    }
  private function getChatStatus(){
       
       $return1 = array();
       $intUserId = sfContext::getInstance()->getUser()->getGuardUser()->getId();
       if($intUserId!=""){
        $return1['status'] = "v";
        $return1['status_message'] = "";
        $return1['success'] ="true";
       } else {
        $return1['status'] = "i";
        $return1['success'] = "false";
        $return1['message'] = "User in not logged in.";
       }
       echo json_encode($return1);exit;
  }

  private function displayUsersFriends(){
        $username = sfcontext::getInstance()->getUser()->getGuardUser()->getUserName();
        $intUserId = sfContext::getInstance()->getUser()->getGuardUser()->getId();
        $lowertimestamp = strtotime("-5 minute");
        $date = date('Y-m-d H:i:s', $lowertimestamp);
        $arrList =  Doctrine_Core::getTable('User')->getLoggidinUsers($intUserId,$date);
        $arrUserList = array();
        Doctrine_Core::getTable('User')->updatechatlastactivity($username,$intUserId,'Y');
        for($i=0;$i<count($arrList);$i++){
            $arrUserList[$i]['username'] = $arrList[$i]['user_name'];
            $arrUserList[$i]['status'] = 'visiable';
            $arrUserList[$i]['loggedIn'] = true;
            $arrUserList[$i]['status_message'] = '';
        }
        echo(json_encode($arrUserList));die;
  }

  private function chartheartbeats(){
      $username = sfcontext::getInstance()->getUser()->getGuardUser()->getUserName();
      chatHeartbeat($username);die;
  }

  private function chartsend($arrRequest){
        $username = sfcontext::getInstance()->getUser()->getGuardUser()->getUserName();
        sendChat($username,$arrRequest['to'],$arrRequest['message']);die;
      
  }
  private function closebox($username){
      closeChat($username);die;
  }
}
