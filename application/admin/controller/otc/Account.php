<?php

namespace app\admin\controller\otc;

use app\common\controller\Backend;
use think\Db;
use think\Validate;
use fast\Sign;
use fast\Http;
use think\Log;
use app\common\model\Bank as bankModel;
use app\common\model\OtcList as OtcModel;
use fast\Pmapi;

/**
 * 轉數快
 *
 * @icon   fa fa-circle-o
 * @remark 主要用于展示轉數快收款账户
 */
class Account extends Backend
{

    /**
     * @var \app\common\model\Attachment
     */
    protected $model = null;
    protected $type = 1; //默认

    protected $noNeedRight = ['*'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new OtcModel();

        $collectionList = model('channel_list')->where(['type'=>1])->select();

        $collectionName = [0 => __('None')];
        foreach ($collectionList as $k => $v) {
            $collectionName[$v['id']] = $v['channel_name'];
        }

        //获取银行列表
        $banklistName = [0 => __('None')];
        $banklist = model('bank')->select();
        foreach ($banklist as $v) {
            $banklistName[$v['id']] = $v['name'].'-'.bankModel::NoticeType[$v['notice_type']];
        }
        // dump($collectionName);exit;
        $this->view->assign("collectionName", $collectionName);
        $this->view->assign("banklistName", $banklistName);
    }

    /**
     * 查看
     */
    public function index()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }

            $filter = $this->request->get("filter", '');
            // dump($filter);exit;
            $op = $this->request->get("op", '', 'trim');

            $filter = (array)json_decode($filter, true);
            $op = (array)json_decode($op, true);

            $model = $this->model;

            // dump($op);exit;
            //组装搜索
            $timewhere = $statuswhere = $groupwhere = [];
            $field = 'a.*,b.channel_name,c.name as pkg_name,c.notice_type';
            if (isset($filter['create_time'])) {
                $timearr = explode(' - ',$filter['create_time']);
                // $model->where('a.create_time','between',[strtotime($timearr[0]),strtotime($timearr[1])]);
                $timewhere = ['a.create_time'=>['between',[strtotime($timearr[0]),strtotime($timearr[1])]]];

                // $filter['a.create_time'] = $filter['create_time'];
                unset($filter['create_time']);
            }

            if (isset($filter['status'])) {

                // $filter['a.status'] = $filter['status'];
                $statuswhere = ['a.status' => $filter['status']];
                unset($filter['status']);
            }


            \think\Request::instance()->get(['op' => json_encode($op)]);
            \think\Request::instance()->get(['filter' => json_encode($filter)]);

            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $list = $model
                ->alias('a')
                ->where($groupwhere)
                ->where($timewhere)
                ->where($statuswhere)
                ->where($where)
                // ->where('a.type',$this->type)
                ->join('channel_list b','a.channel_id = b.id','LEFT')
                ->join('bank c','a.pkg = c.id','LEFT')
                ->field($field)
                ->order($sort, $order)
                ->paginate($limit);
            // echo $this->model->getLastsql();echo '<br>';echo '<br>';exit;

            $arr = Pmapi::pm2()->info();
            // exit;
            $items = $list->items();
            foreach ($items as $k => $v) {
                $items[$k]['create_time'] = datevtime($v['create_time']);
                if(isset($v['pkg_name'])){
                    $pkgbank = $v['pkg_name'].'-'.bankModel::NoticeType[$v['notice_type']];
                    $items[$k]['pkgbank'] = $pkgbank;
                }

                if($v['notice_type'] == bankModel::MAIL_TYPE){
                    //获取状态
                    $matchingArr = array_filter($arr, function($row) use ($v) {
                        return $row["name"] == $v["id"] && $row['status'] == 'online';
                    });
                    // exit;
                    if (!empty($matchingArr)) {
                        $status = 1;
                    }else{
                        $status = 0;
                    }
                    $model->where('id',$v['id'])->update(['status'=>$status]);
                    $v['status'] = $status;
                }

            }

            // dump($rate);
            // echo $this->model->getLastsql();exit;

            //查询 交易金额/交易笔数 等
            $extend = [];
            if($this->group_id != self::MERCHANT_GROUP){
                // $extend = $this->getExtendData($timewhere,$statuswhere,$where);
            }
            
            $result = array("total" => $list->total(), "rows" => $items, "extend" => $extend);
            return json($result);
        }

        return $this->view->fetch();
    }

    /**
     * 添加
     */
    public function add()
    {
        if ($this->request->isPost()) {
            $this->token();
            $params = $this->request->post("row/a");
            if ($params) {
                //先验证后台操作员自己的谷歌验证码是否正确
                if(!$this->checkValid($params['checksum'])){
                    $this->error('谷歌校验码错误',null,[]);
                }
                Db::startTrans();
                try {
                    unset($params['checksum']);
                    $params['status'] = 0;
                    //默认为代收
                    // $params['type'] = $this->type;
                    $result = $this->model->validate('Otc.add')->save($params);
                    if ($result === false) {
                        exception($this->model->getError());
                    }
                    Db::commit();
                } catch (\Exception $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                }
                $this->success();
            }
            $this->error(__('Parameter %s can not be empty'));
        }
        return $this->view->fetch();
    }

    /**
     * 编辑
     */
    public function edit($ids = null)
    {
        $row = $this->model->get(['id' => $ids]);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ($this->request->isPost()) {
            $this->token();
            $params = $this->request->post("row/a");
            if ($params) {
                //先验证后台操作员自己的谷歌验证码是否正确
                if(!$this->checkValid($params['checksum'])){
                    $this->error('谷歌校验码错误',null,[]);
                }
                Db::startTrans();
                try {
                    unset($params['checksum']);
                    $result = $row->validate('Otc.edit')->save($params);
                    if ($result === false) {
                        exception($row->getError());
                    }
                    $bank = bankModel::where('id',$row->pkg)->find();
                    //修改脚本状态
                    if($bank['notice_type'] == bankModel::MAIL_TYPE){
                        if($params['status'] == 0){
                            $cond = [
                                'id' => $row['id'],
                            ];
                            $res = Pmapi::pm2()->stop($cond);
                            $result = $row->save(['status'=>0]);
                        }else{
                            $cond = [
                                'id' => $row['id'],
                                'user' => $row['email'],
                                'password' => $row['password'],
                                'host' => $row['host'],
                                'port' => $row['port'],
                                'key' => $row['keyword'],
                                'egex' => $row['regex'],
                                'poster' => $row['poster'],
                            ];
                            // dump($cond);
                            // exit;
                            $res = Pmapi::pm2()->start($cond);
                            // dump($res);
                            // exit;
                            if($res){
                                $result = $row->save(['status'=>1]);
                            }else{
                                $result = $row->save(['status'=>0]);
                            }
                        }
                    }

                    Db::commit();
                } catch (\Exception $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                }
                $this->success();
            }
            $this->error(__('Parameter %s can not be empty'));
        }
        
        $this->view->assign("row", $row);
        return $this->view->fetch();
    }

    /**
     * 删除
     */
    public function del($ids = "")
    {
        if (!$this->request->isPost()) {
            $this->error(__("Invalid parameters"));
        }
        $ids = $ids ? $ids : $this->request->post("ids");
        if ($ids) {
            // 查询，直接删除
            $channelList = $this->model->where('id', 'in', $ids)->select();
            $notice_type = [];
            if ($channelList) {
                $deleteIds = [];
                foreach ($channelList as $k => $v) {
                    $deleteIds[] = $v->id;
                    $bank = bankModel::where('id',$v->pkg)->find();
                    $notice_type[] = $bank->notice_type;
                }
                if ($deleteIds) {
                    Db::startTrans();
                    try {
                        $this->model->destroy($deleteIds);

                        if($notice_type[0] == bankModel::MAIL_TYPE){
                            $cond = [
                                'id' => $ids,
                            ];
                            $res = Pmapi::pm2()->stop($cond);
                        }
                        Db::commit();
                    } catch (\Exception $e) {
                        Db::rollback();
                        $this->error($e->getMessage());
                    }
                    $this->success();
                }
                $this->error(__('No rows were deleted'));
            }
        }
        $this->error(__('You have no permission'));
    }

    public function channelList(){
        $res = OtcModel::ChannelType;
        // dump($res);exit;
        return json($res);
    }
}
