<?php

namespace app\common\model;

use think\Model;
use think\Session;

class AmountChangeRecord extends Model
{
    protected $name = 'amount_change_record';
    
    // 开启自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $create_time = 'create_time';
    protected $update_time = 'update_time';

    /**
     * 获取所有账变类型
     */
    public function typeslect($is_array = false){
        $result = [
            1 => '人工调账',
            2 => '代收结算',
            3 => '转入代付记录',
            4 => '商户下发',
            5 => '商户下发拒绝回滚',
        ];
        if($is_array){
            return $result;
        }else{
            return json($result);
        }

    }

}
