<?php

namespace app\admin\controller\otc;

use app\common\controller\Backend;
use think\Db;
use think\Validate;
use fast\Sign;
use fast\Http;
use think\Log;

/**
 * 可用銀行包管理
 *
 * @icon   fa fa-circle-o
 * @remark 主要用于展示可用的銀行
 */
class pkg extends Backend
{

    /**
     * @var \app\common\model\Attachment
     */
    protected $model = null;

    protected $noNeedRight = ['*'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('bank');
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
            $field = '*';
            if (isset($filter['create_time'])) {
                $timearr = explode(' - ',$filter['create_time']);
                // $model->where('create_time','between',[strtotime($timearr[0]),strtotime($timearr[1])]);
                $timewhere = ['create_time'=>['between',[strtotime($timearr[0]),strtotime($timearr[1])]]];

                // $filter['create_time'] = $filter['create_time'];
                unset($filter['create_time']);
            }

            if (isset($filter['status'])) {

                // $filter['status'] = $filter['status'];
                $statuswhere = ['status' => $filter['status']];
                unset($filter['status']);
            }


            \think\Request::instance()->get(['op' => json_encode($op)]);
            \think\Request::instance()->get(['filter' => json_encode($filter)]);

            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $list = $model
                ->where($where)
                ->field($field)
                ->order($sort, $order)
                ->paginate($limit);
            // echo $this->model->getLastsql();echo '<br>';echo '<br>';exit;


            $items = $list->items();
            foreach ($items as $k => $v) {
                $items[$k]['create_time'] = datevtime($v['create_time']);

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
                    //默认为代收
                    $result = $this->model->save($params);
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
            $this->error(__('Parameter %s can not be empty', ''));
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
                    $result = $row->save($params);
                    if ($result === false) {
                        exception($row->getError());
                    }

                    Db::commit();
                } catch (\Exception $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                }
                $this->success();
            }
            $this->error(__('Parameter %s can not be empty', ''));
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
            if ($channelList) {
                $deleteIds = [];
                foreach ($channelList as $k => $v) {
                    $deleteIds[] = $v->id;
                }
                if ($deleteIds) {
                    Db::startTrans();
                    try {
                        $this->model->destroy($deleteIds);
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
    
}
