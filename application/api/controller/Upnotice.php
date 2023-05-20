<?php

namespace app\api\controller;

use app\common\controller\Api;
use think\Session;
use think\Db;
use think\Validate;
use fast\Http;
use fast\Random;
use fast\Sign;
use app\admin\library\Paytm;
use app\admin\library\PayGIntegration;
use think\Log;
use app\common\Model\PayOrder;
use app\common\Model\Product;

/**
 * 个卡安卓回调
 */
class Upnotice extends Api
{

    //如果$noNeedLogin为空表示所有接口都需要登录才能请求
    //如果$noNeedRight为空表示所有接口都需要验证权限才能请求
    //如果接口已经设置无需登录,那也就无需鉴权了
    //
    // 无需登录的接口,*表示全部
    protected $noNeedLogin = ['*'];
    // 无需鉴权的接口,*表示全部
    protected $noNeedRight = ['*'];
    // protected $url = 'http://65.1.106.28/api/pay/order';
    protected $testid = 8; //测试通道
    protected $channel = 'alipay'; //通道名-支付宝原生
    protected $channel_key; //密钥
    protected $test_amount = 100.00; //测试金额
    protected $success_code = '200'; //成功码
    protected $link = ''; //平台跳转地址
    protected $akey = 'qwerty';
    protected $t_callbackUrl = 'https://ydapppay.com/ydpay/api/Pay/callback'; //上游通知地址
    protected $callbackUrl = 'https://www.google.com';//跳转给用户的前端页面
    protected $key = '-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4gwQco1KRMDSmXSMkDwIDAQABAoGAfY9LpnuWK5Bs50UVep5c93SJdUi82u7yMx4iHFMc/Z2hfenfYEzu+57fI4fvxTQ//5DbzRR/XKb8ulNv6+CHyPF31xk7YOBfkGI8qjLoq06V+FyBfDSwL8KbLyeHm7KUZnLNQbk8yGLzB3iYKkRHlmUanQGaNMIJziWOkN+N9dECQQD0ONYRNZeuM8zd8XJTSdcIX4a3gy3GGCJxOzv16XHxD03GW6UNLmfPwenKu+cdrQeaqEixrCejXdAFz/7+BSMpAkEA8EaSOeP5Xr3ZrbiKzi6TGMwHMvC7HdJxaBJbVRfApFrE0/mPwmP5rN7QwjrMY+0+AbXcm8mRQyQ1+IGEembsdwJBAN6az8Rv7QnD/YBvi52POIlRSSIMV7SwWvSK4WSMnGb1ZBbhgdg57DXaspcwHsFV7hByQ5BvMtIduHcT14ECfcECQATeaTgjFnqE/lQ22Rk0eGaYO80cc643BXVGafNfd9fcvwBMnk0iGX0XRsOozVt5AzilpsLBYuApa66NcVHJpCECQQDTjI2AQhFc1yRnCU/YgDnSpJVm1nASoRUnU8Jfm3Ozuku7JUXcVpt08DFSceCEX9unCuMcT72rAQlLpdZir876
-----END RSA PRIVATE KEY-----';

    public function _initialize()
    {
        parent::_initialize();
    }

    /**
     * 个卡安卓回调
     */
    public function callback()
    {
        if ($this->request->isPost()) {
            $params = $this->request->post();
            // $params = '{"BANKTXNID":"","CHECKSUMHASH":"qiq2PYIs3X0RXs55tmyp9Jh\/oYiu2js3M7DNl+UmumH7m1Wlji5K63rOskv1EhkrivWCYAu3aW57CLXGQeGIjNXpnsTv6j5pq77wO\/Opi34=","CURRENCY":"INR","MID":"knHPNb01357087489330","ORDERID":"7a8a0678d55847c9a0307712b40388c2","RESPCODE":"141","RESPMSG":"User has not completed transaction.","STATUS":"TXN_FAILURE","TXNAMOUNT":"10.00","TXNID":"20220329111212800110168028504976045"}';
            // $params = json_decode($params,true);


            // $params = json_decode($params,true);
            Log::record('个卡回调callback:POST:'.json_encode($params),'notice');
            if ($params) {
                $end_time = time()+10;
                $start_time = time() - 10*60;
                //签名认证
                // //签名验证
                $sign = Sign::setDecrypt($this->key,$params['sign']);
                if(!$sign){
                    $this->error('Signature verification failed', [],  self::SIGN_VERFY_FAID);
                }

                if(!$params['money']){
                    $this->error('money error', [],  self::SIGN_VERFY_FAID);
                }
                $params['money'] = (float)trim($params['money']);

                if(!$params['utr']){
                    $this->error('utr error', [],  self::SIGN_VERFY_FAID);
                }
                $params['utr'] = trim($params['utr']);

                $where = [
                    'a.virtual_money'=>$params['money'],
                    'a.status' => 3,
                    'a.create_time' => ['between',[$start_time,$end_time]], //十分钟以内
                    'a.utr' => ''
                ];

                // Db::name('pay_order')->where(['id'=>36218])->update(['create_time'=>time()]);
                //1,查询订单-查询方法，根据当前money 金额，和当前时间来查询
                $order = model('PayOrder')
                            ->alias('a')
                            ->join('channel_list b','a.channel_id = b.id','LEFT')
                            ->join('merchant c','a.merchant_number = c.merchant_number','LEFT')
                            ->where($where)
                            ->field('a.*,b.channel_key,c.merchant_key')
                            ->find();
                // Db::name('pay_order')->where(['id'=>36218])->update(['create_time'=>time()]);
                // echo Db::name('pay_order')->getlastsql();
                // dump($order);
                // exit;
                if(!$order){
                    $this->error('order not exist');
                }

                //判断
                $data = [];
                $data['status'] = 4;
                $data['utr'] = $params['utr'];
                $data['callback_time'] = $end_time;

                //3,修改订单状态，存入上游订单号
                Db::name('pay_order')->where(['id'=>$order['id']])->update($data);

                // $model = model('PayOrder');
                // //4,交易成功，则回调给下游
                // if($order['notify_url']){
                //     $cond = $model->getCondItem($order,$data['status']);

                //     try {
                //         $res = Http::post($order['notify_url'], $cond, $options = []);
                //         Log::record('notify:通知参数'.json_encode($cond),'notice');
                //         Log::record('notify:通知回答'.json_encode($res),'notice');
                //         if(!$res){
                //             $model->update_pay_order($order['id'],2);
                //             exception('通知失败');
                //         }
                //     } catch (\Exception $e) {
                //         Log::record('notify:通知失败'.$order['orderno'],'notice');
                //         // $this->error($e->getMessage());
                //     }

                //     if($res){
                //         if($res == 'success'){
                //             $model->update_pay_order($order['id'],1);
                //             Log::record('notify:通知成功'.$order['orderno'],'notice');
                //         }else{
                //             $model->update_pay_order($order['id'],2);
                //             Log::record('notify:通知失败'.$order['orderno'],'notice');
                //         }
                //     }else{
                //         $model->update_pay_order($order['id'],2);
                //         Log::record('notify:通知失败'.$order['orderno'],'notice');
                //     }
                // }

                $this->success('订单处理完成');
            }else{
                $this->error('Parameter can not be empty', [],  self::PARMETR_NOT_EMPTY);
            }
        }else{
            $this->error('only post', [],  self::ONLY_POST);
        }
    }

    /**
     * windows回调
     */
    public function check(){
        if ($this->request->isPost()) {
            $params = $this->request->post();
            // $params = '{"BANKTXNID":"","CHECKSUMHASH":"qiq2PYIs3X0RXs55tmyp9Jh\/oYiu2js3M7DNl+UmumH7m1Wlji5K63rOskv1EhkrivWCYAu3aW57CLXGQeGIjNXpnsTv6j5pq77wO\/Opi34=","CURRENCY":"INR","MID":"knHPNb01357087489330","ORDERID":"7a8a0678d55847c9a0307712b40388c2","RESPCODE":"141","RESPMSG":"User has not completed transaction.","STATUS":"TXN_FAILURE","TXNAMOUNT":"10.00","TXNID":"20220329111212800110168028504976045"}';
            // $params = json_decode($params,true);
// dump($params);exit;
            // $params = json_decode($params,true);
            Log::record('windows银行回调 callback:POST:'.json_encode($params),'notice');
            if ($params) {
                //签名认证
                // //签名验证
                // $sign = Sign::getbkSign($params,$this->akey);
                // dump($sign);exit;

                $sign = Sign::verifybkSign($params,$this->akey);
                if(!$sign){
                    $this->error('Signature verification failed', [],  self::SIGN_VERFY_FAID);
                }
                $data = $params['data'];
                if($data){
                    foreach ($data as $key => $value) {
                        $this->utrlParse($value);
                    }
                }
                $this->success('订单处理完成');
            }else{
                $this->error('Parameter can not be empty', [],  self::PARMETR_NOT_EMPTY);
            }
        }else{
            $this->error('only post', [],  self::ONLY_POST);
        }
    }

    //分析UTR,判断有就不插入了，
    protected function utrlParse($value){
        //
        $utrno = trim($value['ref_id']);
        $money = trim($value['amount']);
        $money = str_replace(",", "", $money);
        $res = Db::name('utr_list')->where(['utr'=>$utrno])->find();
        if(!$res){
            //不存在，插入就行了
            if($utrno != '' && $money != 0){
                $cond = [
                    'utr' => $utrno,
                    'money' => $money,
                    'create_time' => time(),
                ];
                // dump($cond);exit;
                Db::name('utr_list')->insert($cond);
            }
        }
        return true;
    }
}
