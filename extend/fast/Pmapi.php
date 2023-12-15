<?php
namespace fast;

use fast\Http;
use think\Env;
use think\Log;


//Pm2接口类
class Pmapi{
    private $operate;

    private function __construct() {
    }

    public static function pm2() {
        return new self();
    }

    public function info($arrData = array()) {
        $this->operate = 'getlist';
        return $this->performOperation($arrData);
    }

    public function stop($arrData = array()) {
        $this->operate = 'pmStop';
        return $this->performOperation($arrData);
    }

    public function start($arrData = array()) {
        $this->operate = 'pmStart';
        return $this->performOperation($arrData);
    }

    /**
     * 获取 pm2 列表或执行其他操作。
     *
     * @return array 返回操作结果的数组，可能包含 pm2 列表或其他操作返回的数据。
     * @throws \Exception 如果操作类型不合法或发生异常时抛出。
     */
    private function performOperation($arrData = array()) {
        try {
            $url = Env::get('notice.url', '').'/listen/'.$this->operate;

            $sign = Sign::getSign($arrData,Env::get('notice.key', ''));
            $arrData['sign'] = $sign;

            // dump($url);
            // dump($arrData);
            $res = Http::formpost($url,$arrData);
            // dump($res);
            // exit;

            if($res){
                $ret = json_decode($res,true);
                if($ret){
                    if(isset($ret['code']) && $ret['code'] == 200){
                        return $ret['data'];
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
            Log::record($e->getMessage());
            // $this->error($e->getMessage());
            return [];
        }
    }
}
?>