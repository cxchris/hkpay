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
    /**
     * 掉单通知URL
     * @var string
     */
    const pay_notice_url = '/notice/pay';
    /**
     * 接收代付订单通知URL
     * @var string
     */
    const withdraw_notice_url = '/notice/withdraw';
    
    /**
     * Summary of send_lost
     * @param mixed $params
     * @throws \Exception
     * @return \think\response\Json
     */
    public static function send_lost($params)
    {
        try {
            $arrData  = array(
                'amount' => $params['amount']??'',
                'orderno' => $params['orderno']??'',
                'time' => $params['time']??'',
            );
            $sign = Sign::getSign($arrData,Env::get('notice.key'));
            $arrData['sign'] = $sign;

            $url = Env::get('notice.url').self::pay_notice_url;

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

    /**
     * 发送代付通知
     * @param mixed $params
     * @throws \Exception
     * @return \think\response\Json
     */
    public static function send_df($params)
    {
        try {
            $arrData  = array(
                'orderno' => $params['orderno']??'',
                'money' => $params['money']??'',
                'time' => $params['create_time']??'',
            );
            $sign = Sign::getSign($arrData,Env::get('notice.key'));
            $arrData['sign'] = $sign;

            $url = Env::get('notice.url').self::withdraw_notice_url;

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
            Log::record('发送代付通知'.$e->getMessage(),'notice');
            // throw new \Exception($e->getMessage());
        }
        return json();
    }
}
