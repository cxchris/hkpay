<?php

namespace app\common\model;

use think\Model;
use think\Db;

class NoticeNum extends Model
{
    protected $name = 'notice_num';
    
    // 开启自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $create_time = null;
    protected $updateTime = null;
    const TYPE_1 = 1; //1-丢单通知数值
    const TYPE_2 = 2; //2-收到提现通知的数值const TYPE_1 = 1; //1-丢单通知数值

    /**
     * Summary of getAllExtend
     * @param mixed $extend
     * @param mixed $type
     * @return void
     */
    public static function getAllExtend(&$extend,$type){
        self::update(['num'=>0],['type'=>$type]);
        $result = self::getSumByType();

        $extend['lost_num'] = $result['lost_num'];
        $extend['receive_num'] = $result['receive_num'];
        $extend['notice_total'] = $result['lost_num']+$result['receive_num'];
    }

    /**
     * Summary of getSumByType
     * @return array
     */
    public static function getSumByType(){
        $result = self::field('type, SUM(num) as total')
                    ->group('type')
                    ->select();
        $arr = [];
        if($result){
            foreach ($result as $value) {
                if ($value['type'] == self::TYPE_1) {
                    $arr['lost_num'] = $value['total'];
                } else if($value['type'] == self::TYPE_2){
                    $arr['receive_num'] = $value['total'];
                }
            }
        }
        return $arr;
    }
}