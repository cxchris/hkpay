<?php

namespace app\common\library;
use fast\Http;
use think\Env;
use fast\Sign;
use think\Log;
/**
 * 丢单通知
 */
class Notice
{

    const notice_url = '/notice';
    
    /**
     * Summary of send
     * @param mixed $params
     * @throws \Exception
     * @return \think\response\Json
     */
    public static function send($params)
    {
        try {
            $arrData  = array(
                'amount' => $params['amount']??'',
                'content' => $params['content']??'',
                'time' => $params['time']??'',
                'pkg' => $params['pkg']??'',
            );
            $sign = Sign::getSign($arrData,Env::get('notice.key'));
            $arrData['sign'] = $sign;

            $url = Env::get('notice.url').self::notice_url;

            // dump($url);
            // dump($arrData);
            $res = Http::formpost($url,$arrData);

            if($res){
                $ret = json_decode($res,true);
                // dump($ret);exit;
                if($ret){
                    if(isset($ret['code']) && $ret['code'] == 200){
                        return json($ret);
                    }else{
                        throw new \Exception($ret['msg']);
                    }
                }else{
                    throw new \Exception('Interface exception');
                }
            }else{
                throw new \Exception('service no start');
            }
        } catch (\Exception $e) {
            Log::record('掉单通知'.$e->getMessage(),'notice');
            // throw new \Exception($e->getMessage());
        }
        return json();
    }
}
