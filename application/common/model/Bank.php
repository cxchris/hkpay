<?php

namespace app\common\model;

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
}
