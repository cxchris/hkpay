<?php

namespace app\common\model;

use app\common\library\Notice;
use think\Model;
use think\Session;
use think\Db;
use fast\Sign;
use fast\Http;
use think\Log;

class Bank extends Model
{
    protected $name = 'bank';
    
    // 开启自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $create_time = 'create_time';
    protected $updateTime = '';

    /**
     * 1-手机通知，2-邮箱通知，3-短信通知
     * @var array
     */
    const NoticeType = [
        1 => '手机通知',
        2 => '邮箱通知',
        3 => '短信通知',
    ];
}
