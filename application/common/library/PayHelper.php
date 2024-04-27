<?php
namespace app\common\library;

use app\common\controller\Api;
use app\admin\model\Merchant;
use app\common\model\PayOrder;
use app\common\model\PaymentOrder;
use app\admin\model\ChannelList;
use app\common\model\Bank;
use fast\Sign;
use think\Db;
use think\Log;
use fast\Random;
use app\common\library\PayTool;
use app\common\model\OtcList;
use app\common\library\Notice as noticeModel;
use app\common\model\PaymentChangeRecord;
use app\common\model\MerchantType;


/**
 * 简化支付接口，用来放入一些验证之类的方法
 */
class PayHelper extends Api
{
    /**
     * 跳转给用户的前端页面
     * @var string
     */
    protected $callbackUrl = 'https://www.google.com';
    /**
     * 代收上游通知地址
     * @var string
     */
    protected $t_callbackUrl = 'https://sgpaygloabl.com/api/Pay/callback';
    /**
     * 代付上游通知地址
     * @var string
     */
    protected $w_callbackUrl = 'https://sgpaygloabl.com/api/Withdraw/callback';
    protected $PayTool;
    protected $request;
    public function __construct($request) {
        $this->request = $request;
    }

    public function _initialize(){
    }

    /**
     * 验证代收请求数据
     * @param array $params 请求参数
     * @return array
     */
    public function validPayRequest($params) :array{
        // 1.参数验证
        $result = $this->validate($params,'app\admin\validate\Pay.pay');
        if (true !== $result) {
            exception($result,parent::PARMETR_NOT_EMPTY);
        }
        
        // 2.商户验证
        $row = Merchant::where('merchant_number', $params['merchantNo'])->find();
        if(!$row){
            exception('Merchant not exist',parent::MERCHANT_NOT_EXIST);
        }

        //签名验证
        $sign = Sign::verifySign($params,$row->merchant_key);
        if(!$sign){
            exception('Signature verification failed',parent::SIGN_VERFY_FAID);
        }
        //IP判断
        if($row['use_ip']){
            $iparr = explode('|',$row['use_ip']);
            $reqip = request()->ip();
            if(!in_array($reqip,$iparr)){
                exception('Not reported IP',parent::NOT_REPORTED_IP);
            }
        }

        //判断代收状态是否正常
        if($row->collection_status != 1){
            exception('Merchant status unuse',parent::MERCHANT_UNUSE);
        }

        //判断是否为小数
        if(ceil($params['amount']) != $params['amount']){
            // exception('cannot be a decimal',parent::NOT_BE_DECIMAL);
        }

        //商户最低限额
        if($params['amount'] < $row->collection_low_money){
            exception('amount not less than the allowed limit',parent::AMOUNT_LESS_ALLOWED);
        }

        //商户最高限额
        if($params['amount'] > $row->collection_high_money){
            exception('amount not higher than the allowed limit',parent::AMOUNT_HIGHER_ALLOWED);
        }

        //每日限额，查询今日商户一共代付成功的金额
        $timearr = [
            strtotime(date('Y-m-d'). '00:00:00'),
            strtotime(date('Y-m-d'). '23:59:59'),
        ];

        $where = [
            'merchant_number' => $params['merchantNo'],
            'status' => 1,
            'create_time' => ['between',[$timearr[0],$timearr[1]]]
        ];
        $total = PayOrder::where($where)->sum('money');
        if(($params['amount'] + $total) > $row->collection_limit){
            exception('amount not higher than the merchant daily limit',parent::AMOUNT_HIGHER_DAILY_LIMIT);
        }

        //商户订单号验证不重复
        $where = [
            'out_trade_no' => $params['merchantSn'],
            'merchant_number' => $params['merchantNo'],
        ];
        $record = PayOrder::where($where)->find();
        if($record){
            exception('Repeat order',parent::REPEAT_ORDER);
        }

        //查询指定通道，如果未传，则使用给商户分配的通道
        // $channel_id = isset($params['channel'])?$params['channel']:$row->collection_channel_id;
        $channel_id = $row->collection_channel_id;
        $channel = ChannelList::where('id', $channel_id)->find();
        if(!$channel){
            exception('Channel not exist',parent::CHEANNEL_NOT_EXIST);
        }

        if($channel['status'] != 1){
            exception('Channel closed',parent::CHEANNEL_NOT_EXIST);
        }

        //通道最低限额
        if($params['amount'] < $channel->low_money){
            exception('amount not less than the allowed limit',parent::AMOUNT_LESS_ALLOWED);
        }

        //通道最高限额
        if($params['amount'] > $channel->high_money){
            exception('amount not higher than the allowed limit',parent::AMOUNT_HIGHER_ALLOWED);
        }
        //每日限额，查询今日通道一共代收成功的金额
        $where = [
            'channel_id'=>$channel_id,
            'status' => 1,
            'create_time' => ['between',[$timearr[0],$timearr[1]]]
        ];
        $total = PayOrder::where($where)->sum('money');
        if($params['amount'] + $total > $channel->day_limit_money){
            exception('amount not higher than the channel daily limit',parent::AMOUNT_HIGHER_DAILY_LIMIT);
        }

        return [$row,$channel];
    }

    /**
     * 获取三方支付链接
     * @param mixed $params 传入参数
     * @param mixed $row 商户信息
     * @param mixed $channel 通道信息
     * @return array
     */
    public function getApiLink($params,$row,$channel){
        $params['merchant_id'] = $row->id;
        //下单金额
        $amount = $params['amount'];

        //支付类型
        $paychannel = $channel->channel_type;
        
        //直接使用通道费率费率
        $channel_rate = $channel->rate;

        //直接使用商户费率
        $realRate = $row->collection_fee_rate;

        $rate_money = $this->getrate($amount,$realRate,'|'); //商户手续费
        $account_money = $amount - $rate_money; //到账金额
        // dump($rate_money);
        // dump($account_money);
        // exit;
        $this->PayTool = PayTool::instance($channel);
        $currency = $params['currency'] ?? $this->PayTool::currency;
        //三方提供的支付扩展类型，默认使用
        if($currency == 'PHP'){
            //如果是菲律宾商户，则使用
            $channel_pay_type = $params['channel_type'] ?? $this->PayTool::normal_channel;
        }else{
            $channel_pay_type = $channel['channel_pay_type'] ?? $this->PayTool::NOMAL_CHANNEL_PAY_TYPE;
        }

        //检测传入的currency
        if(!in_array($currency,$this->PayTool::$currency_list)){
            exception('unknow currency',parent::CHEANNEL_NOT_EXIST);
        }
        //判断
        Db::startTrans();
        try {
            //1,验证通过，生成订单
            $cond = [];
            $cond['channel_id'] = $channel->id;
            $cond['merchant_number'] = $row->merchant_number;
            $cond['agent_id'] = $row->merchant_agent_id;
            $cond['orderno'] = Random::getOrderSn();
            $cond['out_trade_no'] = $params['merchantSn'];
            $cond['money'] = $amount;
            $cond['currency'] = $currency; //币种
            $cond['rate_money'] = $rate_money; //商户手续费
            $cond['rate_t_money'] = $this->getrate($amount,$channel_rate,'+'); //三方手续费计算
            $cond['collection_fee_rate'] = $realRate;
            $cond['account_money'] = $account_money; //到账金额
            $cond['billing_around'] = $row->merchant_billing_around;
            $cond['pay_type'] = $paychannel;
            $cond['t_notify_url'] = $this->t_callbackUrl.'/'.$this->PayTool::$tag; //上游通知地址
            $cond['notify_url'] = $params['notifyUrl'];
            $cond['callback_url'] = isset($params['returnUrl'])?$params['returnUrl']:$this->callbackUrl;
            $cond['request_ip'] = $this->request->ip();
            $cond['channel_pay_type'] = $channel_pay_type;
            $cond['create_time'] = time();
            $cond['update_time'] = time();
            $cond['remark'] = $params['remark']??'';

            //不同sdk的扩展，初期是扩展utr类型
            $cond = $this->PayTool->extend($cond,$params);

            //根据utr类型，去获取一个可用的UPI卡，用来给收银台展示内容
            // if($paychannel == $this->PayTool::UTR_TYPE){
            //     $otc_info = OtcList::getValidCard();
            //     $cond['upi'] = $otc_info['upi'];
            //     $cond['otc_id'] = $otc_info['id'];
            //     $cond['otc_code'] = Random::alnum();
            // }
            
            $id = PayOrder::insertGetId($cond);
            if ($id == false) {
                exception('订单生成失败',555);
            }

            // $orderinfo = PayOrder::where('id',$id)->find();
            $res = $this->PayTool->pay($cond);
            // dump($res);
            // exit;
            if($res['code'] != Paytool::success_code){
                //失败的情况,把订单状态修改为失败
                PayOrder::update(['status'=>-1],['id'=>$id]);
                Db::commit();
                exception($res['msg'], $res['code']);
            }else{
                $data = $res['data'];
                if(isset($data['tn'])){
                    PayOrder::where(['id'=>$id])->update(['tn'=>$data['tn']]);
                }
                $payUrl = $data['url'];
            }

            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            throw $e;
        }

        $data = [
            'payUrl' => $payUrl,
            "merchantNo" => $row->merchant_number,
            "merchantSn" => $params['merchantSn'],
            "sn" => $cond['orderno'],
        ];
        return $data;
    }

    /**
     * 验证代付请求数据
     * @param array $params 请求参数
     * @return array
     */
    public function validWithdrawRequest($params): array{
        // 1.参数验证
        $result = $this->validate($params,'app\admin\validate\Apply');
        if (true !== $result) {
            exception($result,parent::PARMETR_NOT_EMPTY);
        }

        // 2.商户验证
        $row = Merchant::where('merchant_number', $params['merchantNo'])->find();
        if(!$row){
            exception('Merchant not exist',parent::MERCHANT_NOT_EXIST);
        }
        
        // 签名验证
        $sign = Sign::verifySign($params,$row->merchant_key);
        if(!$sign){
            exception('Signature verification failed',parent::SIGN_VERFY_FAID);
        }

        //IP判断
        if($row['use_ip']){
            $iparr = explode('|',$row['use_ip']);
            $reqip = request()->ip();
            if(!in_array($reqip,$iparr)){
                exception('Not reported IP',parent::NOT_REPORTED_IP);
            }
        }

        //判断代付状态是否正常
        if($row->payment_status != 1){
            exception('Merchant status unuse',parent::MERCHANT_UNUSE);
        }

        //判断是否为小数
        if(ceil($params['amount']) != $params['amount']){
            exception('amount cannot be a decimal',parent::NOT_BE_DECIMAL);
        }

        //商户最低限额
        if($params['amount'] < $row->payment_low_money){
            exception('amount not less than the allowed limit',parent::AMOUNT_LESS_ALLOWED);
        }

        //商户最高限额
        if($params['amount'] > $row->payment_high_money){
            exception('amount not higher than the allowed limit',parent::AMOUNT_HIGHER_ALLOWED);
        }


        $model = new PaymentOrder();

        //每日限额，查询今日商户一共代付成功的金额
        $timearr = [
            strtotime(date('Y-m-d'). '00:00:00'),
            strtotime(date('Y-m-d'). '23:59:59'),
        ];

        $where = [
            'merchant_id' => $row->id,
            'status' => 1,
            'create_time' => ['between',[$timearr[0],$timearr[1]]]
        ];
        $total = $model->where($where)->sum('money');
        if($params['amount'] + $total > $row->payment_limit){
            exception('amount not higher than the merchant daily limit',parent::AMOUNT_HIGHER_DAILY_LIMIT);
        }

        //商户订单号验证不重复
        $where = [
            'out_trade_no' => $params['merchantSn'],
            'merchant_id' => $row->id,
        ];
        $record = $model->where($where)->find();
        if($record){
            exception('Repeat order',parent::REPEAT_ORDER);
        }

        //根据传入金额来指定channelid
        if($params['amount'] <= 1000){
            $use_channel_id = $row->payment_channel_id;
        }else{
            $use_channel_id = $row->big_payment_channel_id?$row->big_payment_channel_id:$row->payment_channel_id;
        }

        $channel_id = $use_channel_id;
        if(!$channel_id){
            exception('Channel not set',parent::CHEANNEL_NOT_EXIST);
        }

        $channel = ChannelList::where('id', $channel_id)->find();
        if(!$channel){
            exception('Channel not exist',parent::CHEANNEL_NOT_EXIST);
        }

        if($channel['status'] != 1){
            exception('Channel closed',parent::CHEANNEL_NOT_EXIST);
        }

        //通道最低限额
        if($params['amount'] < $channel->low_money){
            exception('amount not less than the allowed limit',parent::AMOUNT_LESS_ALLOWED);
        }

        //通道最高限额
        if($params['amount'] > $channel->high_money){
            exception('amount not higher than the allowed limit',parent::AMOUNT_HIGHER_ALLOWED);
        }

        //每日限额，查询今日通道一共代付成功的金额
        $total = $model->where(['channel_id' => $channel_id])
                    ->where(['status'=>1])
                    ->where('create_time','between',[$timearr[0],$timearr[1]])
                    ->sum('money');
        if($params['amount'] + $total > $channel->day_limit_money){
            exception('amount not higher than the daily limit',parent::AMOUNT_HIGHER_DAILY_LIMIT);
        }

        return [$row,$channel,$channel_id];
    }

    /**
     * 下单代付
     * @param mixed $params 传入参数
     * @param mixed $row 商户信息
     * @param mixed $channel 通道信息
     * @param mixed $channel_id 使用代付的通道id
     * @return array
     */
    public function orderPayment($params, $row, $channel, $channel_id){
        //根据商户的代付费率来算
        $realRate = $row['payment_fee_rate'];
        //amount
        $amount = $params['amount'];
        // dump($realRate);
        $rate_money = $this->getrate($amount, $realRate, '|');
        //判断商户余额
        $reduce_money = $rate_money + $amount;

        //直接使用通道费率费率
        $channel_rate = $channel->rate;
        // dump($reduce_money);exit;

        if($reduce_money > $row['merchant_payment_amount']){
            exception('Merchant balance not enough',parent::BALANCE_NOT_ENOUGH);
        }

        $this->PayTool = PayTool::instance($channel);
        //三方提供的支付扩展类型，默认使用
        $channel_pay_type = $channel['channel_withdraw_type'] ?? $this->PayTool::NOMAL_CHANNEL_WITHDRAW_TYPE;
        $currency = $params['currency'] ?? $this->PayTool::currency;

        //区分印度和菲律宾
        if($currency == 'INR'){
            //根据$params['bankName']来查询对应的列，如果不存在则报错
            $bankinfo = Bank::where('bank_name',$params['bankName'])->find();
            if(!$bankinfo){
                // exception('Bank not supported',self::BALANCE_NOT_ENOUGH);
                $bankName = $params['bankName'];
            }else{
                $bankName = $this->PayTool->get_bankName($bankinfo);
            }
            
        }else{
            $bankName = $params['bankName'];
        }

        //检测传入的currency
        if(!in_array($currency,$this->PayTool::$currency_list)){
            exception('unknow currency',parent::CHEANNEL_NOT_EXIST);
        }

        //1,验证通过，生成订单
        $cond = [];
        $cond['channel_id'] = $channel_id;
        $cond['merchant_id'] = $row->id;
        $cond['agent_id'] = $row->merchant_agent_id;
        $cond['orderno'] = Random::getOrderSn();
        $cond['out_trade_no'] = $params['merchantSn'];
        $cond['money'] = $amount;
        $cond['rate_money'] = $rate_money;
        $cond['rate_t_money'] = $this->getrate($amount,$channel_rate,'+'); //三方手续费计算
        $cond['fee_rate'] = $realRate;
        $cond['reduce_money'] = $reduce_money; //扣款金额
        $cond['pay_type'] = $channel->channel_type;
        $cond['channel_pay_type'] = $channel_pay_type; //预留扩展
        $cond['currency'] = $currency; //币种

        $cond['accountName'] = $params['accountName'];
        $cond['accountNo'] = $params['accountNo'];
        $cond['bankName'] = $bankName;
        $cond['bankCode'] = $params['bankCode'];
        $cond['bankMobile'] = $params['bankMobile']??'';
        // $cond['branchName'] = $params['branchName'];

        $cond['notify_url'] = $params['notifyUrl'];
        // $cond['callback_url'] = $params['callbackUrl'];
        $cond['t_notify_url'] = $this->w_callbackUrl.'/'.$this->PayTool::$tag; //上游通知地址
        $cond['request_ip'] = $this->request->ip();
        $cond['create_time'] = time();
        $cond['remark'] = $params['remark']??'';

        $model = new PaymentOrder();

        $id = $model::insertGetId($cond);
        if ($id == false) {
            exception('Order generation failed',555);
        }

        //判断
        Db::startTrans();
        try {
            //2,预扣商户的代付余额
            $merchant = Merchant::field('merchant_payment_amount,merchant_agent_id,country')->where('id',$row->id)->find(); //先查找商家前值
            $res2 = Merchant::where('id',$row->id)
                ->update([
                    'merchant_payment_amount'=>['dec', $reduce_money]
                ]);
            if(!$res2){
                exception('预扣商户代付余额失败');
            }

            //3,添加代付变化记录
            $changeModel = new PaymentChangeRecord();
            $adddata = [
                'orderno' => $cond['out_trade_no'],
                'merchant_id' => $row->id,
                'type' => PaymentChangeRecord::PAYMENT_RECORD_DEL, //type = 2-代付预扣
                'bef_amount' => $merchant['merchant_payment_amount'],
                'change_amount' => -$reduce_money,
                'remark' => $cond['remark'],
                'agent_id' => $merchant['merchant_agent_id'],
                'currency' => $merchant['country'],
            ];
            $res3 = $changeModel->addrecord($adddata);
            if(!$res3){
                exception('添加代付变化记录失败');
            }

            $res = $this->PayTool->withdraw($cond);
            // dump($res);exit;
            Log::record('代付返回:'.json_encode($res),'notice');

            if($res['code'] !== Paytool::success_code){
                //失败的情况,把订单状态修改为失败
                // $model->where(['orderno'=>$cond['orderno']])->update(['status'=>-1]);
                exception($res['msg'], $res['code']);
            }else{
                //5,修改三方订单号,手续费,status
                $data = $res['data'];
                $condition = [];
                if($data['tn']){
                    $condition['tn'] = $data['tn'];
                }
                if($data['status']){
                    $condition['status'] = $data['status'];
                }
                $model::where(['id'=>$id])->update($condition);
            }

            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            //失败的情况,把订单状态修改为失败
            $fail_status = $this->PayTool::_withdraw_system_err;
            $model::where(['orderno'=>$cond['orderno']])->update(['status'=>$fail_status]);

            //通知商户
            $model->notifyShop($cond['orderno'],$fail_status);
            throw $e;
        }

        $data = [
            "merchantNo" => $row->merchant_number,
            "merchantSn" => $params['merchantSn'],
            "sn" => $cond['orderno'],
            // 'extra' => $params['extra']??'',
            'fee' => $cond['rate_money'],
            'status' => $this->PayTool::_withdraw_success
        ];

        //通知node后台
        // $params = [
        //     'orderno' => $cond['orderno'],
        //     'time' => time()
        // ];
        // noticeModel::send_withdraw($params);

        Log::record('返回:'.json_encode($data),'notice');
        return $data;
    }
}
